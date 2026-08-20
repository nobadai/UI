// -----------------------------------------------------------------------------
// App configuration and shared state
// 프로젝트 정의서 v0.5 §6.1 관리자용 화면 구성을 그대로 따릅니다.
// -----------------------------------------------------------------------------

const MOCK = window.AgriSimData;

/**
 * 회사명은 정의서 §10.3 기준 미확정입니다.
 * 확정되면 이 상수 한 곳만 교체하면 사이드바·헤더·문서 타이틀이 함께 바뀝니다.
 */
const BRAND = {
  name: "농산 캣쳐",
  eng: "AGRI CATCHER",
  tagline: "농산물 유통 AI 에이전트 시뮬레이터",
  provisional: true,
};

const nav = [
  { label: "대시보드", page: "dashboard", icon: "dashboard" },
  { section: "금일 도매가 예측(ML)" },
  { label: "가격 예측", page: "forecast", icon: "chart", sub: true },
  { section: "매입" },
  { label: "금일 제안 상세", page: "proposal", icon: "agent", sub: true },
  { label: "제안 이력", page: "proposal-history", icon: "brief", sub: true },
  { label: "시장 시세", page: "market", icon: "search", sub: true },
  { label: "매입 내역", page: "purchase-ledger", icon: "cart", sub: true },
  {
    label: "매입 설정(상수값)",
    page: "purchase-config",
    icon: "settings",
    sub: true,
  },
  { section: "재무" },
  { label: "자산 통합", page: "finance-assets", icon: "cost", sub: true },
  { label: "지출 상세", page: "finance-expense", icon: "card", sub: true },
  { label: "보유 자산 현황", page: "finance-holdings", icon: "box", sub: true },
  { label: "가용 자산", page: "finance-available", icon: "wallet", sub: true },
  { label: "급여 관리", page: "finance-payroll", icon: "users", sub: true },
  { section: "영업 관리" },
  { label: "인력 관리", page: "sales-labor", icon: "user", sub: true },
  { label: "배송 현황", page: "sales-delivery", icon: "truck", sub: true },
  { label: "거래처 현황", page: "sales-clients", icon: "store", sub: true },
  { section: "재고 · 물류 관리" },
  { label: "재고 현황", page: "inventory-status", icon: "box", sub: true },
  { label: "출고 이력", page: "inventory-outbound", icon: "brief", sub: true },
  { section: "거래처 관리" },
  { label: "거래 내역", page: "partner-ledger", icon: "brief", sub: true },
  { label: "영수증 출력", page: "partner-receipt", icon: "card", sub: true },
  { section: "설정" },
  { label: "회원 생성", page: "member-new", icon: "user", sub: true },
  { label: "회원 관리", page: "members", icon: "users", sub: true },
  { label: "회사 관리", page: "company", icon: "store", sub: true },
  { label: "이상치 탐지 알림", page: "anomaly", icon: "bell", sub: true },
  { section: "프로토타입" },
  { label: "외부용 화면", page: "external", icon: "preview", sub: true },
  { label: "시뮬레이션 페르소나", page: "personas", icon: "users", sub: true },
  { label: "오류 화면 미리보기", page: "errors", icon: "preview", sub: true },
];

const state = {
  page: "dashboard",
  item: "cabbage",
  priceTypes: ["retail", "wholesale", "auction"],
  band: "auction",
  horizon: 18,
  range: "20일",
  scenario: "B",
  agent: "logistics",
  decision: MOCK.orchestration.decision.state,
  memberRole: "일반",
};
// -----------------------------------------------------------------------------
// Shared DOM and formatting helpers
// -----------------------------------------------------------------------------

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (n) => Number(n).toLocaleString("ko-KR") + "원";
const won = (n) => Number(n).toLocaleString("ko-KR");
const ton = (kg) => `${(Number(kg) / 1000).toLocaleString("ko-KR")}톤`;

/**
 * Marks DOM markup so Prettier can format embedded HTML inside JavaScript.
 * It intentionally performs no escaping; dynamic user values must use escapeHtml.
 */
function html(strings, ...values) {
  return strings
    .map((segment, index) =>
      index < values.length ? segment + values[index] : segment,
    )
    .join("");
}

const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

const iconSvg = (name) => {
  const paths = {
    dashboard:
      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    chart: '<path d="M4 19V5M4 19h16M7 15l4-5 3 2 5-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    agent:
      '<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 10.2a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.3L20 8H6"/>',
    cost: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.6-1.5-.9-2.6-.9-1.5 0-2.6.7-2.6 1.8 0 2.8 5.7 1.3 5.7 4.3 0 1.2-1.1 2-2.8 2-1.2 0-2.2-.4-3-1M12.5 5.5v13"/>',
    wallet:
      '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16.5 14.5h.01"/>',
    box: '<path d="M12 3 3.5 7.2v9.6L12 21l8.5-4.2V7.2Z"/><path d="M3.5 7.2 12 11.4l8.5-4.2M12 11.4V21"/>',
    truck:
      '<path d="M3 6h10v10H3zM13 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    store:
      '<path d="M3 9h18l-2-5H5L3 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
    users:
      '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 5c2 0 3 1 3 3s-1 3-3 3M17 14c3 0 4 2 4 5"/>',
    brief: '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    preview:
      '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  };
  return html`<svg viewBox="0 0 24 24" aria-hidden="true">
    ${paths[name] || paths.preview}
  </svg>`;
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
// 공통 마크업 헬퍼
// 표와 카드는 화면마다 반복되므로 공통 컴포넌트에서 한 번만 정의합니다.
// -----------------------------------------------------------------------------

/**
 * 등락 표기. 0은 상승도 하락도 아니므로 중립으로 표시합니다.
 * @returns {{mark: string, tone: string, text: string}}
 */
function changeMark(value) {
  const rounded = Number(Number(value).toFixed(1));
  if (rounded > 0) return { mark: "▲", tone: "negative", text: `${rounded}%` };
  if (rounded < 0)
    return { mark: "▼", tone: "positive", text: `${Math.abs(rounded)}%` };
  return { mark: "－", tone: "", text: "0.0%" };
}

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
  const navLabel = nav.find((item) => item.page === state.page)?.label;
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
