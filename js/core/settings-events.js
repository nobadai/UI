// -----------------------------------------------------------------------------
// 설정 화면 동작 — 회원 생성 / 회원 관리 / 회사 관리 / 이상치 탐지 알림
// -----------------------------------------------------------------------------

function bindSettingsNavigation() {
  $("[data-logout]")?.addEventListener("click", () => {
    location.href = "login.html";
  });
  bindSettingsPanel();
}

function bindSettingsPanel() {
  bindMemberForms();
  bindCompanyForm();
  bindAnomalyForm();
}

function bindMemberForms() {
  $("#memberCreateForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scopes = form.getAll("scope");
    openModal(
      "계정 생성 확인",
      html`<p>${escapeHtml(form.get("name"))} 님의 계정을 생성합니다.</p>
        <div class="modal-detail">
          이메일 ${escapeHtml(form.get("email"))}<br />담당 파트
          ${escapeHtml(form.get("team"))}<br />권한
          ${escapeHtml(form.get("role"))}<br />접근 범위
          ${scopes.length ? scopes.join(" · ") : "없음"}
        </div>
        <p>프로토타입에서는 실제 계정이 만들어지지 않습니다.</p>`,
    );
  });

  $$("[data-member]").forEach((button) => {
    button.onclick = () => {
      const member = MOCK.members[Number(button.dataset.member)];
      openModal(
        `${member.name} 권한 변경`,
        html`<p>${member.email} · ${member.team}</p>
          <div class="modal-detail">
            현재 권한 ${member.role}<br />최상위 관리자만 다른 계정의 권한을
            바꿀 수 있습니다.
          </div>`,
        true,
      );
    };
  });
}

function bindCompanyForm() {
  const form = $("#companySettingsForm");
  if (!form) return;

  form.querySelector('[name="name"]')?.addEventListener("input", (event) => {
    $("#companyNamePreview").textContent = event.target.value;
  });

  $("#uploadIntroImage")?.addEventListener("click", () =>
    toast("외부 페이지 대표 이미지는 실제 제품에서 파일 업로드로 연결됩니다."),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    localStorage.setItem("agriSim.company", JSON.stringify(data));
    toast("회사 정보를 저장했습니다. 외부용 화면에도 함께 반영됩니다.");
  });
}

function bindAnomalyForm() {
  const form = $("#anomalySettingsForm");
  if (!form) return;
  const emailEnabled = $("#emailEnabled");
  const emailInput = $("#notificationEmail");
  const preferences = $("#notificationPreferences");

  emailEnabled?.addEventListener("change", () => {
    emailInput.disabled = !emailEnabled.checked;
    preferences.disabled = !emailEnabled.checked;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const rules = $$('input[name="rule"]:checked').map((input) => input.value);
    if (emailEnabled.checked && !rules.length) {
      toast("탐지 규칙을 하나 이상 선택해 주세요.");
      return;
    }
    localStorage.setItem(
      "agriSim.anomaly",
      JSON.stringify({
        emailEnabled: emailEnabled.checked,
        email: emailInput.value,
        rules,
      }),
    );
    toast(`이상치 탐지 규칙 ${rules.length}개를 저장했습니다.`);
  });
}
