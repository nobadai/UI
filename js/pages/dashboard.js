const predictionIngredientIds = ["cabbage", "onion"];
const priceCards = () =>
  MOCK.ingredients
    .map(
      (i) =>
        html`<article
          class="card price-card"
          data-ingredient="${i.id}"
          tabindex="0"
        >
          <div class="photo-slot" aria-label="${i.name} 사진 자리">사진</div>
          <div>
            <h3>
              ${i.name}${predictionIngredientIds.includes(i.id)
                ? '<small class="prediction-coverage">예측 검증</small>'
                : ""}
            </h3>
            <div class="price-value">
              ${money(i.price).replace("원", "")}<small>${i.unit}</small>
            </div>
            <span class="change ${i.change > 0 ? "up" : "down"}"
              >${i.change > 0 ? "▲" : "▼"} ${Math.abs(i.change)}% &nbsp;<small
                >전일 대비</small
              ></span
            >
          </div>
          <span class="status-badge status-${i.status}">${i.label}</span>
        </article>`,
    )
    .join("");
const selectOptions = () =>
  MOCK.ingredients
    .filter((i) => predictionIngredientIds.includes(i.id))
    .map(
      (i) =>
        html`<option
          value="${i.id}"
          ${state.ingredient === i.id ? "selected" : ""}
        >
          ${i.name}
        </option>`,
    )
    .join("");
const forecastPoint = (id = state.ingredient, horizon = state.horizon) => {
  const chart = MOCK.charts[id] || MOCK.charts.cabbage;
  const index =
    state.granularity === "daily"
      ? Math.min(Math.max(horizon, 1), chart.forecast.length - 1)
      : Math.min(horizon * 2, chart.forecast.length - 1);
  const current = chart.actual.at(-1);
  const price = chart.forecast[index];
  const probability = Math.max(
    52,
    Math.min(
      91,
      ({ cabbage: 72, "green-onion": 59, onion: 44, radish: 61, garlic: 39 }[
        id
      ] || 60) +
        (state.granularity === "daily" ? Math.ceil(index / 2) : horizon * 2),
    ),
  );
  return {
    price,
    low: chart.low[index],
    high: chart.high[index],
    probability,
    change: ((price - current) / current) * 100,
    index,
  };
};
const horizonLabel = (value) =>
  state.granularity === "daily"
    ? `${value}일 후`
    : state.granularity === "monthly"
      ? "1개월 후"
      : `${value}주 후`;
function forecastMetrics() {
  const f = forecastPoint();
  return html`<div>
      <span>${horizonLabel(state.horizon)} 예상 가격</span
      ><strong>${money(f.price)}/kg</strong
      ><small
        >현재 대비
        <b class="${f.change >= 0 ? "negative" : "positive"}"
          >${f.change >= 0 ? "+" : ""}${f.change.toFixed(1)}%</b
        ></small
      >
    </div>
    <div>
      <span>가격 상승 가능성</span><strong>${f.probability}%</strong
      ><small>AI 종합 예측 신뢰도</small>
    </div>
    <div>
      <span>예측 가격 범위</span
      ><strong>${money(f.low)} ~ ${money(f.high)}</strong
      ><small>90% 예측 구간</small>
    </div>`;
}
function forecastPanel() {
  return html`<section class="forecast-panel" aria-label="가격 예측 정보">
    <div class="forecast-guide">
      <span class="forecast-guide-icon">↗</span
      ><span
        ><strong id="forecastHoverLabel"
          >${horizonLabel(state.horizon)} 예측값을 표시 중입니다.</strong
        >
        모델은 1~18 영업일을 예측하고 화면에서는 달력 날짜로 표시합니다. 점선을
        클릭하면 해당 시점 근거가 갱신됩니다.</span
      >
    </div>
    <div class="forecast-metrics" id="forecastMetrics">
      ${forecastMetrics()}
    </div>
  </section>`;
}
function granularityControl() {
  return html`<label class="granularity-control"
    ><span>조회 단위</span
    ><select
      class="filter-control granularity-filter"
      aria-label="그래프 조회 단위"
    >
      <option value="daily" ${state.granularity === "daily" ? "selected" : ""}>
        일별
      </option>
      <option
        value="weekly"
        ${state.granularity === "weekly" ? "selected" : ""}
      >
        주별
      </option>
      <option
        value="monthly"
        ${state.granularity === "monthly" ? "selected" : ""}
      >
        월별
      </option>
    </select></label
  >`;
}
const periodOptions = {
  daily: ["4주", "8주", "12주"],
  weekly: ["3개월", "6개월", "1년"],
  monthly: ["1년", "3년", "5년"],
};

function dashboardPage(focusIngredient = false) {
  return html`<div
    class="content integrated-dashboard ${focusIngredient
      ? "ingredient-focus"
      : ""}"
  >
    <section class="mascot-briefing card">
      <div
        class="briefing-mascot mascot-magnifier"
        role="img"
        aria-label="시장 신호를 분석하는 원가 캣쳐 마스코트"
      ></div>
      <div>
        <span class="eyebrow">AI MARKET BRIEFING</span>
        <strong
          >${focusIngredient
            ? "배추·양파 가격 전망과 근거를 함께 확인하세요."
            : "배추·양파를 우선 검증하고 확장 품목의 현재가를 모니터링해요."}</strong
        >
        <p>
          현재 정의서 기준 검증 품목은 배추·양파이며, 다른 품목은 시세
          모니터링용 Mock Data입니다.
        </p>
      </div>
      <button class="button secondary" type="button" data-page="detail">
        상세 근거 보기
      </button>
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>오늘의 주요 식자재 도매가</h2>
          <p>
            2026.08.13 06:00 기준 · aT 가락시장 · 도매 · 상품 · kg 환산 Mock
            기준
          </p>
        </div>
        <div class="section-actions">
          <select class="filter-control" id="dateFilter">
            <option>2026.08.13 (목)</option>
            <option>2026.08.12 (수)</option>
          </select>
          <select class="filter-control" id="storeFilter">
            <option>전체 매장</option>
            ${MOCK.stores
              .slice(0, 4)
              .map((store) => html`<option>${store.name}</option>`)
              .join("")}
          </select>
        </div>
      </div>
      <div class="cards price-grid">${priceCards()}</div>
    </section>

    <section class="dashboard-middle" id="ingredientAnalysis">
      <article class="card chart-card">
        <div class="section-head">
          <div>
            <h2>식자재 가격 추이 & 예측</h2>
            <div class="legend">
              <span><i></i>실제 가격</span
              ><span><i class="forecast"></i>예측 가격</span
              ><span><i class="range"></i>예측 범위</span>
            </div>
          </div>
          <div class="chart-toolbar">
            <select class="filter-control ingredient-filter">
              ${selectOptions()}
            </select>
            <select class="filter-control period-filter">
              <option>4주</option>
              <option>8주</option>
              <option>12주</option>
            </select>
          </div>
        </div>
        <div class="chart-wrap" id="mainChart"></div>
        ${forecastPanel()}
      </article>
      ${evidenceCard()}
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>내 메뉴 원가 영향 TOP 3</h2>
          <p>
            <span id="impactIngredient">배추</span> 가격 예측이 등록 메뉴 원가에
            미치는 영향
          </p>
        </div>
        <button class="text-link" data-page="menu-cost">
          전체 메뉴 분석 →
        </button>
      </div>
      <div class="cards cost-grid">${impactCards()}</div>
    </section>
  </div>`;
}

function evidenceCard() {
  return html`<article
    class="card evidence-card"
    id="evidenceCard"
    aria-live="polite"
  >
    <div class="section-head">
      <div>
        <h2>선택 시점 산출 근거</h2>
        <p>그래프에서 선택한 예측 시점에 가격 판단의 근거가 된 데이터입니다.</p>
      </div>
      <div class="evidence-head-actions">
        <span class="evidence-selected-label" id="evidenceSelectedLabel"
          >오늘 기준</span
        ><button class="text-link" data-page="detail">전체 근거 보기 →</button>
      </div>
    </div>
    <div class="evidence-provenance">
      <span>aT 도매가격 · kg 환산</span><span>주산지 기상 관측</span
      ><span>공개 시점 기준 데이터</span><b>Mock Data</b>
    </div>
    <div class="evidence-signal-grid" id="evidenceSignals">
      ${evidenceSignalCards()}
    </div>
    <div
      class="evidence-view-tabs"
      role="tablist"
      aria-label="근거 데이터 종류"
    >
      <button
        class="active"
        type="button"
        role="tab"
        aria-selected="true"
        data-evidence-view="production"
      >
        생산 · 수급</button
      ><button
        type="button"
        role="tab"
        aria-selected="false"
        data-evidence-view="weather"
      >
        기상
      </button>
    </div>
    <section class="evidence-block">
      <div id="evidenceDetailBody">${productionTable()}</div>
    </section>
    <div class="ai-summary" id="evidenceExplanation">
      <strong>AI 근거 해석</strong>최근 주산지의 고온·강수와 출하량 감소가
      동시에 확인되었습니다. 실제 제품에서는 기준일 당시 공개된 데이터만 결합해
      예측 근거를 재현합니다.
    </div>
  </article>`;
}
function evidenceSignalCards(horizon = 0, granularity = "daily") {
  const days = evidenceDays(horizon, granularity),
    supply = Math.min(18.4, 9.6 + days * 0.18),
    rain = Math.min(82.6, 38.2 + days * 0.7),
    temperature = Math.min(32.8, 30.2 + days * 0.05);
  return html`<div>
      <span>공급 여력</span
      ><strong class="negative">-${supply.toFixed(1)}%</strong
      ><small>평년 대비</small>
    </div>
    <div>
      <span>누적 강수</span><strong>${rain.toFixed(1)}mm</strong
      ><small>선택 시점 영향</small>
    </div>
    <div>
      <span>평균 기온</span><strong>${temperature.toFixed(1)}℃</strong
      ><small>주산지 기준</small>
    </div>`;
}
const evidenceDays = (horizon, granularity) =>
  granularity === "daily"
    ? horizon
    : granularity === "weekly"
      ? horizon * 7
      : 30;
function productionTable(horizon = 0, granularity = "daily") {
  let rows = MOCK.production;
  if (horizon > 0) {
    const days = evidenceDays(horizon, granularity),
      derived = [
        ["생산량", Math.max(68000, 82300 - days * 220), 91000, 87600, "t"],
        ["재배면적", Math.max(13800, 15240 - days * 18), 16310, 15980, "ha"],
        ["출하량", Math.max(64000, 78500 - days * 260), 88900, 83100, "t"],
      ];
    rows = derived.map(([metric, current, normal, previous, unit]) => ({
      metric,
      current: `${current.toLocaleString()}${unit}`,
      normal: `${normal.toLocaleString()}${unit}`,
      previous: `${previous.toLocaleString()}${unit}`,
      change: `${(((current - normal) / normal) * 100).toFixed(1)}%`,
    }));
  }
  return html`<div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>지표</th>
          <th>${horizon ? "예상" : "현재"}</th>
          <th>평년</th>
          <th>전년 동기</th>
          <th>변화율</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) =>
              html`<tr>
                <td><strong>${r.metric}</strong></td>
                <td>${r.current}</td>
                <td>${r.normal}</td>
                <td>${r.previous}</td>
                <td class="negative">▼ ${r.change.replace("-", "")}</td>
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}
function weatherTable(horizon = 0, granularity = "daily") {
  let rows = MOCK.weather;
  if (horizon > 0) {
    const focus = evidenceDays(horizon, granularity),
      start = Math.max(1, focus - 2);
    rows = Array.from({ length: 5 }, (_, i) => {
      const day = start + i,
        temp = 27.2 + Math.min(day, 18) * 0.18,
        rain = 10 + (day % 4) * 10.4,
        humidity = 68 + (day % 5) * 4,
        risk =
          temp >= 29.5 || rain >= 38
            ? "위험"
            : temp >= 28.2 || rain >= 25
              ? "주의"
              : "안정";
      return {
        date: `D+${day}`,
        temp: `${temp.toFixed(1)}℃`,
        rain: `${rain.toFixed(1)}mm`,
        humidity: `${humidity}%`,
        risk,
      };
    });
  }
  return html`<div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>평균기온</th>
          <th>강수량</th>
          <th>습도</th>
          <th>위험도</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) =>
              html`<tr>
                <td>${r.date}</td>
                <td>${r.temp}</td>
                <td class="${parseFloat(r.rain) > 30 ? "negative" : ""}">
                  ${r.rain}
                </td>
                <td>${r.humidity}</td>
                <td>
                  <span
                    class="status-badge status-${r.risk === "위험"
                      ? "danger"
                      : r.risk === "주의"
                        ? "warning"
                        : "success"}"
                    >${r.risk}</span
                  >
                </td>
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}
function updateEvidencePanel() {
  const card = $("#evidenceCard");
  if (!card) return;
  const label = horizonLabel(state.evidenceHorizon),
    days = evidenceDays(state.evidenceHorizon, state.evidenceGranularity),
    view =
      $(".evidence-view-tabs .active")?.dataset.evidenceView || "production";
  $("#evidenceSelectedLabel").textContent = `${label} 예측 근거`;
  $("#evidenceSignals").innerHTML = evidenceSignalCards(
    state.evidenceHorizon,
    state.evidenceGranularity,
  );
  $("#evidenceDetailBody").innerHTML =
    view === "weather"
      ? weatherTable(state.evidenceHorizon, state.evidenceGranularity)
      : productionTable(state.evidenceHorizon, state.evidenceGranularity);
  $("#evidenceExplanation").innerHTML = html`<strong
      >${label} AI 근거 해석</strong
    >선택 시점까지 누적된 고온·강수 위험과 출하량 감소 추세를 반영했습니다.
    ${days}일 누적 영향으로 공급 여력이 낮아져 가격 상승 위험이 확대되는
    시나리오입니다.`;
  card.classList.remove("evidence-updated");
  void card.offsetWidth;
  card.classList.add("evidence-updated");
}
function impactCards() {
  return MOCK.menuImpacts
    .map(
      (m) =>
        html`<article class="card menu-impact">
          <div class="menu-top">
            <div class="menu-photo-slot" aria-label="${m.name} 사진 자리">
              사진
            </div>
            <div>
              <h3>${m.name}</h3>
              <span class="ingredient-use">${m.use}</span>
            </div>
            <div class="impact-delta">
              +${money(m.delta)}<small>▲ ${m.rate}%</small>
            </div>
          </div>
          <div class="cost-flow">
            <div>
              <span>현재 원가</span><strong>${money(m.current)}</strong>
            </div>
            <b>→</b>
            <div>
              <span>예상 원가 (3주 후)</span><strong>${money(m.future)}</strong>
            </div>
          </div>
          <div class="impact-footer">
            <span class="status-badge status-${m.status}">영향 ${m.level}</span
            ><button class="text-link" data-page="menu-cost">
              원가 상세 보기 →
            </button>
          </div>
        </article>`,
    )
    .join("");
}

// -----------------------------------------------------------------------------
// Feature page renderers
// -----------------------------------------------------------------------------
