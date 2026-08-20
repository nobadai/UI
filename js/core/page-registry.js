// -----------------------------------------------------------------------------
// 메뉴 키와 화면 렌더러 매핑 (정의서 §6.1 관리자용 화면)
// -----------------------------------------------------------------------------
const pages = {
  dashboard: () => dashboardPage(),
  forecast: () => forecastPage(),

  proposal: () => proposalPage(),
  "proposal-history": () => proposalHistoryPage(),
  market: () => marketPage(),
  "purchase-ledger": () => purchaseLedgerPage(),
  "purchase-config": () => purchaseConfigPage(),

  "finance-assets": () => financeAssetsPage(),
  "finance-expense": () => financeExpensePage(),
  "finance-holdings": () => financeHoldingsPage(),
  "finance-available": () => financeAvailablePage(),
  "finance-payroll": () => financePayrollPage(),

  "sales-labor": () => salesLaborPage(),
  "sales-delivery": () => salesDeliveryPage(),
  "sales-clients": () => salesClientsPage(),

  "inventory-status": () => inventoryStatusPage(),
  "inventory-outbound": () => inventoryOutboundPage(),

  "partner-ledger": () => partnerLedgerPage(),
  "partner-receipt": () => partnerReceiptPage(),

  "member-new": () => memberNewPage(),
  members: () => membersPage(),
  company: () => companyPage(),
  anomaly: () => anomalyPage(),

  external: () => externalPage(),
  personas: () => personasPage(),
  errors: () => errorsPage(),
};
