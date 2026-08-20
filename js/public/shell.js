// -----------------------------------------------------------------------------
// PUBLIC 기업 홈페이지 셸 — Sticky Header · Footer
// 관리자 화면과 달리 Sidebar를 쓰지 않고 가로 내비게이션을 사용합니다.
// -----------------------------------------------------------------------------

const PUBLIC_NAV = [
  { key: "company", label: "회사소개", href: "company.html" },
  { key: "business", label: "유통사업", href: "business.html" },
  { key: "market", label: "시장정보", href: "market.html" },
  { key: "products", label: "취급품목", href: "index.html#products" },
  { key: "partners", label: "파트너", href: "partners.html" },
  { key: "disclosure", label: "경영정보", href: "disclosure.html" },
];

function publicHeader(active) {
  return html`<a class="skip-link" href="#publicMain">본문으로 건너뛰기</a>
    <header class="site-header" id="siteHeader">
      <div class="site-header-inner">
        <a class="site-brand" href="index.html" aria-label="${BRAND.name} 홈">
          ${brandMark("site-brand-mark")}
          <span><strong>${BRAND.name}</strong><small>${BRAND.eng}</small></span>
        </a>
        <nav class="site-nav" id="siteNav" aria-label="주 메뉴">
          ${PUBLIC_NAV.map(
            (item) =>
              html`<a
                href="${item.href}"
                class="${item.key === active ? "active" : ""}"
                >${item.label}</a
              >`,
          ).join("")}
        </nav>
        <div class="site-actions">
          <a class="site-cta" href="signup.html">거래처 등록</a>
          <a class="site-login" href="login.html">로그인</a>
        </div>
        <button
          class="site-menu-toggle"
          id="siteMenuToggle"
          aria-label="메뉴 열기"
          aria-expanded="false"
        >
          <i></i><i></i><i></i>
        </button>
      </div>
    </header>`;
}

function publicFooter() {
  const site = publicSiteContent();
  return html`<footer class="site-footer">
    <div class="site-footer-inner">
      <div class="footer-brand">
        <a class="site-brand" href="index.html">
          ${brandMark("site-brand-mark")}
          <span
            ><strong>${escapeHtml(site.company.name)}</strong
            ><small>${BRAND.eng}</small></span
          >
        </a>
        <p>${escapeHtml(site.company.intro)}</p>
        <span class="sim-badge">Simulation Data · 시뮬레이션 기준</span>
      </div>
      <div class="footer-links">
        <strong>사이트</strong>
        ${PUBLIC_NAV.map(
          (item) => html`<a href="${item.href}">${item.label}</a>`,
        ).join("")}
      </div>
      <div class="footer-links">
        <strong>거래</strong>
        <a href="signup.html">거래처 등록</a>
        <a href="partners.html#farm">산지 파트너 등록</a>
        <a href="login.html">임직원 로그인</a>
      </div>
      <div class="footer-contact">
        <strong>연락처</strong>
        <span>${escapeHtml(site.company.address)}</span>
        <span>${escapeHtml(site.company.phone)}</span>
        <span>${escapeHtml(site.company.email)}</span>
        <span>${escapeHtml(site.contact.hours)}</span>
      </div>
    </div>
    <div class="site-footer-bottom">
      <span
        >© 2026 ${escapeHtml(site.company.name)} · 사업자등록번호
        ${escapeHtml(site.company.businessNumber)}</span
      >
      <span>가상 농산물 유통회사 시뮬레이션 프로토타입</span>
    </div>
  </footer>`;
}

/** 헤더 스크롤 상태와 모바일 메뉴 토글. */
function bindPublicShell() {
  const header = $("#siteHeader");
  const onScroll = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#siteMenuToggle");
  toggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  $$("#siteNav a").forEach((link) =>
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle?.setAttribute("aria-expanded", "false");
    }),
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") document.body.classList.remove("nav-open");
  });
}

/** 스크롤 진입 시 섹션을 부드럽게 드러냅니다. 모션 최소화 설정은 존중합니다. */
function bindReveal() {
  const targets = $$("[data-reveal]");
  if (!targets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  targets.forEach((el) => observer.observe(el));
}
