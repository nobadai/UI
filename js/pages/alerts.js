const alertItems = [
  {
    type: "risk",
    level: "danger",
    time: "오늘 10:24",
    title: "배추 위험도가 주의에서 위험으로 변경",
    summary: "3주 후 상승 가능성이 78%로 높아졌습니다.",
    action: "식자재 분석",
    page: "ingredient",
    unread: true,
  },
  {
    type: "cost",
    level: "warning",
    time: "오늘 09:10",
    title: "김치찌개 예상 원가 상승률 5% 초과",
    summary: "현재 원가 대비 9.2% 상승할 가능성이 있습니다.",
    action: "메뉴 원가 확인",
    page: "menu-cost",
    unread: true,
  },
  {
    type: "supply",
    level: "warning",
    time: "어제 16:40",
    title: "주산지 출하량 감소 신호 감지",
    summary: "7일 평균 대비 반입량이 11.7% 감소했습니다.",
    action: "상세 근거 확인",
    page: "detail",
    unread: true,
  },
  {
    type: "system",
    level: "success",
    time: "어제 08:30",
    title: "매장 매입 단가 동기화 완료",
    summary: "등록된 5개 매장의 데이터가 정상 반영됐습니다.",
    action: "매장 현황",
    page: "stores",
    unread: false,
  },
];

function alertsPage() {
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>알림 센터</h2>
        <p>가격·수급·메뉴 원가에서 발생한 즉시 대응 이벤트입니다.</p>
      </div>
      <button class="button secondary" id="markRead">모두 읽음</button>
    </div>
    <div class="alert-toolbar" role="group" aria-label="알림 유형 필터">
      <button class="active" data-alert-filter="all">
        전체 <b>${alertItems.length}</b>
      </button>
      <button data-alert-filter="risk">위험 품목</button
      ><button data-alert-filter="cost">메뉴 원가</button
      ><button data-alert-filter="supply">수급</button>
    </div>
    <div class="alert-list">
      ${alertItems
        .map(
          (item, index) =>
            html`<article
              class="card alert-item ${item.unread ? "unread" : ""}"
              data-alert-index="${index}"
              data-alert-type="${item.type}"
            >
              <span class="alert-status status-${item.level}"
                >${iconSvg(
                  item.type === "cost"
                    ? "cost"
                    : item.type === "system"
                      ? "settings"
                      : "bell",
                )}</span
              >
              <div class="alert-copy">
                <span class="alert-time">${item.time}</span>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
              </div>
              <button class="text-link" type="button" data-page="${item.page}">
                ${item.action} →
              </button>
            </article>`,
        )
        .join("")}
    </div>
  </div>`;
}

// -----------------------------------------------------------------------------
// Settings renderers and browser persistence
// -----------------------------------------------------------------------------
