// -----------------------------------------------------------------------------
// 가격 시계열 그래프
// 하나의 화면에서 소매가·중도매가·경락가를 함께 표시합니다 (정의서 §6.1).
// 숫자는 ML 파이프라인 산출물을 대신하는 Mock이며 LLM이 만들지 않습니다.
//
// 상호작용 규칙
//  - 호버: 세로 기준선 하나가 따라오고, 세 가격을 같은 시점 기준으로 함께 읽습니다.
//  - 클릭: 예측 구간을 누르면 그 시점(D+n)이 고정되고 산출 근거가 갱신됩니다.
//    호버만으로는 선택이 바뀌지 않습니다.
// -----------------------------------------------------------------------------

/* 여백은 고정, 그리기 영역(W·H)은 컨테이너 실측값을 씁니다. 기본값은 폴백입니다. */
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

/** 전체 인덱스(과거 + 예측)를 하나의 축으로 다룹니다. offset 이후는 예측입니다. */
const valueAt = (set, index, offset) =>
  index <= offset ? set.actual[index] : set.forecast[index - offset];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * @param {HTMLElement} target 그래프를 그릴 컨테이너
 * @param {object} options
 *  - item: 품목 id
 *  - types: 표시할 가격유형 key 배열
 *  - band: 90% 예측 구간을 그릴 가격유형 key (없으면 생략)
 *  - pin: true면 예측 시점을 클릭해 고정할 수 있습니다 (가격 예측 화면)
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
  const { l, r, t, b } = CHART_BOX;
  // viewBox를 컨테이너 크기에 맞추면 좌우 빈 공간 없이 카드를 꽉 채우고,
  // 호버 기준선도 카드 전체 폭에서 반응합니다.
  const W = Math.max(360, Math.round(target.clientWidth) || CHART_BOX.W);
  const H = Math.max(220, Math.round(target.clientHeight) || CHART_BOX.H);

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
  const plotBottom = H - b;

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

  // 고정 표식(선택한 D+n). 슬라이더와 클릭이 같은 표식을 움직입니다.
  const pinnable = Boolean(options.pin) && !options.decorative;
  const pinIndex =
    offset + clamp(state.horizon, 1, sets[0].forecast.length - 1);
  const pin = pinnable
    ? html`<g class="chart-pin">
        <line
          class="pin-line"
          x1="${x(pinIndex)}"
          x2="${x(pinIndex)}"
          y1="${t}"
          y2="${plotBottom}"
        />
        ${sets
          .map(
            (set) =>
              html`<circle
                class="pin-dot series-${set.key}"
                cx="${x(pinIndex)}"
                cy="${y(valueAt(set, pinIndex, offset))}"
                r="4"
              />`,
          )
          .join("")}
        <g
          class="pin-flag"
          transform="translate(${clamp(x(pinIndex), l + 22, W - r - 22)},0)"
        >
          <rect x="-22" y="1" width="44" height="15" rx="7.5" />
          <text x="0" y="12" text-anchor="middle">
            D+${pinIndex - offset}
          </text>
        </g>
      </g>`
    : "";

  // 호버 기준선. 점이 아니라 세로선 하나로 세 가격을 같은 시점에서 읽습니다.
  const crosshair = options.decorative
    ? ""
    : html`<g class="chart-crosshair" aria-hidden="true">
        <line
          class="crosshair-line"
          x1="0"
          x2="0"
          y1="${t}"
          y2="${plotBottom}"
        />
        ${sets
          .map(
            (set) =>
              html`<circle
                class="crosshair-dot series-${set.key}"
                cx="0"
                cy="0"
                r="4.5"
              />`,
          )
          .join("")}
      </g>`;

  const zoneWidth = (W - l - r) / (count - 1);
  const hoverZones = options.decorative
    ? ""
    : Array.from({ length: count }, (_, i) => i)
        .map(
          (i) =>
            html`<rect
              class="hover-zone ${pinnable && i > offset ? "pinnable" : ""}"
              data-index="${i}"
              x="${x(i) - zoneWidth / 2}"
              y="${t}"
              width="${zoneWidth}"
              height="${plotBottom - t}"
            />`,
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
        y2="${plotBottom}"
      />
      ${lines} ${ticks} ${pin} ${crosshair} ${hoverZones}
    </svg>
    <div class="chart-tooltip"></div>`;

  if (options.decorative) return;
  // 슬라이더가 고정 표식을 움직일 때, 그리고 창 크기가 바뀌어 다시 그릴 때 씁니다.
  target.chartOptions = options;
  target.chartContext = {
    sets,
    offset,
    count,
    x,
    y,
    band,
    pin: pinnable,
    box: { l, r, t, W, plotBottom },
  };
  bindChartCrosshair(target);
}

/* 창 크기가 바뀌면 viewBox 기준이 달라지므로 다시 그립니다. */
let chartResizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(chartResizeTimer);
  chartResizeTimer = window.setTimeout(() => {
    const target = document.getElementById("mainChart");
    if (target && target.chartOptions)
      renderPriceChart(target, target.chartOptions);
  }, 180);
});

function bindChartCrosshair(target) {
  const context = target.chartContext;
  $$(".hover-zone", target).forEach((zone) => {
    const index = Number(zone.dataset.index);
    const show = (event) => showCrosshair(target, zone, index, event);
    zone.addEventListener("mouseenter", show);
    zone.addEventListener("mousemove", show);
    zone.addEventListener("click", () => {
      if (context.pin && index > context.offset)
        pinHorizon(index - context.offset);
    });
  });
  target.addEventListener("mouseleave", () => hideCrosshair(target));
}

function showCrosshair(target, zone, index, event) {
  const context = target.chartContext;
  if (!context) return;
  const group = $(".chart-crosshair", target);
  const px = context.x(index);
  const line = $(".crosshair-line", group);
  line.setAttribute("x1", px);
  line.setAttribute("x2", px);
  $$(".crosshair-dot", group).forEach((dot, i) => {
    dot.setAttribute("cx", px);
    dot.setAttribute(
      "cy",
      context.y(valueAt(context.sets[i], index, context.offset)),
    );
  });
  group.classList.add("is-on");
  renderChartTooltip(target, zone, index, event);
}

function hideCrosshair(target) {
  $(".chart-crosshair", target)?.classList.remove("is-on");
  const tooltip = $(".chart-tooltip", target);
  if (tooltip) tooltip.style.display = "none";
}

function renderChartTooltip(target, zone, index, event) {
  const context = target.chartContext;
  const tooltip = $(".chart-tooltip", target);
  if (!tooltip) return;
  const { offset, sets, band } = context;
  const horizon = index - offset;
  const head =
    index < offset
      ? `${offset - index}일 전 실측`
      : index === offset
        ? "오늘 실측"
        : `D+${horizon} 예측`;
  const bandSet = band ? sets.find((set) => set.key === band) : null;
  tooltip.innerHTML = html`<b>${head}</b> ${sets
      .map(
        (set) =>
          html`<span class="tooltip-row series-${set.key}"
            >${set.meta.label}<strong
              >${won(valueAt(set, index, offset))}원</strong
            ></span
          >`,
      )
      .join("")}
    ${
      bandSet && horizon > 0
        ? html`<span class="tooltip-band"
            >90% 구간 ${won(bandSet.low[horizon])} ~
            ${won(bandSet.high[horizon])}</span
          >`
        : ""
    }
    ${
      context.pin && horizon > 0
        ? html`<span class="tooltip-hint">클릭하면 이 시점으로 고정</span>`
        : ""
    }`;
  tooltip.style.display = "block";

  // viewBox 좌표가 아니라 실제 픽셀 위치를 기준으로 배치합니다.
  const wrapRect = target.getBoundingClientRect();
  const zoneRect = zone.getBoundingClientRect();
  const centerX = zoneRect.left + zoneRect.width / 2 - wrapRect.left;
  const width = tooltip.offsetWidth || 150;
  const height = tooltip.offsetHeight || 84;
  const left =
    centerX + 14 + width > target.clientWidth - 4
      ? centerX - width - 14
      : centerX + 14;
  tooltip.style.left = `${Math.max(4, left)}px`;
  const pointerY = event ? event.clientY - wrapRect.top - 16 : 12;
  tooltip.style.top = `${clamp(pointerY, 4, Math.max(4, target.clientHeight - height - 4))}px`;
}

/**
 * 예측 시점을 고정합니다. 그래프 클릭과 예측 지평 슬라이더가 같은 함수를 씁니다.
 * @param {number} horizon D+n
 * @param {boolean} withEvidence 산출 근거 패널까지 갱신할지 여부
 */
function pinHorizon(horizon, withEvidence = true) {
  state.horizon = horizon;
  updateChartPin();
  const slider = $("#horizonSlider");
  if (slider) slider.value = String(horizon);
  const sliderValue = $("#horizonValue");
  if (sliderValue) sliderValue.textContent = `D+${horizon}`;
  const metrics = $("#forecastMetrics");
  if (metrics) metrics.innerHTML = forecastMetrics();
  const label = $("#forecastHoverLabel");
  if (label) label.textContent = `D+${horizon} 시점을 고정했습니다.`;
  if (withEvidence && $("#evidencePanel")) updateEvidencePanel();
}

/** 고정 표식만 새 위치로 옮깁니다. 그래프 전체를 다시 그리지 않습니다. */
function updateChartPin(target = $("#mainChart")) {
  const context = target && target.chartContext;
  if (!context || !context.pin) return;
  const group = $(".chart-pin", target);
  if (!group) return;
  const { offset, sets, x, y, box } = context;
  const index = offset + clamp(state.horizon, 1, sets[0].forecast.length - 1);
  const px = x(index);
  const line = $(".pin-line", group);
  line.setAttribute("x1", px);
  line.setAttribute("x2", px);
  $$(".pin-dot", group).forEach((dot, i) => {
    dot.setAttribute("cx", px);
    dot.setAttribute("cy", y(valueAt(sets[i], index, offset)));
  });
  const flag = $(".pin-flag", group);
  flag.setAttribute(
    "transform",
    `translate(${clamp(px, box.l + 22, box.W - box.r - 22)},0)`,
  );
  $("text", flag).textContent = `D+${index - offset}`;
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
