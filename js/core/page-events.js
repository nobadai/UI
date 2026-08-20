// -----------------------------------------------------------------------------
// 화면별 인터랙션 연결
// bindPage()에 직접 누적하지 않고 기능별 바인더로 분리합니다.
// -----------------------------------------------------------------------------

function bindPage(page) {
  setupCharts(page);
  bindItemSwitching(page);
  bindForecastControls(page);
  bindProposalPage();
  bindHistoryPage();
  bindMarketPage();
  bindOperationsPages();
  bindPartnerPages();
  bindSettingsNavigation();
}

function setupCharts(page) {
  const chart = $("#mainChart");
  if (chart) {
    renderPriceChart(chart, {
      item: state.item,
      types:
        page === "forecast"
          ? state.priceTypes
          : ["retail", "wholesale", "auction"],
      band: page === "forecast" ? state.band : "auction",
      pin: page === "forecast",
    });
  }
  $$("[data-spark]").forEach((target) =>
    renderSparkline(target, target.dataset.spark, "auction"),
  );
}

function bindItemSwitching(page) {
  $$(".item-filter").forEach((select) => {
    select.onchange = () => {
      state.item = select.value;
      $("#itemButton").innerHTML = `${findItem().name} <span>⌄</span>`;
      route(page, false);
      toast(`${findItem().name} 기준으로 화면을 갱신했습니다.`);
    };
  });

  $$(".price-card, .market-row").forEach((card) => {
    const select = () => {
      state.item = card.dataset.item;
      $("#itemButton").innerHTML = `${findItem().name} <span>⌄</span>`;
      route("forecast");
      toast(`${findItem().name} 예측 화면으로 이동했습니다.`);
    };
    card.onclick = select;
    card.onkeydown = (event) => {
      if (event.key === "Enter") select();
    };
  });
}

function bindForecastControls(page) {
  $$("[data-price-type]").forEach((chip) => {
    chip.onclick = () => {
      const key = chip.dataset.priceType;
      const next = state.priceTypes.includes(key)
        ? state.priceTypes.filter((type) => type !== key)
        : [...state.priceTypes, key];
      if (!next.length) {
        toast("가격 유형은 하나 이상 표시해야 합니다.");
        return;
      }
      state.priceTypes = next;
      route(page, false);
    };
  });

  $(".band-filter")?.addEventListener("change", (event) => {
    state.band = event.target.value;
    route(page, false);
    toast(
      state.band
        ? `${findPriceType(state.band).label} 90% 예측 구간을 표시합니다.`
        : "예측 구간 표시를 숨겼습니다.",
    );
  });

  const slider = $("#horizonSlider");
  if (slider) {
    // 슬라이더와 그래프 클릭이 같은 고정 표식을 움직입니다.
    slider.oninput = () => pinHorizon(Number(slider.value), false);
    slider.onchange = () => updateEvidencePanel();
  }
}

function bindProposalPage() {
  $$(".scenario-card").forEach((card) => {
    const select = () => {
      state.scenario = card.dataset.scenario;
      $$(".scenario-card").forEach((item) =>
        item.classList.toggle("active", item === card),
      );
      const scenario = MOCK.scenarios.find(
        (item) => item.id === state.scenario,
      );
      toast(`${scenario.name}을 검토 대상으로 선택했습니다.`);
    };
    card.onclick = select;
    card.onkeydown = (event) => {
      if (event.key === "Enter") select();
    };
  });

  $("#approveDecision")?.addEventListener("click", () => {
    const combined = MOCK.orchestration.combined;
    openModal(
      "매입 승인",
      html`<p>
          ${combined.qtyTon}톤 / ${money(combined.amount)} 매입안을 승인하면
          T4에서 현금·재고·손익이 State DB에 반영됩니다.
        </p>
        <div class="modal-detail">
          ${combined.splits
            .map(
              (split) =>
                `${split.when} ${split.qtyTon}톤 · ${money(split.amount)} (${split.note})`,
            )
            .join("<br>")}
        </div>
        <p>프로토타입에서는 실제 데이터가 저장되지 않습니다.</p>`,
    );
  });

  $("#reviseDecision")?.addEventListener("click", () => {
    const loops = MOCK.orchestration.loops;
    const remaining = loops.postMax - loops.postUsed;
    toast(
      remaining > 0
        ? `재조정을 요청했습니다. 사후 루프 잔여 ${remaining - 1}회입니다.`
        : "사후 루프가 소진되어 매입 보류로 종료됩니다.",
    );
  });

  $("#holdDecision")?.addEventListener("click", () => {
    $("#approvalHeadline").textContent = "매입 보류로 안전 종료했습니다.";
    toast("오늘 매입을 보류했습니다. 다음 날 T0으로 이어집니다.");
  });
}

function bindHistoryPage() {
  $$(".history-row").forEach((row) => {
    const open = () => {
      const record = MOCK.proposalHistory[Number(row.dataset.history)];
      openModal(
        `${record.date} 제안 결과`,
        html`<span
            class="status-badge status-${
              record.critic === "PASS" ? "success" : "danger"
            }"
            >Critic ${record.critic}</span
          >
          <p>초안 ${record.proposed} → 결과 ${record.approved}</p>
          <div class="modal-detail">
            사전 feedback 루프 ${record.pre}회 · 사후 재조정 루프
            ${record.post}회<br />
            채택된 변경안: ${record.adopted}<br />
            최종 결정: ${record.decision}
          </div>`,
      );
    };
    row.onclick = open;
    row.onkeydown = (event) => {
      if (event.key === "Enter") open();
    };
  });

  $("#exportHistory")?.addEventListener("click", () =>
    toast("제안 이력을 XLSX로 내보냈습니다. (프로토타입)"),
  );
}

function bindMarketPage() {
  $("#marketSort")?.addEventListener("change", (event) => {
    const rows = [...MOCK.items].sort((a, b) =>
      event.target.value === "change" ? b.change - a.change : 0,
    );
    $("#marketRows").innerHTML = rows.map(marketRow).join("");
    $$("[data-spark]").forEach((target) =>
      renderSparkline(target, target.dataset.spark, "auction"),
    );
    bindItemSwitching(state.page);
    toast(
      event.target.value === "change"
        ? "변동률이 큰 순서로 정렬했습니다."
        : "품목 순서로 정렬했습니다.",
    );
  });

  $("#exportPurchases")?.addEventListener("click", () =>
    toast("매입 내역을 XLSX로 내보냈습니다. (프로토타입)"),
  );

  $("#saveConfig")?.addEventListener("click", () => {
    const values = {};
    $$(".config-row input:not([readonly])").forEach((input) => {
      values[input.name] = input.value;
    });
    localStorage.setItem("agriSim.purchaseConfig", JSON.stringify(values));
    toast("매입 상수값을 이 브라우저에 저장했습니다.");
  });
}

function bindOperationsPages() {
  $("#addLabor")?.addEventListener("click", () =>
    openModal(
      "근무 등록",
      "시안에서는 저장하지 않습니다. 실제 제품에서는 근무 조, 투입 인원, 작업 내용을 입력해 일일 근로자 명부에 추가합니다.",
      true,
    ),
  );

  $("#deliveryFilter")?.addEventListener("change", (event) => {
    $$(".delivery-row").forEach((row) => {
      row.hidden =
        event.target.value !== "all" &&
        row.dataset.state !== event.target.value;
    });
  });

  $$(".delivery-row").forEach((row) => {
    const open = () => {
      const delivery = MOCK.sales.deliveries.find(
        (item) => item.code === row.dataset.code,
      );
      openModal(
        `${delivery.code} 배송 상세`,
        html`<p>${delivery.partner} · ${delivery.qty}</p>
          <div class="modal-detail">
            배차 ${delivery.truck}<br />도착 예정 ${delivery.eta}<br />상태
            ${delivery.state}
          </div>`,
      );
    };
    row.onclick = open;
    row.onkeydown = (event) => {
      if (event.key === "Enter") open();
    };
  });

  $("#exportOutbound")?.addEventListener("click", () =>
    toast("출고 전표를 내보냈습니다. (프로토타입)"),
  );
}

function bindPartnerPages() {
  $("#ledgerFilter")?.addEventListener("change", (event) => {
    $$(".ledger-row").forEach((row) => {
      row.hidden =
        event.target.value !== "all" && row.dataset.type !== event.target.value;
    });
  });

  $$("[data-receipt]").forEach((button) => {
    button.onclick = () => {
      const receipt = MOCK.partners.receipts[Number(button.dataset.receipt)];
      const format = button.dataset.format;
      const label = { mail: "메일 발송", pdf: "PDF 추출", xlsx: "XLSX 추출" }[
        format
      ];
      toast(`${receipt.partner} ${receipt.no} ${label}을 시작했습니다.`);
    };
  });

  $("#sendAllReceipts")?.addEventListener("click", () => {
    const pending = MOCK.partners.receipts.filter(
      (receipt) => receipt.state === "발송 대기",
    );
    toast(`발송 대기 ${pending.length}건을 메일로 보냈습니다. (프로토타입)`);
  });
}
