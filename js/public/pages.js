// -----------------------------------------------------------------------------
// PUBLIC 기업 홈페이지 화면
// HOME / COMPANY / BUSINESS / MARKET / PARTNERS / DISCLOSURE
// -----------------------------------------------------------------------------

function publicHero() {
  const site = publicSiteContent();
  const [line1, line2] = site.heroTitle.split("\n");
  return html`<section class="site-hero">
    <div class="site-container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">${escapeHtml(site.heroEyebrow)}</span>
        <h1>
          ${escapeHtml(line1)}${line2 ? html`<br />${escapeHtml(line2)}` : ""}
        </h1>
        <p>${escapeHtml(site.heroBody)}</p>
        <div class="hero-actions">
          <a class="btn-solid" href="signup.html"
            >${escapeHtml(site.heroPrimary)}</a
          >
          <a class="btn-line" href="business.html"
            >${escapeHtml(site.heroSecondary)}</a
          >
        </div>
        <dl class="hero-scale">
          ${site.scale
            .slice(0, 3)
            .map(
              (item) =>
                html`<div>
                  <dt>${escapeHtml(item.label)}</dt>
                  <dd>${escapeHtml(item.value)}</dd>
                </div>`,
            )
            .join("")}
        </dl>
      </div>
      <div
        class="hero-visual"
        role="img"
        aria-label="${escapeHtml(site.heroImageCaption)}"
      >
        <div class="hero-visual-frame">
          <span class="hero-visual-label">대표 이미지 자리</span>
          <span class="hero-visual-caption"
            >${escapeHtml(site.heroImageCaption)}</span
          >
        </div>
        <div class="hero-visual-chip">
          <strong>${MOCK.meta.asOfLabel}</strong>
          <span>기준 시세 갱신</span>
        </div>
      </div>
    </div>
  </section>`;
}

function publicHomePage() {
  const site = publicSiteContent();
  return html`${publicHero()}
  ${section({
    id: "market",
    eyebrow: "TODAY'S MARKET",
    title: "오늘의 시세",
    lead: `${MOCK.meta.asOfLabel} 기준 · 도매시장 낙찰 단가입니다.`,
    action: html`<a class="section-link" href="market.html"
      >시장정보 자세히 보기 →</a
    >`,
    body: html`${marketBoard(MOCK.items.slice(0, 4))}
    ${simulationNotice(
      "공개 시세는 시뮬레이션 데이터이며 실제 거래 단가와 다를 수 있습니다.",
    )}`,
  })}
  ${section({
    id: "business",
    eyebrow: "OUR BUSINESS",
    title: "산지에서 식탁까지, 매일 반복되는 다섯 단계",
    lead: site.aboutBody,
    tone: "tone-soft",
    action: html`<a class="section-link" href="business.html"
      >유통사업 자세히 보기 →</a
    >`,
    body: processFlow(),
  })}
  ${section({
    eyebrow: "DATA DRIVEN DISTRIBUTION",
    title: "감이 아니라 데이터로 결정합니다",
    lead: "매입 수량과 시점을 정할 때 네 가지를 함께 봅니다.",
    body: capabilityGrid(),
  })}
  ${section({
    id: "products",
    eyebrow: "PRODUCTS",
    title: "취급 품목",
    lead: "계약 산지에서 직접 매입해 규격에 맞춰 공급합니다.",
    tone: "tone-soft",
    body: productGrid(),
  })}
  ${section({
    id: "partners",
    eyebrow: "PARTNERS",
    title: "이런 곳과 거래합니다",
    lead: "거래처 유형에 따라 발주 주기와 정산 조건을 다르게 운영합니다.",
    action: html`<a class="section-link" href="partners.html"
      >파트너 자세히 보기 →</a
    >`,
    body: partnerGrid(),
  })}
  ${section({
    id: "disclosure",
    eyebrow: "PUBLIC DATA",
    title: "공개 경영정보",
    lead: "분기 실적과 주요 경영지표를 공개합니다.",
    tone: "tone-soft",
    action: html`<a class="section-link" href="disclosure.html"
      >경영정보 자세히 보기 →</a
    >`,
    body: html`<div class="indicator-grid">
        ${MOCK.external.indicators
          .map(
            (indicator) =>
              html`<article class="indicator-card">
                <span>${indicator.label}</span>
                <strong>${indicator.value}</strong>
                <small>${indicator.sub}</small>
              </article>`,
          )
          .join("")}
      </div>
      ${simulationNotice(escapeHtml(site.disclosureNote))}`,
  })}
  ${ctaSection()}`;
}

function publicCompanyPage() {
  const site = publicSiteContent();
  return html`${pageHeader(
    "COMPANY",
    "회사소개",
    "산지와 거래처를 잇는 농산물 유통회사입니다.",
  )}
  ${section({
    title: escapeHtml(site.aboutTitle),
    lead: escapeHtml(site.aboutBody),
    body: html`<div class="fact-grid">
      ${site.scale
        .map(
          (item) =>
            html`<article class="fact-card">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <small>${escapeHtml(item.sub)}</small>
            </article>`,
        )
        .join("")}
    </div>`,
  })}
  ${section({
    eyebrow: "INFRASTRUCTURE",
    title: "보관과 운송, 품질 관리",
    tone: "tone-soft",
    body: html`<div class="capability-grid">
      ${site.infra
        .map(
          (item) =>
            html`<article class="capability-card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.body)}</p>
            </article>`,
        )
        .join("")}
    </div>`,
  })}
  ${section({
    eyebrow: "CONTACT",
    title: "회사 정보",
    body: html`<div class="info-panel">
      <dl class="info-list">
        <div>
          <dt>상호명</dt>
          <dd>${escapeHtml(site.company.name)}</dd>
        </div>
        <div>
          <dt>대표자</dt>
          <dd>${escapeHtml(site.company.representative)}</dd>
        </div>
        <div>
          <dt>사업자등록번호</dt>
          <dd>${escapeHtml(site.company.businessNumber)}</dd>
        </div>
        <div>
          <dt>설립</dt>
          <dd>${escapeHtml(site.company.founded)}년</dd>
        </div>
        <div>
          <dt>구성원</dt>
          <dd>${escapeHtml(site.company.employees)}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>${escapeHtml(site.company.address)}</dd>
        </div>
        <div>
          <dt>대표번호</dt>
          <dd>${escapeHtml(site.company.phone)}</dd>
        </div>
        <div>
          <dt>이메일</dt>
          <dd>${escapeHtml(site.company.email)}</dd>
        </div>
      </dl>
      <aside class="info-aside">
        <img
          src="assets/01_actions/05_presentation.png"
          alt=""
          loading="lazy"
        />
        <div>
          <strong>회사 소개 자료가 필요하신가요?</strong>
          <p>거래 조건과 공급 가능 품목을 정리해 보내드립니다.</p>
          <a class="btn-line" href="signup.html">자료 요청하기</a>
        </div>
      </aside>
    </div>`,
  })}
  ${ctaSection()}`;
}

function publicBusinessPage() {
  const site = publicSiteContent();
  return html`${pageHeader(
    "BUSINESS",
    "유통사업",
    "매일 반복되는 매입과 배송을 같은 기준으로 운영합니다.",
  )}
  ${section({
    eyebrow: "PROCESS",
    title: "유통 프로세스",
    lead: "산지 확보부터 정산까지 다섯 단계로 나눠 관리합니다.",
    body: processFlow(),
  })}
  ${section({
    eyebrow: "DECISION",
    title: "매입을 결정할 때 보는 것",
    lead: "가격만 보지 않고 보관 여력과 판매 가능성, 자금까지 함께 계산합니다.",
    tone: "tone-soft",
    body: capabilityGrid(),
  })}
  ${section({
    eyebrow: "SCALE",
    title: "운영 규모",
    body: html`<div class="fact-grid">
        ${site.scale
          .map(
            (item) =>
              html`<article class="fact-card">
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
                <small>${escapeHtml(item.sub)}</small>
              </article>`,
          )
          .join("")}
      </div>
      ${simulationNotice("운영 규모는 시뮬레이션 기준 수치입니다.")}`,
  })}
  ${section({
    id: "products",
    eyebrow: "PRODUCTS",
    title: "취급 품목",
    tone: "tone-soft",
    body: productGrid(),
  })}
  ${ctaSection()}`;
}

function publicMarketPage() {
  return html`${pageHeader(
    "MARKET",
    "시장정보",
    `${MOCK.meta.asOfLabel} 기준 · 도매시장 낙찰 단가와 최근 흐름입니다.`,
  )}
  ${section({
    title: "품목별 시세",
    lead: "카드에는 현재가와 전일 대비 변동, 최근 20영업일 흐름을 표시합니다.",
    body: html`${marketBoard()}
    ${simulationNotice(
      "공개 시세는 시뮬레이션 데이터이며 실제 거래 단가와 다를 수 있습니다.",
    )}`,
  })}
  ${section({
    title: "시세 요약",
    tone: "tone-soft",
    body: html`<div class="table-panel">
      <table class="public-table">
        <thead>
          <tr>
            <th>품목</th>
            <th>현재가</th>
            <th>전일 대비</th>
            <th>최근 20영업일 범위</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          ${MOCK.items
            .map((item) => {
              const actual = MOCK.series[item.id].auction.actual;
              const change = changeMark(item.change);
              return html`<tr>
                <th scope="row">${item.name}</th>
                <td>${won(item.auction)}원/kg</td>
                <td class="${change.tone}">${change.mark} ${change.text}</td>
                <td>
                  ${won(Math.min(...actual))} ~ ${won(Math.max(...actual))}원
                </td>
                <td>
                  <span class="status-pill status-${item.status}"
                    >${item.label}</span
                  >
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`,
  })}
  ${section({
    title: "거래 문의",
    body: html`<div class="notice-panel">
      <p>
        원하는 품목의 물량과 납품 주기를 알려주시면 공급 가능 여부와 단가 조건을
        회신해 드립니다. 당일 잔여 물량은 오픈 채팅방에서도 안내합니다.
      </p>
      <a class="btn-solid" href="signup.html">거래처 등록</a>
    </div>`,
  })}
  ${ctaSection()}`;
}

function publicPartnersPage() {
  const site = publicSiteContent();
  return html`${pageHeader(
    "PARTNERS",
    "파트너",
    "우리는 이런 곳과 거래합니다.",
  )}
  ${section({
    title: "거래처 유형",
    lead: "유형별로 발주 주기와 정산 조건, 규격 기준이 다릅니다.",
    body: partnerGrid(),
  })}
  ${section({
    id: "buyer",
    eyebrow: "FOR BUYERS",
    title: "거래처로 등록하시려면",
    tone: "tone-soft",
    body: html`<ol class="step-list">
        <li>
          <strong>등록 신청</strong>
          <p>상호와 담당자, 월 예상 거래량을 남겨주세요.</p>
        </li>
        <li>
          <strong>조건 협의</strong>
          <p>품목과 규격, 납품 주기와 정산 조건을 맞춥니다.</p>
        </li>
        <li>
          <strong>시범 납품</strong>
          <p>첫 회차 납품으로 품질과 배송 시간을 확인합니다.</p>
        </li>
        <li>
          <strong>정기 거래</strong>
          <p>발주와 정산을 정해진 주기로 운영합니다.</p>
        </li>
      </ol>
      <div class="notice-panel">
        <p>
          ${escapeHtml(site.contact.sales)} · ${escapeHtml(site.company.phone)}
        </p>
        <a class="btn-solid" href="signup.html">거래처 등록</a>
      </div>`,
  })}
  ${section({
    id: "farm",
    eyebrow: "FOR FARMS",
    title: "산지 파트너를 찾습니다",
    lead: "새로운 판로가 필요한 생산자와 연간 계약을 맺습니다.",
    body: html`<div class="capability-grid">
        <article class="capability-card">
          <h3>사전 물량 확약</h3>
          <p>재배 전에 매입 물량과 시점을 함께 정합니다.</p>
        </article>
        <article class="capability-card">
          <h3>정해진 정산 주기</h3>
          <p>입고 확인 후 약속된 날짜에 정산합니다.</p>
        </article>
        <article class="capability-card">
          <h3>계약 문서 발송</h3>
          <p>계약 체결 문서는 이메일로 보내드립니다.</p>
        </article>
      </div>
      <div class="notice-panel">
        <p>
          ${escapeHtml(site.contact.farm)} · ${escapeHtml(site.company.email)}
        </p>
        <a class="btn-line" href="signup.html">산지 파트너 등록</a>
      </div>`,
  })}
  ${ctaSection()}`;
}

function publicDisclosurePage() {
  const site = publicSiteContent();
  const statements = MOCK.external.statements;
  return html`${pageHeader(
    "DISCLOSURE",
    "경영정보",
    "분기 실적과 주요 경영지표를 공개합니다.",
  )}
  ${section({
    title: "주요 경영지표",
    body: html`<div class="indicator-grid">
        ${MOCK.external.indicators
          .map(
            (indicator) =>
              html`<article class="indicator-card">
                <span>${indicator.label}</span>
                <strong>${indicator.value}</strong>
                <small>${indicator.sub}</small>
              </article>`,
          )
          .join("")}
      </div>
      ${simulationNotice(escapeHtml(site.disclosureNote))}`,
  })}
  ${section({
    title: "분기 실적",
    lead: "매출, 매출원가, 영업이익과 이익률입니다.",
    tone: "tone-soft",
    body: html`<div class="revenue-bars">
        ${statements
          .slice()
          .reverse()
          .map((row) => {
            const peak = Math.max(...statements.map((item) => item.revenue));
            return html`<div class="revenue-bar">
              <span>${row.period}</span>
              <div class="revenue-track">
                <i
                  class="revenue-cost"
                  style="width:${((row.cost / peak) * 100).toFixed(1)}%"
                ></i>
                <i
                  class="revenue-profit"
                  style="width:${((row.profit / peak) * 100).toFixed(1)}%"
                ></i>
              </div>
              <b>${eok(row.revenue)}</b>
            </div>`;
          })
          .join("")}
        <div class="revenue-legend">
          <span><i class="revenue-cost"></i>매출원가</span>
          <span><i class="revenue-profit"></i>영업이익</span>
        </div>
      </div>
      <div class="table-panel">
        <table class="public-table">
          <thead>
            <tr>
              <th>기간</th>
              <th>매출</th>
              <th>매출원가</th>
              <th>영업이익</th>
              <th>이익률</th>
            </tr>
          </thead>
          <tbody>
            ${statements
              .map(
                (row) =>
                  html`<tr>
                    <th scope="row">${row.period}</th>
                    <td>${money(row.revenue)}</td>
                    <td>${money(row.cost)}</td>
                    <td class="positive">${money(row.profit)}</td>
                    <td>${((row.profit / row.revenue) * 100).toFixed(1)}%</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`,
  })}
  ${section({
    title: "공개 기준",
    body: html`<div class="notice-panel">
      <p>
        이 사이트의 모든 수치는 시뮬레이션으로 생성된 값입니다. 실제 법인의
        재무제표나 공시 자료가 아니며, 투자 판단의 근거로 사용할 수 없습니다.
      </p>
    </div>`,
  })}
  ${ctaSection()}`;
}

/** 하위 페이지 상단 타이틀 영역. 홈의 Hero보다 낮은 높이를 씁니다. */
function pageHeader(eyebrow, title, lead) {
  return html`<section class="page-header">
    <div class="site-container">
      <span class="eyebrow">${eyebrow}</span>
      <h1>${title}</h1>
      <p>${lead}</p>
    </div>
  </section>`;
}

const publicPages = {
  home: publicHomePage,
  company: publicCompanyPage,
  business: publicBusinessPage,
  market: publicMarketPage,
  partners: publicPartnersPage,
  disclosure: publicDisclosurePage,
};
