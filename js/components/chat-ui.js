function seedChat() {
  addChat(
    "ai",
    "안녕하세요! 유통 시뮬레이션 AI입니다.\n\n오늘의 매입 제안, 부서 제약 회신, 가격 예측 근거를 물어보세요.",
  );
  const context = $("#chatContext");
  if (context)
    context.textContent = `${findItem().name} · as_of ${MOCK.meta.asOf} 데이터를 기준으로 답변합니다`;
}
function openChat() {
  $("#chatPanel").classList.add("open");
  document.body.classList.add("chat-open");
  $("#chatPanel").setAttribute("aria-hidden", "false");
  $("#chatLauncher").style.display = "none";
  setTimeout(() => $("#chatInput").focus(), 150);
}
function closeChat() {
  $("#chatPanel").classList.remove("open");
  document.body.classList.remove("chat-open");
  $("#chatPanel").setAttribute("aria-hidden", "true");
  $("#chatLauncher").style.display = "block";
}
function addChat(role, text) {
  const row = document.createElement("div");
  row.className = `chat-row ${role}`;
  const time = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  row.innerHTML =
    role === "ai"
      ? html`<div
            class="chat-mascot mascot-crop mascot-face-basic"
            role="img"
            aria-label="고양이 마스코트"
          ></div>
          <div>
            <div class="bubble">${text}</div>
            <span class="chat-time">${time}</span>
          </div>`
      : html`<div>
          <div class="bubble">${escapeHtml(text)}</div>
          <span class="chat-time">${time}</span>
        </div>`;
  $("#chatMessages").append(row);
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
}
function sendChat(e) {
  e.preventDefault();
  const input = $("#chatInput"),
    text = input.value.trim();
  if (!text) return;
  addChat("user", text);
  input.value = "";
  setTimeout(() => addChat("ai", answerChat(text)), 650);
}

/** 화면의 Mock Data에서 답을 만드는 규칙 기반 응답입니다. */
function answerChat(text) {
  const combined = MOCK.orchestration.combined;
  if (text.includes("매입") || text.includes("제안") || text.includes("승인"))
    return `오늘 매입 초안은 ${MOCK.scenarios[0].qtyTon}톤이었고, 세 부서 변경안을 결합해 ${combined.qtyTon}톤 / ${money(combined.amount)}으로 조정됐어요.\n\nCritic은 ${MOCK.orchestration.critic.result}이며 지금은 ${MOCK.orchestration.decision.label} 상태입니다.`;
  if (text.includes("창고") || text.includes("재고") || text.includes("물류"))
    return `창고는 총 ${MOCK.inventory.capacityTon}톤 중 ${MOCK.inventory.usedTon}톤을 쓰고 있어 여유는 ${(MOCK.inventory.capacityTon - MOCK.inventory.usedTon).toFixed(1)}톤입니다.\n\n재고·물류 부서는 수량과 입고 타이밍 축의 변경안만 낼 수 있어요.`;
  if (text.includes("자금") || text.includes("재무") || text.includes("한도"))
    return `가용자금은 82,400,000원이지만 D+7 고정지출을 빼면 일일 매입 한도는 11,500,000원입니다.\n\n재무는 금액 축(전량/축소/분할/보류) 변경안만 제시합니다.`;
  if (text.includes("가격") || text.includes("예측") || text.includes("시세")) {
    const item = findItem();
    return `${item.name} 경락가는 오늘 ${won(item.auction)}원/kg이고 D+18 예측은 ${won(item.d18)}원/kg입니다.\n\n모든 예측값은 ML 파이프라인 산출물이며 저는 가격 숫자를 만들지 않습니다.`;
  }
  if (
    text.includes("루프") ||
    text.includes("Critic") ||
    text.includes("critic")
  )
    return `사전 feedback 루프는 ${MOCK.orchestration.loops.preUsed}/${MOCK.orchestration.loops.preMax}회, 사후 재조정 루프는 ${MOCK.orchestration.loops.postUsed}/${MOCK.orchestration.loops.postMax}회 사용했습니다.\n\n둘 다 소진되면 매입 보류로 안전 종료합니다.`;
  return "현재 화면의 Mock Data를 기준으로 답변하고 있어요. 매입 제안, 창고 여유, 자금 한도, 가격 예측, 루프 상태를 물어보세요.";
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  $("#toastRegion").append(el);
  setTimeout(() => el.remove(), 2600);
}

function modalFormFields() {
  return html`
    <input
      class="search-input"
      id="prototypeModalInput"
      placeholder="이름 또는 정보를 입력하세요"
    />
    <div class="modal-actions">
      <button class="button ghost" id="cancelPrototypeModal" type="button">
        취소
      </button>
      <button class="button primary" id="confirmPrototypeModal" type="button">
        확인
      </button>
    </div>
  `;
}

function openModal(title, body, form = false) {
  $("#modalContent").innerHTML = html`<h2 id="modalTitle">${title}</h2>
    <div class="modal-body">${body}</div>
    ${form ? modalFormFields() : ""}`;
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");

  $("#cancelPrototypeModal")?.addEventListener("click", closeModal);
  $("#confirmPrototypeModal")?.addEventListener("click", () => {
    closeModal();
    toast("프로토타입에서는 저장되지 않습니다.");
  });
}
function closeModal() {
  $("#modalBackdrop").classList.remove("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "true");
}
