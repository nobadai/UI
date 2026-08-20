/*
 * 가상 농산물 유통회사 AI 에이전트 시뮬레이션 - 화면 Mock Data
 * 프로젝트 정의서 v0.5 기준. 백엔드 연결 시 이 객체를 API 응답 상태로 교체합니다.
 *
 * 원칙 (정의서 §1.2)
 *  - 가격 숫자는 LLM이 만들지 않습니다. 아래 시계열은 ML 파이프라인 산출물을 대신하는 Mock입니다.
 *  - 숫자를 포함한 모든 주장에는 ref_id 출처 참조가 붙습니다.
 *  - 모든 조회는 as_of 시점으로 잘립니다. 미래 정보 선점 금지.
 */

/** 고정 시드 의사난수. 새로고침해도 같은 시계열을 재현합니다. */
function seededRandom(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 한 품목·한 가격유형의 시계열을 만듭니다.
 * actual = 과거 20 영업일, forecast = D+0 ~ D+18 (모델 예측 지평), low/high = 90% 예측 구간
 */
function buildSeries({ seed, base, drift, volatility }) {
  const random = seededRandom(seed);
  const actual = [];
  let price = base * (1 - drift * 0.9);
  for (let i = 0; i < 20; i += 1) {
    price += base * volatility * (random() - 0.42);
    price += (base * drift) / 20;
    actual.push(Math.round(price / 10) * 10);
  }
  const last = actual[actual.length - 1];
  const forecast = [last];
  const low = [last];
  const high = [last];
  for (let d = 1; d <= 18; d += 1) {
    const trend =
      last * (1 + (drift * d) / 26) +
      base * volatility * (random() - 0.5) * 0.6;
    const spread = last * (0.012 + d * 0.0062);
    forecast.push(Math.round(trend / 10) * 10);
    low.push(Math.round((trend - spread) / 10) * 10);
    high.push(Math.round((trend + spread) / 10) * 10);
  }
  return { actual, forecast, low, high };
}

const PRICE_TYPE_SEEDS = {
  auction: { ratio: 1, drift: 1, volatility: 1, seed: 11 },
  wholesale: { ratio: 1.18, drift: 0.92, volatility: 0.82, seed: 29 },
  retail: { ratio: 1.86, drift: 0.74, volatility: 0.55, seed: 47 },
};

const ITEM_BASE = [
  {
    id: "cabbage",
    name: "배추",
    unit: "원/kg",
    base: 780,
    drift: 0.16,
    volatility: 0.05,
    status: "danger",
    label: "상승 위험",
    coverage: true,
  },
  {
    id: "radish",
    name: "무",
    unit: "원/kg",
    base: 640,
    drift: 0.09,
    volatility: 0.045,
    status: "warning",
    label: "주의",
    coverage: true,
  },
  {
    id: "onion",
    name: "양파",
    unit: "원/kg",
    base: 1120,
    drift: -0.04,
    volatility: 0.035,
    status: "success",
    label: "안정",
    coverage: true,
  },
  {
    id: "green-onion",
    name: "대파",
    unit: "원/kg",
    base: 1980,
    drift: 0.07,
    volatility: 0.06,
    status: "warning",
    label: "주의",
    coverage: false,
  },
  {
    id: "garlic",
    name: "마늘",
    unit: "원/kg",
    base: 5600,
    drift: -0.02,
    volatility: 0.03,
    status: "success",
    label: "안정",
    coverage: false,
  },
];

const agriSeries = {};
const agriItems = ITEM_BASE.map((item, index) => {
  agriSeries[item.id] = {};
  Object.entries(PRICE_TYPE_SEEDS).forEach(([type, config]) => {
    agriSeries[item.id][type] = buildSeries({
      seed: item.base + config.seed + index * 137,
      base: Math.round(item.base * config.ratio),
      drift: item.drift * config.drift,
      volatility: item.volatility * config.volatility,
    });
  });
  const auction = agriSeries[item.id].auction;
  const previous = auction.actual[auction.actual.length - 2];
  const current = auction.actual[auction.actual.length - 1];
  return {
    ...item,
    auction: current,
    wholesale: agriSeries[item.id].wholesale.actual.at(-1),
    retail: agriSeries[item.id].retail.actual.at(-1),
    change: Number((((current - previous) / previous) * 100).toFixed(1)),
    d18: agriSeries[item.id].auction.forecast.at(-1),
  };
});

window.AgriSimData = {
  meta: {
    asOf: "2026-08-20",
    asOfLabel: "2026.08.20 06:00",
    tradingDay: "D+0",
    simulationDay: 62,
    simulationRange: "2026.06.20 ~ 2026.08.20",
    source: "KAMIS aT OpenAPI · 일일 기상 관측",
    note: "백테스트 구간 데이터는 as_of 시점 공개분만 결합합니다.",
  },

  priceTypes: [
    {
      key: "retail",
      label: "소매가",
      desc: "소비자 판매 기준",
      color: "var(--blue)",
    },
    {
      key: "wholesale",
      label: "중도매가",
      desc: "중도매인 거래 기준",
      color: "var(--primary)",
    },
    {
      key: "auction",
      label: "경락가",
      desc: "도매시장 경매 낙찰 기준",
      color: "var(--warning)",
    },
  ],

  items: agriItems,
  series: agriSeries,

  /* ---------------------------------------------------------------- 파이프라인 */
  pipeline: [
    {
      stage: "T0",
      title: "상태 스냅샷",
      state: "done",
      time: "06:00",
      detail:
        "가용자금·재고·확정주문·예측을 오케스트레이터가 수집해 전원 동일 배포",
    },
    {
      stage: "T1",
      title: "매입 초안",
      state: "done",
      time: "06:12",
      detail: "매입 에이전트가 시나리오 3안 생성 (A안 예산 초과 인지)",
    },
    {
      stage: "T2",
      title: "제약 검토",
      state: "done",
      time: "06:19",
      detail:
        "재고·물류 / 영업 / 재무 3부서 병렬 회신 (판정 + 데이터 + 이유 + 변경안)",
    },
    {
      stage: "T3",
      title: "조정 · 검증",
      state: "active",
      time: "06:31",
      detail:
        "부서 변경안 결합 → 30톤에서 12톤으로 조정, Critic PASS, 사람 승인 대기",
    },
    {
      stage: "T4",
      title: "State DB 반영",
      state: "waiting",
      time: "-",
      detail: "승인 확정 후 현금·재고·손익을 반영하고 다음 날 T0으로 넘깁니다",
    },
  ],

  snapshot: {
    asOf: "2026-08-20 06:00",
    cards: [
      {
        label: "가용자금",
        value: "82,400,000원",
        sub: "일일 매입 한도 11,500,000원",
        ref: "fin_cash_20260820",
      },
      {
        label: "현재 재고",
        value: "46.2톤",
        sub: "창고 최대 60.0톤 · 여유 13.8톤",
        ref: "inv_stock_20260820",
      },
      {
        label: "확정 주문",
        value: "18.4톤",
        sub: "급식소 9.2 · 1차 소매 6.0 · 가공 3.2",
        ref: "so_confirmed_20260820",
      },
      {
        label: "D+18 예측",
        value: "배추 상승",
        sub: "경락가 기준 상승 시나리오 우세",
        ref: "ml_fc_cabbage_d18",
      },
    ],
  },

  /* -------------------------------------------------------------- T1 매입 초안 */
  scenarios: [
    {
      id: "A",
      name: "A안 · 선제 확보",
      qtyTon: 30,
      amount: 24000000,
      unitPrice: 800,
      items: "배추 30톤",
      rationale:
        "D+18 경락가 상승 시나리오에 대비해 상승 전 물량을 선제 확보합니다.",
      exceedReason:
        "일일 매입 한도(11,500,000원)를 12,500,000원 초과함을 인지하고 제출합니다.",
      refs: ["ml_fc_cabbage_d18", "mkt_auction_20260820"],
      status: "reject",
    },
    {
      id: "B",
      name: "B안 · 표준",
      qtyTon: 18,
      amount: 14400000,
      unitPrice: 800,
      items: "배추 18톤",
      rationale: "확정 주문 18.4톤에 맞춘 표준 매입안입니다.",
      exceedReason: null,
      refs: ["so_confirmed_20260820", "mkt_auction_20260820"],
      status: "conditional",
    },
    {
      id: "C",
      name: "C안 · 분산",
      qtyTon: 18,
      amount: 12900000,
      unitPrice: 717,
      items: "배추 12톤 + 무 6톤",
      rationale: "품목을 분산해 단일 품목 가격 변동 위험을 낮춥니다.",
      exceedReason: null,
      refs: ["mkt_auction_20260820", "ml_fc_radish_d18"],
      status: "conditional",
    },
  ],

  /* ---------------------------------------------- T2 제약 회신 (계약서 §8.2 + v0.5 필드) */
  verdicts: [
    {
      agent: "logistics",
      agentLabel: "재고 · 물류",
      owner: "슬기",
      verdict: "conditional",
      max_feasible_qty_kg: 13800,
      max_feasible_amount_krw: null,
      hard_constraints: ["A안 30톤은 창고 여유 13.8톤을 16.2톤 초과합니다."],
      soft_warnings: ["상온 보관 배추는 입고 후 5일부터 감모율이 급증합니다."],
      evidences: [
        {
          ref_id: "wh_cap_20260820",
          source: "창고 용량 테이블",
          value: "총 60.0톤 / 사용 46.2톤",
        },
        {
          ref_id: "inv_stock_20260820",
          source: "재고 스냅샷",
          value: "배추 31.4톤 · 무 9.1톤 · 양파 5.7톤",
        },
      ],
      reasoning:
        "현재 창고 여유는 13.8톤입니다. 확정 출고 18.4톤 중 9.2톤이 D+1에 빠지므로, 입고를 하루 나누면 수용 가능 물량이 늘어납니다.",
      suggested_adjustment: {
        axis: "timing",
        description: "3톤을 D+1로 분리 입고하면 창고 여유 안에 들어옵니다.",
        evidences: [
          {
            ref_id: "so_confirmed_20260820",
            source: "확정 주문",
            value: "D+1 출고 9.2톤",
          },
        ],
      },
    },
    {
      agent: "sales",
      agentLabel: "영업 · 가격책정",
      owner: "지만",
      verdict: "conditional",
      max_feasible_qty_kg: 15000,
      max_feasible_amount_krw: null,
      hard_constraints: [],
      soft_warnings: [
        "단가를 낮추면 D+30 이후 평균 판매단가 기준선이 함께 내려갑니다.",
      ],
      evidences: [
        {
          ref_id: "so_confirmed_20260820",
          source: "확정 주문",
          value: "18.4톤",
        },
        {
          ref_id: "sales_pipeline_20260820",
          source: "영업 파이프라인",
          value: "가확정 6.6톤 (급식소 2 · 소매 4.6)",
        },
      ],
      reasoning:
        "확정 수요 18.4톤 가운데 즉시 인수 가능한 물량은 15.0톤입니다. 나머지는 단가 조건이 맞아야 확정됩니다.",
      suggested_adjustment: {
        axis: "price",
        description: "판매단가를 5% 낮추면 15톤까지 판로 확보가 가능합니다.",
        evidences: [
          {
            ref_id: "sales_pipeline_20260820",
            source: "영업 파이프라인",
            value: "단가 -5% 조건부 가확정 3.4톤",
          },
        ],
      },
    },
    {
      agent: "finance",
      agentLabel: "재무 · 자금",
      owner: "채훈",
      verdict: "reject",
      max_feasible_qty_kg: null,
      max_feasible_amount_krw: 11500000,
      hard_constraints: [
        "A안 24,000,000원은 일일 매입 한도 11,500,000원을 초과합니다.",
      ],
      soft_warnings: ["D+7 급여 지급 12,800,000원이 예정되어 있습니다."],
      evidences: [
        {
          ref_id: "fin_cash_20260820",
          source: "가용자금",
          value: "82,400,000원",
        },
        {
          ref_id: "fin_fixed_20260820",
          source: "고정지출 스케줄",
          value: "창고 4,200,000 · 운송 3,600,000 · 급여 12,800,000",
        },
      ],
      reasoning:
        "가용자금은 82,400,000원이지만 D+7 고정지출을 차감한 일일 매입 한도는 11,500,000원입니다. 전량 매입은 한도를 넘습니다.",
      suggested_adjustment: {
        axis: "amount",
        description:
          "전량 대신 분할 매입(D+3, D+7)이면 자금 한도 내에서 가능합니다.",
        evidences: [
          {
            ref_id: "fin_fixed_20260820",
            source: "고정지출 스케줄",
            value: "D+7 급여 12,800,000원",
          },
        ],
      },
    },
  ],

  /* --------------------------------------------------- T3 오케스트레이터 조정 결과 */
  orchestration: {
    combined: {
      qtyTon: 12,
      amount: 9600000,
      unitPrice: 800,
      splits: [
        { when: "D+0", qtyTon: 9, amount: 7200000, note: "즉시 입고" },
        {
          when: "D+1",
          qtyTon: 3,
          amount: 2400000,
          note: "재고·물류 timing 변경안 반영",
        },
      ],
      basis: [
        {
          source: "재고·물류",
          axis: "timing",
          limit: "창고 여유 13.8톤",
          applied: "3톤 D+1 분리 입고",
        },
        {
          source: "영업",
          axis: "price",
          limit: "판로 15.0톤",
          applied: "단가 조정 없이 12톤 내 소화",
        },
        {
          source: "재무",
          axis: "amount",
          limit: "자금 11,500,000원",
          applied: "분할 매입으로 9,600,000원",
        },
      ],
      note: "세 축의 상한을 각각 확인한 뒤 최종 결합 수량은 오케스트레이터만 산출합니다 (정의서 §3.4.2).",
    },
    loops: { preUsed: 1, preMax: 2, postUsed: 0, postMax: 2 },
    preFeedback: [
      {
        round: 1,
        time: "06:24",
        trigger: "세 부서가 A안을 모두 기각",
        instruction:
          "재무 금액 축 변경안(분할 매입 D+3·D+7)과 재고·물류 타이밍 축 변경안(3톤 D+1 분리 입고)을 완화 지시로 그대로 전달했습니다.",
        result: "매입 에이전트가 B·C안을 재생성했습니다.",
      },
    ],
    critic: {
      result: "PASS",
      time: "06:31",
      checks: [
        {
          name: "ref_id 출처 존재",
          type: "코드",
          result: "PASS",
          detail: "수치를 포함한 주장 14건 모두 ref_id 보유",
        },
        {
          name: "as_of 시점 준수",
          type: "코드",
          result: "PASS",
          detail: "조회 시점 2026-08-20 이후 데이터 참조 없음",
        },
        {
          name: "agent × axis 조합",
          type: "코드",
          result: "PASS",
          detail:
            "logistics=timing · sales=price · finance=amount 모두 허용 범위",
        },
        {
          name: "조정 결과 vs 원본 데이터 대조",
          type: "LLM",
          result: "PASS",
          detail: "12톤·9,600,000원이 세 부서 상한을 모두 만족",
        },
      ],
    },
    decision: {
      state: "pending",
      label: "사람 승인 대기",
      mode: "제한 모드 · 사람이 최종 선택·승인",
    },
  },

  proposalHistory: [
    {
      date: "2026.08.19",
      proposed: "18톤 / 14,400,000원",
      approved: "15톤 / 12,000,000원",
      pre: 0,
      post: 1,
      critic: "PASS",
      decision: "승인",
      adopted: "재무 amount",
    },
    {
      date: "2026.08.18",
      proposed: "22톤 / 17,600,000원",
      approved: "-",
      pre: 2,
      post: 2,
      critic: "FAIL",
      decision: "매입 보류",
      adopted: "-",
    },
    {
      date: "2026.08.17",
      proposed: "14톤 / 11,200,000원",
      approved: "14톤 / 11,200,000원",
      pre: 0,
      post: 0,
      critic: "PASS",
      decision: "승인",
      adopted: "-",
    },
    {
      date: "2026.08.16",
      proposed: "20톤 / 16,000,000원",
      approved: "12톤 / 9,600,000원",
      pre: 1,
      post: 0,
      critic: "PASS",
      decision: "승인",
      adopted: "재고 timing · 재무 amount",
    },
    {
      date: "2026.08.15",
      proposed: "16톤 / 12,800,000원",
      approved: "16톤 / 12,800,000원",
      pre: 0,
      post: 1,
      critic: "PASS",
      decision: "승인",
      adopted: "영업 price",
    },
  ],

  /* --------------------------------------------------------------------- 매입 */
  purchaseLedger: [
    {
      date: "2026.08.19",
      item: "배추",
      qty: "15.0톤",
      unit: "800원/kg",
      amount: 12000000,
      partner: "강원 고랭지 산지조합",
      status: "입고 완료",
    },
    {
      date: "2026.08.18",
      item: "무",
      qty: "6.0톤",
      unit: "640원/kg",
      amount: 3840000,
      partner: "전남 무안 계약농가",
      status: "입고 완료",
    },
    {
      date: "2026.08.17",
      item: "배추",
      qty: "14.0톤",
      unit: "790원/kg",
      amount: 11060000,
      partner: "강원 고랭지 산지조합",
      status: "입고 완료",
    },
    {
      date: "2026.08.16",
      item: "양파",
      qty: "8.0톤",
      unit: "1,120원/kg",
      amount: 8960000,
      partner: "경남 창녕 산지조합",
      status: "입고 완료",
    },
    {
      date: "2026.08.15",
      item: "배추",
      qty: "16.0톤",
      unit: "780원/kg",
      amount: 12480000,
      partner: "충북 괴산 계약농가",
      status: "정산 완료",
    },
  ],

  purchaseConfig: [
    {
      key: "daily_purchase_limit_krw",
      label: "일일 매입 한도",
      value: "11,500,000원",
      note: "가용자금에서 D+7 고정지출을 차감해 산출",
      editable: true,
    },
    {
      key: "warehouse_capacity_kg",
      label: "창고 총 용량",
      value: "60,000kg",
      note: "창고 페르소나 기준 (§7)",
      editable: true,
    },
    {
      key: "safety_margin_ratio",
      label: "안전 마진",
      value: "12%",
      note: "세 축 상한의 최솟값에 적용",
      editable: true,
    },
    {
      key: "pre_feedback_max",
      label: "사전 feedback 루프 상한",
      value: "2회",
      note: "정의서 §3.2 루프 예산",
      editable: false,
    },
    {
      key: "post_critic_max",
      label: "사후 재조정 루프 상한",
      value: "2회",
      note: "정의서 §3.2 루프 예산",
      editable: false,
    },
    {
      key: "forecast_horizon_days",
      label: "예측 지평",
      value: "D+18",
      note: "ML 파이프라인 산출 범위",
      editable: false,
    },
    {
      key: "autonomy_mode",
      label: "자율성 모드",
      value: "제한",
      note: "정의서 §4 — 사람이 최종 선택·승인",
      editable: false,
    },
    {
      key: "as_of_policy",
      label: "as_of 정책",
      value: "조회 시점 절단",
      note: "백테스트 중 미래 정보 선점 금지",
      editable: false,
    },
  ],

  /* --------------------------------------------------------------------- 재무 */
  finance: {
    assets: [
      { label: "총 자산", value: 214800000, sub: "현금 + 재고 + 미수금" },
      { label: "가용 자금", value: 82400000, sub: "즉시 집행 가능" },
      { label: "재고 자산", value: 36900000, sub: "46.2톤 평가액" },
      { label: "미수금", value: 24500000, sub: "거래처 8곳" },
    ],
    cashFlow: [
      {
        date: "2026.08.20",
        inflow: 18600000,
        outflow: 9600000,
        balance: 82400000,
      },
      {
        date: "2026.08.19",
        inflow: 15200000,
        outflow: 12000000,
        balance: 73400000,
      },
      {
        date: "2026.08.18",
        inflow: 11800000,
        outflow: 3840000,
        balance: 70200000,
      },
      {
        date: "2026.08.17",
        inflow: 14400000,
        outflow: 11060000,
        balance: 62240000,
      },
      {
        date: "2026.08.16",
        inflow: 9700000,
        outflow: 8960000,
        balance: 58900000,
      },
    ],
    expenses: [
      {
        category: "매입",
        amount: 48340000,
        ratio: 62.1,
        fixed: false,
        note: "일일 매입 집행액 누계",
      },
      {
        category: "창고 임차",
        amount: 4200000,
        ratio: 5.4,
        fixed: true,
        note: "창고 페르소나 · 월 고정",
      },
      {
        category: "운송",
        amount: 3600000,
        ratio: 4.6,
        fixed: true,
        note: "운송 페르소나 · 트럭 3대 대여",
      },
      {
        category: "급여",
        amount: 12800000,
        ratio: 16.4,
        fixed: true,
        note: "정규 4명 + 일일 근로자",
      },
      {
        category: "일일 근로자",
        amount: 5400000,
        ratio: 6.9,
        fixed: false,
        note: "상·하차 인력",
      },
      {
        category: "기타 운영비",
        amount: 3480000,
        ratio: 4.6,
        fixed: true,
        note: "보험·통신·수수료",
      },
    ],
    holdings: [
      {
        item: "배추",
        qty: "31.4톤",
        bookValue: 24492000,
        marketValue: 26376000,
        gap: 1884000,
      },
      {
        item: "무",
        qty: "9.1톤",
        bookValue: 5824000,
        marketValue: 5915000,
        gap: 91000,
      },
      {
        item: "양파",
        qty: "5.7톤",
        bookValue: 6384000,
        marketValue: 6270000,
        gap: -114000,
      },
    ],
    available: [
      { label: "현금 잔고", value: 82400000, state: "free" },
      { label: "매입 확정 예약", value: -9600000, state: "locked" },
      { label: "D+7 급여 유보", value: -12800000, state: "locked" },
      { label: "고정지출 유보", value: -7800000, state: "locked" },
      { label: "집행 가능 잔액", value: 52200000, state: "result" },
    ],
    payroll: [
      {
        name: "김OO",
        role: "창고 관리",
        type: "정규",
        monthly: 3400000,
        state: "지급 예정",
      },
      {
        name: "이OO",
        role: "배송 총괄",
        type: "정규",
        monthly: 3200000,
        state: "지급 예정",
      },
      {
        name: "박OO",
        role: "영업",
        type: "정규",
        monthly: 3300000,
        state: "지급 예정",
      },
      {
        name: "최OO",
        role: "회계",
        type: "정규",
        monthly: 2900000,
        state: "지급 예정",
      },
      {
        name: "일일 근로자 (평균 6명)",
        role: "상·하차",
        type: "일용",
        monthly: 5400000,
        state: "일별 정산",
      },
    ],
  },

  /* ----------------------------------------------------------------- 영업 관리 */
  sales: {
    labor: [
      {
        date: "2026.08.20",
        shift: "오전",
        planned: 6,
        actual: 6,
        cost: 540000,
        task: "배추 입고 상차",
      },
      {
        date: "2026.08.20",
        shift: "오후",
        planned: 4,
        actual: 3,
        cost: 270000,
        task: "급식소 출고 분류",
      },
      {
        date: "2026.08.19",
        shift: "오전",
        planned: 6,
        actual: 6,
        cost: 540000,
        task: "무 입고 상차",
      },
      {
        date: "2026.08.19",
        shift: "오후",
        planned: 5,
        actual: 5,
        cost: 450000,
        task: "소매 출고 포장",
      },
      {
        date: "2026.08.18",
        shift: "오전",
        planned: 4,
        actual: 4,
        cost: 360000,
        task: "재고 정리",
      },
    ],
    deliveries: [
      {
        code: "DL-2608-041",
        partner: "행복급식소",
        qty: "3.2톤",
        truck: "1톤 · 2회",
        eta: "08.20 11:00",
        state: "배송 중",
      },
      {
        code: "DL-2608-042",
        partner: "우리마트 강동점",
        qty: "2.4톤",
        truck: "2.5톤 · 1회",
        eta: "08.20 13:30",
        state: "배송 중",
      },
      {
        code: "DL-2608-043",
        partner: "한마음 김치공장",
        qty: "6.0톤",
        truck: "5톤 · 2회",
        eta: "08.20 15:00",
        state: "상차 대기",
      },
      {
        code: "DL-2608-040",
        partner: "청솔 대형식당",
        qty: "1.8톤",
        truck: "1톤 · 1회",
        eta: "08.19 16:00",
        state: "배송 완료",
      },
      {
        code: "DL-2608-039",
        partner: "새벽장터 소매",
        qty: "1.2톤",
        truck: "1톤 · 1회",
        eta: "08.19 09:00",
        state: "배송 완료",
      },
    ],
    clients: [
      {
        name: "행복급식소",
        type: "급식소",
        monthly: "24.0톤",
        terms: "월 정산",
        risk: "low",
        contact: "02-000-0001",
      },
      {
        name: "한마음 김치공장",
        type: "2차 대규모",
        monthly: "48.0톤",
        terms: "주 정산",
        risk: "low",
        contact: "031-000-0002",
      },
      {
        name: "우리마트 강동점",
        type: "대형마트",
        monthly: "18.0톤",
        terms: "월 정산",
        risk: "mid",
        contact: "02-000-0003",
      },
      {
        name: "청솔 대형식당",
        type: "대형식당",
        monthly: "9.6톤",
        terms: "선입금",
        risk: "low",
        contact: "02-000-0004",
      },
      {
        name: "새벽장터 소매",
        type: "1차 소매",
        monthly: "6.4톤",
        terms: "현금",
        risk: "mid",
        contact: "010-0000-0005",
      },
    ],
  },

  /* ------------------------------------------------------------- 재고 · 물류 */
  inventory: {
    capacityTon: 60,
    usedTon: 46.2,
    stock: [
      {
        item: "배추",
        qty: "31.4톤",
        inbound: "2026.08.19",
        storage: "상온",
        shelfLeft: "4일",
        loss: "3.2%",
        state: "danger",
      },
      {
        item: "무",
        qty: "9.1톤",
        inbound: "2026.08.18",
        storage: "냉장",
        shelfLeft: "12일",
        loss: "1.1%",
        state: "success",
      },
      {
        item: "양파",
        qty: "5.7톤",
        inbound: "2026.08.16",
        storage: "상온",
        shelfLeft: "21일",
        loss: "0.8%",
        state: "success",
      },
    ],
    outbound: [
      {
        date: "2026.08.20",
        item: "배추",
        qty: "3.2톤",
        to: "행복급식소",
        doc: "OB-2608-118",
        state: "출고 완료",
      },
      {
        date: "2026.08.20",
        item: "배추",
        qty: "6.0톤",
        to: "한마음 김치공장",
        doc: "OB-2608-119",
        state: "상차 대기",
      },
      {
        date: "2026.08.19",
        item: "무",
        qty: "2.4톤",
        to: "우리마트 강동점",
        doc: "OB-2608-117",
        state: "출고 완료",
      },
      {
        date: "2026.08.19",
        item: "배추",
        qty: "1.8톤",
        to: "청솔 대형식당",
        doc: "OB-2608-116",
        state: "출고 완료",
      },
      {
        date: "2026.08.18",
        item: "양파",
        qty: "1.2톤",
        to: "새벽장터 소매",
        doc: "OB-2608-115",
        state: "출고 완료",
      },
    ],
  },

  /* ----------------------------------------------------------------- 거래처 */
  partners: {
    ledger: [
      {
        date: "2026.08.20",
        partner: "행복급식소",
        type: "매출",
        qty: "3.2톤",
        amount: 3840000,
        settle: "미수",
        due: "2026.08.31",
      },
      {
        date: "2026.08.20",
        partner: "한마음 김치공장",
        type: "매출",
        qty: "6.0톤",
        amount: 6600000,
        settle: "미수",
        due: "2026.08.24",
      },
      {
        date: "2026.08.19",
        partner: "강원 고랭지 산지조합",
        type: "매입",
        qty: "15.0톤",
        amount: 12000000,
        settle: "완료",
        due: "2026.08.19",
      },
      {
        date: "2026.08.19",
        partner: "우리마트 강동점",
        type: "매출",
        qty: "2.4톤",
        amount: 3120000,
        settle: "완료",
        due: "2026.08.19",
      },
      {
        date: "2026.08.18",
        partner: "전남 무안 계약농가",
        type: "매입",
        qty: "6.0톤",
        amount: 3840000,
        settle: "완료",
        due: "2026.08.18",
      },
    ],
    receipts: [
      {
        no: "RC-2608-0091",
        partner: "행복급식소",
        period: "2026.08.01 ~ 08.20",
        amount: 28800000,
        state: "발송 대기",
      },
      {
        no: "RC-2608-0090",
        partner: "한마음 김치공장",
        period: "2026.08.01 ~ 08.20",
        amount: 52800000,
        state: "메일 발송 완료",
      },
      {
        no: "RC-2608-0089",
        partner: "우리마트 강동점",
        period: "2026.08.01 ~ 08.19",
        amount: 21600000,
        state: "메일 발송 완료",
      },
      {
        no: "RC-2608-0088",
        partner: "청솔 대형식당",
        period: "2026.08.01 ~ 08.19",
        amount: 11520000,
        state: "발송 대기",
      },
    ],
  },

  /* ------------------------------------------------------------------- 설정 */
  members: [
    {
      name: "이현서",
      email: "orchestrator@agri-sim.co.kr",
      role: "최상위 관리자",
      team: "오케스트레이터 · Critic",
      state: "활성",
    },
    {
      name: "김지헌",
      email: "ml@agri-sim.co.kr",
      role: "일반",
      team: "ML 가격 예측",
      state: "활성",
    },
    {
      name: "오충현",
      email: "purchase@agri-sim.co.kr",
      role: "일반",
      team: "매입 의사결정",
      state: "활성",
    },
    {
      name: "이채훈",
      email: "finance@agri-sim.co.kr",
      role: "일반",
      team: "재무 · 자금",
      state: "활성",
    },
    {
      name: "김슬기",
      email: "logistics@agri-sim.co.kr",
      role: "일반",
      team: "재고 · 물류",
      state: "활성",
    },
    {
      name: "정지만",
      email: "sales@agri-sim.co.kr",
      role: "일반",
      team: "영업 · 가격책정",
      state: "휴면",
    },
  ],

  company: {
    name: "(가칭) 농산 캣쳐",
    businessNumber: "000-00-00000",
    representative: "미정",
    phone: "02-0000-0000",
    address: "서울특별시 송파구 가락동 도매시장로 000",
    email: "contact@agri-sim.co.kr",
    intro:
      "가상 농산물 유통회사 시뮬레이션입니다. 회사명은 정의서 §10.3 기준 미확정 상태입니다.",
  },

  anomalyRules: [
    {
      key: "price_jump",
      label: "경락가 급등락",
      threshold: "전일 대비 ±8%",
      channel: "이메일 · 대시보드",
      on: true,
    },
    {
      key: "warehouse_cap",
      label: "창고 적재율",
      threshold: "85% 초과",
      channel: "대시보드",
      on: true,
    },
    {
      key: "cash_floor",
      label: "가용자금 하한",
      threshold: "30,000,000원 미만",
      channel: "이메일",
      on: true,
    },
    {
      key: "critic_fail",
      label: "Critic FAIL 발생",
      threshold: "즉시",
      channel: "이메일 · 대시보드",
      on: true,
    },
    {
      key: "loop_exhausted",
      label: "루프 소진 · 매입 보류",
      threshold: "사전 2회 + 사후 2회 소진",
      channel: "이메일",
      on: true,
    },
    {
      key: "loss_rate",
      label: "재고 감모율",
      threshold: "5% 초과",
      channel: "대시보드",
      on: false,
    },
  ],

  /* --------------------------------------------------------------- 페르소나 */
  personas: [
    {
      name: "창고 물량",
      role: "보관 용량 · 비용 산정",
      state: "정의 완료",
      note: "국가물류통합정보센터 창고 통계 참고",
    },
    {
      name: "운송",
      role: "트럭 수, 대여 vs 구매",
      state: "정의 완료",
      note: "현재 5톤 1대 · 2.5톤 1대 · 1톤 1대 대여",
    },
    {
      name: "급식소",
      role: "급식 인원 수, 주간 메뉴 → 발주일 예측",
      state: "정의 완료",
      note: "수요 생성기 입력",
    },
    {
      name: "대형마트",
      role: "정기 납품 수요",
      state: "정의 필요",
      note: "정의서 §10.4 미결",
    },
    {
      name: "대형식당",
      role: "정기 납품 수요",
      state: "정의 필요",
      note: "정의서 §10.4 미결",
    },
    {
      name: "위탁",
      role: "잉여 물량 처리",
      state: "최후순위",
      note: "우선순위 최하",
    },
    {
      name: "1차 소매",
      role: "오픈채팅 입찰 대상",
      state: "정의 완료",
      note: "외부 화면 오픈 채팅방과 연결",
    },
    {
      name: "2차 대규모",
      role: "김치 가공 공장",
      state: "정의 완료",
      note: "대량 정기 수요",
    },
  ],

  /* ------------------------------------------------------------- 외부용 화면 */
  external: {
    chatBids: [
      {
        time: "09:12",
        nick: "새벽장터",
        message: "배추 1.2톤 kg당 1,180원 가능할까요?",
        state: "검토 중",
      },
      {
        time: "09:08",
        nick: "동네청과",
        message: "무 800kg 문의드립니다.",
        state: "응답 완료",
      },
      {
        time: "08:55",
        nick: "성남농산",
        message: "양파 500kg 오늘 수령 가능한가요?",
        state: "응답 완료",
      },
    ],
    contracts: [
      {
        no: "CT-2608-014",
        farm: "강원 고랭지 산지조합",
        item: "배추",
        volume: "월 60톤",
        state: "서명 대기",
      },
      {
        no: "CT-2608-013",
        farm: "전남 무안 계약농가",
        item: "무",
        volume: "월 24톤",
        state: "체결 완료",
      },
      {
        no: "CT-2608-012",
        farm: "경남 창녕 산지조합",
        item: "양파",
        volume: "월 32톤",
        state: "체결 완료",
      },
    ],
    statements: [
      {
        period: "2026년 2분기",
        revenue: 486000000,
        cost: 402000000,
        profit: 84000000,
      },
      {
        period: "2026년 1분기",
        revenue: 431000000,
        cost: 371000000,
        profit: 60000000,
      },
    ],
  },
};
