# Next.js 전환 가이드

현재 프로토타입은 별도 빌드 없이 GitHub Pages에서 실행할 수 있도록 classic script를 사용합니다. 파일 경계는 Next.js App Router로 옮기기 쉬운 단위로 분리했습니다.

## 권장 매핑

| 현재 파일                  | Next.js 전환 위치                                | 역할                             |
| -------------------------- | ------------------------------------------------ | -------------------------------- |
| `index.html`               | `app/(service)/layout.tsx`                       | Sidebar, Header, Chatbot 공통 셸 |
| `js/pages/dashboard.js`    | `app/(service)/dashboard/page.tsx`               | 대시보드와 식자재 분석 통합 화면 |
| `js/pages/detail.js`       | `app/(service)/analysis/[ingredientId]/page.tsx` | 식자재 상세 분석                 |
| `js/pages/recipes.js`      | `app/(service)/recipes/page.tsx`                 | 레시피와 메뉴 원가               |
| `js/pages/stores.js`       | `app/(service)/stores/page.tsx`                  | 매장·가맹점 관리                 |
| `js/pages/briefings.js`    | `app/(service)/briefings/page.tsx`               | 정기 분석 보고서                 |
| `js/pages/alerts.js`       | `app/(service)/alerts/page.tsx`                  | 즉시 확인할 위험 이벤트          |
| `js/pages/settings.js`     | `app/(service)/settings/**/page.tsx`             | 회원·회사·알림 설정              |
| `js/components/chart.js`   | `components/forecast/ForecastChart.tsx`          | 예측 그래프                      |
| `js/components/chat-ui.js` | `components/chat/ChatPanel.tsx`                  | 챗봇 오버레이                    |
| `js/data/mock-data.js`     | `lib/mock-data.ts` 또는 API layer                | Mock 응답                        |
| `js/core/router.js`        | Next.js App Router                               | 전환 후 제거                     |

## 전환 순서

1. `index.html`의 공통 셸을 `(service)/layout.tsx`로 옮깁니다.
2. `js/pages/`의 각 반환 문자열을 React JSX 컴포넌트로 변환합니다.
3. `js/components/`의 DOM 이벤트를 `useState`, `useEffect`, 이벤트 prop으로 교체합니다.
4. `window.CostCatcherData`를 TypeScript 타입이 있는 API adapter 또는 Server Component fetch로 교체합니다.
5. `localStorage` Mock 저장은 React Query/Zustand 같은 클라이언트 상태와 실제 API mutation으로 교체합니다.

내부 화면마다 별도 HTML 문서를 만들지 않은 이유는 Sidebar, Header, Chatbot이 중복되고 화면 전환 때 전체 문서가 다시 그려지기 때문입니다. 현재의 페이지별 JavaScript 경계가 Next.js route 단위와 직접 대응하면서도 정적 프로토타입의 자연스러운 화면 전환을 유지합니다.
