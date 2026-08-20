// -----------------------------------------------------------------------------
// 외부(PUBLIC)와 내부(ADMIN) 화면이 함께 쓰는 최소 공통 모듈
//
// 두 화면은 레이아웃과 목적이 다르지만 같은 회사의 서비스이므로
// 브랜드, 숫자 표기, 마크업 헬퍼는 한 곳에서만 정의합니다.
// 화면 전용 컴포넌트는 여기에 두지 않습니다 (정의서 §22 경계).
// -----------------------------------------------------------------------------

const MOCK = window.AgriSimData;

/**
 * 회사명(정의서 §10.3 미결 항목)은 `햇들 농산`으로 확정했습니다.
 * 외부 헤더·내부 사이드바·문서 타이틀이 모두 이 상수 하나를 참조합니다.
 */
const BRAND = {
  name: "햇들 농산",
  eng: "HAETDEUL AGRI",
  tagline: "데이터 기반 농산물 유통",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (n) => Number(n).toLocaleString("ko-KR") + "원";
const won = (n) => Number(n).toLocaleString("ko-KR");
const ton = (kg) => `${(Number(kg) / 1000).toLocaleString("ko-KR")}톤`;
const eok = (n) => `${(Number(n) / 100000000).toFixed(1)}억원`;

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
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 16c0 2.2.6 3.4.6 3.4S9 10 19 8c0 0-7 3.4-9.6 11.2"/>',
    preview:
      '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  };
  return html`<svg viewBox="0 0 24 24" aria-hidden="true">
    ${paths[name] || paths.preview}
  </svg>`;
};

/** 브랜드 마크 SVG. 외부 헤더·푸터와 내부 사이드바가 같은 마크를 씁니다. */
const brandMark = (className = "brand-mark") =>
  html`<svg class="${className}" viewBox="0 0 44 48" aria-hidden="true">
    <path d="M22 2 40 9v25L22 46 4 34V9Z" fill="currentColor" />
    <path d="m13 18 4-5 5 3 5-3 4 5v9c0 6-4 10-9 10s-9-4-9-10Z" fill="#fff" />
    <circle cx="18.5" cy="24" r="1.5" fill="currentColor" />
    <circle cx="25.5" cy="24" r="1.5" fill="currentColor" />
    <path
      d="M19 29q3 3 6 0"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>`;

/**
 * 외부 페이지에 노출되는 회사 콘텐츠.
 * 관리자 `설정 > 외부 페이지 관리`에서 저장한 값이 있으면 그것을 우선합니다.
 */
function publicSiteContent() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("agriSim.publicSite"));
  } catch (error) {
    saved = null;
  }
  let company = null;
  try {
    company = JSON.parse(localStorage.getItem("agriSim.company"));
  } catch (error) {
    company = null;
  }
  return {
    ...MOCK.publicSite,
    ...(saved || {}),
    company: { ...MOCK.company, ...(company || {}) },
  };
}
