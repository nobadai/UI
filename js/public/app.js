// -----------------------------------------------------------------------------
// PUBLIC 기업 홈페이지 부트스트랩
// 각 HTML 문서가 data-public-page로 자기 화면 키를 알려줍니다.
// -----------------------------------------------------------------------------
(function initPublicSite() {
  const key = document.body.dataset.publicPage || "home";
  const renderer = publicPages[key] || publicPages.home;
  const site = publicSiteContent();

  document.title =
    key === "home"
      ? `${site.company.name} | ${BRAND.tagline}`
      : `${document.title.split(" | ")[0]} | ${site.company.name}`;

  $("#siteHeaderRoot").innerHTML = publicHeader(key);
  $("#publicMain").innerHTML = renderer();
  $("#siteFooterRoot").innerHTML = publicFooter();

  bindPublicShell();
  bindReveal();

  // 같은 문서 안의 앵커 이동은 Sticky Header 높이만큼 여유를 둡니다.
  $$('a[href^="#"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      const target = document.getElementById(
        link.getAttribute("href").slice(1),
      );
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }),
  );

  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target)
      window.setTimeout(
        () => target.scrollIntoView({ behavior: "auto", block: "start" }),
        60,
      );
  }
})();
