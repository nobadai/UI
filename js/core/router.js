function init() {
  document.title = `${BRAND.name} | ${BRAND.eng}`;
  $$("[data-brand-name]").forEach((el) => (el.textContent = BRAND.name));
  $$("[data-brand-eng]").forEach((el) => (el.textContent = BRAND.eng));
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
  $("#notificationButton").onclick = () => {
    route("anomaly");
    toast("이상치 탐지 알림 3건을 불러왔습니다.");
  };
  $("#helpButton").onclick = () =>
    openModal(
      `${BRAND.name} 도움말`,
      html`<p>
          정의서 v0.5의 일일 파이프라인(T0 → T4)을 화면으로 옮긴
          프로토타입입니다.
        </p>
        <div class="modal-detail">
          <strong>T0</strong> 대시보드에서 오늘의 상태 스냅샷을 확인합니다.<br />
          <strong>T1~T3</strong> 매입 &gt; 금일 제안 상세에서 시나리오, 3부서
          제약 회신, 변경안 결합, Critic 결과를 검토하고 승인합니다.<br />
          <strong>T4</strong> 승인 후 재무·재고 화면에 반영 결과가 기록됩니다.
        </div>
        <p>
          오른쪽 아래 AI 챗봇에서도 현재 화면의 Mock Data를 질문할 수 있습니다.
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
  anomaly: "임계치를 넘은 이벤트를 감지하는 규칙과 전달 채널을 설정합니다.",
  external: "로그인 전 외부 사용자에게 공개되는 화면 구성입니다.",
  personas:
    "고정지출과 수요를 산정하기 위한 시뮬레이션 페르소나 정의 상태입니다.",
  errors: "오류·점검 상태별 사용자 안내 화면을 확인합니다.",
};

/** 사이드바 순서를 이용해 breadcrumb의 상위 섹션을 찾습니다. */
function findSection(page) {
  let current = "";
  for (const entry of nav) {
    if (entry.section) current = entry.section;
    else if (entry.page === page) return entry.sub ? current : "";
  }
  return "";
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
  const section = findSection(page);
  $("#pageTitle").textContent = found?.label || BRAND.name;
  $("#pageSubtitle").textContent = subtitles[page] || "";
  $("#breadcrumb").textContent = [BRAND.name, section, found?.label]
    .filter(Boolean)
    .join(" / ");
  const renderer = pages[page] || pages.dashboard;
  $("#appMain").classList.remove("page-enter");
  $("#appMain").innerHTML = renderer();
  void $("#appMain").offsetWidth;
  $("#appMain").classList.add("page-enter");
  $("#appMain").focus({ preventScroll: true });
  bindPage(page);
  setTimeout(() => document.body.classList.remove("route-loading"), 360);
}
