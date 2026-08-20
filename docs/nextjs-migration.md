# Next.js 전환 가이드

현재 프로토타입은 별도 빌드 없이 GitHub Pages에서 실행할 수 있도록 classic script를 사용합니다. 파일 경계는 Next.js App Router의 route group으로 그대로 옮길 수 있게 나눴습니다.

## 두 개의 레이아웃

정의서 §6은 첫 화면부터 관리자용과 외부용을 분리합니다. 지금 구조도 셸이 완전히 다릅니다.

| 영역       | 현재                                                                   | Next.js                      |
| ---------- | ---------------------------------------------------------------------- | ---------------------------- |
| **PUBLIC** | `index.html` 외 5개 문서 + `js/public/shell.js` (Sticky Header/Footer) | `app/(public)/layout.tsx`    |
| **ADMIN**  | `admin.html` 한 문서 + `js/core/router.js` (Sidebar/Header/Chatbot)    | `app/(admin)/layout.tsx`     |
| 공통       | `js/core/shared.js` (BRAND, 포맷터, 마크업 헬퍼)                       | `lib/brand.ts`, `lib/fmt.ts` |

## 권장 매핑

### PUBLIC

| 현재 파일               | Next.js 전환 위치                  | 역할                  |
| ----------------------- | ---------------------------------- | --------------------- |
| `index.html`            | `app/(public)/page.tsx`            | 홈 — Hero부터 CTA까지 |
| `company.html`          | `app/(public)/company/page.tsx`    | 회사소개              |
| `business.html`         | `app/(public)/business/page.tsx`   | 유통사업 · 프로세스   |
| `market.html`           | `app/(public)/market/page.tsx`     | 공개 시장정보         |
| `partners.html`         | `app/(public)/partners/page.tsx`   | 파트너 · 등록 절차    |
| `disclosure.html`       | `app/(public)/disclosure/page.tsx` | 공개 경영정보         |
| `login.html`            | `app/(public)/login/page.tsx`      | 로그인                |
| `signup.html`           | `app/(public)/signup/page.tsx`     | 회원가입              |
| `js/public/shell.js`    | `app/(public)/layout.tsx`          | Header · Footer 셸    |
| `js/public/sections.js` | `components/public/*`              | 섹션 단위 컴포넌트    |
| `js/public/pages.js`    | 각 `page.tsx` 본문                 | 화면별 조합           |

### ADMIN

| 현재 파일                   | Next.js 전환 위치                    | 역할                                     |
| --------------------------- | ------------------------------------ | ---------------------------------------- |
| `admin.html`                | `app/(admin)/layout.tsx`             | Sidebar, Header, Chatbot 공통 셸         |
| `js/pages/dashboard.js`     | `app/(admin)/dashboard/page.tsx`     | 상태 스냅샷과 Agent Pipeline             |
| `js/pages/forecast.js`      | `app/(admin)/forecast/page.tsx`      | 금일 도매가 예측(ML) · 소/중/경 그래프   |
| `js/pages/purchase.js`      | `app/(admin)/purchase/**/page.tsx`   | 제안 상세 · 이력 · 시세 · 내역 · 설정    |
| `js/pages/finance.js`       | `app/(admin)/finance/**/page.tsx`    | 자산 · 지출 · 보유자산 · 가용자산 · 급여 |
| `js/pages/operations.js`    | `app/(admin)/operations/**/page.tsx` | 재고/물류 · 인력 · 배송 · 거래처         |
| `js/pages/settings.js`      | `app/(admin)/settings/**/page.tsx`   | 회원 · 회사 · 외부 페이지 · 이상치 알림  |
| `js/pages/notifications.js` | `app/(admin)/notifications/page.tsx` | 알림 요약 팝오버 · 알림 로그 상세        |
| `js/pages/misc.js`          | QA 라우트                            | 페르소나 · 오류 미리보기                 |
| `js/components/chart.js`    | `components/forecast/PriceChart.tsx` | 다중 시계열 예측 그래프                  |
| `js/components/chat-ui.js`  | `components/chat/ChatPanel.tsx`      | 챗봇 오버레이                            |
| `js/core/config.js`         | `lib/nav.ts` + `lib/policy.ts`       | 사이드바 그룹 · 축 정책                  |
| `js/core/router.js`         | Next.js App Router                   | 전환 후 제거                             |
| `js/data/mock-data.js`      | `lib/mock-data.ts` 또는 API layer    | Mock 응답                                |

## 외부 콘텐츠 연동 경계

관리자 `관리 > 외부 페이지 관리`에서 저장한 값(`agriSim.publicSite`)을 PUBLIC 화면이 `publicSiteContent()`로 읽습니다. 회사 기본 정보(`agriSim.company`)도 같은 함수에서 합쳐집니다.

전환 시에는 이 두 값이 하나의 `site_content` 테이블로 가고, PUBLIC은 Server Component fetch, ADMIN은 mutation으로 나뉩니다. 지금 `publicSiteContent()` 하나만 교체하면 되도록 읽기 지점을 한 곳으로 모아 뒀습니다.

## 전환 순서

1. 공통 셸 두 개를 각각 `(public)/layout.tsx`, `(admin)/layout.tsx`로 옮깁니다.
2. `js/public/`과 `js/pages/`의 반환 문자열을 React JSX 컴포넌트로 변환합니다.
3. DOM 이벤트를 `useState`, `useEffect`, 이벤트 prop으로 교체합니다.
4. `window.AgriSimData`를 TypeScript 타입이 있는 API adapter 또는 Server Component fetch로 교체합니다.
5. `publicSiteContent()`를 `site_content` 조회로 바꾸고, 외부 페이지 관리 폼을 mutation으로 연결합니다.
6. `js/core/config.js`의 `AXIS_POLICY`와 `checkAxisPolicy()`는 백엔드 `contracts.py`의 `SuggestedAdjustment` 검증과 같은 규칙입니다. 스키마에서 생성한 타입으로 대체하고, 화면은 표시만 담당하게 합니다.
7. `localStorage` Mock 저장은 React Query/Zustand 같은 클라이언트 상태와 실제 API mutation으로 교체합니다.

## 왜 PUBLIC은 문서를 나누고 ADMIN은 하나로 뒀는가

외부 페이지는 각 URL이 독립적으로 공유·검색되어야 하고 화면 간 상태를 공유하지 않으므로 문서를 나눴습니다. 반대로 관리자 화면은 Sidebar·Header·Chatbot이 모든 화면에 동일하게 붙고 화면 전환이 잦으므로, 문서를 나누면 셸이 중복되고 전환 때마다 전체가 다시 그려집니다. 이 경계가 Next.js의 route group 두 개와 그대로 대응합니다.
