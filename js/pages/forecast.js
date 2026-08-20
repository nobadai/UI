// -----------------------------------------------------------------------------
// 금일 도매가 예측(ML) — 소매가 · 중도매가 · 경락가를 한 화면에서 표시합니다.
// -----------------------------------------------------------------------------

/** 선택한 지평(D+n)의 예측 지표를 계산합니다. */
function forecastPoint(
  itemId = state.item,
  horizon = state.horizon,
  typeKey = "auction",
) {
  const source = MOCK.series[itemId][typeKey];
  const index = Math.min(Math.max(horizon, 1), source.forecast.length - 1);
  const current = source.actual.at(-1);
  const price = source.forecast[index];
  return {
    index,
    price,
    low: source.low[index],
    high: source.high[index],
    current,
    change: ((price - current) / current) * 100,
    width: ((source.high[index] - source.low[index]) / price) * 100,
  };
}

function forecastMetrics(itemId = state.item) {
  const base = forecastPoint(itemId, state.horizon, "auction");
  return html`<div>
      <span>D+${state.horizon} 예상 경락가</span
      ><strong>${won(base.price)}원/kg</strong
      ><small
        >현재 대비
        <b class="${base.change >= 0 ? "negative" : "positive"}"
          >${base.change >= 0 ? "+" : ""}${base.change.toFixed(1)}%</b
        ></small
      >
    </div>
    <div>
      <span>90% 예측 구간</span
      ><strong>${won(base.low)} ~ ${won(base.high)}</strong
      ><small>구간 폭 ${base.width.toFixed(1)}%</small>
    </div>
    <div>
      <span>중도매가 · 소매가</span
      ><strong
        >${won(forecastPoint(itemId, state.horizon, "wholesale").price)} ·
        ${won(forecastPoint(itemId, state.horizon, "retail").price)}</strong
      ><small>같은 시점 동시 예측</small>
    </div>`;
}

function forecastPanel() {
  return html`<section class="forecast-panel" aria-label="가격 예측 정보">
    <div class="forecast-guide">
      <span class="forecast-guide-icon">↗</span
      ><span
        ><strong id="forecastHoverLabel"
          >D+${state.horizon} 예측값을 표시 중입니다.</strong
        >
        모델 예측 지평은 D+1 ~ D+18입니다. 점선 위 지점을 클릭하면 아래 산출
        근거가 해당 시점 기준으로 갱신됩니다.</span
      >
    </div>
    <label class="horizon-control">
      <span>예측 지평</span>
      <input
        type="range"
        id="horizonSlider"
        min="1"
        max="18"
        value="${state.horizon}"
        aria-label="예측 지평 선택"
      />
      <b id="horizonValue">D+${state.horizon}</b>
    </label>
    <div class="forecast-metrics" id="forecastMetrics">
      ${forecastMetrics()}
    </div>
  </section>`;
}

function priceTypeToggle() {
  return html`<div
    class="price-type-toggle"
    role="group"
    aria-label="표시할 가격 유형"
  >
    ${MOCK.priceTypes
      .map(
        (type) =>
          html`<button
            type="button"
            class="type-chip type-${type.key} ${state.priceTypes.includes(
              type.key,
            )
              ? "on"
              : ""}"
            data-price-type="${type.key}"
            aria-pressed="${state.priceTypes.includes(type.key)}"
          >
            <i></i>${type.label}<small>${type.desc}</small>
          </button>`,
      )
      .join("")}
  </div>`;
}

function itemSelect() {
  return html`<select class="filter-control item-filter" aria-label="품목 선택">
    ${MOCK.items
      .map(
        (item) =>
          html`<option
            value="${item.id}"
            ${state.item === item.id ? "selected" : ""}
          >
            ${item.name}${item.coverage ? " (예측 검증)" : ""}
          </option>`,
      )
      .join("")}
  </select>`;
}

function forecastPage() {
  const item = findItem();
  return html`<div class="content forecast-page">
    <section class="mascot-briefing card">
      <div
        class="briefing-mascot mascot-magnifier"
        role="img"
        aria-label="가격 신호를 살펴보는 마스코트"
      ></div>
      <div>
        <span class="eyebrow">ML PRICE FORECAST · D+18</span>
        <strong
          >${item.name} 경락가는 D+18에 ${won(item.d18)}원/kg으로
          예측됩니다.</strong
        >
        <p>
          모든 예측값은 ML 파이프라인 산출물입니다. LLM은 가격 숫자를 생성하지
          않습니다 (정의서 §1.2).
        </p>
      </div>
      <button class="button secondary" type="button" data-page="proposal">
        매입 제안 보기
      </button>
    </section>

    <article class="card chart-card">
      <div class="section-head">
        <div>
          <h2>${item.name} 가격 추이 &amp; 예측</h2>
          <p>
            ${MOCK.meta.asOfLabel} 기준 · ${MOCK.meta.source} · 실선은 실측,
            점선은 예측입니다.
          </p>
        </div>
        <div class="chart-toolbar">
          ${itemSelect()}
          <select
            class="filter-control band-filter"
            aria-label="예측 구간 표시"
          >
            <option
              value="auction"
              ${state.band === "auction" ? "selected" : ""}
            >
              구간: 경락가
            </option>
            <option value="wholesale">구간: 중도매가</option>
            <option value="retail">구간: 소매가</option>
            <option value="">구간 숨김</option>
          </select>
        </div>
      </div>
      ${priceTypeToggle()}
      <div class="chart-wrap" id="mainChart"></div>
      ${forecastPanel()}
    </article>

    <div class="detail-grid">
      ${evidenceCard()}
      <article class="card">
        <div class="section-head">
          <div>
            <h2>품목별 D+18 예측 요약</h2>
            <p>
              경락가 기준. 예측 검증 품목과 시세 모니터링 품목을 구분합니다.
            </p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>품목</th>
                <th>오늘 경락가</th>
                <th>D+18 예측</th>
                <th>변동</th>
                <th>구분</th>
              </tr>
            </thead>
            <tbody>
              ${MOCK.items
                .map((row) => {
                  const rate = ((row.d18 - row.auction) / row.auction) * 100;
                  return html`<tr>
                    <td><strong>${row.name}</strong></td>
                    <td>${won(row.auction)}원</td>
                    <td>${won(row.d18)}원</td>
                    <td class="${changeMark(rate).tone}">
                      ${changeMark(rate).mark} ${changeMark(rate).text}
                    </td>
                    <td>
                      <span
                        class="status-badge status-${row.coverage
                          ? "success"
                          : "warning"}"
                        >${row.coverage ? "예측 검증" : "시세 모니터링"}</span
                      >
                    </td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </div>`;
}

// ----------------------------------------------------------------- 산출 근거
const EVIDENCE_SOURCES = [
  {
    ref: "kamis_auction_20260820",
    source: "KAMIS 경락가",
    note: "가락시장 일별 낙찰 단가",
  },
  {
    ref: "kma_weather_20260820",
    source: "기상 관측",
    note: "주산지 기온·강수",
  },
  {
    ref: "at_supply_20260820",
    source: "반입량 통계",
    note: "도매시장 일별 반입량",
  },
];

function evidenceSignals(horizon = state.horizon) {
  const supply = Math.min(18.4, 6.2 + horizon * 0.62);
  const rain = Math.min(92.4, 24.6 + horizon * 3.4);
  const temperature = Math.min(32.4, 28.6 + horizon * 0.2);
  return html`<div>
      <span>공급 여력</span
      ><strong class="negative">-${supply.toFixed(1)}%</strong
      ><small>평년 대비</small>
    </div>
    <div>
      <span>누적 강수</span><strong>${rain.toFixed(1)}mm</strong
      ><small>선택 시점까지</small>
    </div>
    <div>
      <span>평균 기온</span><strong>${temperature.toFixed(1)}℃</strong
      ><small>주산지 기준</small>
    </div>`;
}

function evidenceCard() {
  return html`<article
    class="card evidence-card"
    id="evidencePanel"
    aria-live="polite"
  >
    <div class="section-head">
      <div>
        <h2>선택 시점 산출 근거</h2>
        <p>그래프에서 선택한 예측 시점의 판단 근거입니다.</p>
      </div>
      <span class="evidence-selected-label" id="evidenceSelectedLabel"
        >D+${state.horizon} 기준</span
      >
    </div>
    <div class="evidence-provenance">
      <span>as_of ${MOCK.meta.asOf}</span><span>${MOCK.meta.source}</span
      ><b>Mock Data</b>
    </div>
    <div class="evidence-signal-grid" id="evidenceSignals">
      ${evidenceSignals()}
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ref_id</th>
            <th>출처</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          ${EVIDENCE_SOURCES.map(
            (row) =>
              html`<tr>
                <td><code class="ref-id">${row.ref}</code></td>
                <td>${row.source}</td>
                <td>${row.note}</td>
              </tr>`,
          ).join("")}
        </tbody>
      </table>
    </div>
    <div class="ai-summary" id="evidenceExplanation">
      <strong>AI 근거 해석</strong>주산지 고온·강수 누적과 반입량 감소가 함께
      확인됩니다. 숫자를 포함한 모든 주장에는 ref_id가 붙어 있으며, 없으면
      Critic이 FAIL 처리합니다.
    </div>
  </article>`;
}

function updateEvidencePanel() {
  const card = $("#evidencePanel");
  if (!card) return;
  $("#evidenceSelectedLabel").textContent = `D+${state.horizon} 기준`;
  $("#evidenceSignals").innerHTML = evidenceSignals();
  $("#evidenceExplanation").innerHTML = html`<strong
      >D+${state.horizon} AI 근거 해석</strong
    >선택 시점까지 누적된 고온·강수와 반입량 감소를 반영했습니다. 예측 구간이
    넓어질수록 불확실성이 커지므로 매입 판단은 구간 하단을 함께 봅니다.`;
  card.classList.remove("evidence-updated");
  void card.offsetWidth;
  card.classList.add("evidence-updated");
}
