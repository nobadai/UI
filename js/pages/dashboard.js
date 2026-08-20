// -----------------------------------------------------------------------------
// ADMIN 메인 대시보드
//
// 이 화면이 답해야 하는 질문은 하나입니다.
// "오늘 회사가 어떤 상태이며, 어떤 의사결정을 승인해야 하는가?"
// 그래서 상태 → 판단 흐름 → 시나리오 → 가격 순서로 내려갑니다.
// -----------------------------------------------------------------------------

function asOfStrip() {
  return html`<div class="asof-strip">
    <div><span>기준일</span><strong>${MOCK.meta.asOfLabel}</strong></div>
    <div>
      <span>시뮬레이션</span><strong>${MOCK.meta.simulationDay}일차</strong
      ><small>${MOCK.meta.simulationRange}</small>
    </div>
    <div>
      <span>as_of</span><strong>${MOCK.meta.asOf}</strong
      ><small>이후 데이터 참조 금지</small>
    </div>
    <div>
      <span>자율성 모드</span><strong>제한</strong
      ><small>사람이 최종 선택·승인</small>
    </div>
  </div>`;
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

/** T0 → T4를 흐름 그대로 세로로 배치하고, T2만 세 부서로 갈라 보여줍니다. */
function agentFlow() {
  const critic = MOCK.orchestration.critic;
  const combined = MOCK.orchestration.combined;
  const loops = MOCK.orchestration.loops;
  return html`<section class="card flow-card">
    <div class="section-head">
      <div>
        <h2>오늘의 Agent Pipeline</h2>
        <p>T0 상태 배포부터 사람 승인까지 오늘 실제로 지나온 경로입니다.</p>
      </div>
      <button class="button secondary" type="button" data-page="proposal">
        제안 상세 열기
      </button>
    </div>

    <ol class="agent-flow">
      <li class="flow-node is-done">
        <span class="flow-stage">T0</span>
        <strong>상태 스냅샷</strong>
        <p>가용자금·재고·확정주문·예측을 전원에게 동일 배포</p>
        <b>06:00</b>
      </li>
      <li class="flow-node is-done">
        <span class="flow-stage">ML</span>
        <strong>가격 예측</strong>
        <p>${findItem().name} D+18 ${won(findItem().d18)}원/kg</p>
        <b>06:05</b>
      </li>
      <li class="flow-node is-done">
        <span class="flow-stage">T1</span>
        <strong>매입 초안</strong>
        <p>시나리오 3안 · A안은 예산 초과를 인지하고 제출</p>
        <b>06:12</b>
      </li>

      <li class="flow-branch">
        <span class="flow-stage">T2</span>
        <div class="flow-branch-head">
          <strong>제약 검토 · 3부서 병렬</strong>
          <small>판정 + 데이터 + 이유 + 변경안</small>
        </div>
        <div class="flow-agents">
          ${MOCK.verdicts
            .map(
              (verdict) =>
                html`<div class="flow-agent agent-${verdict.agent}">
                  <span>${verdict.agentLabel}</span>
                  <b
                    class="status-badge status-${
                      VERDICT_STATUS[verdict.verdict]
                    }"
                    >${VERDICT_LABEL[verdict.verdict]}</b
                  >
                  <small
                    >${
                      verdict.suggested_adjustment
                        ? `${AXIS_LABEL[verdict.suggested_adjustment.axis]} 축 변경안`
                        : "변경안 없음"
                    }</small
                  >
                </div>`,
            )
            .join("")}
        </div>
      </li>

      <li class="flow-node is-done">
        <span class="flow-stage">T3</span>
        <strong>오케스트레이터 조정</strong>
        <p>
          ${MOCK.scenarios[0].qtyTon}톤 → ${combined.qtyTon}톤 ·
          ${money(combined.amount)}
        </p>
        <b>06:31</b>
      </li>
      <li class="flow-node is-${critic.result === "PASS" ? "done" : "fail"}">
        <span class="flow-stage">CRITIC</span>
        <strong>검증 ${critic.result}</strong>
        <p>코드 검사 3건 · LLM 대조 1건</p>
        <b>${critic.time}</b>
      </li>
      <li class="flow-node is-active">
        <span class="flow-stage">승인</span>
        <strong>${MOCK.orchestration.decision.label}</strong>
        <p>${MOCK.orchestration.decision.mode}</p>
        <b>—</b>
      </li>
      <li class="flow-node is-waiting">
        <span class="flow-stage">T4</span>
        <strong>State DB 반영</strong>
        <p>승인 후 현금·재고·손익이 다음 날 T0으로 넘어갑니다</p>
        <b>-</b>
      </li>
    </ol>

    <div class="pipeline-loops">
      <span>사전 feedback 루프 <b>${loops.preUsed} / ${loops.preMax}</b></span>
      <span>사후 재조정 루프 <b>${loops.postUsed} / ${loops.postMax}</b></span>
      <span>두 루프 모두 소진 시 <b>매입 보류</b>로 안전 종료</span>
    </div>
  </section>`;
}

function decisionSummaryCard() {
  const combined = MOCK.orchestration.combined;
  const draft = MOCK.scenarios[0];
  return html`<article class="card decision-card">
    <div class="section-head">
      <div>
        <h2>오늘 승인할 매입안</h2>
        <p>세 부서 상한을 결합한 오케스트레이터 산출 결과입니다.</p>
      </div>
      <span class="status-badge status-warning"
        >${MOCK.orchestration.decision.label}</span
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
      <span class="split-hint"
        >${combined.splits
          .map((split) => `${split.when} ${split.qtyTon}톤`)
          .join(" · ")}</span
      >
      <button class="text-link" type="button" data-page="proposal">
        판정 근거 보기 →
      </button>
    </div>
  </article>`;
}

/** 오늘의 매입 시나리오 요약. 상세 검토는 제안 상세 화면에서 합니다. */
function scenarioSummary() {
  return html`<div class="cards scenario-summary">
    ${MOCK.scenarios
      .map(
        (scenario) =>
          html`<article
            class="card scenario-brief"
            data-page="proposal"
            tabindex="0"
          >
            <header>
              <h3>${scenario.name}</h3>
              <span
                class="status-badge status-${VERDICT_STATUS[scenario.status]}"
                >${VERDICT_LABEL[scenario.status]}</span
              >
            </header>
            <div class="scenario-brief-figure">
              <strong>${scenario.qtyTon}톤</strong>
              <span>${money(scenario.amount)}</span>
            </div>
            <p>${scenario.items} · 단가 ${won(scenario.unitPrice)}원/kg</p>
            ${
              scenario.exceedReason
                ? html`<small class="scenario-brief-flag"
                    >exceed_reason 있음</small
                  >`
                : ""
            }
          </article>`,
      )
      .join("")}
  </div>`;
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
              ${item.name}${
                item.coverage
                  ? '<small class="prediction-coverage">예측 검증</small>'
                  : ""
              }
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

    ${asOfStrip()}

    <section>
      <div class="section-head">
        <div>
          <h2>오늘의 상태</h2>
          <p>
            T0에서 오케스트레이터가 수집해 전원에게 동일 배포한 스냅샷입니다.
          </p>
        </div>
        <span class="status-badge status-success">as_of ${MOCK.meta.asOf}</span>
      </div>
      <div class="cards kpi-grid">${snapshotCards()}</div>
    </section>

    <section class="dashboard-decision">
      ${agentFlow()} ${decisionSummaryCard()}
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>오늘의 매입 시나리오</h2>
          <p>
            T1 매입 초안 ${MOCK.scenarios.length}안. 카드를 누르면 상세 검토로
            이동합니다.
          </p>
        </div>
        <button class="text-link" type="button" data-page="proposal-history">
          제안 이력 보기 →
        </button>
      </div>
      ${scenarioSummary()}
    </section>

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
      <article class="card watch-card">
        <div class="section-head">
          <div>
            <h2>취급 품목 시세</h2>
            <p>경락가 기준 · 카드를 누르면 해당 품목으로 전환합니다.</p>
          </div>
        </div>
        <div class="cards price-grid">${priceCards()}</div>
        <button class="text-link" type="button" data-page="market">
          시장 시세 전체 보기 →
        </button>
      </article>
    </section>
  </div>`;
}
