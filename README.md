# 원가 캣쳐 HTML Prototype

식자재 가격 변동 가능성과 메뉴 원가 영향을 검토하기 위한 정적 HTML 프로토타입입니다.

## 바로 실행

저장소 루트의 `index.html`을 브라우저로 열면 됩니다.

```text
UI/
├── index.html                  # 로그인 이후 앱 셸
├── login.html                  # 로그인
├── signup.html                 # 회원가입
├── assets/                     # 마스코트 및 참고 자산
├── css/
│   ├── common.css              # 공통 CSS 엔트리와 오버레이 정책
│   ├── style.css               # 디자인 토큰·레이아웃·공통 컴포넌트
│   └── pages/                  # 라우트별 독립 스타일
├── js/
│   ├── app.js                  # 라우팅·화면 렌더링·인터랙션
│   ├── auth.js                 # 로그인/회원가입 Mock 동작
│   └── data/mock-data.js       # API 교체 대상 Mock Data
└── .github/workflows/          # GitHub Pages 자동 배포
```

## 관리 규칙

- 공통 디자인 토큰, 카드, 버튼, 표, 모달, 챗봇은 공통 CSS에서 관리합니다.
- 특정 화면의 배치는 `css/pages/<route>.css`에서 관리합니다.
- `app.js`의 `route()`가 현재 라우트에 맞는 화면 CSS를 자동으로 교체합니다.
- 백엔드 연결 시 `window.CostCatcherData`를 API 응답 상태로 교체합니다.
- 챗봇은 앱 레이아웃과 독립된 고정 오버레이이며 최초 접속 시 닫혀 있습니다.
- 인증은 Mock 동작이며 실제 토큰이나 비밀번호를 저장하지 않습니다.

## GitHub Pages

`main` 브랜치에 변경 사항을 push하면 GitHub Actions가 저장소 루트의 정적 파일을 GitHub Pages에 배포하도록 구성되어 있습니다. 저장소 Settings → Pages의 Source는 `GitHub Actions`로 선택해야 합니다.
