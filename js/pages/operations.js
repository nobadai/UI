// -----------------------------------------------------------------------------
// 영업 관리 · 재고/물류 관리 · 거래처 관리
// -----------------------------------------------------------------------------

const DELIVERY_STATUS = {
  "배송 중": "warning",
  "상차 대기": "danger",
  "배송 완료": "success",
};

const RISK_LABEL = { low: "안정", mid: "관찰", high: "위험" };
const RISK_STATUS = { low: "success", mid: "warning", high: "danger" };

// ----------------------------------------------------------------- 영업 관리
function salesLaborPage() {
  const labor = MOCK.sales.labor;
  const cost = labor.reduce((sum, row) => sum + row.cost, 0);
  const planned = labor.reduce((sum, row) => sum + row.planned, 0);
  const actual = labor.reduce((sum, row) => sum + row.actual, 0);
  return html`<div class="content">
    ${pageIntro(
      "인력 관리 · 일일 근로자 명부",
      "근무 조별 투입 인원과 인건비 기록입니다. 인원수·비용 산정 로직은 임의 설정된 더미 데이터입니다.",
      html`<button class="button primary" type="button" id="addLabor">
        + 근무 등록
      </button>`,
    )}
    ${kpiCards([
      {
        label: "최근 인건비",
        value: money(cost),
        sub: `${labor.length}개 근무 조`,
      },
      { label: "계획 인원", value: `${planned}명`, sub: "누계" },
      {
        label: "실제 투입",
        value: `${actual}명`,
        sub: `미충원 ${planned - actual}명`,
        tone: planned === actual ? "success" : "warning",
      },
      { label: "평균 일당", value: "90,000원", sub: "8시간 기준 더미 값" },
    ])}
    ${sectionCard({
      title: "근무 기록",
      desc: "입고 상차와 출고 분류 작업에 투입된 인원입니다.",
      body: dataTable(
        ["일자", "근무 조", "계획", "실제", "인건비", "작업"],
        labor
          .map(
            (row) =>
              html`<tr>
                <td>${row.date}</td>
                <td><strong>${row.shift}</strong></td>
                <td>${row.planned}명</td>
                <td class="${row.actual < row.planned ? "negative" : ""}">
                  ${row.actual}명
                </td>
                <td>${money(row.cost)}</td>
                <td>${row.task}</td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function salesDeliveryPage() {
  const deliveries = MOCK.sales.deliveries;
  const active = deliveries.filter((row) => row.state !== "배송 완료").length;
  return html`<div class="content">
    ${pageIntro(
      "배송 현황",
      "운송 페르소나 기준 트럭 3대(5톤·2.5톤·1톤)를 배차합니다.",
      html`<select
        class="filter-control"
        id="deliveryFilter"
        aria-label="배송 상태 필터"
      >
        <option value="all">전체 상태</option>
        <option value="배송 중">배송 중</option>
        <option value="상차 대기">상차 대기</option>
        <option value="배송 완료">배송 완료</option>
      </select>`,
    )}
    ${kpiCards([
      {
        label: "오늘 배송 건",
        value: `${deliveries.length}건`,
        sub: "전표 기준",
      },
      {
        label: "진행 중",
        value: `${active}건`,
        sub: "배송 중 · 상차 대기",
        tone: "warning",
      },
      { label: "총 배송 물량", value: "14.6톤", sub: "출고 전표 합계" },
      { label: "보유 트럭", value: "3대", sub: "전량 대여 · 운송 페르소나" },
    ])}
    ${sectionCard({
      title: "배송 전표",
      desc: "행을 선택하면 배송 상세를 확인할 수 있습니다.",
      body: dataTable(
        ["전표", "거래처", "물량", "차량", "도착 예정", "상태"],
        deliveries
          .map(
            (row) =>
              html`<tr
                class="delivery-row"
                data-state="${row.state}"
                data-code="${row.code}"
                tabindex="0"
              >
                <td><code class="ref-id">${row.code}</code></td>
                <td><strong>${row.partner}</strong></td>
                <td>${row.qty}</td>
                <td>${row.truck}</td>
                <td>${row.eta}</td>
                <td>
                  <span
                    class="status-badge status-${DELIVERY_STATUS[row.state]}"
                    >${row.state}</span
                  >
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function salesClientsPage() {
  const clients = MOCK.sales.clients;
  return html`<div class="content">
    ${pageIntro(
      "거래처 현황",
      "정기 거래처의 월 물량과 정산 조건입니다. 거래처 유형은 §7 페르소나와 연결됩니다.",
      html`<button
        class="button secondary"
        type="button"
        data-page="partner-ledger"
      >
        거래 내역 보기
      </button>`,
    )}
    ${kpiCards([
      {
        label: "정기 거래처",
        value: `${clients.length}곳`,
        sub: "페르소나 유형 5종",
      },
      { label: "월 계약 물량", value: "106.0톤", sub: "합계" },
      { label: "선입금 거래처", value: "1곳", sub: "청솔 대형식당" },
      {
        label: "관찰 대상",
        value: "2곳",
        sub: "정산 조건 재협의 예정",
        tone: "warning",
      },
    ])}
    ${sectionCard({
      title: "거래처 목록",
      desc: "유형별로 발주 주기와 정산 조건이 다릅니다.",
      body: dataTable(
        ["거래처", "유형", "월 물량", "정산 조건", "연락처", "상태"],
        clients
          .map(
            (row) =>
              html`<tr>
                <td><strong>${row.name}</strong></td>
                <td>${row.type}</td>
                <td>${row.monthly}</td>
                <td>${row.terms}</td>
                <td>${row.contact}</td>
                <td>
                  <span class="status-badge status-${RISK_STATUS[row.risk]}"
                    >${RISK_LABEL[row.risk]}</span
                  >
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

// ------------------------------------------------------------ 재고 · 물류 관리
function inventoryStatusPage() {
  const inventory = MOCK.inventory;
  const usage = (inventory.usedTon / inventory.capacityTon) * 100;
  return html`<div class="content">
    ${pageIntro(
      "재고 현황",
      "창고 용량과 보관 방식, 잔여 유통기한을 함께 봅니다. 재고·물류 에이전트의 수량·타이밍 판단 근거입니다.",
      html`<button class="button secondary" type="button" data-page="proposal">
        오늘 제약 회신 보기
      </button>`,
    )}
    <article class="card capacity-card">
      <div class="section-head">
        <div>
          <h2>창고 적재 현황</h2>
          <p>
            여유 ${(inventory.capacityTon - inventory.usedTon).toFixed(1)}톤 ·
            이 값이 재고·물류 회신의 max_feasible_qty_kg가 됩니다.
          </p>
        </div>
        <span class="status-badge status-${usage > 85 ? "danger" : "warning"}"
          >적재율 ${usage.toFixed(1)}%</span
        >
      </div>
      <div class="capacity-track">
        <i style="width:${usage.toFixed(1)}%"></i>
        <b style="left:85%">경보 85%</b>
      </div>
      <div class="capacity-legend">
        <span>사용 ${inventory.usedTon}톤</span
        ><span>총 ${inventory.capacityTon}톤</span>
      </div>
    </article>
    ${sectionCard({
      title: "품목별 재고",
      desc: "야채 보관 방식과 감모율은 추후 보강 대상입니다 (정의서 §6.1).",
      body: dataTable(
        ["품목", "수량", "입고일", "보관 방식", "잔여 기한", "감모율", "상태"],
        inventory.stock
          .map(
            (row) =>
              html`<tr>
                <td><strong>${row.item}</strong></td>
                <td>${row.qty}</td>
                <td>${row.inbound}</td>
                <td>
                  <span
                    class="storage-chip storage-${row.storage === "냉장"
                      ? "cold"
                      : "room"}"
                    >${row.storage}</span
                  >
                </td>
                <td>${row.shelfLeft}</td>
                <td class="${row.state === "danger" ? "negative" : ""}">
                  ${row.loss}
                </td>
                <td>
                  <span class="status-badge status-${row.state}"
                    >${row.state === "danger" ? "회전 필요" : "안정"}</span
                  >
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function inventoryOutboundPage() {
  const outbound = MOCK.inventory.outbound;
  return html`<div class="content">
    ${pageIntro(
      "출고 이력",
      "출고 전표별 처리 상태입니다. 확정 출고 물량은 다음 날 T0 스냅샷의 재고에 반영됩니다.",
      html`<button class="button secondary" type="button" id="exportOutbound">
        전표 내보내기
      </button>`,
    )}
    ${kpiCards([
      { label: "최근 출고", value: `${outbound.length}건`, sub: "전표 기준" },
      { label: "출고 물량", value: "14.6톤", sub: "합계" },
      {
        label: "상차 대기",
        value: "1건",
        sub: "한마음 김치공장",
        tone: "warning",
      },
      { label: "D+1 예정 출고", value: "9.2톤", sub: "급식소 정기 납품" },
    ])}
    ${sectionCard({
      title: "출고 전표",
      body: dataTable(
        ["일자", "품목", "수량", "출고처", "전표 번호", "상태"],
        outbound
          .map(
            (row) =>
              html`<tr>
                <td>${row.date}</td>
                <td><strong>${row.item}</strong></td>
                <td>${row.qty}</td>
                <td>${row.to}</td>
                <td><code class="ref-id">${row.doc}</code></td>
                <td>
                  <span
                    class="status-badge status-${row.state === "출고 완료"
                      ? "success"
                      : "warning"}"
                    >${row.state}</span
                  >
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

// ---------------------------------------------------------------- 거래처 관리
function partnerLedgerPage() {
  const ledger = MOCK.partners.ledger;
  const receivable = ledger
    .filter((row) => row.settle === "미수")
    .reduce((sum, row) => sum + row.amount, 0);
  return html`<div class="content">
    ${pageIntro(
      "거래 내역",
      "매입과 매출을 한 표에서 확인하고 미수 정산 예정일을 관리합니다.",
      html`<select
        class="filter-control"
        id="ledgerFilter"
        aria-label="거래 유형 필터"
      >
        <option value="all">전체 유형</option>
        <option value="매출">매출</option>
        <option value="매입">매입</option>
      </select>`,
    )}
    ${kpiCards([
      {
        label: "미수금",
        value: money(receivable),
        sub: "정산 예정",
        tone: "danger",
      },
      { label: "최근 매출", value: money(13560000), sub: "3건" },
      { label: "최근 매입", value: money(15840000), sub: "2건" },
      { label: "거래처", value: "5곳", sub: "산지 2 · 판매처 3" },
    ])}
    ${sectionCard({
      title: "거래 기록",
      body: dataTable(
        ["일자", "거래처", "유형", "물량", "금액", "정산", "예정일"],
        ledger
          .map(
            (row) =>
              html`<tr class="ledger-row" data-type="${row.type}">
                <td>${row.date}</td>
                <td><strong>${row.partner}</strong></td>
                <td>
                  <span
                    class="status-badge status-${row.type === "매출"
                      ? "success"
                      : "warning"}"
                    >${row.type}</span
                  >
                </td>
                <td>${row.qty}</td>
                <td>${money(row.amount)}</td>
                <td class="${row.settle === "미수" ? "negative" : "positive"}">
                  ${row.settle}
                </td>
                <td>${row.due}</td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function partnerReceiptPage() {
  const receipts = MOCK.partners.receipts;
  return html`<div class="content">
    ${pageIntro(
      "영수증 출력",
      "정산 기간별 영수증을 메일로 발송하거나 PDF·XLSX로 추출합니다.",
      html`<button class="button primary" type="button" id="sendAllReceipts">
        대기 건 일괄 발송
      </button>`,
    )}
    ${sectionCard({
      title: "발행 대상",
      desc: "거래처 이메일은 거래처 현황에 등록된 주소를 사용합니다.",
      body: dataTable(
        ["번호", "거래처", "정산 기간", "금액", "상태", "출력"],
        receipts
          .map(
            (row, index) =>
              html`<tr>
                <td><code class="ref-id">${row.no}</code></td>
                <td><strong>${row.partner}</strong></td>
                <td>${row.period}</td>
                <td>${money(row.amount)}</td>
                <td>
                  <span
                    class="status-badge status-${row.state === "발송 대기"
                      ? "warning"
                      : "success"}"
                    >${row.state}</span
                  >
                </td>
                <td class="receipt-actions">
                  <button
                    class="button ghost"
                    type="button"
                    data-receipt="${index}"
                    data-format="mail"
                  >
                    메일
                  </button>
                  <button
                    class="button ghost"
                    type="button"
                    data-receipt="${index}"
                    data-format="pdf"
                  >
                    PDF
                  </button>
                  <button
                    class="button ghost"
                    type="button"
                    data-receipt="${index}"
                    data-format="xlsx"
                  >
                    XLSX
                  </button>
                </td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}
