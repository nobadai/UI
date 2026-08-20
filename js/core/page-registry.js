// -----------------------------------------------------------------------------
// 메뉴 키와 화면 렌더러 매핑 (ADMIN, 정의서 §6.1)
// 외부 기업 홈페이지는 js/public/pages.js에서 별도로 관리합니다.
// -----------------------------------------------------------------------------
const pages = {
  dashboard: () => dashboardPage(),

  forecast: () => forecastPage(),
  proposal: () => proposalPage(),
  "proposal-history": () => proposalHistoryPage(),
  market: () => marketPage(),
  "purchase-ledger": () => purchaseLedgerPage(),
  "purchase-config": () => purchaseConfigPage(),

  "inventory-status": () => inventoryStatusPage(),
  "inventory-outbound": () => inventoryOutboundPage(),
  "sales-labor": () => salesLaborPage(),
  "sales-delivery": () => salesDeliveryPage(),

  "finance-assets": () => financeAssetsPage(),
  "finance-expense": () => financeExpensePage(),
  "finance-holdings": () => financeHoldingsPage(),
  "finance-available": () => financeAvailablePage(),
  "finance-payroll": () => financePayrollPage(),

  "sales-clients": () => salesClientsPage(),
  "partner-ledger": () => partnerLedgerPage(),
  "partner-receipt": () => partnerReceiptPage(),

  "member-new": () => memberNewPage(),
  members: () => membersPage(),
  company: () => companyPage(),
  "public-site": () => publicSitePage(),
  anomaly: () => anomalyPage(),
  notifications: () => notificationLogPage(),

  personas: () => personasPage(),
  errors: () => errorsPage(),
};
