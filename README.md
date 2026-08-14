# 원가 캣쳐 HTML Prototype

식자재 가격 변동 가능성과 메뉴 원가 영향을 검토하기 위한 정적 HTML 프로토타입입니다.

## 바로 실행

저장소 루트의 `index.html`을 브라우저로 열면 됩니다.

```text
UI/
├── index.html                  # 로그인 이후 앱 셸
├── login.html                  # 로그인
├── signup.html                 # 회원가입
├── assets/                     # 동작·표정·턴어라운드별 개별 마스코트 PNG
├── css/
│   ├── common.css              # 공통 CSS 엔트리와 오버레이 정책
│   ├── style.css               # 디자인 토큰·레이아웃·공통 컴포넌트
│   ├── components/             # 마스코트·로딩·모바일 내비게이션
│   └── pages/                  # 라우트별 독립 스타일
├── js/
│   ├── app.js                  # 모든 의존성 로드 후 실행하는 부트스트랩
│   ├── auth.js                 # 로그인/회원가입 Mock 동작
│   ├── error.js                # 오류 상태별 안내 화면 렌더링
│   ├── components/
│   │   ├── chart.js            # 가격 실측·예측 그래프와 상호작용
│   │   └── chat-ui.js          # AI 챗봇과 공통 피드백 UI
│   ├── core/
│   │   ├── config.js           # 공통 상태·DOM 유틸리티·아이콘
│   │   ├── router.js           # 정적 프로토타입 라우터와 앱 수명주기
│   │   ├── page-registry.js    # 메뉴 키와 화면 렌더러 매핑
│   │   ├── page-events.js      # 화면별 인터랙션 연결
│   │   └── settings-events.js  # 설정·프로필·매장 팝업 동작
│   ├── data/mock-data.js       # API 교체 대상 Mock Data
│   └── pages/                  # 대시보드·상세·레시피 등 화면별 렌더러
├── docs/nextjs-migration.md    # Next.js App Router 전환 경계
└── .github/workflows/          # GitHub Pages 자동 배포
```

## 관리 규칙

- 공통 디자인 토큰, 카드, 버튼, 표, 모달, 챗봇은 공통 CSS에서 관리합니다.
- 특정 화면의 배치는 `css/pages/<route>.css`에서 관리합니다.
- 화면 마크업은 `html` 태그 템플릿을 사용해 HTML 구조대로 자동 포맷합니다. 사용자 입력값은 반드시 `escapeHtml()`을 거쳐야 합니다.
- 이벤트는 `bindPage()`에 직접 누적하지 않고 `bindChartInteractions`, `bindRecipePage`처럼 기능별 바인더로 분리합니다.
- HTML 문자열 안의 인라인 `onclick`은 사용하지 않고 JavaScript에서 `addEventListener`로 연결합니다.
- 화면별 CSS는 분리해 관리하고 `css/pages/app-pages.css`에서 최초 한 번 불러와 화면 전환 깜빡임을 방지합니다.
- 백엔드 연결 시 `window.CostCatcherData`를 API 응답 상태로 교체합니다.
- 챗봇은 앱 레이아웃과 독립된 고정 오버레이이며 최초 접속 시 닫혀 있습니다.
- 대시보드와 식자재 분석은 가격 → 예측 → 근거 → 메뉴 영향이 이어지는 통합 화면을 공유합니다.
- 알림 주기와 가맹점 선택은 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.
- 모바일에서는 가격 카드 가로 탐색과 하단 빠른 메뉴를 제공합니다.
- 마스코트는 `assets/manifest.csv`의 개별 PNG만 용도별로 연결합니다. `mascot-sheet.png`는 화면 자산으로 사용하지 않습니다.
- 인증은 Mock 동작이며 실제 토큰이나 비밀번호를 저장하지 않습니다.
- 내부 화면은 공통 Sidebar·Header·Chatbot 셸을 중복하지 않도록 `index.html` 하나에서 렌더링합니다. 화면 구현은 `js/pages/`로 분리되어 Next.js의 `app/**/page.tsx`로 옮길 수 있습니다.

## 코드 포매팅

프로젝트 루트에서 아래 명령을 실행하면 HTML, CSS, JavaScript를 동일한 규칙으로 정렬할 수 있습니다.

```bash
npx --yes prettier@3.6.2 --write "*.html" "css/**/*.css" "js/**/*.js" "README.md"
```

포매팅 규칙은 `.prettierrc.json`, 제외 경로는 `.prettierignore`에서 관리합니다.

## 기획 문서 반영 기준

- 현재 AI 가격예측 검증 품목은 배추와 양파입니다. 다른 품목은 현재가 모니터링 Mock으로 구분합니다.
- 대표 가격은 aT 가락시장·도매·상품·kg 환산 기준을 화면에 명시합니다.
- 모델 예측 범위는 1~18 영업일이며 UI에서는 사용자가 이해하기 쉬운 달력 날짜로 표시합니다.
- 근거 데이터는 실제 제품 전환 시 기준일 당시 공개된 값만 as-of 방식으로 결합해야 합니다.

## 주요 동작 확인

- 식자재 카드를 선택하면 같은 화면의 그래프와 근거 영역이 선택 품목 기준으로 갱신됩니다.
- 예측 그래프에 마우스를 올리면 해당 시점의 예상가를 보고, 클릭하면 오른쪽 산출 근거가 변경됩니다.
- 알림 설정에서 이메일 수신 여부와 일별·주별·월간 주기를 복수 선택할 수 있습니다.
- 가맹점 설정에서 분석 대상 매장 수와 지점 목록을 선택하고 저장할 수 있습니다.
- `설정 > 회사 정보 · 가맹점`에서 새 매장을 추가하고 분석 대상 매장을 선택할 수 있습니다.
- `레시피 관리`에서 메뉴별 식재료·사용량·현재 매입 단가를 추가, 수정, 삭제하고 브라우저에 저장할 수 있습니다.
- 사이드바 `프로토타입 > 오류 화면 미리보기`에서 400·401·403·404·500·503·오프라인 화면을 직접 열 수 있습니다.

## GitHub Pages

`main` 브랜치에 변경 사항을 push하면 GitHub Actions가 저장소 루트의 정적 파일을 GitHub Pages에 배포하도록 구성되어 있습니다. 저장소 Settings → Pages의 Source는 `GitHub Actions`로 선택해야 합니다.
