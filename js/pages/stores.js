function storesPage(title) {
  const riskStoreCount = MOCK.stores.filter(
    (store) => store.risks !== "없음",
  ).length;

  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>${title}</h2>
        <p>
          등록된 매장의 위험 품목과 원가 영향을 비교하는 모니터링 화면입니다.
          매장 등록·구성은 설정에서 관리합니다.
        </p>
      </div>
      <button class="button secondary" data-page="company">
        회사 · 가맹점 설정
      </button>
    </div>
    <div class="cards store-summary">
      <article class="card kpi-card">
        <span>등록 매장</span><strong>${MOCK.stores.length}</strong
        ><small>${MOCK.stores.map((store) => store.name).join(" · ")}</small>
      </article>
      <article class="card kpi-card">
        <span>위험 품목 보유 매장</span
        ><strong style="color:var(--danger)">${riskStoreCount}</strong
        ><small>실시간 모니터링 기준</small>
      </article>
      <article class="card kpi-card">
        <span>평균 예상 원가 상승</span><strong>6.8%</strong
        ><small>3주 전망 기준</small>
      </article>
    </div>
    <article class="card store-table-card">
      <div class="section-head">
        <div>
          <h2>매장 위험 모니터링</h2>
          <p>
            행을 선택하면 해당 매장의 위험 품목과 메뉴 원가 영향을 확인할 수
            있습니다.
          </p>
        </div>
        <select class="filter-control" id="regionFilter">
          <option>전체 지역</option>
          <option>서울</option>
          <option>경기</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>매장명</th>
              <th>지역</th>
              <th>관리 품목</th>
              <th>현재 위험 품목</th>
              <th>담당자</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody id="storeRows">
            ${MOCK.stores.map(storeRow).join("")}
          </tbody>
        </table>
      </div>
    </article>
  </div>`;
}

function franchisePage() {
  return html`<div class="content">
    <section class="mascot-briefing card compact">
      <div
        class="briefing-mascot mascot-shopping-cart"
        role="img"
        aria-label="매장을 살피는 원가 캣쳐 마스코트"
      ></div>
      <div>
        <span class="eyebrow">FRANCHISE NETWORK</span
        ><strong
          >${MOCK.stores.length}개 매장을 한 번에 관리하고 있어요.</strong
        >
        <p>${MOCK.stores.map((store) => store.name).join(" · ")}</p>
      </div>
      <button
        class="button secondary"
        type="button"
        data-open-franchise-settings
      >
        가맹점 설정
      </button>
    </section>
    ${storesPage("가맹점 관리")
      .replace('<div class="content">', "")
      .replace(/<\/div>$/, "")}
  </div>`;
}
function storeRow(s) {
  return html`<tr class="store-row" data-store="${s.name}" tabindex="0">
    <td class="store-name">${s.name}</td>
    <td>${s.region}</td>
    <td>${s.items}</td>
    <td class="${s.risks === "없음" ? "positive" : "negative"}">${s.risks}</td>
    <td>${s.manager}</td>
    <td><span class="status-dot"></span>${s.state}</td>
  </tr>`;
}
