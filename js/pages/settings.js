// -----------------------------------------------------------------------------
// 설정 — 회원 생성 / 회원 관리(최상위만) / 회사 관리 / 이상치 탐지 알림
// 변경 사항은 localStorage에 저장되는 프로토타입 동작입니다.
// -----------------------------------------------------------------------------

const settingsMenu = [
  { label: "회원 생성", page: "member-new" },
  { label: "회원 관리", page: "members", topOnly: true },
  { label: "회사 관리", page: "company" },
  { label: "이상치 탐지 알림", page: "anomaly" },
];

function readStoredSettings(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function settingsShell(activePage, panel) {
  return html`<div class="content">
    <div class="settings-layout">
      <aside class="card settings-menu">
        ${settingsMenu
          .map(
            (item) =>
              html`<button
                class="${item.page === activePage ? "active" : ""}"
                data-page="${item.page}"
              >
                ${item.label}${item.topOnly
                  ? '<small class="menu-flag">최상위</small>'
                  : ""}
              </button>`,
          )
          .join("")}
        <button data-logout>로그아웃</button>
      </aside>
      <article class="card settings-panel" id="settingsPanel">${panel}</article>
    </div>
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

// ------------------------------------------------------------------ 회원 생성
function memberNewPage() {
  const teams = [
    "ML 가격 예측",
    "매입 의사결정",
    "재무 · 자금",
    "재고 · 물류",
    "영업 · 가격책정",
    "오케스트레이터 · Critic",
  ];
  return settingsShell(
    "member-new",
    html`<form id="memberCreateForm">
      <div class="settings-panel-header">
        <div>
          <h3>회원 생성</h3>
          <p>
            계정을 만들고 담당 파트와 권한을 지정합니다. 초대 메일이 발송됩니다.
          </p>
        </div>
        <button class="button primary" type="submit">계정 생성</button>
      </div>
      <div class="editable-form-grid">
        <label
          ><span>이름</span
          ><input
            class="search-input"
            name="name"
            placeholder="예: 홍길동"
            required
        /></label>
        <label
          ><span>이메일</span
          ><input
            class="search-input"
            name="email"
            type="email"
            placeholder="name@agri-sim.co.kr"
            required
        /></label>
        <label
          ><span>담당 파트</span
          ><select class="search-input" name="team">
            ${teams.map((team) => html`<option>${team}</option>`).join("")}
          </select></label
        >
        <label
          ><span>권한</span
          ><select class="search-input" name="role">
            <option>일반</option>
            <option>최상위 관리자</option>
          </select></label
        >
      </div>
      <section class="settings-section">
        <h4>
          초기 접근 범위 <small>생성 후 회원 관리에서 변경할 수 있습니다</small>
        </h4>
        <div class="choice-grid">
          ${choiceCard({
            name: "scope",
            value: "purchase",
            title: "매입",
            description: "제안 상세 · 이력 · 매입 내역",
            checked: true,
          })}
          ${choiceCard({
            name: "scope",
            value: "finance",
            title: "재무",
            description: "자산 · 지출 · 급여",
            checked: false,
          })}
          ${choiceCard({
            name: "scope",
            value: "ops",
            title: "영업 · 물류",
            description: "인력 · 배송 · 재고",
            checked: false,
          })}
        </div>
      </section>
      <div class="profile-security-note">
        <strong>프로토타입 안내</strong
        ><span>실제 계정은 생성되지 않으며 비밀번호도 저장하지 않습니다.</span>
      </div>
    </form>`,
  );
}

// ------------------------------------------------------------------ 회원 관리
function membersPage() {
  return settingsShell(
    "members",
    html`<div>
      <div class="settings-panel-header">
        <div>
          <h3>회원 관리</h3>
          <p>
            최상위 관리자만 접근할 수 있는 화면입니다. 권한과 상태를 변경합니다.
          </p>
        </div>
        <button class="button secondary" type="button" data-page="member-new">
          + 회원 생성
        </button>
      </div>
      ${dataTable(
        ["이름", "이메일", "담당 파트", "권한", "상태", "관리"],
        MOCK.members
          .map(
            (member, index) =>
              html`<tr>
                <td><strong>${member.name}</strong></td>
                <td>${member.email}</td>
                <td>${member.team}</td>
                <td>
                  <span
                    class="status-badge status-${member.role === "최상위 관리자"
                      ? "success"
                      : "warning"}"
                    >${member.role}</span
                  >
                </td>
                <td><span class="status-dot"></span>${member.state}</td>
                <td>
                  <button
                    class="text-link"
                    type="button"
                    data-member="${index}"
                  >
                    권한 변경 →
                  </button>
                </td>
              </tr>`,
          )
          .join(""),
      )}
      <div class="profile-security-note">
        <strong>권한 경계</strong
        ><span
          >최상위 관리자만 회원 생성·삭제와 회사 정보 수정을 할 수
          있습니다.</span
        >
      </div>
    </div>`,
  );
}

// ------------------------------------------------------------------ 회사 관리
function companyPage() {
  const saved = readStoredSettings("agriSim.company", MOCK.company);
  return settingsShell(
    "company",
    html`<form id="companySettingsForm">
      <div class="settings-panel-header">
        <div>
          <h3>회사 관리</h3>
          <p>여기서 저장한 값은 외부용 화면의 회사 소개와 함께 사용됩니다.</p>
        </div>
        <button class="button primary" type="submit">회사 정보 저장</button>
      </div>
      <div class="franchise-summary">
        <div
          class="settings-mascot mascot-laptop"
          role="img"
          aria-label="회사 정보를 정리하는 마스코트"
        ></div>
        <div>
          <span>상호명</span
          ><strong id="companyNamePreview">${escapeHtml(saved.name)}</strong>
          <small>회사명은 정의서 §10.3 기준 미확정 상태입니다.</small>
        </div>
        <span class="status-badge status-warning">가칭</span>
      </div>
      <div class="editable-form-grid">
        <label
          ><span>상호명</span
          ><input
            class="search-input"
            name="name"
            value="${escapeHtml(saved.name)}"
            required
        /></label>
        <label
          ><span>사업자등록번호</span
          ><input
            class="search-input"
            name="businessNumber"
            value="${escapeHtml(saved.businessNumber)}"
            required
        /></label>
        <label
          ><span>대표자</span
          ><input
            class="search-input"
            name="representative"
            value="${escapeHtml(saved.representative)}"
            required
        /></label>
        <label
          ><span>대표번호</span
          ><input
            class="search-input"
            name="phone"
            value="${escapeHtml(saved.phone)}"
            required
        /></label>
        <label class="form-wide"
          ><span>위치</span
          ><input
            class="search-input"
            name="address"
            value="${escapeHtml(saved.address)}"
            required
        /></label>
        <label class="form-wide"
          ><span>이메일 · 외부 테이블 연동</span
          ><input
            class="search-input"
            name="email"
            type="email"
            value="${escapeHtml(saved.email)}"
            required
        /></label>
        <label class="form-wide"
          ><span>외부 페이지 소개글</span
          ><textarea class="search-input" name="intro" rows="3">
${escapeHtml(saved.intro)}</textarea
          >
        </label>
      </div>
      <section class="settings-section">
        <div class="settings-section-title">
          <h4>외부 페이지 이미지</h4>
          <button class="text-link" type="button" id="uploadIntroImage">
            이미지 등록
          </button>
        </div>
        <div class="intro-image-slot" aria-label="외부 페이지 대표 이미지 자리">
          이미지 자리 · 외부 페이지 관리 테이블과 연동
        </div>
      </section>
    </form>`,
  );
}

// ---------------------------------------------------------- 이상치 탐지 알림
function anomalyPage() {
  const saved = readStoredSettings("agriSim.anomaly", {
    emailEnabled: true,
    email: "orchestrator@agri-sim.co.kr",
    rules: MOCK.anomalyRules.filter((rule) => rule.on).map((rule) => rule.key),
  });
  return settingsShell(
    "anomaly",
    html`<form id="anomalySettingsForm">
      <div class="settings-panel-header">
        <div>
          <h3>이상치 탐지 알림</h3>
          <p>
            임계치를 넘은 이벤트만 전달합니다. 규칙은 코드 레벨에서 평가됩니다.
          </p>
        </div>
        <button class="button primary" type="submit">설정 저장</button>
      </div>
      <section class="settings-section">
        <h4>전달 채널</h4>
        <label class="channel-setting">
          <span
            ><strong>이메일 알림</strong
            ><small
              >Critic FAIL과 매입 보류는 항상 즉시 발송됩니다.</small
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
          value="${escapeHtml(saved.email)}"
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
          <h4>탐지 규칙 <small>임계치를 넘으면 알림을 생성합니다</small></h4>
          <div class="choice-grid">
            ${MOCK.anomalyRules
              .map((rule) =>
                choiceCard({
                  name: "rule",
                  value: rule.key,
                  title: rule.label,
                  description: `${rule.threshold} · ${rule.channel}`,
                  checked: saved.rules.includes(rule.key),
                }),
              )
              .join("")}
          </div>
        </section>
      </fieldset>
    </form>`,
  );
}
