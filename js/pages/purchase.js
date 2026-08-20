// -----------------------------------------------------------------------------
// 매입 — 금일 제안 상세 / 제안 이력 / 시장 시세 / 매입 내역 / 설정(상수값)
// 금일 제안 상세는 정의서 §3.1의 T1 → T2 → T3 → Critic → 사람 승인을 한 화면에 담습니다.
// -----------------------------------------------------------------------------

function scenarioCards() {
  return MOCK.scenarios
    .map(
      (scenario) =>
        html`<article
          class="card scenario-card ${
            state.scenario === scenario.id ? "active" : ""
          }"
          data-scenario="${scenario.id}"
          tabindex="0"
        >
          <div class="scenario-head">
            <h3>${scenario.name}</h3>
            <span class="status-badge status-${VERDICT_STATUS[scenario.status]}"
              >${VERDICT_LABEL[scenario.status]}</span
            >
          </div>
          <div class="scenario-figure">
            <strong>${scenario.qtyTon}톤</strong
            ><span>${money(scenario.amount)}</span>
            <small
              >단가 ${won(scenario.unitPrice)}원/kg · ${scenario.items}</small
            >
          </div>
          <p>${scenario.rationale}</p>
          ${
            scenario.exceedReason
              ? html`<div class="exceed-reason">
                  <strong>exceed_reason</strong>${scenario.exceedReason}
                </div>`
              : ""
          }
          <div class="ref-list">
            ${scenario.refs
              .map((ref) => html`<code class="ref-id">${ref}</code>`)
              .join("")}
          </div>
        </article>`,
    )
    .join("");
}

/** T2 한 부서의 제약 회신 카드. 계약서 §8.2 필드 + v0.5 suggested_adjustment. */
function verdictCard(verdict) {
  const adjustment = verdict.suggested_adjustment;
  const axisCheck = adjustment
    ? checkAxisPolicy(verdict.agent, adjustment.axis)
    : { pass: true, allowed: AXIS_POLICY[verdict.agent] };
  const requirement = checkAdjustmentRequirement(verdict);
  return html`<article class="card verdict-card agent-${verdict.agent}">
    <header class="verdict-head">
      <div>
        <span class="verdict-agent">${verdict.agentLabel}</span>
        <small>담당 ${verdict.owner} · agent="${verdict.agent}"</small>
      </div>
      <span class="status-badge status-${VERDICT_STATUS[verdict.verdict]}"
        >${VERDICT_LABEL[verdict.verdict]}</span
      >
    </header>

    <dl class="verdict-figures">
      <div>
        <dt>max_feasible_qty_kg</dt>
        <dd>
          ${
            verdict.max_feasible_qty_kg === null
              ? "—"
              : `${won(verdict.max_feasible_qty_kg)}kg (${ton(verdict.max_feasible_qty_kg)})`
          }
        </dd>
      </div>
      <div>
        <dt>max_feasible_amount_krw</dt>
        <dd>
          ${
            verdict.max_feasible_amount_krw === null
              ? "— (재무만 채웁니다)"
              : money(verdict.max_feasible_amount_krw)
          }
        </dd>
      </div>
    </dl>

    ${
      verdict.hard_constraints.length
        ? html`<div class="constraint-block hard">
            <strong>hard_constraints</strong>
            <ul>
              ${verdict.hard_constraints
                .map((line) => html`<li>${line}</li>`)
                .join("")}
            </ul>
          </div>`
        : ""
    }
    ${
      verdict.soft_warnings.length
        ? html`<div class="constraint-block soft">
            <strong>soft_warnings</strong>
            <ul>
              ${verdict.soft_warnings
                .map((line) => html`<li>${line}</li>`)
                .join("")}
            </ul>
          </div>`
        : ""
    }

    <div class="verdict-reasoning">
      <strong>reasoning</strong>
      <p>${verdict.reasoning}</p>
    </div>

    <div class="evidence-chips">
      ${verdict.evidences
        .map(
          (evidence) =>
            html`<span class="evidence-chip"
              ><code class="ref-id">${evidence.ref_id}</code>${evidence.source}
              <b>${evidence.value}</b></span
            >`,
        )
        .join("")}
    </div>

    ${
      adjustment
        ? html`<section class="adjustment-block">
            <div class="adjustment-head">
              <span class="axis-chip axis-${adjustment.axis}"
                >axis: ${adjustment.axis} · ${AXIS_LABEL[adjustment.axis]}</span
              >
              <span class="policy-flag ${axisCheck.pass ? "pass" : "fail"}"
                >축 검사 ${axisCheck.pass ? "PASS" : "FAIL"}</span
              >
            </div>
            <strong>suggested_adjustment</strong>
            <p>${adjustment.description}</p>
            <div class="evidence-chips">
              ${adjustment.evidences
                .map(
                  (evidence) =>
                    html`<span class="evidence-chip"
                      ><code class="ref-id">${evidence.ref_id}</code
                      >${evidence.source} <b>${evidence.value}</b></span
                    >`,
                )
                .join("")}
            </div>
            <small class="adjustment-note"
              >허용 축:
              ${axisCheck.allowed.map((axis) => AXIS_LABEL[axis]).join(" · ")} —
              다른 부서 축에 대한 제안과 최종 결합 수량 제시는
              금지입니다.</small
            >
          </section>`
        : html`<div class="adjustment-block empty">
            <strong>suggested_adjustment</strong>
            <p>verdict가 ok이므로 생략합니다 (불필요한 LLM 호출 방지).</p>
          </div>`
    }

    <footer class="verdict-foot ${requirement.pass ? "" : "fail"}">
      생성 조건 검사: verdict=${verdict.verdict} → 변경안
      ${requirement.required ? "필수" : "생략"} ·
      ${requirement.present ? "포함됨" : "없음"} ·
      ${requirement.pass ? "PASS" : "FAIL"}
    </footer>
  </article>`;
}

function orchestrationCard() {
  const orchestration = MOCK.orchestration;
  const combined = orchestration.combined;
  return html`<article class="card orchestration-card">
    <div class="section-head">
      <div>
        <h2>T3 오케스트레이터 조정</h2>
        <p>
          세 부서 변경안을 결합해 총량을 조정합니다. 최종 결합은 여기서만
          이루어집니다.
        </p>
      </div>
      <span class="status-badge status-success"
        >${MOCK.scenarios[0].qtyTon}톤 → ${combined.qtyTon}톤</span
      >
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>부서</th>
            <th>축</th>
            <th>제시한 상한</th>
            <th>결합에 반영된 내용</th>
          </tr>
        </thead>
        <tbody>
          ${combined.basis
            .map(
              (row) =>
                html`<tr>
                  <td><strong>${row.source}</strong></td>
                  <td>
                    <span class="axis-chip axis-${row.axis}"
                      >${AXIS_LABEL[row.axis]}</span
                    >
                  </td>
                  <td>${row.limit}</td>
                  <td>${row.applied}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="split-plan">
      ${combined.splits
        .map(
          (split) =>
            html`<div>
              <span>${split.when}</span><strong>${split.qtyTon}톤</strong>
              <small>${money(split.amount)} · ${split.note}</small>
            </div>`,
        )
        .join("")}
    </div>

    <div class="ai-summary"><strong>결합 원칙</strong>${combined.note}</div>
  </article>`;
}

function preFeedbackCard() {
  const orchestration = MOCK.orchestration;
  return html`<article class="card feedback-card">
    <div class="section-head">
      <div>
        <h2>사전 feedback 루프</h2>
        <p>Critic 호출 전에 매입 에이전트로 회송한 기록입니다 (정의서 §3.2).</p>
      </div>
      <span class="status-badge status-warning"
        >${orchestration.loops.preUsed} / ${orchestration.loops.preMax}
        사용</span
      >
    </div>
    ${
      orchestration.preFeedback.length
        ? html`<ol class="feedback-list">
            ${orchestration.preFeedback
              .map(
                (round) =>
                  html`<li>
                    <div class="feedback-meta">
                      <b>${round.round}회차</b><span>${round.time}</span>
                    </div>
                    <strong>트리거</strong>
                    <p>${round.trigger}</p>
                    <strong>완화 지시 (부서 변경안 그대로 전달)</strong>
                    <p>${round.instruction}</p>
                    <strong>결과</strong>
                    <p>${round.result}</p>
                  </li>`,
              )
              .join("")}
          </ol>`
        : html`<div class="empty-state">
            <strong>회송 없이 Critic으로 진행했습니다.</strong>
          </div>`
    }
    <div class="boundary-note">
      오케스트레이터는 원본 DB를 읽지 않습니다. 완화 지시는 부서가 회신에 담아
      올린 <code>suggested_adjustment</code>를 그대로 전달합니다.
    </div>
  </article>`;
}

function criticCard() {
  const critic = MOCK.orchestration.critic;
  return html`<article class="card critic-card">
    <div class="section-head">
      <div>
        <h2>Critic 검증</h2>
        <p>
          ${critic.time} 실행 · 코드 검사와 LLM 대조 검사를 함께 수행합니다.
        </p>
      </div>
      <span
        class="status-badge status-${
          critic.result === "PASS" ? "success" : "danger"
        }"
        >${critic.result}</span
      >
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>검사 항목</th>
            <th>유형</th>
            <th>결과</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          ${critic.checks
            .map(
              (check) =>
                html`<tr>
                  <td><strong>${check.name}</strong></td>
                  <td><span class="check-type">${check.type}</span></td>
                  <td>
                    <span
                      class="status-badge status-${
                        check.result === "PASS" ? "success" : "danger"
                      }"
                      >${check.result}</span
                    >
                  </td>
                  <td>${check.detail}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </article>`;
}

function approvalCard() {
  const combined = MOCK.orchestration.combined;
  return html`<article class="card approval-card" id="approvalCard">
    <div
      class="settings-mascot mascot-laptop"
      role="img"
      aria-label="승인을 기다리는 마스코트"
    ></div>
    <div class="approval-copy">
      <span class="eyebrow">HUMAN IN THE LOOP</span>
      <strong id="approvalHeadline"
        >${combined.qtyTon}톤 / ${money(combined.amount)} 매입안을
        승인할까요?</strong
      >
      <p>${MOCK.orchestration.decision.mode} (정의서 §4 자율성 모드)</p>
    </div>
    <div class="approval-actions">
      <button class="button ghost" type="button" id="holdDecision">
        매입 보류
      </button>
      <button class="button secondary" type="button" id="reviseDecision">
        재조정 요청
      </button>
      <button class="button primary" type="button" id="approveDecision">
        승인하고 T4 반영
      </button>
    </div>
  </article>`;
}

function proposalPage() {
  return html`<div class="content proposal-page">
    <div class="page-intro">
      <div>
        <h2>${MOCK.meta.asOfLabel} 매입 제안</h2>
        <p>
          T1 초안 → T2 제약 검토 → T3 조정 → Critic → 사람 승인 순서로
          확인합니다.
        </p>
      </div>
      <div class="section-actions">
        <span class="status-badge status-warning"
          >${MOCK.orchestration.decision.label}</span
        ><button
          class="button secondary"
          type="button"
          data-page="proposal-history"
        >
          제안 이력
        </button>
      </div>
    </div>

    ${approvalCard()}

    <section class="stage-block">
      <div class="section-head">
        <div>
          <h2><span class="stage-tag">T1</span> 매입 초안</h2>
          <p>
            매입 에이전트가 생성한 시나리오입니다. 예산 초과를 인지하면
            exceed_reason을 명시합니다.
          </p>
        </div>
      </div>
      <div class="cards scenario-grid">${scenarioCards()}</div>
    </section>

    <section class="stage-block">
      <div class="section-head">
        <div>
          <h2><span class="stage-tag">T2</span> 제약 검토 · 3부서 병렬</h2>
          <p>
            각 부서 회신 = 판정 + 데이터 + 이유 + 변경안. 부서는 자기 축의
            변경안만 냅니다 (정의서 §3.4.2).
          </p>
        </div>
        <span class="status-badge status-success">축 검사 코드 레벨 적용</span>
      </div>
      <div class="verdict-grid">${MOCK.verdicts.map(verdictCard).join("")}</div>
    </section>

    <section class="stage-block">
      <div class="section-head">
        <div>
          <h2><span class="stage-tag">T3</span> 조정 · 검증</h2>
          <p>변경안 결합, 사전 feedback 루프, Critic 검증 결과입니다.</p>
        </div>
      </div>
      ${orchestrationCard()}
      <div class="detail-grid stage-pair">
        ${preFeedbackCard()} ${criticCard()}
      </div>
    </section>
  </div>`;
}

// ------------------------------------------------------------------ 제안 이력
function proposalHistoryPage() {
  const rows = MOCK.proposalHistory;
  const approved = rows.filter((row) => row.decision === "승인").length;
  const adopted = rows.filter((row) => row.adopted !== "-").length;
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>제안 이력</h2>
        <p>
          변경안 채택률은 정의서 §10.10의 지표화 논의 대상입니다. 변경안이
          형식적으로만 채워지는지 확인하는 용도입니다.
        </p>
      </div>
      <button class="button secondary" type="button" id="exportHistory">
        이력 내보내기
      </button>
    </div>
    <div class="cards kpi-grid">
      <article class="card kpi-card">
        <span>최근 ${rows.length}일 승인</span><strong>${approved}건</strong
        ><small>보류 ${rows.length - approved}건</small>
      </article>
      <article class="card kpi-card">
        <span>변경안 채택률</span
        ><strong>${Math.round((adopted / rows.length) * 100)}%</strong
        ><small>부서 변경안이 최종 결정에 반영된 비율</small>
      </article>
      <article class="card kpi-card">
        <span>Critic FAIL</span
        ><strong style="color:var(--danger)"
          >${rows.filter((row) => row.critic === "FAIL").length}건</strong
        ><small>루프 소진 시 매입 보류</small>
      </article>
      <article class="card kpi-card">
        <span>평균 조정 폭</span><strong>-31%</strong
        ><small>초안 대비 승인 수량</small>
      </article>
    </div>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>일자별 제안 결과</h2>
          <p>행을 선택하면 그 날의 판정 요약을 확인할 수 있습니다.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>일자</th>
              <th>T1 초안</th>
              <th>승인 결과</th>
              <th>사전/사후 루프</th>
              <th>Critic</th>
              <th>채택된 변경안</th>
              <th>결정</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row, index) =>
                  html`<tr
                    class="history-row"
                    data-history="${index}"
                    tabindex="0"
                  >
                    <td><strong>${row.date}</strong></td>
                    <td>${row.proposed}</td>
                    <td>${row.approved}</td>
                    <td>${row.pre}회 / ${row.post}회</td>
                    <td>
                      <span
                        class="status-badge status-${
                          row.critic === "PASS" ? "success" : "danger"
                        }"
                        >${row.critic}</span
                      >
                    </td>
                    <td>${row.adopted}</td>
                    <td
                      class="${
                        row.decision === "승인" ? "positive" : "negative"
                      }"
                    >
                      ${row.decision}
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  </div>`;
}

// ----------------------------------------------------------------- 시장 시세
function marketPage() {
  return html`<div class="content market-page">
    <div class="page-intro">
      <div>
        <h2>시장 시세</h2>
        <p>
          ${MOCK.meta.asOfLabel} 기준 · ${MOCK.meta.source} · 소매가 · 중도매가
          · 경락가를 함께 비교합니다.
        </p>
      </div>
      <span class="status-badge status-success">as_of ${MOCK.meta.asOf}</span>
    </div>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>품목별 시세 비교</h2>
          <p>D+18은 경락가 기준 ML 예측값입니다.</p>
        </div>
        <select class="filter-control" id="marketSort" aria-label="정렬 기준">
          <option value="name">품목순</option>
          <option value="change">변동률순</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>품목</th>
              <th>소매가</th>
              <th>중도매가</th>
              <th>경락가</th>
              <th>전일 대비</th>
              <th>D+18 예측</th>
              <th>추이</th>
            </tr>
          </thead>
          <tbody id="marketRows">
            ${MOCK.items.map(marketRow).join("")}
          </tbody>
        </table>
      </div>
    </article>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>가격 유형 정의</h2>
          <p>화면 전체에서 같은 정의를 사용합니다.</p>
        </div>
      </div>
      <div class="cards kpi-grid">
        ${MOCK.priceTypes
          .map(
            (type) =>
              html`<article class="card kpi-card type-card type-${type.key}">
                <span>${type.label}</span><strong>${type.desc}</strong>
                <small>series.&lt;품목&gt;.${type.key}</small>
              </article>`,
          )
          .join("")}
      </div>
    </article>
  </div>`;
}

function marketRow(item) {
  const rate = ((item.d18 - item.auction) / item.auction) * 100;
  return html`<tr class="market-row" data-item="${item.id}" tabindex="0">
    <td>
      <strong>${item.name}</strong>
      ${
        item.coverage
          ? '<small class="prediction-coverage">예측 검증</small>'
          : ""
      }
    </td>
    <td>${won(item.retail)}원</td>
    <td>${won(item.wholesale)}원</td>
    <td><strong>${won(item.auction)}원</strong></td>
    <td class="${changeMark(item.change).tone}">
      ${changeMark(item.change).mark} ${changeMark(item.change).text}
    </td>
    <td class="${changeMark(rate).tone}">
      ${won(item.d18)}원 (${rate >= 0 ? "+" : ""}${rate.toFixed(1)}%)
    </td>
    <td><div class="row-spark" data-spark="${item.id}"></div></td>
  </tr>`;
}

// ---------------------------------------------------------------- 매입 내역
function purchaseLedgerPage() {
  const total = MOCK.purchaseLedger.reduce((sum, row) => sum + row.amount, 0);
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>매입 내역</h2>
        <p>승인 후 T4에서 State DB에 반영된 확정 매입 건입니다.</p>
      </div>
      <button class="button secondary" type="button" id="exportPurchases">
        XLSX 내보내기
      </button>
    </div>
    <div class="cards kpi-grid">
      <article class="card kpi-card">
        <span>최근 5건 합계</span><strong>${money(total)}</strong
        ><small>${MOCK.purchaseLedger.length}건</small>
      </article>
      <article class="card kpi-card">
        <span>평균 매입 단가</span><strong>804원/kg</strong
        ><small>배추 기준</small>
      </article>
      <article class="card kpi-card">
        <span>산지 거래처</span><strong>4곳</strong
        ><small>계약농가 2 · 산지조합 2</small>
      </article>
      <article class="card kpi-card">
        <span>정산 완료</span><strong>1건</strong
        ><small>나머지는 입고 완료</small>
      </article>
    </div>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>확정 매입 건</h2>
          <p>수량·단가·산지 거래처와 정산 상태입니다.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>일자</th>
              <th>품목</th>
              <th>수량</th>
              <th>단가</th>
              <th>금액</th>
              <th>산지 거래처</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK.purchaseLedger
              .map(
                (row) =>
                  html`<tr>
                    <td>${row.date}</td>
                    <td><strong>${row.item}</strong></td>
                    <td>${row.qty}</td>
                    <td>${row.unit}</td>
                    <td>${money(row.amount)}</td>
                    <td>${row.partner}</td>
                    <td><span class="status-dot"></span>${row.status}</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  </div>`;
}

// ------------------------------------------------------------ 매입 설정(상수값)
function purchaseConfigPage() {
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>매입 설정 (상수값)</h2>
        <p>
          매입 판단에 쓰이는 상수와 루프 예산입니다. 정의서에 고정된 값은
          화면에서 수정할 수 없습니다.
        </p>
      </div>
      <button class="button primary" type="button" id="saveConfig">
        설정 저장
      </button>
    </div>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>운영 상수</h2>
          <p>변경 사항은 이 브라우저에 저장됩니다.</p>
        </div>
      </div>
      <div class="config-list">
        ${MOCK.purchaseConfig
          .map(
            (row) =>
              html`<label class="config-row ${row.editable ? "" : "locked"}">
                <span>
                  <strong>${row.label}</strong>
                  <small>${row.note}</small>
                  <code class="ref-id">${row.key}</code>
                </span>
                <input
                  class="search-input"
                  name="${row.key}"
                  value="${escapeHtml(row.value)}"
                  ${row.editable ? "" : "readonly"}
                />
              </label>`,
          )
          .join("")}
      </div>
    </article>
    <article class="card">
      <div class="section-head">
        <div>
          <h2>부서별 허용 축</h2>
          <p>
            코드 레벨에서 강제되는 규칙입니다. 허용 범위를 벗어난 조합은 Critic
            이전에 FAIL 처리됩니다.
          </p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>부서</th>
              <th>agent</th>
              <th>허용 axis</th>
              <th>금지</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK.verdicts
              .map(
                (verdict) =>
                  html`<tr>
                    <td><strong>${verdict.agentLabel}</strong></td>
                    <td><code class="ref-id">${verdict.agent}</code></td>
                    <td>
                      ${AXIS_POLICY[verdict.agent]
                        .map(
                          (axis) =>
                            html`<span class="axis-chip axis-${axis}"
                              >${axis} · ${AXIS_LABEL[axis]}</span
                            >`,
                        )
                        .join("")}
                    </td>
                    <td>다른 부서 축 제안 · 최종 결합 수량 제시</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  </div>`;
}
