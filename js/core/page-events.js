function updateForecastSelection() {
  const target = $("#mainChart"),
    svg = target?.querySelector("svg");
  if (!svg) return;
  svg.querySelector(".forecast-selection")?.remove();
}

function bindPage(page) {
  setupChartControls();
  bindChartInteractions(page);
  bindEvidenceInteractions();
  bindDashboardFilters();
  bindRecipePage(page);
  bindStorePage();
  bindBriefingPage();
  bindAlertPage();
  bindSettingsNavigation();
  bindPlanAndGuestActions();
}

function setupChartControls() {
  const chartCard = $("#mainChart")?.closest(".chart-card");

  if (chartCard && !chartCard.querySelector(".granularity-control")) {
    const toolbar =
      chartCard.querySelector(".chart-toolbar") ||
      chartCard.querySelector(".section-head");
    toolbar?.insertAdjacentHTML("beforeend", granularityControl());
  }

  $$(".period-filter").forEach((el) => {
    const options = periodOptions[state.granularity];
    el.innerHTML = options
      .map(
        (value) =>
          html`<option ${value === state.period ? "selected" : ""}>
            ${value}
          </option>`,
      )
      .join("");
  });

  if (
    $("#mainChart") &&
    !$(".forecast-panel") &&
    !$("#mainChart").classList.contains("fake-chart")
  )
    $("#mainChart").insertAdjacentHTML("afterend", forecastPanel());

  if ($("#mainChart")) {
    renderChart($("#mainChart"), state.ingredient);
    updateForecastSelection();
  }

  if ($("#guestChart")) renderChart($("#guestChart"), "cabbage", true);
}

function bindChartInteractions(page) {
  $$(".granularity-filter").forEach(
    (el) =>
      (el.onchange = () => {
        state.granularity = el.value;
        state.period = periodOptions[state.granularity][0];
        state.horizon = state.granularity === "monthly" ? 4 : 3;
        route(page, false);
        toast(`${el.options[el.selectedIndex].text} 가격 추이로 변경했습니다.`);
      }),
  );

  $$(".ingredient-filter").forEach(
    (el) =>
      (el.onchange = () => {
        state.ingredient = el.value;
        renderChart($("#mainChart"), state.ingredient);
        if (page === "detail") {
          route("detail", false);
          return;
        }
        if ($("#forecastMetrics"))
          $("#forecastMetrics").innerHTML = forecastMetrics();
        updateForecastSelection();
      }),
  );

  $$(".period-filter").forEach(
    (el) =>
      (el.onchange = () => {
        state.period = el.value;
        renderChart($("#mainChart"), state.ingredient);
        toast(`${el.value} 기간으로 조회했습니다.`);
      }),
  );

  bindIngredientCards();
}

function bindIngredientCards() {
  $$(".price-card").forEach((card) => {
    card.onclick = () => {
      if (!predictionIngredientIds.includes(card.dataset.ingredient)) {
        toast(
          `${getIngredient(card.dataset.ingredient).name}은 현재가 모니터링 품목입니다. AI 예측 검증은 배추·양파를 우선 지원합니다.`,
        );
        return;
      }
      state.ingredient = card.dataset.ingredient;
      $$(".ingredient-filter").forEach(
        (filter) => (filter.value = state.ingredient),
      );
      renderChart($("#mainChart"), state.ingredient);
      if ($("#forecastMetrics"))
        $("#forecastMetrics").innerHTML = forecastMetrics();
      $("#impactIngredient").textContent = getIngredient().name;
      $("#ingredientAnalysis")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      toast(`${getIngredient().name} 가격 전망과 산출 근거를 표시했습니다.`);
    };
    card.onkeydown = (event) => {
      if (event.key === "Enter") card.click();
    };
  });
}

function bindEvidenceInteractions() {
  $$(".tab").forEach(
    (t) =>
      (t.onclick = () => {
        $$(".tab").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        $("#evidenceBody").innerHTML =
          t.dataset.evidence === "weather" ? weatherTable() : productionTable();
      }),
  );

  $$(".evidence-view-tabs button").forEach(
    (button) =>
      (button.onclick = () => {
        $$(".evidence-view-tabs button").forEach((item) => {
          item.classList.toggle("active", item === button);
          item.setAttribute("aria-selected", String(item === button));
        });
        updateEvidencePanel();
      }),
  );
}

function bindDashboardFilters() {
  $("#storeFilter")?.addEventListener("change", (e) =>
    toast(`${e.target.value} 기준으로 원가 영향을 다시 계산했습니다.`),
  );
  $("#dateFilter")?.addEventListener("change", (e) =>
    toast(`${e.target.value} 데이터를 불러왔습니다.`),
  );
  $("#downloadBrief")?.addEventListener("click", () =>
    toast("브리핑이 내 기록에 저장되었습니다."),
  );
}

function bindRecipePage(page) {
  $("#recipeList")?.addEventListener("click", (event) => {
    const button = event.target.closest(".recipe-item");
    if (!button) return;
    state.recipe = button.dataset.recipe;
    state.recipeEditing = false;
    const recipe = MOCK.recipes.find((item) => item.id === state.recipe);
    $("#recipeList").innerHTML = recipeList(state.recipe);
    $("#recipeDetail").innerHTML = recipeDetail(recipe, page === "menu-cost");
    bindRecipeEditor(page);
  });
  $("#recipeSearch")?.addEventListener("input", (e) => {
    $$(".recipe-item").forEach(
      (x) =>
        (x.style.display = x.textContent.includes(e.target.value)
          ? "flex"
          : "none"),
    );
  });
  $("#addRecipe")?.addEventListener("click", () =>
    openModal(
      "새 메뉴 추가",
      "시안에서는 저장하지 않습니다. 실제 제품에서는 메뉴명, 판매가, 제공량을 입력한 뒤 식재료와 사용량을 등록하는 흐름으로 연결됩니다.",
      true,
    ),
  );

  bindRecipeEditor(page);
}

function bindStoreRows() {
  $$(".store-row").forEach(
    (row) =>
      (row.onclick = () => {
        state.store = row.dataset.store;
        const s = MOCK.stores.find((x) => x.name === state.store);
        openModal(
          `${s.name} 원가 현황`,
          `${s.region} · 담당자 ${s.manager}<br><br>현재 위험 품목은 <strong>${s.risks}</strong>입니다. 배추 관련 등록 메뉴 4개의 예상 원가가 평균 7.2% 상승할 것으로 보입니다.`,
        );
      }),
  );
}

function bindStorePage() {
  bindStoreRows();

  $("#regionFilter")?.addEventListener("change", (e) => {
    $("#storeRows").innerHTML = MOCK.stores
      .filter(
        (s) =>
          e.target.value === "전체 지역" || s.region.startsWith(e.target.value),
      )
      .map(storeRow)
      .join("");
    bindStoreRows();
  });

  $("#addStore")?.addEventListener("click", openAddStoreModal);
}

function bindBriefingPage() {
  $$(".brief-card").forEach(
    (b, i) =>
      (b.onclick = () => {
        const item = MOCK.briefings[i] || MOCK.briefings[0];
        openModal(
          item.title,
          html`<span class="status-badge status-warning">${item.type}</span>
            <p>${item.body}</p>
            <div class="modal-detail">
              예상 영향: 배추 사용 메뉴 평균 원가 +7.4%<br />권장 대응: 2~3주
              물량 발주 시점 검토
            </div>`,
        );
      }),
  );
  $("#generateBriefing")?.addEventListener("click", () =>
    toast("주간 브리핑 생성을 시작했습니다. 완료되면 기록에 추가됩니다."),
  );
}

function bindAlertPage() {
  $("#markRead")?.addEventListener("click", () => {
    $$(".alert-item").forEach((item) => item.classList.remove("unread"));
    toast("모든 알림을 읽음 처리했습니다.");
  });
  $$("[data-alert-filter]").forEach(
    (button) =>
      (button.onclick = () => {
        $$("[data-alert-filter]").forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        $$(".alert-item").forEach(
          (item) =>
            (item.hidden =
              button.dataset.alertFilter !== "all" &&
              item.dataset.alertType !== button.dataset.alertFilter),
        );
      }),
  );
  $$(".alert-item").forEach(
    (item) =>
      (item.onclick = (event) => {
        if (event.target.closest("[data-page]")) return;
        const alert = alertItems[Number(item.dataset.alertIndex)];
        item.classList.remove("unread");
        openModal(
          alert.title,
          html`<span class="status-badge status-${alert.level}"
              >${alert.time}</span
            >
            <p>${alert.summary}</p>
            <div class="modal-detail">
              이 알림은 임계치를 넘은 시점에 즉시 생성되는 대응 이벤트입니다.
            </div>`,
        );
      }),
  );
}

function bindSettingsNavigation() {
  $$(".settings-menu button").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.setting);
      if (index === 4) {
        location.href = "login.html";
        return;
      }
      const settingRoutes = ["profile", "company", "settings", "plans"];
      route(settingRoutes[index]);
    };
  });
  bindSettingsPanel();
  $("[data-open-franchise-settings]")?.addEventListener("click", () => {
    state.settingsTab = 1;
    route("company");
  });
}

function bindPlanAndGuestActions() {
  $$("[data-plan]").forEach(
    (b) =>
      (b.onclick = () =>
        openModal(
          `${b.dataset.plan} 플랜`,
          `선택하신 플랜은 시안용입니다. 실제 결제는 진행되지 않습니다.`,
        )),
  );
  $("#freeStart")?.addEventListener(
    "click",
    () => (location.href = "signup.html"),
  );
  $("#loginPreview")?.addEventListener(
    "click",
    () => (location.href = "login.html"),
  );
}

function bindRecipeEditor(page) {
  const recipe =
    MOCK.recipes.find((item) => item.id === state.recipe) || MOCK.recipes[0];
  $("#editRecipe")?.addEventListener("click", () => {
    state.recipeEditing = true;
    $("#recipeDetail").innerHTML = recipeEditForm(recipe);
    bindRecipeEditor(page);
  });
  $("#cancelRecipeEdit")?.addEventListener("click", () => {
    state.recipeEditing = false;
    $("#recipeDetail").innerHTML = recipeDetail(recipe, false);
    bindRecipeEditor(page);
  });
  $("#addIngredientRow")?.addEventListener("click", () => {
    $("#ingredientEditRows").insertAdjacentHTML(
      "beforeend",
      ingredientInputRow(),
    );
    $("#ingredientEditRows tr:last-child input").focus();
  });
  $("#ingredientEditRows")?.addEventListener("click", (event) => {
    const button = event.target.closest(".ingredient-remove");
    if (!button) return;
    const rows = $$("#ingredientEditRows tr");
    if (rows.length === 1) {
      toast("식재료는 한 개 이상 등록해 주세요.");
      return;
    }
    button.closest("tr").remove();
  });
  $("#recipeEditForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const rows = $$("#ingredientEditRows tr");
    recipe.items = rows.map((row) => [
      row.querySelector('[name="ingredientName"]').value.trim(),
      row.querySelector('[name="ingredientAmount"]').value.trim(),
      row.querySelector('[name="ingredientPrice"]').value.trim(),
    ]);
    recipe.updatedAt = new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", ".");
    localStorage.setItem("costCatcher.recipes", JSON.stringify(MOCK.recipes));
    state.recipeEditing = false;
    $("#recipeDetail").innerHTML = recipeDetail(recipe, false);
    bindRecipeEditor(page);
    toast(`${recipe.name} 레시피를 저장했습니다.`);
  });
}
