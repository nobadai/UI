// -----------------------------------------------------------------------------
// 관리 — 알림 로그
//
// `이상치 탐지 알림`이 "언제 알릴지"를 정하는 설정 화면이라면,
// 이 화면은 "실제로 알린 기록"을 보는 화면입니다.
// 헤더 알림 버튼의 요약 팝오버와 이 화면이 같은 MOCK.notifications를 공유합니다.
// -----------------------------------------------------------------------------

const NOTIFICATION_LEVELS = {
  critical: { label: "긴급", badge: "danger" },
  warning: { label: "주의", badge: "warning" },
  info: { label: "참고", badge: "info" },
};

const NOTIFICATION_STATUS = {
  unread: { label: "미확인", badge: "warning" },
  read: { label: "확인함", badge: "info" },
  done: { label: "처리 완료", badge: "success" },
};

const READ_STORAGE_KEY = "agriSim.notificationRead";

/** 사용자가 확인한 알림 id 목록. 프로토타입이라 localStorage에 남깁니다. */
function readNotificationIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(READ_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

/** Mock의 초기 상태 위에 사용자가 확인한 기록을 덮어 실제 상태를 만듭니다. */
function notificationStatus(item) {
  if (item.status === "unread" && readNotificationIds().includes(item.id))
    return "read";
  return item.status;
}

const unreadNotifications = () =>
  MOCK.notifications.filter((item) => notificationStatus(item) === "unread");

function findNotification(id) {
  return MOCK.notifications.find((item) => item.id === id) || null;
}

function markNotificationRead(id) {
  const ids = readNotificationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      /* 저장 실패가 화면 동작을 막지는 않습니다. */
    }
  }
  updateNotificationBadge();
}

function markAllNotificationsRead() {
  try {
    localStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(MOCK.notifications.map((item) => item.id)),
    );
  } catch (error) {
    /* 무시 */
  }
  updateNotificationBadge();
}

/** 헤더 알림 버튼의 미확인 개수 배지. 0건이면 배지를 숨깁니다. */
function updateNotificationBadge() {
  const badge = $("#notificationBadge");
  if (!badge) return;
  const count = unreadNotifications().length;
  badge.textContent = String(count);
  badge.hidden = count === 0;
  $("#notificationButton")?.setAttribute(
    "aria-label",
    count ? `알림 ${count}건 보기` : "알림 보기",
  );
}

const ruleLabel = (key) =>
  MOCK.anomalyRules.find((rule) => rule.key === key)?.label || "직접 등록";

// -------------------------------------------------------------------- 팝오버
/** 헤더 알림 버튼을 눌렀을 때 뜨는 요약 목록. 상세는 알림 로그 화면이 맡습니다. */
function notificationPopoverContent() {
  const unread = unreadNotifications().length;
  const recent = MOCK.notifications.slice(0, 5);
  return html`<div class="popover-head">
      <div>
        <strong>알림</strong>
        <span>${unread ? `미확인 ${unread}건` : "미확인 알림 없음"}</span>
      </div>
      <button type="button" id="markAllReadButton" ${unread ? "" : "disabled"}>
        모두 확인
      </button>
    </div>
    ${
      recent.length
        ? html`<ul class="popover-list">
            ${recent
              .map((item) => {
                const status = notificationStatus(item);
                return html`<li>
                  <button
                    type="button"
                    class="popover-item ${status === "unread" ? "is-unread" : ""}"
                    data-notification="${item.id}"
                  >
                    <span class="noti-level level-${item.level}"
                      >${NOTIFICATION_LEVELS[item.level].label}</span
                    >
                    <span class="noti-body">
                      <strong>${item.title}</strong>
                      <small>${item.summary}</small>
                    </span>
                    <span class="noti-time">${item.relativeTime}</span>
                  </button>
                </li>`;
              })
              .join("")}
          </ul>`
        : html`<div class="popover-empty">
            <div
              class="mascot-crop mascot-magnifier"
              role="img"
              aria-label="알림을 살펴보는 마스코트"
            ></div>
            <strong>도착한 알림이 없어요</strong>
            <span>임계치를 넘는 이벤트가 생기면 여기에 표시됩니다.</span>
          </div>`
    }
    <footer class="popover-foot">
      <button type="button" data-page="notifications">
        알림 로그 전체 보기 →
      </button>
    </footer>`;
}

// ----------------------------------------------------------------- 알림 로그
function notificationLogPage() {
  const active =
    findNotification(state.notification) || MOCK.notifications[0] || null;
  const unread = unreadNotifications().length;
  return html`<div class="content notification-log">
    <section class="mascot-briefing card">
      <div
        class="briefing-mascot mascot-binoculars"
        role="img"
        aria-label="알림을 확인하는 마스코트"
      ></div>
      <div>
        <span class="eyebrow">NOTIFICATION LOG</span>
        <strong
          >${
            unread
              ? `확인하지 않은 알림이 ${unread}건 있어요.`
              : "모든 알림을 확인했어요."
          }</strong
        >
        <p>
          임계치를 넘은 이벤트만 기록됩니다. 어떤 규칙이 알림을 만드는지는
          이상치 탐지 알림에서 설정합니다.
        </p>
      </div>
      <button class="button secondary" type="button" data-page="anomaly">
        탐지 규칙 설정
      </button>
    </section>

    ${
      active
        ? html`<div class="log-layout">
            <aside class="card log-list-card" aria-label="알림 목록">
              <div class="section-head">
                <div>
                  <h2>알림 목록</h2>
                  <p>최근 발생 순입니다.</p>
                </div>
                <span class="log-unread">미확인 ${unread}</span>
              </div>
              <ul class="log-list">
                ${MOCK.notifications
                  .map((item) => notificationListRow(item, item === active))
                  .join("")}
              </ul>
            </aside>
            <article
              class="card log-detail-card"
              id="notificationDetail"
              aria-live="polite"
            >
              ${notificationDetail(active)}
            </article>
          </div>`
        : html`<article class="card">
            <strong>기록된 알림이 없습니다.</strong>
            <p>탐지 규칙이 임계치를 넘으면 이 화면에 기록이 쌓입니다.</p>
          </article>`
    }
  </div>`;
}

function notificationListRow(item, isActive) {
  const status = notificationStatus(item);
  return html`<li>
    <button
      type="button"
      class="log-row ${isActive ? "active" : ""} ${
        status === "unread" ? "is-unread" : ""
      }"
      data-notification="${item.id}"
    >
      <span class="log-row-head">
        <span class="noti-level level-${item.level}"
          >${NOTIFICATION_LEVELS[item.level].label}</span
        >
        <span class="noti-time">${item.relativeTime}</span>
      </span>
      <strong>${item.title}</strong>
      <small>${item.summary}</small>
    </button>
  </li>`;
}

function notificationDetail(item) {
  const statusMeta = NOTIFICATION_STATUS[notificationStatus(item)];
  return html`<div class="log-detail-head">
      <div>
        <div class="log-detail-tags">
          <span class="noti-level level-${item.level}"
            >${NOTIFICATION_LEVELS[item.level].label}</span
          >
          <span class="status-badge status-${statusMeta.badge}"
            >${statusMeta.label}</span
          >
          <code class="ref-id">${item.id}</code>
        </div>
        <h2>${item.title}</h2>
        <p>${item.summary}</p>
      </div>
      <button
        class="button secondary"
        type="button"
        data-page="${item.target.page}"
      >
        ${item.target.label}
      </button>
    </div>

    <dl class="log-meta">
      <div>
        <dt>탐지 시각</dt>
        <dd>${item.detectedAt}</dd>
      </div>
      <div>
        <dt>감지 규칙</dt>
        <dd>${ruleLabel(item.rule)}</dd>
      </div>
      <div>
        <dt>관측값</dt>
        <dd class="log-observed">${item.observed}</dd>
      </div>
      <div>
        <dt>임계치</dt>
        <dd>${item.threshold}</dd>
      </div>
      <div>
        <dt>전달 채널</dt>
        <dd>${item.channel}</dd>
      </div>
      <div>
        <dt>출처</dt>
        <dd><code class="ref-id">${item.refId}</code></dd>
      </div>
    </dl>

    <section class="log-block">
      <h3>상세 내용</h3>
      <p>${item.detail}</p>
    </section>

    <section class="log-block">
      <h3>영향</h3>
      <ul class="log-impact">
        ${item.impact.map((line) => html`<li>${line}</li>`).join("")}
      </ul>
    </section>

    <section class="log-block">
      <h3>처리 이력</h3>
      <ol class="log-timeline">
        ${item.timeline
          .map(
            (step) =>
              html`<li>
                <span class="log-time">${step.time}</span>
                <strong>${step.label}</strong>
                <small>${step.note}</small>
              </li>`,
          )
          .join("")}
      </ol>
    </section>

    <div class="evidence-provenance">
      <span>as_of ${MOCK.meta.asOf}</span><span>${MOCK.meta.source}</span
      ><b>Mock Data</b>
    </div>`;
}

/** 목록 클릭 시 화면 전체를 다시 그리지 않고 상세 영역만 교체합니다. */
function selectNotification(id) {
  const item = findNotification(id);
  if (!item) return;
  state.notification = id;
  markNotificationRead(id);
  const panel = $("#notificationDetail");
  if (!panel) {
    route("notifications");
    return;
  }
  panel.innerHTML = notificationDetail(item);
  panel.classList.remove("evidence-updated");
  void panel.offsetWidth;
  panel.classList.add("evidence-updated");
  $$(".log-row").forEach((row) => {
    const isActive = row.dataset.notification === id;
    row.classList.toggle("active", isActive);
    if (isActive) row.classList.remove("is-unread");
  });
  const counter = $(".log-unread");
  if (counter) counter.textContent = `미확인 ${unreadNotifications().length}`;
}
