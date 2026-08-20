// -----------------------------------------------------------------------------
// 프로토타입 — 시뮬레이션 페르소나 / 오류 화면 미리보기
// 외부 기업 홈페이지는 독립 문서(index.html 등)로 분리했습니다.
// -----------------------------------------------------------------------------

function personasPage() {
  const defined = MOCK.personas.filter((p) => p.state === "정의 완료").length;
  return html`<div class="content">
    ${pageIntro(
      "시뮬레이션 페르소나",
      "재무의 고정지출과 수요를 산정하려면 페르소나 정의가 선행되어야 합니다 (정의서 §7).",
      html`<span class="status-badge status-warning">
        미정의 ${MOCK.personas.length - defined}개
      </span>`,
    )}
    ${kpiCards([
      {
        label: "전체 페르소나",
        value: `${MOCK.personas.length}개`,
        sub: "정의서 §7 기준",
      },
      {
        label: "정의 완료",
        value: `${defined}개`,
        sub: "고정지출·수요 산정 가능",
        tone: "success",
      },
      {
        label: "정의 필요",
        value: `${MOCK.personas.length - defined}개`,
        sub: "대형마트 · 대형식당 등",
        tone: "danger",
      },
      { label: "고정지출 반영", value: "3개", sub: "창고 · 운송 · 급여" },
    ])}
    ${sectionCard({
      title: "페르소나 정의 상태",
      desc: "정의가 끝나지 않은 페르소나는 재무 지출 상세의 고정지출 산정에 반영되지 않습니다.",
      body: dataTable(
        ["페르소나", "역할", "상태", "비고"],
        MOCK.personas
          .map(
            (persona) =>
              html`<tr>
                <td><strong>${persona.name}</strong></td>
                <td>${persona.role}</td>
                <td>
                  <span
                    class="status-badge status-${
                      persona.state === "정의 완료"
                        ? "success"
                        : persona.state === "정의 필요"
                          ? "danger"
                          : "warning"
                    }"
                    >${persona.state}</span
                  >
                </td>
                <td>${persona.note}</td>
              </tr>`,
          )
          .join(""),
      ),
    })}
  </div>`;
}

function errorsPage() {
  const items = [
    [
      "400",
      "잘못된 요청",
      "입력·요청 형식 오류",
      "03_expressions/14_face_surprised.png",
    ],
    ["401", "로그인 필요", "인증 세션 만료", "01_actions/01_basic.png"],
    [
      "403",
      "접근 권한 없음",
      "최상위 관리자 전용 화면",
      "03_expressions/18_face_sad.png",
    ],
    [
      "404",
      "페이지 없음",
      "잘못된 주소·이동 경로",
      "02_actions/06_binoculars.png",
    ],
    [
      "500",
      "서비스 오류",
      "내부 처리 실패",
      "03_expressions/17_face_crying.png",
    ],
    [
      "503",
      "서비스 점검",
      "일시적 이용 제한",
      "03_expressions/19_face_sleepy.png",
    ],
    [
      "offline",
      "네트워크 오프라인",
      "연결 상태 오류",
      "02_actions/11_sleeping.png",
    ],
  ];
  return html`<div class="content">
    ${pageIntro(
      "오류 화면 미리보기",
      "인증, 권한, 서버, 네트워크 상황별 사용자 안내 화면을 직접 확인할 수 있습니다.",
      html`<span class="status-badge status-success">Prototype QA</span>`,
    )}
    <section class="card error-preview-guide">
      <div
        class="preview-guide-mascot mascot-laptop"
        role="img"
        aria-label="오류 화면을 점검하는 마스코트"
      ></div>
      <div>
        <span class="eyebrow">ERROR EXPERIENCE</span>
        <h3>문제가 생겨도 다음 행동을 바로 알 수 있게</h3>
        <p>
          각 화면에는 오류 이유, 해결 방법, 메인 복귀 동선을 일관된 형태로
          제공합니다.
        </p>
      </div>
    </section>
    <div class="error-preview-grid">
      ${items
        .map(
          ([code, title, description, image]) =>
            html`<a class="card error-preview-card" href="${code}.html"
              ><img src="assets/${image}" alt="" loading="lazy" />
              <div>
                <span>${code.toUpperCase()}</span>
                <h3>${title}</h3>
                <p>${description}</p>
                <b>화면 열기 →</b>
              </div></a
            >`,
        )
        .join("")}
    </div>
  </div>`;
}
