// -----------------------------------------------------------------------------
// 프로토타입 — 외부용 화면 / 시뮬레이션 페르소나 / 오류 화면 미리보기
// -----------------------------------------------------------------------------

function externalPage() {
  const external = MOCK.external;
  const company = readStoredSettings("agriSim.company", MOCK.company);
  return html`<div class="content external-page">
    ${pageIntro(
      "외부용 화면",
      "로그인·회원가입 이전에 외부 사용자에게 공개되는 화면입니다 (정의서 §6.2).",
      html`<div class="section-actions">
        <a class="button ghost" href="login.html">로그인 화면 열기</a
        ><a class="button secondary" href="signup.html">회원가입 화면 열기</a>
      </div>`,
    )}

    <section class="guest-hero card">
      <div>
        <span class="status-badge status-success">산지 직거래 · 오픈 입찰</span>
        <h2>${escapeHtml(company.name)}의<br />오늘 물량을 공개합니다.</h2>
        <p>${escapeHtml(company.intro)}</p>
        <div class="market-mini">
          ${MOCK.items
            .slice(0, 3)
            .map(
              (item) =>
                html`<span
                  >${item.name}
                  <b class="${changeMark(item.change).tone}"
                    >${changeMark(item.change).mark}
                    ${changeMark(item.change).text}</b
                  ></span
                >`,
            )
            .join("")}
        </div>
        <button class="button primary" type="button" id="externalJoin">
          오픈 채팅방 참여하기
        </button>
      </div>
      <div class="external-visual">
        <img
          src="assets/02_actions/08_shopping_cart.png"
          alt="물량을 옮기는 마스코트"
          loading="lazy"
        />
      </div>
    </section>

    <div class="detail-grid">
      ${sectionCard({
        title: "오픈 채팅방",
        desc: "유입을 유도하고 판매량을 유동적으로 조절합니다. 1차 소매 페르소나가 입찰 대상입니다.",
        className: "chat-board-card",
        body: html`<ul class="chat-board">
          ${external.chatBids
            .map(
              (bid) =>
                html`<li>
                  <span class="chat-board-time">${bid.time}</span>
                  <div>
                    <strong>${escapeHtml(bid.nick)}</strong>
                    <p>${escapeHtml(bid.message)}</p>
                  </div>
                  <span
                    class="status-badge status-${bid.state === "검토 중"
                      ? "warning"
                      : "success"}"
                    >${bid.state}</span
                  >
                </li>`,
            )
            .join("")}
        </ul>`,
      })}
      ${sectionCard({
        title: "산지 계약",
        desc: "계약 체결 문서를 메일로 발송합니다.",
        body: dataTable(
          ["계약 번호", "산지", "품목", "물량", "상태"],
          external.contracts
            .map(
              (contract) =>
                html`<tr>
                  <td><code class="ref-id">${contract.no}</code></td>
                  <td><strong>${contract.farm}</strong></td>
                  <td>${contract.item}</td>
                  <td>${contract.volume}</td>
                  <td>
                    <span
                      class="status-badge status-${contract.state ===
                      "서명 대기"
                        ? "warning"
                        : "success"}"
                      >${contract.state}</span
                    >
                  </td>
                </tr>`,
            )
            .join(""),
        ),
      })}
    </div>

    <div class="detail-grid">
      ${sectionCard({
        title: "재무제표 확인",
        desc: "회사 공개데이터로 열람할 수 있는 분기 실적입니다.",
        body: dataTable(
          ["기간", "매출", "매출원가", "영업이익", "이익률"],
          external.statements
            .map(
              (row) =>
                html`<tr>
                  <td><strong>${row.period}</strong></td>
                  <td>${money(row.revenue)}</td>
                  <td>${money(row.cost)}</td>
                  <td class="positive">${money(row.profit)}</td>
                  <td>${((row.profit / row.revenue) * 100).toFixed(1)}%</td>
                </tr>`,
            )
            .join(""),
        ),
      })}
      ${sectionCard({
        title: "사용자 인증 · 외부 페이지 관리",
        desc: "인증 수단과 외부 페이지 콘텐츠는 관리자 화면의 회사 관리와 연동됩니다.",
        body: html`<ul class="external-feature-list">
          <li>
            <strong>메일 인증</strong><span>회원가입 시 인증 메일 발송</span>
          </li>
          <li><strong>OAuth 2.0</strong><span>외부 계정 연동 로그인</span></li>
          <li>
            <strong>소개글</strong
            ><span>${escapeHtml(company.intro.slice(0, 40))}…</span>
          </li>
          <li>
            <strong>대표 이미지</strong
            ><span>외부 페이지 관리 테이블에서 관리</span>
          </li>
          <li>
            <strong>회사 정보</strong
            ><span
              >${escapeHtml(company.phone)} · ${escapeHtml(company.email)}</span
            >
          </li>
        </ul>`,
      })}
    </div>
  </div>`;
}

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
                    class="status-badge status-${persona.state === "정의 완료"
                      ? "success"
                      : persona.state === "정의 필요"
                        ? "danger"
                        : "warning"}"
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
