// -----------------------------------------------------------------------------
// App configuration and shared state
// -----------------------------------------------------------------------------

const MOCK = window.CostCatcherData;

const nav = [
  { label: "대시보드", page: "dashboard", icon: "dashboard" },
  { section: "원가 분석" },
  { label: "식자재 가격 분석", page: "ingredient", icon: "chart", sub: true },
  { label: "상세 분석", page: "detail", icon: "search", sub: true },
  { section: "메뉴·레시피" },
  { label: "레시피 관리", page: "recipes", icon: "recipe", sub: true },
  { label: "메뉴 원가 분석", page: "menu-cost", icon: "cost", sub: true },
  { section: "매장 관리" },
  { label: "매장 통합 현황", page: "stores", icon: "store", sub: true },
  { section: "브리핑 & 알림" },
  { label: "브리핑 기록", page: "briefings", icon: "brief", sub: true },
  { label: "알림 센터", page: "alerts", icon: "bell", sub: true },
  { section: "설정" },
  { label: "회원 정보", page: "profile", icon: "user", sub: true },
  { label: "회사 정보 · 가맹점", page: "company", icon: "users", sub: true },
  { label: "알림 설정", page: "settings", icon: "settings", sub: true },
  { label: "요금제", page: "plans", icon: "card", sub: true },
  { section: "프로토타입" },
  { label: "비회원 화면", page: "guest", icon: "preview", sub: true },
  { label: "오류 화면 미리보기", page: "errors", icon: "preview", sub: true },
];

const state = {
  page: "dashboard",
  ingredient: "cabbage",
  granularity: "daily",
  period: "4주",
  horizon: 3,
  evidenceHorizon: 0,
  evidenceGranularity: "daily",
  recipe: "kimchi",
  recipeEditing: false,
  store: "전체 매장",
  settingsTab: 3,
  profileEditing: false,
};
// -----------------------------------------------------------------------------
// Shared DOM and formatting helpers
// -----------------------------------------------------------------------------

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (n) => Number(n).toLocaleString("ko-KR") + "원";

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
    recipe: '<path d="M6 3v18M10 6h10M10 12h10M10 18h7"/>',
    cost: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.6-1.5-.9-2.6-.9-1.5 0-2.6.7-2.6 1.8 0 2.8 5.7 1.3 5.7 4.3 0 1.2-1.1 2-2.8 2-1.2 0-2.2-.4-3-1M12.5 5.5v13"/>',
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
