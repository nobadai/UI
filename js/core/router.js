function init() {
  const storedRecipes = readStoredSettings("costCatcher.recipes", null);
  if (Array.isArray(storedRecipes) && storedRecipes.length)
    MOCK.recipes.splice(0, MOCK.recipes.length, ...storedRecipes);
  $("#mainNav").innerHTML = nav
    .map((item) =>
      item.section
        ? html`<div class="nav-label">${item.section}</div>`
        : html`<button
            class="nav-item ${item.sub ? "sub" : ""}"
            data-page="${item.page}"
          >
            <span class="nav-icon">${iconSvg(item.icon)}</span>${item.label}
          </button>`,
    )
    .join("");
  bindGlobal();
  route(location.hash.replace("#/", "") || "dashboard", false);
  seedChat();
  window.setTimeout(() => $("#appLoader")?.classList.add("is-hidden"), 650);
}

function bindGlobal() {
  document.addEventListener("click", (e) => {
    const pageTarget = e.target.closest("[data-page]");
    if (pageTarget) {
      route(pageTarget.dataset.page);
      $("#sidebar").classList.remove("open");
    }
    const company = e.target.closest("[data-company]");
    if (company) {
      $("#companyButton").innerHTML =
        `${company.dataset.company} <span>⌄</span>`;
      $("#companyDropdown").classList.remove("open");
      toast("조직이 변경되었습니다.");
    }
  });
  $("#companyButton").onclick = (e) => {
    e.stopPropagation();
    $("#companyDropdown").classList.toggle("open");
  };
  document.addEventListener("click", () =>
    $("#companyDropdown").classList.remove("open"),
  );
  $("#sidebarOpen").onclick = () => $("#sidebar").classList.add("open");
  $("#sidebarClose").onclick = () => $("#sidebar").classList.remove("open");
  $("#notificationButton").onclick = () => {
    route("alerts");
    toast("읽지 않은 알림 3건을 불러왔습니다.");
  };
  $("#helpButton").onclick = () =>
    openModal(
      "원가 캣쳐 도움말",
      "대시보드에서 시장 신호를 확인하고, 상세 분석에서 근거 데이터를 검토한 다음 메뉴 원가 영향을 확인하세요. 오른쪽 아래 AI 챗봇에서도 현재 화면의 데이터를 질문할 수 있습니다.",
    );
  $("#chatLauncher").onclick = openChat;
  $("#chatMinimize").onclick = closeChat;
  $("#chatForm").onsubmit = sendChat;
  $("#modalClose").onclick = closeModal;
  $("#modalBackdrop").onclick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeChat();
      $("#sidebar").classList.remove("open");
    }
  });
  window.addEventListener("hashchange", () =>
    route(location.hash.replace("#/", "") || "dashboard", false),
  );
}

function route(page, push = true) {
  document.body.classList.add("route-loading");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  state.page = page;
  if (push) location.hash = `/${page}`;
  $$(".nav-item").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === page),
  );
  $$(".mobile-bottom-nav [data-page]").forEach((button) =>
    button.classList.toggle("active", button.dataset.page === page),
  );
  const found = nav.find((item) => item.page === page);
  const subtitles = {
    dashboard: "오늘의 식자재 동향과 원가 위험 신호를 확인하세요.",
    ingredient: "품목별 실제 가격과 향후 예측 구간을 비교합니다.",
    detail: "가격 변화의 근거를 데이터별로 확인합니다.",
    recipes: "등록 메뉴와 식재료 사용량을 관리합니다.",
    "menu-cost": "시장 변동이 메뉴 원가에 미치는 영향을 확인합니다.",
    stores: "등록 매장의 위험 품목과 원가 영향을 한 화면에서 모니터링합니다.",
    franchise: "가맹점별 위험 품목과 담당 현황을 관리합니다.",
    briefings: "정해진 주기에 생성된 시장·원가 요약 보고서를 확인합니다.",
    alerts: "즉시 확인하고 대응해야 하는 위험 이벤트를 확인합니다.",
    profile: "내 이름과 연락처 등 회원 정보를 확인하고 안전하게 수정합니다.",
    company: "회사 정보와 분석 대상 가맹점을 관리합니다.",
    settings: "이메일과 정기 알림 주기를 설정합니다.",
    plans: "사업 규모에 맞는 플랜을 비교합니다.",
    guest: "로그인 전 공개되는 서비스 소개 화면입니다.",
    errors: "오류·점검 상태별 사용자 안내 화면을 확인합니다.",
  };
  $("#pageTitle").textContent = found?.label || "원가 캣쳐";
  $("#pageSubtitle").textContent = subtitles[page] || "";
  $("#breadcrumb").textContent = `원가 캣쳐 / ${found?.label || ""}`;
  const renderer = pages[page] || pages.dashboard;
  $("#appMain").classList.remove("page-enter");
  $("#appMain").innerHTML = renderer();
  void $("#appMain").offsetWidth;
  $("#appMain").classList.add("page-enter");
  $("#appMain").focus({ preventScroll: true });
  bindPage(page);
  setTimeout(() => document.body.classList.remove("route-loading"), 360);
}

// -----------------------------------------------------------------------------
// Forecast controls and dashboard renderers
// -----------------------------------------------------------------------------
