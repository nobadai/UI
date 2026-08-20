(function () {
  "use strict";
  const form = document.getElementById("authForm");
  if (!form) return;
  const mode = document.body.dataset.auth;
  const message = document.getElementById("authMessage");
  const setMessage = (text, success = false) => {
    message.textContent = text;
    message.classList.toggle("success", success);
  };
  const markInvalid = (el) => {
    if (el) el.classList.add("invalid");
  };
  document.querySelectorAll("input,select").forEach((input) =>
    input.addEventListener("input", () => {
      input.classList.remove("invalid");
      setMessage("");
    }),
  );
  document.querySelectorAll(".password-toggle").forEach((button) =>
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute(
        "aria-label",
        show ? "비밀번호 숨기기" : "비밀번호 표시",
      );
    }),
  );
  document.querySelectorAll("[data-social]").forEach((button) =>
    button.addEventListener("click", () => {
      setMessage(
        `${button.dataset.social} 로그인은 시안에서 대시보드로 연결됩니다.`,
        true,
      );
      setTimeout(() => (location.href = "index.html#/dashboard"), 450);
    }),
  );
  document
    .getElementById("forgotPassword")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      setMessage(
        "비밀번호 재설정 메일 발송 UI는 다음 단계에서 연결됩니다.",
        true,
      );
    });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form
      .querySelectorAll(".invalid")
      .forEach((el) => el.classList.remove("invalid"));
    const required = [...form.querySelectorAll("[required]")];
    const empty = required.find((el) =>
      el.type === "checkbox" ? !el.checked : !el.value.trim(),
    );
    if (empty) {
      markInvalid(empty);
      setMessage("필수 정보를 모두 입력해 주세요.");
      empty.focus();
      return;
    }
    const email = document.getElementById("email");
    if (!/^\S+@\S+\.\S+$/.test(email.value)) {
      markInvalid(email);
      setMessage("올바른 이메일 주소를 입력해 주세요.");
      email.focus();
      return;
    }
    const password = document.getElementById("password");
    if (password.value.length < 8) {
      markInvalid(password);
      setMessage("비밀번호는 8자 이상 입력해 주세요.");
      password.focus();
      return;
    }
    if (mode === "signup") {
      const confirm = document.getElementById("passwordConfirm");
      if (password.value !== confirm.value) {
        markInvalid(confirm);
        setMessage("비밀번호가 일치하지 않습니다.");
        confirm.focus();
        return;
      }
      localStorage.setItem(
        "agriSimUser",
        JSON.stringify({
          name: document.getElementById("name").value,
          company: document.getElementById("company").value,
          email: email.value,
        }),
      );
      setMessage("회원가입이 완료되었습니다. 대시보드로 이동합니다.", true);
    } else setMessage("로그인되었습니다. 대시보드로 이동합니다.", true);
    setTimeout(() => (location.href = "index.html#/dashboard"), 650);
  });
})();
