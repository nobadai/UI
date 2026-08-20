// -----------------------------------------------------------------------------
// 재무 — 자산 통합 / 지출 상세 / 보유 자산 현황 / 가용 자산 / 급여 관리
// 고정지출 항목은 §7 시뮬레이션 페르소나에서 산정한 값을 사용합니다.
// -----------------------------------------------------------------------------

function financeAssetsPage() {
  const finance = MOCK.finance;
  return html`<div class="content">
    ${pageIntro(
      "자산 통합",
      `${MOCK.meta.asOfLabel} 기준 · 현금과 재고, 미수금을 합친 회사 자산 전체입니다.`,
      html`<button
        class="button secondary"
        type="button"
        data-page="finance-available"
      >
        가용 자산 보기
      </button>`,
    )}
    ${kpiCards(
      finance.assets.map((asset) => ({
        label: asset.label,
        value: money(asset.value),
        sub: asset.sub,
      })),
    )}
    ${sectionCard({
      title: "일별 자금 흐름",
      desc: "매출 입금과 매입·고정지출 집행을 일자별로 대조합니다.",
      body: dataTable(
        ["일자", "유입", "유출", "순증감", "잔고"],
        finance.cashFlow
          .map((row) => {
            const net = row.inflow - row.outflow;
            return html`<tr>
              <td><strong>${row.date}</strong></td>
              <td class="positive">+${won(row.inflow)}</td>
              <td class="negative">-${won(row.outflow)}</td>
              <td class="${net >= 0 ? "positive" : "negative"}">
                ${net >= 0 ? "+" : ""}${won(net)}
              </td>
              <td>${money(row.balance)}</td>
            </tr>`;
          })
          .join(""),
      ),
    })}
    ${sectionCard({
      title: "자산 구성",
      desc: "재고 자산은 보유 자산 현황의 시가 평가액을 따릅니다.",
      body: html`<div class="asset-bars">
        ${finance.assets
          .filter((asset) => asset.label !== "총 자산")
          .map((asset) => {
            const total = finance.assets[0].value;
            return html`<div class="asset-bar">
              <span>${asset.label}</span>
              <div class="bar-track">
                <i
                  style="width:${((asset.value / total) * 100).toFixed(1)}%"
                ></i>
              </div>
              <b>${money(asset.value)}</b>
            </div>`;
          })
          .join("")}
      </div>`,
    })}
  </div>`;
}

function financeExpensePage() {
  const expenses = MOCK.finance.expenses;
  const fixed = expenses.filter((row) => row.fixed);
  const fixedTotal = fixed.reduce((sum, row) => sum + row.amount, 0);
  const total = expenses.reduce((sum, row) => sum + row.amount, 0);
  return html`<div class="content">
    ${pageIntro(
      "지출 상세",
      "고정지출과 변동지출을 구분합니다. 고정지출 산정에는 창고·운송 페르소나가 필요합니다 (정의서 §7).",
      html`<button class="button ghost" type="button" data-page="personas">
        페르소나 정의 보기
      </button>`,
    )}
    ${kpiCards([
      { label: "총 지출", value: money(total), sub: "이번 달 누계" },
      {
        label: "고정지출",
        value: money(fixedTotal),
        sub: `${fixed.length}개 항목 · 비중 ${((fixedTotal / total) * 100).toFixed(1)}%`,
      },
      {
        label: "변동지출",
        value: money(total - fixedTotal),
        sub: "매입 · 일일 근로자",
      },
      {
        label: "일일 매입 한도",
        value: "11,500,000원",
        sub: "가용자금 - D+7 고정지출",
        tone: "danger",
      },
    ])}
    ${sectionCard({
      title: "지출 항목",
      desc: "고정 여부에 따라 매입 한도 계산에 반영되는 방식이 다릅니다.",
      body: dataTable(
        ["항목", "구분", "금액", "비중", "비고"],
        expenses
          .map(
            (row) =>
              html`<tr>
                <td><strong>${row.category}</strong></td>
                <td>
                  <span
                    class="status-badge status-${
                      row.fixed ? "warning" : "success"
                    }"
                    >${row.fixed ? "고정" : "변동"}</span
                  >
                </td>
                <td>${money(row.amount)}</td>
                <td>
                  <div class="ratio-cell">
                    <i style="width:${row.ratio}%"></i><b>${row.ratio}%</b>
                  </div>
                </td>
                <td>${row.note}</td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function financeHoldingsPage() {
  const holdings = MOCK.finance.holdings;
  const book = holdings.reduce((sum, row) => sum + row.bookValue, 0);
  const market = holdings.reduce((sum, row) => sum + row.marketValue, 0);
  return html`<div class="content">
    ${pageIntro(
      "보유 자산 현황",
      "보유 재고의 장부가와 오늘 시가를 비교합니다. 시가는 중도매가 기준 Mock입니다.",
    )}
    ${kpiCards([
      {
        label: "장부가 합계",
        value: money(book),
        sub: `${MOCK.inventory.usedTon}톤`,
      },
      {
        label: "시가 평가액",
        value: money(market),
        sub: `${MOCK.meta.asOfLabel} 기준`,
      },
      {
        label: "평가 손익",
        value: `${market - book >= 0 ? "+" : ""}${money(market - book)}`,
        sub: "미실현",
        tone: market - book >= 0 ? "success" : "danger",
      },
      {
        label: "창고 적재율",
        value: `${((MOCK.inventory.usedTon / MOCK.inventory.capacityTon) * 100).toFixed(1)}%`,
        sub: `${MOCK.inventory.usedTon} / ${MOCK.inventory.capacityTon}톤`,
        tone: "warning",
      },
    ])}
    ${sectionCard({
      title: "품목별 평가",
      desc: "평가 손익은 매입 단가와 오늘 시세의 차이입니다.",
      body: dataTable(
        ["품목", "수량", "장부가", "시가", "평가 손익"],
        holdings
          .map(
            (row) =>
              html`<tr>
                <td><strong>${row.item}</strong></td>
                <td>${row.qty}</td>
                <td>${money(row.bookValue)}</td>
                <td>${money(row.marketValue)}</td>
                <td class="${row.gap >= 0 ? "positive" : "negative"}">
                  ${row.gap >= 0 ? "+" : ""}${won(row.gap)}원
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function financeAvailablePage() {
  const rows = MOCK.finance.available;
  const result = rows.find((row) => row.state === "result");
  return html`<div class="content">
    ${pageIntro(
      "가용 자산",
      "현금 잔고에서 확정 예약과 유보 항목을 차감해 실제 집행 가능 잔액을 계산합니다.",
      html`<button class="button secondary" type="button" data-page="proposal">
        오늘 매입안 보기
      </button>`,
    )}
    ${sectionCard({
      title: "집행 가능 잔액 계산",
      desc: "재무 에이전트가 금액 축 판단에 사용하는 값입니다.",
      className: "available-card",
      body: html`<ul class="available-ledger">
          ${rows
            .map(
              (row) =>
                html`<li class="is-${row.state}">
                  <span>${row.label}</span>
                  <b class="${row.value < 0 ? "negative" : ""}"
                    >${row.value >= 0 ? "" : "-"}${won(
                      Math.abs(row.value),
                    )}원</b
                  >
                </li>`,
            )
            .join("")}
        </ul>
        <div class="ai-summary">
          <strong>매입 한도 산출</strong>집행 가능 잔액 ${money(result.value)}
          가운데 하루 매입에 배정하는 금액은 11,500,000원입니다. 이 값이 재무
          회신의 <code>max_feasible_amount_krw</code>가 됩니다.
        </div>`,
    })}
  </div>`;
}

function financePayrollPage() {
  const payroll = MOCK.finance.payroll;
  const total = payroll.reduce((sum, row) => sum + row.monthly, 0);
  return html`<div class="content">
    ${pageIntro(
      "급여 관리",
      "정규 인력과 일일 근로자의 급여를 함께 관리합니다. 인원수·비용 산정 로직은 임의 설정된 더미 데이터입니다.",
      html`<button
        class="button secondary"
        type="button"
        data-page="sales-labor"
      >
        일일 근로자 명부
      </button>`,
    )}
    ${kpiCards([
      {
        label: "월 급여 총액",
        value: money(total),
        sub: `${payroll.length}개 항목`,
      },
      { label: "정규 인력", value: "4명", sub: "창고 · 배송 · 영업 · 회계" },
      { label: "일용 인력", value: "평균 6명", sub: "상·하차" },
      {
        label: "다음 지급일",
        value: "D+7",
        sub: "가용자금에서 유보 중",
        tone: "warning",
      },
    ])}
    ${sectionCard({
      title: "지급 대상",
      desc: "D+7 지급 예정액은 매입 한도 계산에서 미리 차감됩니다.",
      body: dataTable(
        ["대상", "담당", "고용 형태", "월 지급액", "상태"],
        payroll
          .map(
            (row) =>
              html`<tr>
                <td><strong>${row.name}</strong></td>
                <td>${row.role}</td>
                <td>
                  <span
                    class="status-badge status-${
                      row.type === "정규" ? "success" : "warning"
                    }"
                    >${row.type}</span
                  >
                </td>
                <td>${money(row.monthly)}</td>
                <td><span class="status-dot"></span>${row.state}</td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}
