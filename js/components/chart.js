// -----------------------------------------------------------------------------
// 가격 시계열 그래프
// 하나의 화면에서 소매가·중도매가·경락가를 함께 표시합니다 (정의서 §6.1).
// 숫자는 ML 파이프라인 산출물을 대신하는 Mock이며 LLM이 만들지 않습니다.
// -----------------------------------------------------------------------------

const CHART_BOX = { W: 780, H: 300, l: 60, r: 20, t: 18, b: 40 };
const PAST_LABELS = ["7/24", "7/31", "8/7", "8/14", "오늘"];

/** 화면에 표시할 축 눈금 위치와 라벨을 만듭니다. */
function chartTicks(actualLength, forecastLength) {
  const offset = actualLength - 1;
  const ticks = PAST_LABELS.map((label, index) => ({
    index: Math.round((index * offset) / (PAST_LABELS.length - 1)),
    label,
  }));
  [6, 12, 18].forEach((day) => {
    if (day < forecastLength)
      ticks.push({ index: offset + day, label: `D+${day}` });
  });
  return ticks;
}

/**
 * @param {HTMLElement} target 그래프를 그릴 컨테이너
 * @param {object} options
 *  - item: 품목 id
 *  - types: 표시할 가격유형 key 배열
 *  - band: 90% 예측 구간을 그릴 가격유형 key (없으면 생략)
 *  - decorative: true면 상호작용을 붙이지 않습니다
 */
function renderPriceChart(target, options = {}) {
  if (!target) return;
  const itemId = options.item || state.item;
  const types = (options.types || state.priceTypes).filter(
    (key) => MOCK.series[itemId] && MOCK.series[itemId][key],
  );
  if (!types.length) return;
  const band =
    options.band && types.includes(options.band) ? options.band : null;
  const { W, H, l, r, t, b } = CHART_BOX;

  const sets = types.map((key) => ({
    key,
    meta: findPriceType(key),
    ...MOCK.series[itemId][key],
  }));
  const values = sets.flatMap((set) => [
    ...set.actual,
    ...set.forecast,
    ...(band === set.key ? [...set.low, ...set.high] : []),
  ]);
  const step = Math.max(
    100,
    Math.round((Math.max(...values) - Math.min(...values)) / 500) * 100,
  );
  const min = Math.floor((Math.min(...values) - step * 0.4) / step) * step;
  const max = Math.ceil((Math.max(...values) + step * 0.4) / step) * step;

  const offset = sets[0].actual.length - 1;
  const count = sets[0].actual.length + sets[0].forecast.length - 1;
  const x = (i) => l + (i * (W - l - r)) / (count - 1);
  const y = (v) => t + ((max - v) * (H - t - b)) / (max - min);

  const steps = 5;
  let grid = "";
  for (let i = 0; i < steps; i += 1) {
    const value = max - ((max - min) * i) / (steps - 1);
    const yy = y(value);
    grid += html`<line
        class="grid-line"
        x1="${l}"
        x2="${W - r}"
        y1="${yy}"
        y2="${yy}"
      /><text class="axis-label" x="${l - 9}" y="${yy + 4}" text-anchor="end"
        >${Math.round(value).toLocaleString()}</text
      >`;
  }

  const bandSet = band ? sets.find((set) => set.key === band) : null;
  const bandArea = bandSet
    ? [
        ...bandSet.high.map((v, i) => `${x(offset + i)},${y(v)}`),
        ...bandSet.low.map((v, i) => `${x(offset + i)},${y(v)}`).reverse(),
      ].join(" ")
    : "";

  const lines = sets
    .map((set) => {
      const actualPts = set.actual.map((v, i) => `${x(i)},${y(v)}`).join(" ");
      const forecastPts = set.forecast
        .map((v, i) => `${x(offset + i)},${y(v)}`)
        .join(" ");
      return html`<g class="series series-${set.key}">
        <polyline class="actual-line" points="${actualPts}" />
        <polyline class="forecast-line" points="${forecastPts}" />
        <circle
          class="chart-point"
          cx="${x(offset)}"
          cy="${y(set.actual.at(-1))}"
          r="4.5"
        />
      </g>`;
    })
    .join("");

  const ticks = chartTicks(sets[0].actual.length, sets[0].forecast.length)
    .map(
      (tick) =>
        html`<text
          class="axis-label ${tick.label === "오늘" ? "today-label" : ""}"
          x="${x(tick.index)}"
          y="${H - 12}"
          text-anchor="middle"
          >${tick.label}</text
        >`,
    )
    .join("");

  const hitPoints = sets[0].actual
    .map(
      (_, i) =>
        html`<rect
          class="hit-point"
          data-index="${i}"
          x="${x(i) - 6}"
          y="${t}"
          width="12"
          height="${H - t - b}"
          fill="transparent"
        />`,
    )
    .join("");

  const forecastPoints = options.decorative
    ? ""
    : sets[0].forecast
        .map((_, i) =>
          i === 0
            ? ""
            : html`<g class="forecast-event-point" data-horizon="${i}">
                <circle
                  class="forecast-point-dot"
                  cx="${x(offset + i)}"
                  cy="${y(sets[0].forecast[i])}"
                  r="3"
                />
                <rect
                  class="forecast-point-hit"
                  x="${x(offset + i) - 6}"
                  y="${t}"
                  width="12"
                  height="${H - t - b}"
                  fill="transparent"
                />
              </g>`,
        )
        .join("");

  target.innerHTML = html`<svg
      viewBox="0 0 ${W} ${H}"
      role="img"
      aria-label="${findItem(itemId).name} ${sets
        .map((set) => set.meta.label)
        .join(" · ")} 실제 및 D+18 예측 가격 그래프"
    >
      ${grid}
      ${bandArea ? `<polygon class="range-area" points="${bandArea}" />` : ""}
      <line
        class="today-line"
        x1="${x(offset)}"
        x2="${x(offset)}"
        y1="${t}"
        y2="${H - b}"
      />
      ${lines} ${ticks} ${hitPoints} ${forecastPoints}
    </svg>
    <div class="chart-tooltip"></div>`;

  if (options.decorative) return;
  bindChartTooltip(target, sets, offset);
  bindForecastPoints(target, sets);
}

function bindChartTooltip(target, sets, offset) {
  const tooltip = $(".chart-tooltip", target);
  $$(".hit-point", target).forEach((zone) => {
    zone.addEventListener("mouseenter", (event) => {
      const index = Number(zone.dataset.index);
      tooltip.style.display = "block";
      tooltip.style.left = `${Math.min(event.offsetX + 10, target.clientWidth - 150)}px`;
      tooltip.style.top = `${Math.max(event.offsetY - 20, 4)}px`;
      tooltip.innerHTML = html`<b
          >${index === offset ? "오늘" : `${offset - index}일 전`} 실측</b
        >
        ${sets
          .map(
            (set) =>
              html`<span class="tooltip-row series-${set.key}"
                >${set.meta.label}<strong
                  >${won(set.actual[index])}원</strong
                ></span
              >`,
          )
          .join("")}`;
    });
    zone.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}

function bindForecastPoints(target, sets) {
  $$(".forecast-event-point", target).forEach((point) => {
    const horizon = Number(point.dataset.horizon);
    const apply = () => {
      state.horizon = horizon;
      if ($("#forecastMetrics"))
        $("#forecastMetrics").innerHTML = forecastMetrics();
      const label = $("#forecastHoverLabel");
      if (label) label.textContent = `D+${horizon} 예측값을 표시 중입니다.`;
      $$(".forecast-event-point", target).forEach((item) =>
        item.classList.toggle("active", item === point),
      );
      if ($("#horizonSlider")) $("#horizonSlider").value = String(horizon);
    };
    point.addEventListener("mouseenter", apply);
    point.addEventListener("click", () => {
      apply();
      if ($("#evidencePanel")) updateEvidencePanel();
    });
    if (horizon === state.horizon) point.classList.add("active");
  });
}

/** 대시보드·시장 시세 화면의 소형 스파크라인. */
function renderSparkline(target, itemId, typeKey = "auction") {
  if (!target) return;
  const source = MOCK.series[itemId][typeKey];
  const points = [...source.actual.slice(-10), ...source.forecast.slice(1)];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const W = 120;
  const H = 34;
  const path = points
    .map(
      (value, index) =>
        `${(index * W) / (points.length - 1)},${H - ((value - min) / (max - min || 1)) * (H - 4) - 2}`,
    )
    .join(" ");
  const splitX =
    ((source.actual.slice(-10).length - 1) * W) / (points.length - 1);
  target.innerHTML = html`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <polyline class="spark-line" points="${path}" />
    <line class="spark-split" x1="${splitX}" x2="${splitX}" y1="0" y2="${H}" />
  </svg>`;
}
