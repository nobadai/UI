function plansPage() {
  return html`<div class="content">
    <div class="page-intro" style="justify-content:center;text-align:center">
      <div>
        <h2>사업 규모에 맞는 원가 인텔리전스</h2>
        <p>
          모든 가격과 기능은 시안용 Mock Data이며 언제든 변경할 수 있습니다.
        </p>
      </div>
    </div>
    <div class="cards pricing-grid">
      ${MOCK.plans
        .map(
          (p) =>
            html`<article
              class="card price-plan ${p.featured ? "recommended" : ""}"
            >
              ${p.featured
                ? '<span class="recommend-label">가장 많이 선택</span>'
                : ""}
              <h3>${p.name}</h3>
              <p>${p.desc}</p>
              <div class="plan-price">
                ${p.price}<small
                  >${p.price.includes("월") ? " / VAT 별도" : ""}</small
                >
              </div>
              <ul class="feature-list">
                ${p.features.map((f) => html`<li>${f}</li>`).join("")}
              </ul>
              <button
                class="button ${p.featured ? "primary" : "ghost"}"
                data-plan="${p.name}"
              >
                ${p.price === "별도 문의" ? "도입 문의" : "플랜 선택"}
              </button>
            </article>`,
        )
        .join("")}
    </div>
  </div>`;
}
function guestPage() {
  return html`<div class="content">
    <section class="guest-hero">
      <div>
        <span class="status-badge status-success">식자재 원가 조기경보</span>
        <h2>원가 변동을<br />가격보다 먼저 포착하세요.</h2>
        <p>
          기상·작황·생산·출하·수급·정책 데이터를 AI가 함께 분석해, 사업자의 메뉴
          원가에 미칠 영향까지 연결합니다.
        </p>
        <div class="market-mini">
          <span>배추 <b class="negative">▲ 4.2%</b></span
          ><span>대파 <b class="negative">▲ 1.8%</b></span
          ><span>양파 <b>→ 안정</b></span>
        </div>
        <button class="button primary" id="freeStart">무료로 시작하기</button>
      </div>
      <div class="preview-locked">
        <div class="fake-chart chart-wrap" id="guestChart"></div>
        <div class="lock-overlay">
          <div>
            <strong>AI 예측과 상세 근거를 확인하려면<br />로그인하세요.</strong
            ><button class="button primary" id="loginPreview">
              로그인하고 확인
            </button>
          </div>
        </div>
      </div>
    </section>
    <div class="section-head" style="margin-top:28px">
      <div>
        <h2>데이터에서 대응까지, 하나의 흐름으로</h2>
        <p>대시보드 → 상세 근거 → 메뉴 원가 영향</p>
      </div>
    </div>
    <div class="cards cost-grid">
      <article class="card kpi-card">
        <span>01 · 시장 감지</span><strong>이상 신호 포착</strong
        ><small>7개 데이터 영역을 함께 분석</small>
      </article>
      <article class="card kpi-card">
        <span>02 · 근거 확인</span><strong>설명 가능한 예측</strong
        ><small>가격 변화의 이유를 정량 데이터로 확인</small>
      </article>
      <article class="card kpi-card">
        <span>03 · 사업 대응</span><strong>메뉴 원가 영향</strong
        ><small>등록 메뉴와 매장까지 영향 연결</small>
      </article>
    </div>
  </div>`;
}

function errorsPage() {
  const items = [
    [
      "400",
      "잘못된 요청",
      "입력·요청 형식 오류",
      "03_expressions/14_face_surprised.png",
    ],
    ["401", "로그인 필요", "인증 세션 만료", "01_actions/01_basic.png"],
    [
      "403",
      "접근 권한 없음",
      "사용자 권한 제한",
      "03_expressions/18_face_sad.png",
    ],
    [
      "404",
      "페이지 없음",
      "잘못된 주소·이동 경로",
      "02_actions/06_binoculars.png",
    ],
    [
      "500",
      "서비스 오류",
      "내부 처리 실패",
      "03_expressions/17_face_crying.png",
    ],
    [
      "503",
      "서비스 점검",
      "일시적 이용 제한",
      "03_expressions/19_face_sleepy.png",
    ],
    [
      "offline",
      "네트워크 오프라인",
      "연결 상태 오류",
      "02_actions/11_sleeping.png",
    ],
  ];
  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>오류 화면 미리보기</h2>
        <p>
          인증, 권한, 서버, 네트워크 상황별 사용자 안내 화면을 직접 확인할 수
          있습니다.
        </p>
      </div>
      <span class="status-badge status-success">Prototype QA</span>
    </div>
    <section class="card error-preview-guide">
      <div
        class="preview-guide-mascot mascot-laptop"
        role="img"
        aria-label="오류 화면을 점검하는 원가 캣쳐 마스코트"
      ></div>
      <div>
        <span class="eyebrow">ERROR EXPERIENCE</span>
        <h3>문제가 생겨도 다음 행동을 바로 알 수 있게</h3>
        <p>
          각 화면에는 오류 이유, 해결 방법, 메인 복귀 동선을 일관된 형태로
          제공합니다.
        </p>
      </div>
    </section>
    <div class="error-preview-grid">
      ${items
        .map(
          ([code, title, description, image]) =>
            html`<a class="card error-preview-card" href="${code}.html"
              ><img src="assets/${image}" alt="" loading="lazy" />
              <div>
                <span>${code.toUpperCase()}</span>
                <h3>${title}</h3>
                <p>${description}</p>
                <b>화면 열기 →</b>
              </div></a
            >`,
        )
        .join("")}
    </div>
  </div>`;
}

// -----------------------------------------------------------------------------
// Page-specific event binding
// -----------------------------------------------------------------------------
