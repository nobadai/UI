function recipePage(costOnly) {
  const active =
    MOCK.recipes.find((r) => r.id === state.recipe) || MOCK.recipes[0];
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>${costOnly ? "메뉴 원가 분석" : "레시피 관리"}</h2>
        <p>레시피별 식재료 구성과 시장 전망을 반영한 예상 원가를 관리합니다.</p>
      </div>
      <button class="button primary" id="addRecipe">+ 메뉴 추가</button>
    </div>
    <div class="recipe-layout">
      <aside class="card list-panel">
        <input class="search-input" id="recipeSearch" placeholder="메뉴 검색" />
        <div id="recipeList">${recipeList(active.id)}</div>
      </aside>
      <article class="card detail-panel" id="recipeDetail">
        ${recipeDetail(active, costOnly)}
      </article>
    </div>
  </div>`;
}
function recipeList(activeId) {
  return MOCK.recipes
    .map(
      (r) =>
        html`<button
          class="recipe-item ${r.id === activeId ? "active" : ""}"
          data-recipe="${r.id}"
        >
          <span class="recipe-photo-slot">사진</span
          ><span
            ><strong>${r.name}</strong
            ><small>현재 원가 ${money(r.current)}</small></span
          >
        </button>`,
    )
    .join("");
}
function recipeDetail(r, costOnly = false) {
  if (state.recipeEditing && !costOnly) return recipeEditForm(r);
  return html`<div class="recipe-header">
      <div>
        <h3>${escapeHtml(r.name)}</h3>
        <p>
          ${escapeHtml(r.servings)} 기준 레시피 · 마지막 수정
          ${r.updatedAt || "2026.08.12"}
        </p>
      </div>
      ${costOnly
        ? ""
        : html`<button class="button ghost" id="editRecipe">
            레시피 수정
          </button>`}
    </div>
    <div class="cards kpi-grid">
      <article class="card kpi-card">
        <span>현재 메뉴 원가</span><strong>${money(r.current)}</strong
        ><small>원가율 31.2%</small>
      </article>
      <article class="card kpi-card">
        <span>3주 후 예상 원가</span
        ><strong style="color:var(--danger)">${money(r.future)}</strong
        ><small>+${money(r.future - r.current)} 상승</small>
      </article>
      <article class="card kpi-card">
        <span>판매가</span><strong>8,500원</strong><small>매장 평균</small>
      </article>
      <article class="card kpi-card">
        <span>예상 원가율</span><strong>33.8%</strong><small>+2.6%p</small>
      </article>
    </div>
    <div class="section-head">
      <div>
        <h2>식재료 구성</h2>
        <p>현재 매입 단가 기준</p>
      </div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>식재료</th>
            <th>사용량</th>
            <th>현재 매입 단가</th>
            <th>가격 전망</th>
          </tr>
        </thead>
        <tbody>
          ${r.items
            .map(
              (it, i) =>
                html`<tr>
                  <td><strong>${escapeHtml(it[0])}</strong></td>
                  <td>${escapeHtml(it[1])}</td>
                  <td>${escapeHtml(it[2])}</td>
                  <td>
                    <span
                      class="status-badge status-${i === 0
                        ? "danger"
                        : "success"}"
                      >${i === 0 ? "상승" : "안정"}</span
                    >
                  </td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    ${costOnly
      ? '<div class="ai-summary"><strong>AI 원가 제안</strong>배추 사용량이 전체 예상 원가 상승분의 72%를 차지합니다. 한시적 대체 규격 검토 또는 3주분 선발주를 권장합니다.</div>'
      : ""}`;
}
function ingredientInputRow(item = ["", "", ""]) {
  return html`<tr class="ingredient-input-row">
    <td>
      <input
        class="recipe-input"
        name="ingredientName"
        value="${escapeHtml(item[0])}"
        placeholder="예: 배추"
        required
      />
    </td>
    <td>
      <input
        class="recipe-input"
        name="ingredientAmount"
        value="${escapeHtml(item[1])}"
        placeholder="예: 180g"
        required
      />
    </td>
    <td>
      <input
        class="recipe-input"
        name="ingredientPrice"
        value="${escapeHtml(item[2])}"
        placeholder="예: 620원/kg"
        required
      />
    </td>
    <td>
      <button class="ingredient-remove" type="button" aria-label="식재료 삭제">
        삭제
      </button>
    </td>
  </tr>`;
}
function recipeEditForm(r) {
  return html`<form id="recipeEditForm">
    <div class="recipe-header">
      <div>
        <h3>${escapeHtml(r.name)} 레시피 수정</h3>
        <p>메뉴에 들어가는 식재료, 사용량과 현재 매입 단가를 입력하세요.</p>
      </div>
      <div class="recipe-edit-actions">
        <button class="button ghost" type="button" id="cancelRecipeEdit">
          취소</button
        ><button class="button primary" type="submit">레시피 저장</button>
      </div>
    </div>
    <div class="recipe-edit-guide">
      <strong>입력 기준</strong
      ><span
        >사용량에는 g·kg·ml 등의 단위를, 매입 단가에는 원/kg·원/개처럼 거래
        단위를 함께 적어주세요.</span
      >
    </div>
    <div class="table-wrap">
      <table class="data-table recipe-edit-table">
        <thead>
          <tr>
            <th>식재료</th>
            <th>사용량</th>
            <th>현재 매입 단가</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody id="ingredientEditRows">
          ${r.items.map((item) => ingredientInputRow(item)).join("")}
        </tbody>
      </table>
    </div>
    <button
      class="button secondary add-ingredient-button"
      type="button"
      id="addIngredientRow"
    >
      + 식재료 추가
    </button>
  </form>`;
}
