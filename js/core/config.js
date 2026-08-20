// -----------------------------------------------------------------------------
// ADMIN 화면 설정과 상태
// 정의서 §6.1 관리자용 화면을 담되, 메뉴가 길어지지 않도록 그룹으로 접습니다.
// 공통 헬퍼(BRAND, html, money 등)는 js/core/shared.js에 있습니다.
// -----------------------------------------------------------------------------

/**
 * 사이드바 그룹. 각 그룹은 접었다 펼 수 있고, 현재 화면이 속한 그룹은 항상 펼칩니다.
 * 기능은 하나도 줄이지 않고 묶음만 다시 나눴습니다.
 */
const navGroups = [
  {
    id: "home",
    items: [{ label: "대시보드", page: "dashboard", icon: "dashboard" }],
  },
  {
    id: "decision",
    label: "AI 의사결정",
    icon: "agent",
    items: [
      { label: "가격 예측", page: "forecast", icon: "chart" },
      { label: "금일 제안 상세", page: "proposal", icon: "agent" },
      { label: "제안 이력", page: "proposal-history", icon: "brief" },
      { label: "시장 시세", page: "market", icon: "search" },
      { label: "매입 내역", page: "purchase-ledger", icon: "cart" },
      { label: "매입 설정(상수값)", page: "purchase-config", icon: "settings" },
    ],
  },
  {
    id: "operations",
    label: "운영",
    icon: "box",
    items: [
      { label: "재고 현황", page: "inventory-status", icon: "box" },
      { label: "출고 이력", page: "inventory-outbound", icon: "brief" },
      { label: "인력 관리", page: "sales-labor", icon: "user" },
      { label: "배송 현황", page: "sales-delivery", icon: "truck" },
    ],
  },
  {
    id: "finance",
    label: "재무",
    icon: "cost",
    items: [
      { label: "자산 통합", page: "finance-assets", icon: "cost" },
      { label: "지출 상세", page: "finance-expense", icon: "card" },
      { label: "보유 자산 현황", page: "finance-holdings", icon: "box" },
      { label: "가용 자산", page: "finance-available", icon: "wallet" },
      { label: "급여 관리", page: "finance-payroll", icon: "users" },
    ],
  },
  {
    id: "partners",
    label: "거래처",
    icon: "store",
    items: [
      { label: "거래처 현황", page: "sales-clients", icon: "store" },
      { label: "거래 내역", page: "partner-ledger", icon: "brief" },
      { label: "영수증 출력", page: "partner-receipt", icon: "card" },
    ],
  },
  {
    id: "management",
    label: "관리",
    icon: "settings",
    items: [
      { label: "회원 생성", page: "member-new", icon: "user" },
      { label: "회원 관리", page: "members", icon: "users" },
      { label: "회사 관리", page: "company", icon: "store" },
      { label: "외부 페이지 관리", page: "public-site", icon: "globe" },
      { label: "이상치 탐지 알림", page: "anomaly", icon: "bell" },
      { label: "알림 로그", page: "notifications", icon: "brief" },
    ],
  },
  {
    id: "prototype",
    label: "프로토타입",
    icon: "preview",
    items: [
      { label: "시뮬레이션 페르소나", page: "personas", icon: "users" },
      { label: "오류 화면 미리보기", page: "errors", icon: "preview" },
    ],
  },
];

/** 화면 키로 메뉴 항목과 소속 그룹을 찾습니다. */
function findNavEntry(page) {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.page === page);
    if (item) return { item, group };
  }
  return { item: null, group: null };
}

const state = {
  page: "dashboard",
  item: "cabbage",
  priceTypes: ["retail", "wholesale", "auction"],
  band: "auction",
  horizon: 18,
  scenario: "B",
  notification: null,
  openGroups: ["decision"],
};

// -----------------------------------------------------------------------------
// 에이전트 역할 경계 (정의서 §3.4.2 축 제한)
// 부서별 허용 축을 코드 레벨에서 강제합니다. Critic 검사 1~3과 같은 규칙입니다.
// -----------------------------------------------------------------------------
const AXIS_POLICY = {
  logistics: ["quantity", "timing"],
  sales: ["price", "quantity"],
  finance: ["amount"],
};

const AXIS_LABEL = {
  quantity: "수량",
  timing: "입고 타이밍",
  price: "판매단가",
  amount: "금액",
};

const VERDICT_LABEL = {
  ok: "승인",
  conditional: "조건부",
  reject: "기각",
};

const VERDICT_STATUS = {
  ok: "success",
  conditional: "warning",
  reject: "danger",
};

/** agent × axis 조합이 허용 범위 안인지 코드 레벨에서 판정합니다. */
function checkAxisPolicy(agent, axis) {
  const allowed = AXIS_POLICY[agent] || [];
  return {
    pass: allowed.includes(axis),
    allowed,
  };
}

/** verdict가 ok가 아니면 변경안이 필수입니다 (정의서 §3.4.3 생성 조건). */
function checkAdjustmentRequirement(verdict) {
  const required = verdict.verdict !== "ok";
  const present = Boolean(verdict.suggested_adjustment);
  return { required, present, pass: required === present };
}

// -----------------------------------------------------------------------------
// ADMIN 공통 마크업 헬퍼
// 표와 카드는 화면마다 반복되므로 공통 컴포넌트에서 한 번만 정의합니다.
// -----------------------------------------------------------------------------

/** 공통 데이터 표. rows에는 이미 만들어진 <tr> 문자열을 넘깁니다. */
function dataTable(headers, rows) {
  return html`<div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          ${headers.map((header) => html`<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

/** 제목·설명이 붙은 공통 카드. */
function sectionCard({ title, desc, actions = "", body, className = "" }) {
  return html`<article class="card ${className}">
    <div class="section-head">
      <div>
        <h2>${title}</h2>
        ${desc ? html`<p>${desc}</p>` : ""}
      </div>
      ${actions}
    </div>
    ${body}
  </article>`;
}

/**
 * 화면 상단 제목 영역.
 * 헤더에 이미 같은 제목·설명이 있으면 중복해서 그리지 않고 동작 버튼만 남깁니다.
 */
function pageIntro(title, desc, actions = "") {
  const navLabel = findNavEntry(state.page).item?.label;
  const showTitle = title !== navLabel;
  const showDesc = desc && desc !== subtitles[state.page];
  if (!showTitle && !showDesc)
    return actions
      ? html`<div class="page-intro actions-only">${actions}</div>`
      : "";
  return html`<div class="page-intro">
    <div>
      ${showTitle ? html`<h2>${title}</h2>` : ""}
      ${showDesc ? html`<p>${desc}</p>` : ""}
    </div>
    ${actions}
  </div>`;
}

/** KPI 카드 묶음. items = [{label, value, sub, tone}] */
function kpiCards(items) {
  return html`<div class="cards kpi-grid">
    ${items
      .map(
        (item) =>
          html`<article class="card kpi-card">
            <span>${item.label}</span
            ><strong ${item.tone ? `style="color:var(--${item.tone})"` : ""}
              >${item.value}</strong
            ><small>${item.sub}</small>
          </article>`,
      )
      .join("")}
  </div>`;
}

const findItem = (id = state.item) =>
  MOCK.items.find((item) => item.id === id) || MOCK.items[0];

const findPriceType = (key) =>
  MOCK.priceTypes.find((type) => type.key === key) || MOCK.priceTypes[1];
