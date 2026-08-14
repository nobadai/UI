function bindSettingsPanel() {
  const emailEnabled = $("#emailEnabled");
  const emailInput = $("#notificationEmail");
  const notificationPreferences = $("#notificationPreferences");
  emailEnabled?.addEventListener("change", () => {
    emailInput.disabled = !emailEnabled.checked;
    notificationPreferences.disabled = !emailEnabled.checked;
  });

  $("#requestProfileEdit")?.addEventListener("click", openProfilePasswordModal);
  $("#cancelProfileEdit")?.addEventListener("click", () => {
    state.profileEditing = false;
    $("#settingsPanel").innerHTML = profilePanel();
    bindSettingsPanel();
  });

  $("#profileSettingsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const profile = Object.fromEntries(form.entries());
    localStorage.setItem("costCatcher.profile", JSON.stringify(profile));
    state.profileEditing = false;
    $("#settingsPanel").innerHTML = profilePanel();
    bindSettingsPanel();
    toast("회원 정보를 저장했습니다.");
  });

  $("#companySettingsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company = {
      name: form.get("companyName"),
      businessNumber: form.get("businessNumber"),
      representative: form.get("representative"),
      storeType: form.get("storeType"),
    };
    const storeIds = form.getAll("store");
    localStorage.setItem("costCatcher.company", JSON.stringify(company));
    localStorage.setItem("costCatcher.franchise", JSON.stringify({ storeIds }));
    toast(`회사 정보와 ${storeIds.length}개 매장을 저장했습니다.`);
  });
  $("#addCompanyStore")?.addEventListener("click", openAddStoreModal);

  $("#notificationSettingsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const frequencies = $$('input[name="frequency"]:checked').map(
      (input) => input.value,
    );
    const alertTypes = $$('input[name="alertType"]:checked').map(
      (input) => input.value,
    );
    if (emailEnabled.checked && !frequencies.length) {
      toast("일별·주별·월간 중 하나 이상 선택해 주세요.");
      return;
    }
    localStorage.setItem(
      "costCatcher.notifications",
      JSON.stringify({
        emailEnabled: emailEnabled.checked,
        email: emailInput.value,
        frequencies,
        alertTypes,
      }),
    );
    toast("알림 설정을 브라우저에 저장했습니다.");
  });

  const updateStoreSummary = () => {
    const selected = $$('input[name="store"]:checked').map(
      (input) => input.value,
    );
    if ($("#selectedStoreCount"))
      $("#selectedStoreCount").textContent = `${selected.length}개`;
    if ($("#selectedStoreNames"))
      $("#selectedStoreNames").textContent =
        selected.join(" · ") || "선택된 매장 없음";
  };
  $$('input[name="store"]').forEach((input) =>
    input.addEventListener("change", updateStoreSummary),
  );
  $("#selectAllStores")?.addEventListener("click", () => {
    $$('input[name="store"]').forEach((input) => (input.checked = true));
    updateStoreSummary();
  });
  $("#franchiseSettingsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const storeIds = $$('input[name="store"]:checked').map(
      (input) => input.value,
    );
    localStorage.setItem("costCatcher.franchise", JSON.stringify({ storeIds }));
    toast(`${storeIds.length}개 매장을 분석 범위로 저장했습니다.`);
  });
}

function openProfilePasswordModal() {
  openModal(
    "비밀번호 확인",
    html`<form
      id="profilePasswordForm"
      class="modal-form profile-password-form"
    >
      <p class="modal-form-intro">
        개인정보 보호를 위해 현재 비밀번호를 입력해 주세요.
      </p>
      <label class="field-label" for="profilePassword">현재 비밀번호</label
      ><input
        class="search-input"
        id="profilePassword"
        type="password"
        minlength="8"
        placeholder="비밀번호 8자 이상"
        autocomplete="current-password"
        required
      /><small class="modal-field-help"
        >프로토타입에서는 임의의 8자 이상 비밀번호로 확인됩니다.</small
      >
      <p
        class="modal-inline-error"
        id="profilePasswordError"
        aria-live="polite"
      ></p>
      <div class="modal-actions">
        <button class="button ghost" type="button" id="cancelProfilePassword">
          취소</button
        ><button class="button primary" type="submit">확인 후 수정</button>
      </div>
    </form>`,
  );
  const input = $("#profilePassword");
  $("#cancelProfilePassword").onclick = closeModal;
  $("#profilePasswordForm").onsubmit = (event) => {
    event.preventDefault();
    if (input.value.length < 8) {
      input.classList.add("invalid");
      $("#profilePasswordError").textContent =
        "비밀번호를 8자 이상 입력해 주세요.";
      input.focus();
      return;
    }
    state.profileEditing = true;
    closeModal();
    $("#settingsPanel").innerHTML = editableProfilePanel();
    bindSettingsPanel();
    toast("본인 확인이 완료되었습니다.");
  };
  window.setTimeout(() => input.focus(), 80);
}

function openAddStoreModal() {
  openModal(
    "가맹점 추가",
    html`<form id="addStoreForm" class="modal-form">
      <label class="field-label" for="newStoreName">매장명</label>
      <input
        class="search-input"
        id="newStoreName"
        placeholder="예: 판교점"
        required
      />
      <label class="field-label" for="newStoreRegion">지역</label>
      <input
        class="search-input"
        id="newStoreRegion"
        placeholder="예: 경기 성남시"
        required
      />
      <label class="field-label" for="newStoreManager">담당자</label>
      <input
        class="search-input"
        id="newStoreManager"
        placeholder="담당자 이름"
        required
      />
      <div class="modal-actions">
        <button class="button ghost" type="button" id="cancelAddStore">
          취소</button
        ><button class="button primary" type="submit">매장 등록</button>
      </div>
    </form>`,
  );

  $("#cancelAddStore").onclick = closeModal;
  $("#addStoreForm").onsubmit = (event) => {
    event.preventDefault();
    const name = $("#newStoreName").value.trim();
    const region = $("#newStoreRegion").value.trim();
    const manager = $("#newStoreManager").value.trim();
    if (MOCK.stores.some((store) => store.name === name)) {
      toast("이미 등록된 매장명입니다.");
      return;
    }
    MOCK.stores.push({
      name,
      region,
      manager,
      items: "0개",
      risks: "없음",
      state: "등록 완료",
    });
    closeModal();
    route(state.page, false);
    toast(`${name}을 가맹점 목록에 등록했습니다.`);
  };
}

// -----------------------------------------------------------------------------
// SVG chart rendering and forecast interactions
// -----------------------------------------------------------------------------
