function detailPage() {
  const metricIcon = (n) =>
    html`<span class="metric-icon">${iconSvg(n)}</span>`;
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>${getIngredient().name} 상세 분석</h2>
        <p>가격 예측 결과와 판단 근거를 데이터 출처별로 확인합니다.</p>
      </div>
      <div class="section-actions">
        <select class="filter-control ingredient-filter">
          ${selectOptions()}</select
        ><button class="button secondary" id="downloadBrief">
          브리핑 저장
        </button>
      </div>
    </div>
    <div class="cards kpi-grid">
      <article class="card kpi-card">
        <span>3주 후 가격 상승 가능성</span
        ><strong style="color:var(--danger)">78%</strong
        ><small>지난주 대비 +9%p</small>
      </article>
      <article class="card kpi-card">
        <span>위험도</span><strong>높음</strong
        ><small>AI 종합 위험 점수 82/100</small>
      </article>
      <article class="card kpi-card">
        <span>예상 영향 기간</span><strong>3주 후</strong
        ><small>2026.09.03 전후</small>
      </article>
      <article class="card kpi-card">
        <span>3주 후 예상 가격</span><strong>3,790원</strong
        ><small>현재 대비 +10.8%</small>
      </article>
    </div>
    <div class="detail-grid">
      <article class="card chart-card">
        <div class="section-head">
          <div>
            <h2>가격 추이 & 예측 범위</h2>
            <p>90% 예측 구간을 함께 표시합니다.</p>
          </div>
          <select class="filter-control period-filter">
            <option>4주</option>
            <option>8주</option>
          </select>
        </div>
        <div class="chart-wrap" id="mainChart"></div>
      </article>
      <div class="metric-list">
        <article class="card metric">
          ${metricIcon("chart")}
          <div><span>생산량</span><strong>82,300t</strong></div>
          <b>▼ 9.6%</b>
        </article>
        <article class="card metric">
          ${metricIcon("brief")}
          <div><span>출하량</span><strong>78,500t</strong></div>
          <b>▼ 11.7%</b>
        </article>
        <article class="card metric">
          ${metricIcon("store")}
          <div><span>재배면적</span><strong>15,240ha</strong></div>
          <b>▼ 6.6%</b>
        </article>
        <article class="card metric">
          ${metricIcon("bell")}
          <div><span>기상 위험</span><strong>고온·다우</strong></div>
          <b>위험</b>
        </article>
      </div>
    </div>
    <div class="detail-grid" style="margin-top:14px">
      <article class="card evidence-card">
        <div class="section-head">
          <div>
            <h2>근거 데이터</h2>
            <p>생산·출하 및 기상 관측 요약</p>
          </div>
        </div>
        ${productionTable()}
        <div style="height:12px"></div>
        ${weatherTable()}
      </article>
      <article class="card evidence-card">
        <div class="section-head">
          <div>
            <h2>정책·수급 신호</h2>
            <p>비정형 데이터 분석 결과</p>
          </div>
        </div>
        <div class="metric-list">
          <div class="modal-detail">
            <strong>수급</strong>
            <p>가락시장 반입량이 7일 이동평균 대비 12.4% 감소했습니다.</p>
          </div>
          <div class="modal-detail">
            <strong>정책</strong>
            <p>
              정부 비축 물량 방출 검토가 보도됐으나 단기 공급 효과는 제한적으로
              반영했습니다.
            </p>
          </div>
        </div>
        <div class="ai-summary">
          <strong>AI 종합 해석</strong>고온과 집중호우가 생육을 늦추고 출하량
          감소로 이어지는 패턴이 관찰됩니다. 재배면적 감소 추세까지 겹쳐 3주 후
          가격 상승 가능성을 78%로 산정했습니다.
        </div>
      </article>
    </div>
  </div>`;
}
