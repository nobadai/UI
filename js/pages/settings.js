const settingsMenu = [
  "회원 정보",
  "회사 정보 · 가맹점",
  "알림 설정",
  "요금제",
  "로그아웃",
];

const defaultNotificationSettings = {
  emailEnabled: true,
  email: "admin@catcherfood.co.kr",
  frequencies: ["daily", "weekly"],
  alertTypes: ["risk", "cost", "supply"],
};

function readStoredSettings(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function settingsPage(selected) {
  const routeTabs = { profile: 0, company: 1, settings: 2 };
  if (routeTabs[selected] !== undefined)
    state.settingsTab = routeTabs[selected];
  if (selected === "profile") state.profileEditing = false;
  const titles = ["회원 정보", "회사 정보 · 가맹점", "알림 설정", "요금제"];
  const descriptions = [
    "등록된 회원 정보를 확인하고 안전하게 수정합니다.",
    "회사 기본 정보와 분석 대상 가맹점을 관리합니다.",
    "이메일 수신 여부와 정기 알림 주기를 관리합니다.",
    "현재 이용 플랜과 제공 기능을 확인합니다.",
  ];

  return html`<div class="content">
    <div class="page-intro">
      <div>
        <h2>설정</h2>
        <p>
          ${descriptions[state.settingsTab] || "서비스 설정을 관리합니다."} 변경
          사항은 이 브라우저에 저장됩니다.
        </p>
      </div>
    </div>
    <div class="settings-layout">
      <aside class="card settings-menu">
        ${settingsMenu
          .map(
            (label, index) =>
              html`<button
                class="${index === state.settingsTab ? "active" : ""}"
                data-setting="${index}"
              >
                ${label}
              </button>`,
          )
          .join("")}
      </aside>
      <article class="card settings-panel" id="settingsPanel">
        ${renderSettingsPanel(state.settingsTab)}
      </article>
    </div>
  </div>`;
}
const defaultProfile = {
  name: "원가캣쳐",
  email: "admin@catcherfood.co.kr",
  phone: "010-1234-5678",
  role: "관리자",
};
function profilePanel() {
  const saved = readStoredSettings("costCatcher.profile", defaultProfile);
  return html`<div class="profile-view">
    <div class="settings-panel-header">
      <div>
        <h3>회원 정보</h3>
        <p>계정에 등록된 담당자 정보를 확인합니다.</p>
      </div>
      <button class="button primary" type="button" id="requestProfileEdit">
        회원 정보 수정
      </button>
    </div>
    <div class="profile-avatar-row">
      <div class="profile-avatar-large">${saved.name.charAt(0)}</div>
      <div>
        <strong>${saved.name}</strong
        ><small>${saved.role} 계정 · 이메일 인증 완료</small>
      </div>
    </div>
    <dl class="profile-info-list">
      <div>
        <dt>이름</dt>
        <dd>${saved.name}</dd>
      </div>
      <div>
        <dt>권한</dt>
        <dd><span class="status-badge status-success">${saved.role}</span></dd>
      </div>
      <div>
        <dt>이메일</dt>
        <dd>${saved.email}<small>인증 완료</small></dd>
      </div>
      <div>
        <dt>연락처</dt>
        <dd>${saved.phone}</dd>
      </div>
      <div>
        <dt>소속 회사</dt>
        <dd>(주)캣쳐푸드</dd>
      </div>
    </dl>
    <div class="profile-security-note">
      <strong>개인정보 보호</strong
      ><span>회원정보를 수정하려면 현재 비밀번호를 다시 확인해야 합니다.</span>
    </div>
  </div>`;
}
function editableProfilePanel() {
  const saved = readStoredSettings("costCatcher.profile", defaultProfile);
  return html`<form id="profileSettingsForm">
    <div class="settings-panel-header">
      <div>
        <h3>회원 정보 수정</h3>
        <p>비밀번호 확인이 완료되었습니다. 변경할 정보를 입력하세요.</p>
      </div>
      <div class="settings-header-actions">
        <button class="button ghost" type="button" id="cancelProfileEdit">
          취소</button
        ><button class="button primary" type="submit">변경 사항 저장</button>
      </div>
    </div>
    <div class="profile-avatar-row">
      <div class="profile-avatar-large">${saved.name.charAt(0)}</div>
      <div>
        <strong>${saved.name}</strong><small>본인 확인 완료 · 수정 가능</small>
      </div>
    </div>
    <div class="editable-form-grid">
      <label
        ><span>이름</span
        ><input
          class="search-input"
          name="name"
          value="${saved.name}"
          required /></label
      ><label
        ><span>권한 · 관리자만 변경 가능</span
        ><input
          class="search-input readonly-field"
          name="role"
          value="${saved.role}"
          readonly /></label
      ><label
        ><span>이메일</span
        ><input
          class="search-input"
          name="email"
          type="email"
          value="${saved.email}"
          required /></label
      ><label
        ><span>연락처</span
        ><input
          class="search-input"
          name="phone"
          value="${saved.phone}"
          required
      /></label>
    </div>
  </form>`;
}
function companyPanel() {
  const company = readStoredSettings("costCatcher.company", {
      name: "(주)캣쳐푸드",
      businessNumber: "123-45-67890",
      representative: "김캣쳐",
      storeType: "프랜차이즈 본사",
    }),
    scope = readStoredSettings("costCatcher.franchise", {
      storeIds: MOCK.stores.map((store) => store.name),
    });
  return html`<form id="companySettingsForm">
    <div class="settings-panel-header">
      <div>
        <h3>회사 정보 · 가맹점</h3>
        <p>조직 기본 정보와 분석에 포함할 운영 매장을 함께 관리합니다.</p>
      </div>
      <button class="button primary" type="submit">회사 정보 저장</button>
    </div>
    <div class="editable-form-grid">
      <label
        ><span>회사명</span
        ><input
          class="search-input"
          name="companyName"
          value="${company.name}"
          required /></label
      ><label
        ><span>사업자등록번호</span
        ><input
          class="search-input"
          name="businessNumber"
          value="${company.businessNumber}"
          required /></label
      ><label
        ><span>대표자</span
        ><input
          class="search-input"
          name="representative"
          value="${company.representative}"
          required /></label
      ><label
        ><span>사업 유형</span
        ><select class="search-input" name="storeType">
          <option ${company.storeType === "프랜차이즈 본사" ? "selected" : ""}>
            프랜차이즈 본사
          </option>
          <option ${company.storeType === "외식업 사업자" ? "selected" : ""}>
            외식업 사업자
          </option>
          <option
            ${company.storeType === "급식·식자재 사업자" ? "selected" : ""}
          >
            급식·식자재 사업자
          </option>
        </select></label
      >
    </div>
    <div class="franchise-summary">
      <div
        class="settings-mascot mascot-laptop"
        role="img"
        aria-label="매장을 확인하는 원가 캣쳐 마스코트"
      ></div>
      <div>
        <span>분석 대상 매장</span
        ><strong id="selectedStoreCount">${scope.storeIds.length}개</strong
        ><small id="selectedStoreNames"
          >${scope.storeIds.join(" · ") || "선택된 매장 없음"}</small
        >
      </div>
      <button class="button ghost" type="button" id="addCompanyStore">
        + 매장 추가
      </button>
    </div>
    <section class="settings-section">
      <div class="settings-section-title">
        <h4>운영 매장</h4>
        <button class="text-link" id="selectAllStores" type="button">
          전체 선택
        </button>
      </div>
      <div class="store-choice-list">
        ${MOCK.stores
          .map((store) =>
            choiceCard({
              name: "store",
              value: store.name,
              title: store.name,
              description: `${store.region} · 담당자 ${store.manager}`,
              checked: scope.storeIds.includes(store.name),
            }),
          )
          .join("")}
      </div>
    </section>
  </form>`;
}
function renderSettingsPanel(index) {
  if (index === 0)
    return state.profileEditing ? editableProfilePanel() : profilePanel();
  if (index === 1) return companyPanel();
  if (index === 2) return notificationPanel();
  return html`<div class="empty-state">
    <strong>현재 플랜과 기능 범위를 확인하세요.</strong>
    <p><button class="button primary" data-page="plans">요금제 보기</button></p>
  </div>`;
}

function choiceCard({ name, value, title, description, checked }) {
  return html`<label class="choice-card">
    <input
      type="checkbox"
      name="${name}"
      value="${value}"
      ${checked ? "checked" : ""}
    />
    <span class="choice-check" aria-hidden="true">✓</span>
    <span><strong>${title}</strong><small>${description}</small></span>
  </label>`;
}

function notificationPanel() {
  const saved = readStoredSettings(
    "costCatcher.notifications",
    defaultNotificationSettings,
  );
  const frequencies = [
    ["daily", "일별", "매일 오전 9시 요약"],
    ["weekly", "주별", "매주 월요일 브리핑"],
    ["monthly", "월간", "매월 1일 원가 리포트"],
  ];
  const alertTypes = [
    ["risk", "위험 품목", "주의 → 위험 변경 즉시"],
    ["cost", "메뉴 원가 영향", "예상 상승률 5% 초과"],
    ["supply", "정책·수급 뉴스", "공급 및 정책 변화 감지"],
  ];

  return html`<form id="notificationSettingsForm">
    <div class="settings-panel-header">
      <div>
        <h3>알림 설정</h3>
        <p>이메일 수신 여부와 리포트 주기를 복수 선택할 수 있습니다.</p>
      </div>
      <button class="button primary" type="submit">설정 저장</button>
    </div>
    <section class="settings-section">
      <h4>전달 채널</h4>
      <label class="channel-setting">
        <span
          ><strong>이메일 알림</strong
          ><small
            >위험 신호와 선택한 정기 리포트를 이메일로 받습니다.</small
          ></span
        >
        <input
          type="checkbox"
          id="emailEnabled"
          ${saved.emailEnabled ? "checked" : ""}
        />
        <span class="channel-switch" aria-hidden="true"></span>
      </label>
      <label class="field-label" for="notificationEmail">수신 이메일</label>
      <input
        class="search-input"
        id="notificationEmail"
        type="email"
        value="${saved.email}"
        ${saved.emailEnabled ? "" : "disabled"}
        required
      />
    </section>
    <fieldset
      class="notification-dependent"
      id="notificationPreferences"
      ${saved.emailEnabled ? "" : "disabled"}
    >
      <section class="settings-section">
        <h4>
          정기 알림 주기 <small>이메일 알림 사용 시 복수 선택 가능</small>
        </h4>
        <div class="choice-grid">
          ${frequencies
            .map(([value, title, description]) =>
              choiceCard({
                name: "frequency",
                value,
                title,
                description,
                checked: saved.frequencies.includes(value),
              }),
            )
            .join("")}
        </div>
      </section>
      <section class="settings-section">
        <h4>받을 알림 <small>이메일 알림 사용 시 설정 가능</small></h4>
        <div class="choice-grid">
          ${alertTypes
            .map(([value, title, description]) =>
              choiceCard({
                name: "alertType",
                value,
                title,
                description,
                checked: saved.alertTypes.includes(value),
              }),
            )
            .join("")}
        </div>
      </section>
    </fieldset>
  </form>`;
}

function franchiseSettingsPanel() {
  const fallback = { storeIds: MOCK.stores.map((store) => store.name) };
  const saved = readStoredSettings("costCatcher.franchise", fallback);

  return html`<form id="franchiseSettingsForm">
    <div class="settings-panel-header">
      <div>
        <h3>가맹점 설정</h3>
        <p>분석과 알림에 포함할 매장을 선택하세요.</p>
      </div>
      <button class="button primary" type="submit">가맹점 저장</button>
    </div>
    <div class="franchise-summary">
      <div
        class="settings-mascot mascot-laptop"
        role="img"
        aria-label="매장 정보를 확인하는 원가 캣쳐 마스코트"
      ></div>
      <div>
        <span>선택한 매장</span
        ><strong id="selectedStoreCount">${saved.storeIds.length}개</strong
        ><small id="selectedStoreNames"
          >${saved.storeIds.join(" · ") || "선택된 매장 없음"}</small
        >
      </div>
    </div>
    <section class="settings-section">
      <div class="settings-section-title">
        <h4>운영 매장 목록</h4>
        <button class="text-link" id="selectAllStores" type="button">
          전체 선택
        </button>
      </div>
      <div class="store-choice-list">
        ${MOCK.stores
          .map((store) =>
            choiceCard({
              name: "store",
              value: store.name,
              title: store.name,
              description: `${store.region} · 담당자 ${store.manager}`,
              checked: saved.storeIds.includes(store.name),
            }),
          )
          .join("")}
      </div>
    </section>
  </form>`;
}
