function renderChart(target, id = "cabbage", decorative = false) {
  if (!target) return;
  const data = MOCK.charts[id] || MOCK.charts.cabbage;
  const actual = data.actual,
    forecast = data.forecast;
  const all = [...actual, ...forecast, ...data.low, ...data.high];
  const min = Math.floor((Math.min(...all) - 150) / 500) * 500,
    max = Math.ceil((Math.max(...all) + 150) / 500) * 500;
  const W = 760,
    H = 290,
    p = { l: 56, r: 18, t: 18, b: 38 };
  const count = actual.length + forecast.length - 1;
  const x = (i) => p.l + (i * (W - p.l - p.r)) / (count - 1),
    y = (v) => p.t + ((max - v) * (H - p.t - p.b)) / (max - min);
  const actualPts = actual.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const offset = actual.length - 1;
  const forecastPts = forecast
    .map((v, i) => `${x(offset + i)},${y(v)}`)
    .join(" ");
  const area = [
    ...data.high.map((v, i) => `${x(offset + i)},${y(v)}`),
    ...data.low.map(
      (v, i) =>
        `${x(offset + data.low.length - 1 - i)},${y(data.low[data.low.length - 1 - i])}`,
    ),
  ].join(" ");
  const steps = 5;
  let grid = "";
  for (let i = 0; i < steps; i++) {
    const v = max - ((max - min) * i) / (steps - 1),
      yy = y(v);
    grid += html`<line
        class="grid-line"
        x1="${p.l}"
        x2="${W - p.r}"
        y1="${yy}"
        y2="${yy}"
      /><text class="axis-label" x="${p.l - 9}" y="${yy + 4}" text-anchor="end"
        >${Math.round(v).toLocaleString()}</text
      >`;
  }
  const labels = [
    "4/22",
    "4/29",
    "5/6",
    "5/13",
    "5/20",
    "5/27",
    "6/3",
    "6/10",
    "6/17",
  ];
  const labelMarkup = labels
    .map((l, i) => {
      const xx = p.l + (i * (W - p.l - p.r)) / (labels.length - 1);
      return html`<text
        class="axis-label"
        x="${xx}"
        y="${H - 11}"
        text-anchor="middle"
        >${l}</text
      >`;
    })
    .join("");
  target.innerHTML = html`<svg
      viewBox="0 0 ${W} ${H}"
      role="img"
      aria-label="${getIngredient(id).name} 실제 및 예측 가격 그래프"
    >
      ${grid}
      <polygon class="range-area" points="${area}" />
      <line
        class="today-line"
        x1="${x(offset)}"
        x2="${x(offset)}"
        y1="${p.t}"
        y2="${H - p.b}"
      />
      <polyline class="actual-line" points="${actualPts}" />
      <polyline class="forecast-line" points="${forecastPts}" />
      <circle
        class="chart-point"
        cx="${x(offset)}"
        cy="${y(actual.at(-1))}"
        r="5"
      />
      ${labelMarkup}
      <text
        class="axis-label"
        x="${x(offset)}"
        y="${H - 25}"
        text-anchor="middle"
        style="font-weight:800;fill:#185c4a"
      >
        오늘
      </text>
      ${actual
        .map(
          (v, i) =>
            html`<circle
              class="hit-point"
              data-value="${v}"
              cx="${x(i)}"
              cy="${y(v)}"
              r="9"
              fill="transparent"
            />`,
        )
        .join("")}
    </svg>
    <div class="chart-tooltip"></div>`;
  if (!decorative) {
    $$(".hit-point", target).forEach((dot) => {
      dot.onmouseenter = (e) => {
        const tt = $(".chart-tooltip", target);
        tt.style.display = "block";
        tt.style.left = `${Math.min(e.offsetX + 8, target.clientWidth - 100)}px`;
        tt.style.top = `${Math.max(e.offsetY - 48, 0)}px`;
        tt.innerHTML = `실제 도매가<strong>${money(dot.dataset.value)}/kg</strong>`;
      };
      dot.onmouseleave = () =>
        ($(".chart-tooltip", target).style.display = "none");
    });
  }
}
const average = (values) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
function buildChartSeries(source, granularity = "daily") {
  if (granularity === "weekly") {
    const actual = [];
    for (let i = 0; i < source.actual.length; i += 5)
      actual.push(average(source.actual.slice(i, i + 5)));
    actual[actual.length - 1] = source.actual.at(-1);
    const points = [0, 2, 4, 6, 8];
    return {
      actual,
      forecast: points.map((i) => source.forecast[i]),
      low: points.map((i) => (i === 0 ? source.actual.at(-1) : source.low[i])),
      high: points.map((i) =>
        i === 0 ? source.actual.at(-1) : source.high[i],
      ),
      labels: [
        "4월 4주",
        "5월 1주",
        "5월 2주",
        "5월 3주",
        "오늘",
        "1주 후",
        "2주 후",
        "3주 후",
        "4주 후",
      ],
    };
  }
  if (granularity === "monthly") {
    return {
      actual: [
        average(source.actual.slice(0, 12)),
        average(source.actual.slice(12, 24)),
        source.actual.at(-1),
      ],
      forecast: [source.actual.at(-1), source.forecast.at(-1)],
      low: [source.actual.at(-1), source.low.at(-1)],
      high: [source.actual.at(-1), source.high.at(-1)],
      labels: ["3월", "4월", "5월 현재", "6월 예측"],
    };
  }
  return {
    actual: [...source.actual],
    forecast: [...source.forecast],
    low: [...source.low],
    high: [...source.high],
    labels: [
      "4/22",
      "4/29",
      "5/6",
      "5/13",
      "5/20",
      "5/27",
      "6/3",
      "6/10",
      "6/17",
    ],
  };
}
const renderChartBase = renderChart;
function attachForecastInteractions(target, series) {
  const svg = target.querySelector("svg");
  if (!svg) return;
  svg.querySelector(".forecast-interactions")?.remove();
  const W = 760,
    H = 290,
    p = { l: 56, r: 18, t: 18, b: 38 },
    all = [...series.actual, ...series.forecast, ...series.low, ...series.high],
    min = Math.floor((Math.min(...all) - 150) / 500) * 500,
    max = Math.ceil((Math.max(...all) + 150) / 500) * 500,
    count = series.actual.length + series.forecast.length - 1,
    offset = series.actual.length - 1,
    x = (i) => p.l + (i * (W - p.l - p.r)) / (count - 1),
    y = (value) => p.t + ((max - value) * (H - p.t - p.b)) / (max - min),
    points =
      state.granularity === "daily"
        ? series.forecast
            .slice(1)
            .map((_, index) => ({ h: index + 1, i: index + 1 }))
        : state.granularity === "weekly"
          ? [
              { h: 1, i: 1 },
              { h: 2, i: 2 },
              { h: 3, i: 3 },
              { h: 4, i: 4 },
            ]
          : [{ h: 4, i: 1 }],
    ns = "http://www.w3.org/2000/svg",
    group = document.createElementNS(ns, "g");
  group.setAttribute("class", "forecast-interactions");
  points.forEach((point) => {
    const item = document.createElementNS(ns, "g"),
      cx = x(offset + point.i),
      cy = y(series.forecast[point.i]);
    item.setAttribute(
      "class",
      `forecast-event-point ${state.granularity === "daily" ? "daily-hover-zone" : ""}`,
    );
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      `${horizonLabel(point.h)} 예상 가격 ${money(series.forecast[point.i])}`,
    );
    item.innerHTML = html`<circle
        class="forecast-point-dot"
        cx="${cx}"
        cy="${cy}"
        r="4"
      /><circle class="forecast-point-hit" cx="${cx}" cy="${cy}" r="15" />`;
    const preview = () => {
      state.horizon = point.h;
      if ($("#forecastMetrics"))
        $("#forecastMetrics").innerHTML = forecastMetrics();
      const label = $("#forecastHoverLabel");
      if (label)
        label.textContent = `${horizonLabel(point.h)} 예측값을 표시 중입니다.`;
      updateForecastSelection();
    };
    const commit = () => {
      preview();
      state.evidenceHorizon = point.h;
      state.evidenceGranularity = state.granularity;
      updateEvidencePanel();
    };
    item.addEventListener("mouseenter", preview);
    item.addEventListener("focus", preview);
    item.addEventListener("click", commit);
    group.append(item);
  });
  svg.append(group);
}
renderChart = function (target, id = "cabbage", decorative = false) {
  if (!target) return;
  const source = MOCK.charts[id] || MOCK.charts.cabbage,
    series = buildChartSeries(source, state.granularity),
    previous = MOCK.charts[id];
  MOCK.charts[id] = series;
  renderChartBase(target, id, decorative);
  MOCK.charts[id] = previous;
  const labels = [...target.querySelectorAll("svg text.axis-label")].filter(
    (el) => el.getAttribute("y") === "279",
  );
  labels.forEach((el, index) => {
    if (index < series.labels.length) {
      el.textContent = series.labels[index];
      el.setAttribute(
        "x",
        String(
          56 +
            (index * (760 - 56 - 18)) / Math.max(1, series.labels.length - 1),
        ),
      );
      el.style.display = "";
    } else el.style.display = "none";
  });
  const svg = target.querySelector("svg");
  if (svg)
    svg.setAttribute(
      "aria-label",
      `${getIngredient(id).name} ${state.granularity === "daily" ? "일별" : state.granularity === "weekly" ? "주별" : "월별"} 실제 및 예측 가격 그래프`,
    );
  if (!decorative) attachForecastInteractions(target, series);
};
function getIngredient(id = state.ingredient) {
  return MOCK.ingredients.find((i) => i.id === id) || MOCK.ingredients[0];
}

// -----------------------------------------------------------------------------
// Chatbot and shared feedback UI
// -----------------------------------------------------------------------------
