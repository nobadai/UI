(function () {
  "use strict";

  const html = (strings, ...values) =>
    strings
      .map((segment, index) =>
        index < values.length ? segment + values[index] : segment,
      )
      .join("");

  const states = {
    400: {
      kicker: "잘못된 요청",
      title: "요청 내용을 확인해 주세요",
      description:
        "입력한 주소나 요청 형식이 올바르지 않아 처리할 수 없습니다.",
      help: "이전 화면으로 돌아가 입력 항목과 선택 조건을 다시 확인해 주세요.",
      primary: "이전 화면",
      action: "back",
    },
    401: {
      kicker: "로그인 필요",
      title: "로그인이 필요한 화면입니다",
      description: "세션이 만료됐거나 아직 로그인하지 않았습니다.",
      help: "계정으로 다시 로그인하면 이전에 보던 매입 제안 화면을 계속 이용할 수 있습니다.",
      primary: "로그인",
      href: "login.html",
    },
    403: {
      kicker: "접근 권한 없음",
      title: "이 화면을 볼 권한이 없습니다",
      description:
        "회원 관리와 회사 관리는 최상위 관리자만 접근할 수 있습니다.",
      help: "최상위 관리자에게 권한을 요청하거나 다른 계정으로 로그인해 주세요.",
      primary: "이전 화면",
      action: "back",
    },
    404: {
      kicker: "페이지를 찾을 수 없음",
      title: "찾으시는 화면이 사라졌어요",
      description: "주소가 변경됐거나 존재하지 않는 페이지입니다.",
      help: "대시보드에서 오늘의 상태 스냅샷과 파이프라인 진행 상황을 다시 확인해 보세요.",
      primary: "대시보드로",
      href: "index.html#/dashboard",
    },
    500: {
      kicker: "서비스 오류",
      title: "데이터를 불러오지 못했습니다",
      description: "일시적인 내부 오류로 요청을 완료하지 못했습니다.",
      help: "잠시 후 다시 시도해 주세요. 문제가 계속되면 오류 코드와 함께 관리자에게 문의해 주세요.",
      primary: "다시 시도",
      action: "retry",
    },
    503: {
      kicker: "서비스 점검 중",
      title: "조금만 기다려 주세요",
      description:
        "더 안정적인 시뮬레이션 운영을 위해 서비스를 점검하고 있습니다.",
      help: "점검이 끝나면 가격 예측과 매입 제안 기능을 정상적으로 이용할 수 있습니다.",
      primary: "새로고침",
      action: "retry",
    },
    offline: {
      kicker: "네트워크 연결 없음",
      title: "인터넷 연결을 확인해 주세요",
      description:
        "현재 네트워크에 연결할 수 없어 최신 시장 데이터를 가져오지 못했습니다.",
      help: "Wi-Fi 또는 네트워크 연결 상태를 확인한 후 다시 시도해 주세요.",
      primary: "다시 연결",
      action: "retry",
    },
  };
  const code = document.body.dataset.code || "404",
    state = states[code] || states["404"],
    root = document.getElementById("errorRoot");
  if (root) {
    const primaryAction = state.href
      ? html`<a class="error-primary" href="${state.href}">
          ${state.primary}
        </a>`
      : html`<button class="error-primary" type="button" data-${state.action}>
          ${state.primary}
        </button>`;

    root.innerHTML = html`
      <section class="error-visual">
        <div class="error-orbit"></div>
        <div
          class="error-mascot"
          role="img"
          aria-label="농산 캣쳐 마스코트"
        ></div>
      </section>
      <section class="error-copy">
        <span class="error-kicker">AGRI CATCHER · ${state.kicker}</span>
        <div class="error-code">${code === "offline" ? "OFFLINE" : code}</div>
        <h1>${state.title}</h1>
        <p>${state.description}</p>
        <div class="error-help">${state.help}</div>
        <div class="error-actions">
          ${primaryAction}
          <a class="error-secondary" href="index.html#/dashboard">
            메인으로 이동
          </a>
        </div>
      </section>
    `;
  }
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "index.html#/dashboard";
  });
  document
    .querySelector("[data-retry]")
    ?.addEventListener("click", () => location.reload());
})();
