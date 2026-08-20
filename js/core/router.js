function init() {
  $$("[data-brand-name]").forEach((el) => (el.textContent = BRAND.name));
  const initial = location.hash.replace("#/", "") || "dashboard";
  const group = findNavEntry(initial).group;
  if (group && group.label && !state.openGroups.includes(group.id))
    state.openGroups.push(group.id);
  renderNav();
  bindGlobal();
  updateNotificationBadge();
  route(initial, false);
  seedChat();
  window.setTimeout(() => $("#appLoader")?.classList.add("is-hidden"), 650);
}

/** 그룹 단위 접이식 사이드바. 현재 화면이 속한 그룹은 항상 펼쳐 둡니다. */
function renderNav() {
  $("#mainNav").innerHTML = navGroups
    .map((group) => {
      const items = group.items
        .map(
          (item) =>
            html`<button
              class="nav-item ${group.label ? "sub" : ""} ${
                item.page === state.page ? "active" : ""
              }"
              data-page="${item.page}"
            >
              <span class="nav-icon">${iconSvg(item.icon)}</span>${item.label}
            </button>`,
        )
        .join("");
      if (!group.label) return html`<div class="nav-group">${items}</div>`;
      const open =
        state.openGroups.includes(group.id) ||
        group.items.some((item) => item.page === state.page);
      return html`<div class="nav-group ${open ? "open" : ""}">
        <button
          class="nav-group-toggle"
          data-nav-group="${group.id}"
          aria-expanded="${open}"
        >
          <span class="nav-icon">${iconSvg(group.icon)}</span>${group.label}
          <b aria-hidden="true">⌄</b>
        </button>
        <div class="nav-group-items">${items}</div>
      </div>`;
    })
    .join("");
}

/** 헤더 알림 버튼의 요약 팝오버. 상세 화면은 관리 > 알림 로그가 담당합니다. */
function openNotificationPopover() {
  const popover = $("#notificationPopover");
  if (!popover) return;
  popover.innerHTML = notificationPopoverContent();
  popover.hidden = false;
  $("#notificationButton")?.setAttribute("aria-expanded", "true");
}

function closeNotificationPopover() {
  const popover = $("#notificationPopover");
  if (!popover || popover.hidden) return;
  popover.hidden = true;
  popover.innerHTML = "";
  $("#notificationButton")?.setAttribute("aria-expanded", "false");
}

function bindGlobal() {
  document.addEventListener("click", (e) => {
    // 알림 팝오버: 바깥을 누르면 닫고, 안쪽 동작은 아래에서 개별 처리합니다.
    if (!e.target.closest(".notification-wrap")) closeNotificationPopover();
    if (e.target.closest("#markAllReadButton")) {
      markAllNotificationsRead();
      openNotificationPopover();
      toast("알림을 모두 확인 처리했습니다.");
      return;
    }
    const notificationTarget = e.target.closest("[data-notification]");
    if (notificationTarget) {
      closeNotificationPopover();
      const id = notificationTarget.dataset.notification;
      if (state.page === "notifications") {
        selectNotification(id);
      } else {
        state.notification = id;
        markNotificationRead(id);
        route("notifications");
      }
      return;
    }
    const groupToggle = e.target.closest("[data-nav-group]");
    if (groupToggle) {
      const id = groupToggle.dataset.navGroup;
      state.openGroups = state.openGroups.includes(id)
        ? state.openGroups.filter((item) => item !== id)
        : [...state.openGroups, id];
      renderNav();
      return;
    }
    const pageTarget = e.target.closest("[data-page]");
    if (pageTarget) {
      closeNotificationPopover();
      route(pageTarget.dataset.page);
      $("#sidebar").classList.remove("open");
    }
    const item = e.target.closest("[data-switch-item]");
    if (item) {
      state.item = item.dataset.switchItem;
      $("#itemButton").innerHTML = `${findItem().name} <span>⌄</span>`;
      $("#itemDropdown").classList.remove("open");
      route(state.page, false);
      toast(`${findItem().name} 기준으로 화면을 갱신했습니다.`);
    }
  });
  $("#itemButton").onclick = (e) => {
    e.stopPropagation();
    $("#itemDropdown").classList.toggle("open");
  };
  document.addEventListener("click", () =>
    $("#itemDropdown").classList.remove("open"),
  );
  $("#itemDropdown").innerHTML = MOCK.items
    .map(
      (item) =>
        html`<button data-switch-item="${item.id}">
          ${item.name}
          <small>${item.coverage ? "예측 검증" : "시세 모니터링"}</small>
        </button>`,
    )
    .join("");
  $("#itemButton").innerHTML = `${findItem().name} <span>⌄</span>`;
  $("#sidebarOpen").onclick = () => $("#sidebar").classList.add("open");
  $("#sidebarClose").onclick = () => $("#sidebar").classList.remove("open");
  $("#notificationButton").onclick = (event) => {
    event.stopPropagation();
    if ($("#notificationPopover")?.hidden === false) closeNotificationPopover();
    else openNotificationPopover();
  };
  $("#helpButton").onclick = () =>
    openModal(
      `${BRAND.name} 운영 시스템 도움말`,
      html`<p>
          정의서 v0.5의 일일 파이프라인(T0 → T4)을 화면으로 옮긴
          프로토타입입니다.
        </p>
        <div class="modal-detail">
          <strong>T0</strong> 대시보드에서 오늘의 상태 스냅샷을 확인합니다.<br />
          <strong>T1~T3</strong> AI 의사결정 &gt; 금일 제안 상세에서 시나리오,
          3부서 제약 회신, 변경안 결합, Critic 결과를 검토하고 승인합니다.<br />
          <strong>T4</strong> 승인 후 재무·재고 화면에 반영 결과가 기록됩니다.
        </div>
        <p>
          외부 고객이 보는 기업 홈페이지는 헤더의
          <strong>홈페이지</strong> 버튼으로 열 수 있고, 콘텐츠는
          <strong>관리 &gt; 외부 페이지 관리</strong>에서 수정합니다.
        </p>`,
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
      closeNotificationPopover();
      closeModal();
      closeChat();
      $("#sidebar").classList.remove("open");
    }
  });
  window.addEventListener("hashchange", () =>
    route(location.hash.replace("#/", "") || "dashboard", false),
  );
}

const subtitles = {
  dashboard:
    "오늘의 상태 스냅샷과 일일 파이프라인(T0 → T4) 진행 상황을 확인합니다.",
  forecast:
    "품목을 선택하면 소매가·중도매가·경락가를 한 화면에서 함께 표시합니다.",
  proposal:
    "T1 매입 초안부터 T2 제약 회신, T3 조정, Critic 검증, 사람 승인까지 한 화면에서 처리합니다.",
  "proposal-history":
    "지난 제안의 조정 폭, 루프 사용량, Critic 결과와 변경안 채택률을 확인합니다.",
  market: "품목별 소매·중도매·경락 시세와 D+18 예측을 비교합니다.",
  "purchase-ledger": "확정 매입 건의 수량, 단가, 산지 거래처를 기록합니다.",
  "purchase-config":
    "매입 판단에 쓰이는 상수값과 루프 예산을 관리합니다. 일부 값은 정의서에 고정되어 있습니다.",
  "finance-assets": "현금·재고·미수금을 합친 자산 전체를 확인합니다.",
  "finance-expense":
    "고정지출과 변동지출을 구분해 매입 한도 산출 근거를 확인합니다.",
  "finance-holdings": "보유 재고의 장부가와 시가 차이를 비교합니다.",
  "finance-available": "유보 항목을 차감한 실제 집행 가능 잔액을 계산합니다.",
  "finance-payroll": "정규·일용 인력의 급여 지급 일정을 관리합니다.",
  "sales-labor":
    "일일 근로자 명부와 인건비를 기록합니다. 인원 산정은 더미 로직입니다.",
  "sales-delivery": "배송 건별 트럭 배차와 도착 예정 시각을 확인합니다.",
  "sales-clients": "정기 거래처의 월 물량과 정산 조건을 관리합니다.",
  "inventory-status":
    "품목별 재고, 보관 방식, 잔여 유통기한과 감모율을 확인합니다.",
  "inventory-outbound": "출고 전표별 처리 상태를 확인합니다.",
  "partner-ledger": "거래처별 매입·매출과 미수 정산 현황을 확인합니다.",
  "partner-receipt":
    "정산 기간별 영수증을 메일로 발송하거나 PDF·XLSX로 추출합니다.",
  "member-new": "새 계정을 생성하고 권한과 담당 파트를 지정합니다.",
  members: "계정 권한과 상태를 관리합니다. 최상위 관리자만 접근합니다.",
  company: "상호명·대표번호·위치·이메일을 관리하며 외부 페이지와 연동됩니다.",
  "public-site":
    "외부 기업 홈페이지에 노출되는 소개글, 대표 이미지, 안내 문구를 관리합니다.",
  anomaly: "임계치를 넘은 이벤트를 감지하는 규칙과 전달 채널을 설정합니다.",
  notifications:
    "실제로 발송된 알림의 발생 시각, 관측값, 처리 이력을 확인합니다.",
  personas:
    "고정지출과 수요를 산정하기 위한 시뮬레이션 페르소나 정의 상태입니다.",
  errors: "오류·점검 상태별 사용자 안내 화면을 확인합니다.",
};

function route(page, push = true) {
  document.body.classList.add("route-loading");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  state.page = page;
  if (push) location.hash = `/${page}`;
  const { item: found, group } = findNavEntry(page);
  if (group && group.label && !state.openGroups.includes(group.id))
    state.openGroups.push(group.id);
  renderNav();
  $$(".mobile-bottom-nav [data-page]").forEach((button) =>
    button.classList.toggle("active", button.dataset.page === page),
  );
  $("#pageTitle").textContent = found?.label || BRAND.name;
  $("#pageSubtitle").textContent = subtitles[page] || "";
  $("#breadcrumb").textContent = [BRAND.name, group?.label, found?.label]
    .filter(Boolean)
    .join(" / ");
  const renderer = pages[page] || pages.dashboard;
  $("#appMain").classList.remove("page-enter");
  $("#appMain").innerHTML = renderer();
  void $("#appMain").offsetWidth;
  $("#appMain").focus({ preventScroll: true });
  void $("#appMain").offsetWidth;
  $("#appMain").classList.add("page-enter");
  bindPage(page);
  setTimeout(() => document.body.classList.remove("route-loading"), 360);
}
