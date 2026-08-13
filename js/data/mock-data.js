window.CostCatcherData = {
  ingredients:[
    {id:'cabbage',name:'배추',price:3420,unit:'원/kg',change:4.2,status:'danger',label:'위험'},
    {id:'green-onion',name:'대파',price:2180,unit:'원/kg',change:1.8,status:'warning',label:'주의'},
    {id:'onion',name:'양파',price:1240,unit:'원/kg',change:-0.7,status:'success',label:'안정'},
    {id:'radish',name:'무',price:980,unit:'원/kg',change:2.3,status:'warning',label:'주의'},
    {id:'garlic',name:'마늘',price:6850,unit:'원/kg',change:-0.5,status:'success',label:'안정'}
  ],
  charts:{
    cabbage:{actual:[2620,2700,2810,2760,2870,2850,2960,2940,3040,3140,3100,3210,3160,3280,3260,3190,3330,3400,3360,3310,3340,3280,3350,3370,3420],forecast:[3420,3460,3510,3560,3630,3710,3790,3860,3940],low:[3420,3340,3290,3240,3190,3130,3070,3000,2920],high:[3420,3580,3730,3890,4050,4200,4270,4410,4530]},
    'green-onion':{actual:[1900,1940,1870,1980,2010,2050,2020,2070,2120,2080,2140,2180],forecast:[2180,2210,2250,2240,2280,2320,2310,2350,2380],low:[2180,2120,2100,2080,2090,2100,2070,2050,2030],high:[2180,2290,2370,2400,2460,2520,2560,2630,2680]},
    onion:{actual:[1320,1300,1290,1280,1275,1260,1270,1250,1240],forecast:[1240,1235,1220,1210,1200,1195,1180,1170,1165],low:[1240,1200,1170,1140,1120,1100,1080,1060,1040],high:[1240,1270,1280,1290,1300,1310,1310,1320,1330]},
    radish:{actual:[850,870,900,890,910,930,940,960,980],forecast:[980,1000,1010,1040,1060,1080,1110,1130,1160],low:[980,940,930,940,950,960,970,980,990],high:[980,1060,1100,1150,1200,1240,1290,1330,1380]},
    garlic:{actual:[7020,7000,6980,6940,6910,6890,6880,6860,6850],forecast:[6850,6830,6800,6790,6770,6760,6740,6710,6690],low:[6850,6700,6600,6500,6440,6370,6310,6260,6200],high:[6850,6960,7010,7060,7100,7160,7200,7240,7290]}
  },
  production:[{metric:'생산량',current:'82,300t',normal:'91,000t',previous:'87,600t',change:'-9.6%'},{metric:'재배면적',current:'15,240ha',normal:'16,310ha',previous:'15,980ha',change:'-6.6%'},{metric:'출하량',current:'78,500t',normal:'88,900t',previous:'83,100t',change:'-11.7%'}],
  weather:[{date:'5/16',temp:'23.1℃',rain:'12.5mm',humidity:'72%',risk:'안정'},{date:'5/17',temp:'24.3℃',rain:'8.0mm',humidity:'68%',risk:'안정'},{date:'5/18',temp:'26.8℃',rain:'25.3mm',humidity:'81%',risk:'주의'},{date:'5/19',temp:'29.7℃',rain:'42.6mm',humidity:'85%',risk:'위험'},{date:'5/20',temp:'30.2℃',rain:'38.2mm',humidity:'82%',risk:'위험'}],
  menuImpacts:[{name:'김치찌개',use:'배추 180g 사용',current:1000,future:1092,delta:92,rate:9.2,level:'높음',status:'danger'},{name:'겉절이',use:'배추 200g 사용',current:960,future:1038,delta:78,rate:8.1,level:'보통',status:'warning'},{name:'보쌈',use:'배추 150g 사용',current:800,future:861,delta:61,rate:7.6,level:'낮음',status:'success'}],
  recipes:[
    {id:'kimchi',name:'김치찌개',servings:'1인분',current:1000,future:1092,items:[['배추','180g','620원'],['돼지고기','150g','2,100원'],['대파','20g','90원'],['양파','30g','55원']]},
    {id:'salad',name:'겉절이',servings:'1접시',current:960,future:1038,items:[['배추','200g','684원'],['대파','15g','65원'],['마늘','8g','55원'],['고춧가루','10g','110원']]},
    {id:'bossam',name:'보쌈',servings:'1인분',current:800,future:861,items:[['배추','150g','513원'],['돼지고기','200g','2,800원'],['마늘','12g','82원'],['새우젓','15g','120원']]}
  ],
  stores:[{name:'강남점',region:'서울 강남구',items:'12개',risks:'배추, 대파',manager:'김민준',state:'운영 중'},{name:'수원점',region:'경기 수원시',items:'10개',risks:'배추',manager:'이서연',state:'운영 중'},{name:'용인점',region:'경기 용인시',items:'8개',risks:'대파',manager:'박지훈',state:'운영 중'},{name:'분당점',region:'경기 성남시',items:'11개',risks:'배추, 무',manager:'최유진',state:'운영 중'},{name:'잠실점',region:'서울 송파구',items:'9개',risks:'없음',manager:'정도윤',state:'점검 중'}],
  briefings:[{date:'2026.08.13',type:'위험도 변경',title:'배추 위험도 · 주의 → 위험',summary:'3주 가격 전망이 업데이트되었습니다.',body:'주산지 고온과 집중호우가 겹치며 출하량 감소 신호가 확인되었습니다. 배추를 많이 사용하는 메뉴의 예상 원가를 점검해 주세요.'},{date:'2026.08.12',type:'가격 전망',title:'대파 가격 전망 업데이트',summary:'2주 후 상승 가능성이 61%로 조정되었습니다.',body:'경기 북부권 출하량 회복이 지연되고 있습니다. 다만 예측 범위가 넓어 추가 관찰이 필요합니다.'},{date:'2026.08.11',type:'주간 브리핑',title:'주간 원가 브리핑 생성 완료',summary:'이번 주 핵심 변동 품목 4개를 확인하세요.',body:'배추와 대파는 상승 압력이 확대됐고, 양파와 마늘은 안정 구간을 유지했습니다.'}],
  plans:[{name:'Starter',price:'월 39,000원',desc:'소규모 매장을 위한 시작 플랜',features:['1개 매장','기본 식자재 모니터링','AI 브리핑','주간 이메일 리포트']},{name:'Business',price:'월 119,000원',desc:'성장하는 외식 사업자를 위한 플랜',featured:true,features:['최대 5개 매장','식자재 상세 분석','메뉴 원가 분석','AI 브리핑 및 실시간 알림']},{name:'Franchise',price:'별도 문의',desc:'다점포 운영 조직을 위한 맞춤 플랜',features:['다점포 및 가맹점 관리','통합 원가 분석','사용자 권한 관리','전담 온보딩 지원']}]
};
