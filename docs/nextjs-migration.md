# Next.js 전환 가이드

현재 프로토타입은 별도 빌드 없이 GitHub Pages에서 실행할 수 있도록 classic script를 사용합니다. 파일 경계는 Next.js App Router로 옮기기 쉬운 단위로 분리했습니다.

## 권장 매핑

| 현재 파일                  | Next.js 전환 위치                    | 역할                                     |
| -------------------------- | ------------------------------------ | ---------------------------------------- |
| `index.html`               | `app/(admin)/layout.tsx`             | Sidebar, Header, Chatbot 공통 셸         |
| `js/pages/dashboard.js`    | `app/(admin)/dashboard/page.tsx`     | T0 스냅샷과 파이프라인 대시보드          |
| `js/pages/forecast.js`     | `app/(admin)/forecast/page.tsx`      | 금일 도매가 예측(ML) · 소/중/경 그래프   |
| `js/pages/purchase.js`     | `app/(admin)/purchase/**/page.tsx`   | 제안 상세 · 이력 · 시세 · 내역 · 설정    |
| `js/pages/finance.js`      | `app/(admin)/finance/**/page.tsx`    | 자산 · 지출 · 보유자산 · 가용자산 · 급여 |
| `js/pages/operations.js`   | `app/(admin)/ops/**/page.tsx`        | 영업 · 재고/물류 · 거래처                |
| `js/pages/settings.js`     | `app/(admin)/settings/**/page.tsx`   | 회원 · 회사 · 이상치 알림                |
| `js/pages/misc.js`         | `app/(public)/**` 및 QA 라우트       | 외부용 화면 · 페르소나 · 오류 미리보기   |
| `js/components/chart.js`   | `components/forecast/PriceChart.tsx` | 다중 시계열 예측 그래프                  |
| `js/components/chat-ui.js` | `components/chat/ChatPanel.tsx`      | 챗봇 오버레이                            |
| `js/data/mock-data.js`     | `lib/mock-data.ts` 또는 API layer    | Mock 응답                                |
| `js/core/config.js`        | `lib/policy.ts` + `lib/brand.ts`     | 축 정책 · 브랜드 상수 · 포맷터           |
| `js/core/router.js`        | Next.js App Router                   | 전환 후 제거                             |

## 화면 구조 경계

정의서 §6은 첫 화면부터 관리자용과 외부용을 분리합니다. Next.js에서는 route group으로 나눕니다.

- `app/(admin)/**` — 로그인 후 관리자 화면. 현재 `index.html` 셸에 해당합니다.
- `app/(public)/**` — 오픈 채팅방, 산지 계약, 재무제표 열람 등 외부 사용자 화면. 현재 `js/pages/misc.js`의 `externalPage()`가 그 미리보기입니다.

## 전환 순서

1. `index.html`의 공통 셸을 `(admin)/layout.tsx`로 옮깁니다.
2. `js/pages/`의 각 반환 문자열을 React JSX 컴포넌트로 변환합니다.
3. `js/components/`의 DOM 이벤트를 `useState`, `useEffect`, 이벤트 prop으로 교체합니다.
4. `window.AgriSimData`를 TypeScript 타입이 있는 API adapter 또는 Server Component fetch로 교체합니다.
5. `js/core/config.js`의 `AXIS_POLICY`와 `checkAxisPolicy()`는 백엔드 `contracts.py`의 `SuggestedAdjustment` 검증과 같은 규칙입니다. 전환 시 스키마에서 생성한 타입으로 대체하고, 화면에서는 표시만 담당하게 합니다.
6. `localStorage` Mock 저장은 React Query/Zustand 같은 클라이언트 상태와 실제 API mutation으로 교체합니다.

내부 화면마다 별도 HTML 문서를 만들지 않은 이유는 Sidebar, Header, Chatbot이 중복되고 화면 전환 때 전체 문서가 다시 그려지기 때문입니다. 현재의 페이지별 JavaScript 경계가 Next.js route 단위와 직접 대응하면서도 정적 프로토타입의 자연스러운 화면 전환을 유지합니다.
