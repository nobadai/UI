function briefingPage() {
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>브리핑 기록</h2>
        <p>
          일별·주별·월간 단위로 생성된 시장과 원가 변화의 종합 보고서입니다.
        </p>
      </div>
      <button class="button secondary" id="generateBriefing">
        주간 브리핑 생성
      </button>
    </div>
    <div class="cards briefing-summary">
      <article class="card kpi-card">
        <span>이번 달 생성</span><strong>12건</strong
        ><small>일간 8 · 주간 3 · 월간 1</small>
      </article>
      <article class="card kpi-card">
        <span>다음 자동 생성</span><strong>월요일 09:00</strong
        ><small>주간 원가 브리핑</small>
      </article>
      <article class="card kpi-card">
        <span>주요 분석 품목</span><strong>배추 · 양파</strong
        ><small>예측 검증 품목 기준</small>
      </article>
    </div>
    <div class="briefing-list">
      ${MOCK.briefings
        .map(
          (briefing, index) =>
            html`<article
              class="card briefing-report brief-card"
              data-brief="${index}"
            >
              <div class="report-icon">${iconSvg("brief")}</div>
              <div class="report-copy">
                <span class="brief-date"
                  >${briefing.date} · ${index === 2 ? "주간" : "일간"}
                  보고서</span
                >
                <h3>${briefing.title}</h3>
                <p>${briefing.summary}</p>
                <div class="report-tags">
                  <span>가격 전망</span><span>근거 요약</span
                  ><span>메뉴 영향</span>
                </div>
              </div>
              <button class="button ghost" type="button">보고서 열기</button>
            </article>`,
        )
        .join("")}
    </div>
  </div>`;
}
