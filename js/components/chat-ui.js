function seedChat() {
  addChat(
    "ai",
    "안녕하세요! 원가 캣쳐 AI입니다.\n\n식자재 가격, 원가 영향, 메뉴 분석 등 무엇이든 물어보세요.",
  );
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
            aria-label="원가 캣쳐 고양이 마스코트"
          ></div>
          <div>
            <div class="bubble">${text}</div>
            <span class="chat-time">${time}</span>
          </div>`
      : html`<div>
          <div class="bubble">${text}</div>
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
  setTimeout(() => {
    const answer =
      text.includes("배추") || text.includes("이유")
        ? "현재 배추는 3주 후 가격 상승 가능성이 78%로 높게 예측되고 있어요.\n\n주요 근거는 다음과 같습니다.\n• 주산지 강수량 증가\n• 고온으로 인한 생육 지연\n• 출하량 감소\n• 재배면적 감소 추세\n\n더 자세한 근거는 ‘상세 분석’ 페이지에서 확인해보세요."
        : text.includes("메뉴") || text.includes("원가")
          ? "배추 가격 상승 시 김치찌개의 예상 원가는 1,000원에서 1,092원으로 약 9.2% 오를 수 있어요. 메뉴 원가 분석에서 다른 메뉴도 비교할 수 있습니다."
          : "현재 화면의 Mock Data를 기준으로 답변하고 있어요. 배추 가격 전망, 메뉴 원가 영향, 위험 신호의 근거를 질문해보세요.";
    addChat("ai", answer);
  }, 650);
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
