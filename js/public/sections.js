// -----------------------------------------------------------------------------
// PUBLIC 공통 섹션 조각
//
// 외부 화면은 내부 판단 과정을 그대로 보여주지 않습니다.
// 시세는 실측 구간만 공개하고, D+18 예측·Agent·Critic 같은 내부 용어는 쓰지 않습니다.
// -----------------------------------------------------------------------------

/** 섹션 공통 골격. eyebrow → 제목 → 설명 → 본문 순서를 지킵니다. */
function section({
  id = "",
  eyebrow = "",
  title,
  lead = "",
  body,
  tone = "",
  action = "",
}) {
  return html`<section
    class="site-section ${tone}"
    ${id ? `id="${id}"` : ""}
    data-reveal
  >
    <div class="site-container">
      <div class="section-intro">
        <div>
          ${eyebrow ? html`<span class="eyebrow">${eyebrow}</span>` : ""}
          <h2>${title}</h2>
          ${lead ? html`<p>${lead}</p>` : ""}
        </div>
        ${action}
      </div>
      ${body}
    </div>
  </section>`;
}

/**
 * 공개 시세 스파크라인.
 * 예측 구간은 그리지 않고 최근 실측 20영업일만 사용합니다.
 */
function publicSparkline(itemId) {
  const points = MOCK.series[itemId].auction.actual;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const W = 200;
  const H = 56;
  const coords = points.map(
    (value, index) =>
      `${(index * W) / (points.length - 1)},${
        H - ((value - min) / (max - min || 1)) * (H - 8) - 4
      }`,
  );
  const rising = points.at(-1) >= points[0];
  return html`<svg
    class="public-spark ${rising ? "up" : "down"}"
    viewBox="0 0 ${W} ${H}"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <polygon
      class="public-spark-area"
      points="0,${H} ${coords.join(" ")} ${W},${H}"
    />
    <polyline class="public-spark-line" points="${coords.join(" ")}" />
  </svg>`;
}

/** 오늘의 시세 보드. 현재가 · 전일 대비 · 상태 · 추이까지만 공개합니다. */
function marketBoard(items = MOCK.items) {
  return html`<div class="market-board">
    ${items
      .map((item) => {
        const change = changeMark(item.change);
        return html`<article class="market-tile">
          <header>
            <h3>${item.name}</h3>
            <span class="status-pill status-${item.status}">${item.label}</span>
          </header>
          <div class="market-price">
            ${won(item.auction)}<small>${item.unit}</small>
          </div>
          <span class="market-change ${change.tone}"
            >${change.mark} ${change.text} <small>전일 대비</small></span
          >
          ${publicSparkline(item.id)}
        </article>`;
      })
      .join("")}
  </div>`;
}

/** 취급 품목 카드. 대시보드 카드가 아니라 기업 홈페이지의 Product Section 형태입니다. */
function productGrid() {
  const notes = {
    cabbage: "고랭지·해안 산지에서 계절별로 공급합니다.",
    radish: "김장철 대량 공급과 상시 납품을 함께 운영합니다.",
    onion: "저장성이 좋아 연중 안정적으로 공급합니다.",
    "green-onion": "손질 규격에 맞춘 소분 납품이 가능합니다.",
    potato: "감자는 상온 보관 기준으로 장기 공급합니다.",
    garlic: "깐마늘·통마늘 규격을 거래처 조건에 맞춰 공급합니다.",
  };
  return html`<div class="product-grid">
    ${MOCK.items
      .map(
        (item) =>
          html`<article class="product-card">
            <div class="product-visual" aria-hidden="true">
              <span>${item.name}</span>
            </div>
            <div class="product-body">
              <h3>${item.name}</h3>
              <p>${notes[item.id] || "산지 계약 기반으로 공급합니다."}</p>
              <dl>
                <div>
                  <dt>기준 시세</dt>
                  <dd>${won(item.auction)}원/kg</dd>
                </div>
                <div>
                  <dt>공급 형태</dt>
                  <dd>산지 직매입</dd>
                </div>
              </dl>
            </div>
          </article>`,
      )
      .join("")}
  </div>`;
}

/** 산지 → 정산까지의 실제 업무 흐름. 내부 T0~T4 표기는 쓰지 않습니다. */
function processFlow() {
  const site = publicSiteContent();
  return html`<ol class="process-flow">
    ${site.process
      .map(
        (step) =>
          html`<li>
            <span class="process-step">${step.step}</span>
            <strong>${escapeHtml(step.title)}</strong>
            <p>${escapeHtml(step.body)}</p>
          </li>`,
      )
      .join("")}
  </ol>`;
}

/** 내부 Agent 판단 축을 외부 사용자 관점의 가치로 옮긴 카드. */
function capabilityGrid() {
  const site = publicSiteContent();
  return html`<div class="capability-grid">
    ${site.capabilities
      .map(
        (capability, index) =>
          html`<article class="capability-card">
            <span class="capability-index">0${index + 1}</span>
            <h3>${escapeHtml(capability.title)}</h3>
            <p>${escapeHtml(capability.body)}</p>
          </article>`,
      )
      .join("")}
  </div>`;
}

function partnerGrid() {
  const site = publicSiteContent();
  return html`<div class="partner-grid">
    ${site.partnerTypes
      .map(
        (partner) =>
          html`<article class="partner-card">
            <h3>${escapeHtml(partner.name)}</h3>
            <p>${escapeHtml(partner.body)}</p>
            <span class="partner-volume">${escapeHtml(partner.volume)}</span>
          </article>`,
      )
      .join("")}
  </div>`;
}

function ctaSection() {
  const site = publicSiteContent();
  return html`<section class="site-cta-section" id="contact" data-reveal>
    <div class="site-container">
      <div class="cta-panel">
        <div>
          <h2>${escapeHtml(site.ctaTitle)}</h2>
          <p>${escapeHtml(site.ctaBody)}</p>
          <span class="cta-hours"
            >${escapeHtml(site.contact.hours)} ·
            ${escapeHtml(site.company.phone)}</span
          >
        </div>
        <div class="cta-actions">
          <a class="btn-solid" href="signup.html">거래처 등록</a>
          <a class="btn-line" href="partners.html#farm">산지 파트너 등록</a>
        </div>
      </div>
    </div>
  </section>`;
}

/** 시뮬레이션 기반 데이터임을 밝히는 고지. 실제 실적으로 오인되지 않게 합니다. */
function simulationNotice(text) {
  return html`<p class="simulation-notice">
    <span class="sim-badge">Simulation Data</span>${text}
  </p>`;
}
