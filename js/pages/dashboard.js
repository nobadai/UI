// -----------------------------------------------------------------------------
// 메인 대시보드 — T0 상태 스냅샷과 일일 파이프라인(T0 → T4) 진행 상황
// -----------------------------------------------------------------------------

function pipelineTracker() {
  return html`<section class="card pipeline-card">
    <div class="section-head">
      <div>
        <h2>오늘의 파이프라인</h2>
        <p>
          ${MOCK.meta.asOfLabel} 기준 · 시뮬레이션
          ${MOCK.meta.simulationDay}일차 (${MOCK.meta.simulationRange})
        </p>
      </div>
      <button class="button secondary" type="button" data-page="proposal">
        제안 상세 열기
      </button>
    </div>
    <ol class="pipeline-steps">
      ${MOCK.pipeline
        .map(
          (step) =>
            html`<li class="pipeline-step is-${step.state}">
              <span class="pipeline-stage">${step.stage}</span>
              <strong>${step.title}</strong>
              <small>${step.detail}</small>
              <b>${step.time}</b>
            </li>`,
        )
        .join("")}
    </ol>
    <div class="pipeline-loops">
      <span
        >사전 feedback 루프
        <b
          >${MOCK.orchestration.loops.preUsed} /
          ${MOCK.orchestration.loops.preMax}</b
        ></span
      >
      <span
        >사후 재조정 루프
        <b
          >${MOCK.orchestration.loops.postUsed} /
          ${MOCK.orchestration.loops.postMax}</b
        ></span
      >
      <span>두 루프 모두 소진 시 <b>매입 보류</b>로 안전 종료</span>
    </div>
  </section>`;
}

function snapshotCards() {
  return MOCK.snapshot.cards
    .map(
      (card) =>
        html`<article class="card kpi-card">
          <span>${card.label}</span><strong>${card.value}</strong>
          <small>${card.sub}</small>
          <code class="ref-id">${card.ref}</code>
        </article>`,
    )
    .join("");
}

function decisionSummaryCard() {
  const combined = MOCK.orchestration.combined;
  const critic = MOCK.orchestration.critic;
  const draft = MOCK.scenarios[0];
  return html`<article class="card decision-card">
    <div class="section-head">
      <div>
        <h2>오늘의 매입 판단</h2>
        <p>T1 초안에서 T3 조정까지의 결과 요약입니다.</p>
      </div>
      <span
        class="status-badge status-${critic.result === "PASS"
          ? "success"
          : "danger"}"
        >Critic ${critic.result}</span
      >
    </div>
    <div class="decision-flow">
      <div>
        <span>T1 초안 (A안)</span><strong>${draft.qtyTon}톤</strong
        ><small>${money(draft.amount)}</small>
      </div>
      <b>→</b>
      <div class="decision-final">
        <span>T3 조정 결과</span><strong>${combined.qtyTon}톤</strong
        ><small>${money(combined.amount)}</small>
      </div>
    </div>
    <ul class="axis-summary">
      ${combined.basis
        .map(
          (row) =>
            html`<li>
              <span class="axis-chip axis-${row.axis}"
                >${AXIS_LABEL[row.axis]}</span
              >
              <strong>${row.source}</strong>
              <small>${row.limit} → ${row.applied}</small>
            </li>`,
        )
        .join("")}
    </ul>
    <div class="decision-footer">
      <span class="status-badge status-warning"
        >${MOCK.orchestration.decision.label}</span
      >
      <button class="text-link" type="button" data-page="proposal">
        판정 근거 보기 →
      </button>
    </div>
  </article>`;
}

function priceCards() {
  return MOCK.items
    .map(
      (item) =>
        html`<article
          class="card price-card"
          data-item="${item.id}"
          tabindex="0"
        >
          <div>
            <h3>
              ${item.name}${item.coverage
                ? '<small class="prediction-coverage">예측 검증</small>'
                : ""}
            </h3>
            <div class="price-value">
              ${won(item.auction)}<small>${item.unit}</small>
            </div>
            <span class="change ${changeMark(item.change).tone}"
              >${changeMark(item.change).mark} ${changeMark(item.change).text}
              &nbsp;<small>전일 대비 경락가</small></span
            >
          </div>
          <div class="price-spark" data-spark="${item.id}"></div>
          <div class="price-types">
            <span>소매 <b>${won(item.retail)}</b></span
            ><span>중도매 <b>${won(item.wholesale)}</b></span>
          </div>
          <span class="status-badge status-${item.status}">${item.label}</span>
        </article>`,
    )
    .join("");
}

function dashboardPage() {
  const item = findItem();
  return html`<div class="content dashboard-page">
    <section class="mascot-briefing card">
      <div
        class="briefing-mascot mascot-binoculars"
        role="img"
        aria-label="시장 신호를 살피는 마스코트"
      ></div>
      <div>
        <span class="eyebrow">DAILY AGENT BRIEFING</span>
        <strong
          >매입 초안 ${MOCK.scenarios[0].qtyTon}톤이 세 부서 변경안을 거쳐
          ${MOCK.orchestration.combined.qtyTon}톤으로 조정됐어요.</strong
        >
        <p>
          Critic ${MOCK.orchestration.critic.result} 상태이며 제한 모드 기준으로
          사람의 최종 승인을 기다리고 있습니다.
        </p>
      </div>
      <button class="button primary" type="button" data-page="proposal">
        승인 화면으로
      </button>
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>T0 상태 스냅샷</h2>
          <p>
            ${MOCK.snapshot.asOf} 기준 · 오케스트레이터가 수집해 전원에게 동일
            배포한 값입니다.
          </p>
        </div>
        <span class="status-badge status-success">as_of ${MOCK.meta.asOf}</span>
      </div>
      <div class="cards kpi-grid">${snapshotCards()}</div>
    </section>

    ${pipelineTracker()}

    <section class="dashboard-middle">
      <article class="card chart-card">
        <div class="section-head">
          <div>
            <h2>${item.name} 가격 추이 &amp; D+18 예측</h2>
            <div class="legend">
              <span><i class="type-retail"></i>소매가</span
              ><span><i class="type-wholesale"></i>중도매가</span
              ><span><i class="type-auction"></i>경락가</span
              ><span><i class="range"></i>90% 예측 구간</span>
            </div>
          </div>
          <div class="chart-toolbar">
            ${itemSelect()}
            <button class="button ghost" type="button" data-page="forecast">
              전체 예측 화면
            </button>
          </div>
        </div>
        <div class="chart-wrap" id="mainChart"></div>
      </article>
      ${decisionSummaryCard()}
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>취급 품목 시세</h2>
          <p>
            ${MOCK.meta.asOfLabel} 기준 · 경락가 표시 · 카드를 누르면 해당
            품목으로 전환합니다.
          </p>
        </div>
        <button class="text-link" type="button" data-page="market">
          시장 시세 전체 보기 →
        </button>
      </div>
      <div class="cards price-grid">${priceCards()}</div>
    </section>
  </div>`;
}
