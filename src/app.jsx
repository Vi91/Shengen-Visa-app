import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const STORAGE_KEYS = {
  history: "schengen-history-dates",
  plans: "schengen-plan-dates",
  language: "schengen-language",
};

const HISTORY_LOOKBACK_DAYS = 180;
const PLAN_MONTHS = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ROUTES = ["overview", "history", "plans"];
const LANGUAGES = ["en", "tr"];

const TRANSLATIONS = {
  en: {
    locale: "en-GB",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    routes: {
      overview: "Overview",
      history: "History",
      plans: "Plans",
    },
    language: {
      label: "Language",
      english: "EN",
      turkish: "TR",
    },
    brand: {
      title: "Schengen Stay Tracker",
      subtitle: "Rolling 90/180-day check",
      intro: "Record past presence dates, then simulate future travel before booking a trip.",
      note:
        "Non-EU visitors can stay up to 90 days within any rolling 180-day period. This app counts each selected day as a day present.",
    },
    nav: {
      overview: {
        label: "Overview",
        description: "Rule status and next actions",
      },
      history: {
        label: "Travel History",
        description: "Mark dates already spent in Schengen",
      },
      plans: {
        label: "Travel Plans",
        description: "Test future dates against the rule",
      },
    },
    hero: {
      eyebrow: "Schengen Rule Assistant",
      title: "Track actual stays. Test plans before they become a problem.",
      copy:
        "Use the history screen for dates already spent in Schengen, then move to travel plans to test upcoming visits against the same rolling window.",
      addHistory: "Add history",
      checkPlans: "Check plans",
      daysLeftToday: "Days left today",
      planStatus: "Plan status",
      noPlan: "No plan yet",
      within: "Within limit",
      violates: "Violates rule",
    },
    overview: {
      kicker: "Dashboard",
      title: "Your current Schengen snapshot",
      subtitle:
        "This is the quickest view of how much allowance remains and whether the current plan is safe.",
      usedDays: "Days used in the last 180 days",
      daysLeft: "Days left right now",
      plannedDays: "Planned future days",
      recordTitle: "Record travel history",
      recordCopy: "Add or adjust past dates you were inside Schengen.",
      recordAction: "Open history",
      validateTitle: "Validate a trip",
      validateCopy:
        "Select future travel days and the app will flag the first date that breaks the rule.",
      validateAction: "Open plans",
      ruleTitle: "Understand the result",
      ruleCopy:
        "Every selected day counts toward the total inside the rolling 180-day window ending on the date being checked.",
      ruleAction: "Review rule",
    },
    history: {
      kicker: "Step 1",
      title: "Travel history",
      subtitle:
        "Tap or slide across dates you were physically present in the Schengen area. Selected dates turn green.",
      clear: "Clear history",
      selectedDays: "Days selected in history",
      usedDays: "Days used in the last 180 days",
      daysLeft: "Days left right now",
      visitedTitle: "Visited dates",
      visitedCaption: "From 180 days before today through today",
      continue: "Continue to travel plans",
    },
    plans: {
      kicker: "Step 2",
      title: "Travel plans",
      subtitle:
        "Tap or slide across future dates you want to spend in Schengen. Invalid planned days are highlighted in red.",
      clear: "Clear plans",
      historySaved: "History dates saved",
      selectedDays: "Planned days selected",
      daysLeftAfterPlan: "Days left after plan",
      plannedTitle: "Planned dates",
      plannedCaption: "Today through the next 12 months",
      back: "Back to history",
      returnToOverview: "Return to overview",
    },
    callout: {
      noPlanTitle: "No plan selected",
      noPlanCopy:
        "Add future dates in the travel plans screen to see whether they fit inside the rolling 90/180-day rule.",
      validTitle: "Current plan fits the rule",
      invalidTitle: "Current plan breaks the rule",
      pending: "Pending",
      valid: "Valid",
      invalid: "Violation",
    },
  },
  tr: {
    locale: "tr-TR",
    weekdays: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    routes: {
      overview: "Genel Bakış",
      history: "Geçmiş",
      plans: "Planlar",
    },
    language: {
      label: "Dil",
      english: "EN",
      turkish: "TR",
    },
    brand: {
      title: "Schengen Kalış Takibi",
      subtitle: "90/180 gün kuralı",
      intro:
        "Geçmiş Schengen günlerinizi kaydedin, sonra gelecekteki seyahatlerinizi rezervasyon yapmadan önce kontrol edin.",
      note:
        "AB vatandaşı olmayan ziyaretçiler, hareketli herhangi bir 180 günlük dönemde en fazla 90 gün kalabilir. Bu uygulama seçilen her günü Schengen'de geçirilmiş gün olarak sayar.",
    },
    nav: {
      overview: {
        label: "Genel Bakış",
        description: "Kural durumu ve sonraki adımlar",
      },
      history: {
        label: "Seyahat Geçmişi",
        description: "Schengen'de geçirdiğiniz günleri işaretleyin",
      },
      plans: {
        label: "Seyahat Planları",
        description: "Gelecek tarihleri kurala göre test edin",
      },
    },
    hero: {
      eyebrow: "Schengen Kural Asistanı",
      title: "Kalış günlerini takip edin. Planları önceden test edin.",
      copy:
        "Geçmişi Aç sayfasına Schengen bölgesinde geçirdiğiniz tarihleri girin, Planları Aç sayfasına gelecek dönem seyahat tarihlerinizi ekleyin, kural ihlali olursa sistem sizi uyaracak.",
      addHistory: "Geçmiş ekle",
      checkPlans: "Planları kontrol et",
      daysLeftToday: "Bugün kalan gün",
      planStatus: "Plan durumu",
      noPlan: "Henüz plan yok",
      within: "Sınır içinde",
      violates: "Kuralı ihlal ediyor",
    },
    overview: {
      kicker: "Panel",
      title: "Mevcut Schengen özeti",
      subtitle:
        "Burası ne kadar hakkınız kaldığını ve mevcut planın güvenli olup olmadığını görmenin en hızlı yoludur.",
      usedDays: "Son 180 günde kullanılan gün",
      daysLeft: "Şu anda kalan gün",
      plannedDays: "Planlanan gelecek günleri",
      recordTitle: "Seyahat geçmişini kaydet",
      recordCopy: "Schengen içinde bulunduğunuz geçmiş tarihleri ekleyin veya düzeltin.",
      recordAction: "Geçmişi aç",
      validateTitle: "Bir seyahati doğrula",
      validateCopy:
        "Gelecek seyahat günlerini seçin; uygulama kuralı bozan ilk tarihi gösterecektir.",
      validateAction: "Planları aç",
      ruleTitle: "Sonucu anlayın",
      ruleCopy:
        "Seçilen her gün, kontrol edilen tarihte biten hareketli 180 günlük pencerenin toplamına eklenir.",
      ruleAction: "Kuralı incele",
    },
    history: {
      kicker: "Adım 1",
      title: "Seyahat geçmişi",
      subtitle:
        "Schengen bölgesinde fiziksel olarak bulunduğunuz tarihlere dokunun veya kaydırın. Seçilen tarihler yeşil olur.",
      clear: "Geçmişi temizle",
      selectedDays: "Geçmişte seçilen gün",
      usedDays: "Son 180 günde kullanılan gün",
      daysLeft: "Şu anda kalan gün",
      visitedTitle: "Ziyaret edilen tarihler",
      visitedCaption: "Bugünden 180 gün önce ile bugün arası",
      continue: "Seyahat planlarına geç",
    },
    plans: {
      kicker: "Adım 2",
      title: "Seyahat planları",
      subtitle:
        "Schengen'de geçirmek istediğiniz gelecek tarihlere dokunun veya kaydırın. Geçersiz plan tarihleri kırmızı görünür.",
      clear: "Planları temizle",
      historySaved: "Kaydedilen geçmiş tarihleri",
      selectedDays: "Seçilen plan günleri",
      daysLeftAfterPlan: "Plan sonrası kalan gün",
      plannedTitle: "Planlanan tarihler",
      plannedCaption: "Bugünden sonraki 12 ay",
      back: "Geçmişe dön",
      returnToOverview: "Genel bakışa dön",
    },
    callout: {
      noPlanTitle: "Plan seçilmedi",
      noPlanCopy:
        "Seyahat planları ekranında gelecek tarihleri ekleyin; planın hareketli 90/180 gün kuralına uyup uymadığını görün.",
      validTitle: "Mevcut plan kurala uyuyor",
      invalidTitle: "Mevcut plan kuralı bozuyor",
      pending: "Bekliyor",
      valid: "Geçerli",
      invalid: "İhlal",
    },
  },
};

function App() {
  const today = startOfUtcDay(new Date());
  const todayIso = toIsoDate(today);
  const historyStart = shiftDate(today, -HISTORY_LOOKBACK_DAYS);
  const historyCalendarStart = firstDayOfMonth(historyStart);
  const historyMonthCount = monthDiff(historyCalendarStart, firstDayOfMonth(today)) + 1;
  const historyMonths = buildMonthSequence(historyCalendarStart, historyMonthCount);
  const planStart = firstDayOfMonth(today);
  const planMonths = buildMonthSequence(planStart, PLAN_MONTHS);
  const historyMinIso = toIsoDate(historyStart);
  const planMaxIso = toIsoDate(lastDayOfMonth(planMonths[planMonths.length - 1]));

  const [route, setRoute] = useHashRoute("overview");
  const [language, setLanguage] = useStoredPreference(
    STORAGE_KEYS.language,
    sanitizeLanguage,
    "en",
  );
  const [historyDates, setHistoryDates] = useStoredDates(
    STORAGE_KEYS.history,
    (dates) => sanitizeHistoryDates(dates, historyMinIso, todayIso),
  );
  const [planDates, setPlanDates] = useStoredDates(
    STORAGE_KEYS.plans,
    (dates) => sanitizePlanDates(dates, todayIso, planMaxIso),
  );

  const t = TRANSLATIONS[language];
  const locale = t.locale;
  const historyStats = getCurrentHistoryStats(historyDates, todayIso);
  const planStats = evaluatePlan(historyDates, planDates, todayIso);

  const applyHistoryDate = (iso, shouldSelect) => {
    setHistoryDates((current) => setDateSelection(current, iso, shouldSelect));
  };

  const applyPlanDate = (iso, shouldSelect) => {
    setPlanDates((current) => setDateSelection(current, iso, shouldSelect));
  };

  return (
    <div className={`app-shell is-${language}`} lang={locale}>
      <div className="app-toolbar">
        <LanguageSwitcher language={language} onChange={setLanguage} t={t.language} />
      </div>

      <div className="mobile-nav" aria-label={t.language.label}>
        <MobileNavButton route="overview" currentRoute={route} onNavigate={setRoute}>
          {t.routes.overview}
        </MobileNavButton>
        <MobileNavButton route="history" currentRoute={route} onNavigate={setRoute}>
          {t.routes.history}
        </MobileNavButton>
        <MobileNavButton route="plans" currentRoute={route} onNavigate={setRoute}>
          {t.routes.plans}
        </MobileNavButton>
      </div>

      <div className="app-frame">
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand-mark">S</div>
            <div className="brand-copy">
              <h1 className="brand-title">{t.brand.title}</h1>
              <p>{t.brand.subtitle}</p>
            </div>
          </div>

          <div className="sidebar-copy">
            <p>{t.brand.intro}</p>
          </div>

          <nav className="side-nav" aria-label={t.language.label}>
            <NavButton
              route="overview"
              currentRoute={route}
              label={t.nav.overview.label}
              description={t.nav.overview.description}
              icon="01"
              onNavigate={setRoute}
            />
            <NavButton
              route="history"
              currentRoute={route}
              label={t.nav.history.label}
              description={t.nav.history.description}
              icon="02"
              onNavigate={setRoute}
            />
            <NavButton
              route="plans"
              currentRoute={route}
              label={t.nav.plans.label}
              description={t.nav.plans.description}
              icon="03"
              onNavigate={setRoute}
            />
          </nav>

          <p className="sidebar-note">{t.brand.note}</p>
        </aside>

        <main className="page-panel">
          <HeroCard historyStats={historyStats} planStats={planStats} onNavigate={setRoute} t={t} />

          {route === "overview" && (
            <OverviewScreen
              historyDates={historyDates}
              historyStats={historyStats}
              planDates={planDates}
              planStats={planStats}
              onNavigate={setRoute}
              t={t}
              locale={locale}
            />
          )}

          {route === "history" && (
            <HistoryScreen
              today={today}
              months={historyMonths}
              historyStart={historyStart}
              historyDates={historyDates}
              historyStats={historyStats}
              onApplyDate={applyHistoryDate}
              onClear={() => setHistoryDates([])}
              onNavigate={setRoute}
              t={t}
              locale={locale}
            />
          )}

          {route === "plans" && (
            <PlansScreen
              today={today}
              months={planMonths}
              historyDates={historyDates}
              planDates={planDates}
              planStats={planStats}
              onApplyDate={applyPlanDate}
              onClear={() => setPlanDates([])}
              onNavigate={setRoute}
              t={t}
              locale={locale}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function HeroCard({ historyStats, planStats, onNavigate, t }) {
  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1>{t.hero.title}</h1>
        <p>{t.hero.copy}</p>
        <div className="cta-row">
          <button className="primary-button" type="button" onClick={() => onNavigate("history")}>
            {t.hero.addHistory}
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate("plans")}>
            {t.hero.checkPlans}
          </button>
        </div>
      </div>

      <div className="hero-aside">
        <div className="mini-stat">
          <span className="chip">{t.hero.daysLeftToday}</span>
          <span className="mini-stat-value">{historyStats.remainingDays}</span>
        </div>
        <div className="mini-stat">
          <span className="chip">{t.hero.planStatus}</span>
          <span className="mini-stat-value">
            {planStats.hasPlan
              ? planStats.isValid
                ? t.hero.within
                : t.hero.violates
              : t.hero.noPlan}
          </span>
        </div>
      </div>
    </section>
  );
}

function OverviewScreen({ historyDates, historyStats, planDates, planStats, onNavigate, t, locale }) {
  return (
    <section>
      <ScreenHeader
        kicker={t.overview.kicker}
        title={t.overview.title}
        subtitle={t.overview.subtitle}
      />

      <div className="metrics-grid">
        <MetricCard label={t.overview.usedDays} value={historyStats.usedDays} tone="plan" />
        <MetricCard
          label={t.overview.daysLeft}
          value={historyStats.remainingDays}
          tone={historyStats.remainingDays > 0 ? "good" : "danger"}
        />
        <MetricCard label={t.overview.plannedDays} value={planDates.length} tone="plan" />
      </div>

      <div className="actions-grid">
        <ActionCard
          variant="history"
          title={t.overview.recordTitle}
          copy={`${historyDates.length} ${t.overview.recordCopy}`}
          actionLabel={t.overview.recordAction}
          onClick={() => onNavigate("history")}
        />
        <ActionCard
          variant="plan"
          title={t.overview.validateTitle}
          copy={t.overview.validateCopy}
          actionLabel={t.overview.validateAction}
          onClick={() => onNavigate("plans")}
        />
        <ActionCard
          variant="summary"
          title={t.overview.ruleTitle}
          copy={t.overview.ruleCopy}
          actionLabel={t.overview.ruleAction}
          onClick={() => onNavigate("overview")}
        />
      </div>

      <PlanCallout planStats={planStats} t={t} locale={locale} />
    </section>
  );
}

function HistoryScreen({
  today,
  months,
  historyStart,
  historyDates,
  historyStats,
  onApplyDate,
  onClear,
  onNavigate,
  t,
  locale,
}) {
  return (
    <section>
      <ScreenHeader
        kicker={t.history.kicker}
        title={t.history.title}
        subtitle={t.history.subtitle}
        actions={
          <button className="ghost-button" type="button" onClick={onClear}>
            {t.history.clear}
          </button>
        }
      />

      <div className="metrics-grid">
        <MetricCard label={t.history.selectedDays} value={historyDates.length} tone="plan" />
        <MetricCard label={t.history.usedDays} value={historyStats.usedDays} tone="plan" />
        <MetricCard
          label={t.history.daysLeft}
          value={historyStats.remainingDays}
          tone={historyStats.remainingDays > 0 ? "good" : "danger"}
        />
      </div>

      <CalendarPanel
        title={t.history.visitedTitle}
        caption={t.history.visitedCaption}
        months={months}
        mode="history"
        selectedDates={historyDates}
        invalidPlanDates={[]}
        minDate={historyStart}
        maxDate={today}
        onApplyDate={onApplyDate}
        locale={locale}
        weekdayLabels={t.weekdays}
      />

      <div className="screen-footer">
        <div className="footer-spacer" />
        <button className="primary-button" type="button" onClick={() => onNavigate("plans")}>
          {t.history.continue}
        </button>
      </div>
    </section>
  );
}

function PlansScreen({
  today,
  months,
  historyDates,
  planDates,
  planStats,
  onApplyDate,
  onClear,
  onNavigate,
  t,
  locale,
}) {
  return (
    <section>
      <ScreenHeader
        kicker={t.plans.kicker}
        title={t.plans.title}
        subtitle={t.plans.subtitle}
        actions={
          <button className="ghost-button" type="button" onClick={onClear}>
            {t.plans.clear}
          </button>
        }
      />

      <div className="metrics-grid">
        <MetricCard label={t.plans.historySaved} value={historyDates.length} tone="plan" />
        <MetricCard label={t.plans.selectedDays} value={planDates.length} tone="plan" />
        <MetricCard
          label={t.plans.daysLeftAfterPlan}
          value={planStats.remainingAfterPlan}
          tone={planStats.isValid ? "good" : "danger"}
        />
      </div>

      <PlanCallout planStats={planStats} t={t} locale={locale} />

      <CalendarPanel
        title={t.plans.plannedTitle}
        caption={t.plans.plannedCaption}
        months={months}
        mode="plans"
        selectedDates={planDates}
        invalidPlanDates={planStats.invalidDates}
        minDate={today}
        maxDate={null}
        onApplyDate={onApplyDate}
        locale={locale}
        weekdayLabels={t.weekdays}
      />

      <div className="screen-footer">
        <button className="secondary-button" type="button" onClick={() => onNavigate("history")}>
          {t.plans.back}
        </button>
        <button className="primary-button" type="button" onClick={() => onNavigate("overview")}>
          {t.plans.returnToOverview}
        </button>
      </div>
    </section>
  );
}

function ScreenHeader({ kicker, title, subtitle, actions = null }) {
  return (
    <header className="page-header">
      <div>
        <p className="page-kicker">{kicker}</p>
        <h2 className="page-title">{title}</h2>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

function MetricCard({ label, value, tone }) {
  const toneClass = tone ? `is-${tone}` : "";

  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${toneClass}`}>{value}</p>
    </article>
  );
}

function ActionCard({ variant, title, copy, actionLabel, onClick }) {
  return (
    <button className={`action-card is-${variant}`} type="button" onClick={onClick}>
      <div>
        <h3 className="card-title">{title}</h3>
        <p className="card-copy">{copy}</p>
      </div>
      <span className="chip">{actionLabel}</span>
    </button>
  );
}

function PlanCallout({ planStats, t, locale }) {
  let className = "callout-card";
  let title = t.callout.noPlanTitle;
  let copy = t.callout.noPlanCopy;
  let chip = t.callout.pending;

  if (planStats.hasPlan && planStats.isValid) {
    className += " is-valid";
    title = t.callout.validTitle;
    copy = buildValidPlanCopy(planStats.remainingAfterPlan, locale);
    chip = t.callout.valid;
  }

  if (planStats.hasPlan && !planStats.isValid) {
    className += " is-invalid";
    title = t.callout.invalidTitle;
    copy = buildInvalidPlanCopy(planStats.firstViolationDate, planStats.violatingCount, locale);
    chip = t.callout.invalid;
  }

  return (
    <article className={className}>
      <div>
        <h3 className="card-title">{title}</h3>
        <p className="status-detail">{copy}</p>
      </div>
      <span className="chip">{chip}</span>
    </article>
  );
}

function CalendarPanel({
  title,
  caption,
  months,
  mode,
  selectedDates,
  invalidPlanDates,
  minDate,
  maxDate,
  onApplyDate,
  locale,
  weekdayLabels,
}) {
  const calendarRef = useRef(null);
  const dragModeRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const touchedDatesRef = useRef(new Set());

  useEffect(() => {
    const findDateAtPagePoint = (pageX, pageY) => {
      const dateButtons = calendarRef.current?.querySelectorAll?.("[data-date-button='true']");
      if (!dateButtons?.length) {
        return null;
      }

      for (const button of dateButtons) {
        if (button.dataset.disabled === "true") {
          continue;
        }

        const rect = button.getBoundingClientRect();
        const left = rect.left + window.scrollX;
        const right = rect.right + window.scrollX;
        const top = rect.top + window.scrollY;
        const bottom = rect.bottom + window.scrollY;

        if (pageX >= left && pageX <= right && pageY >= top && pageY <= bottom) {
          return button.dataset.date ?? null;
        }
      }

      return null;
    };

    const applyDateAtPoint = (pageX, pageY) => {
      if (!dragModeRef.current) {
        return;
      }

      const iso = findDateAtPagePoint(pageX, pageY);
      if (!iso || touchedDatesRef.current.has(iso)) {
        return;
      }

      touchedDatesRef.current.add(iso);
      onApplyDate(iso, dragModeRef.current === "add");
    };

    const handlePointerMove = (event) => {
      if (activePointerIdRef.current == null || event.pointerId !== activePointerIdRef.current) {
        return;
      }

      applyDateAtPoint(event.pageX, event.pageY);
    };

    const stopDragging = () => {
      dragModeRef.current = null;
      activePointerIdRef.current = null;
      touchedDatesRef.current.clear();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [onApplyDate]);

  const handleDayPointerDown = (event, iso, isSelected) => {
    const nextMode = isSelected ? "remove" : "add";
    dragModeRef.current = nextMode;
    activePointerIdRef.current = event.pointerId;
    touchedDatesRef.current.clear();
    touchedDatesRef.current.add(iso);
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    onApplyDate(iso, nextMode === "add");
  };

  return (
    <section className="calendar-panel">
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p className="calendar-caption">{caption}</p>
        </div>
      </div>

      <div className="calendar-grid" ref={calendarRef}>
        {months.map((monthDate) => (
          <MonthCard
            key={toIsoDate(monthDate)}
            monthDate={monthDate}
            mode={mode}
            selectedDates={selectedDates}
            invalidPlanDates={invalidPlanDates}
            minDate={minDate}
            maxDate={maxDate}
            onDayPointerDown={handleDayPointerDown}
            locale={locale}
            weekdayLabels={weekdayLabels}
          />
        ))}
      </div>
    </section>
  );
}

function MonthCard({
  monthDate,
  mode,
  selectedDates,
  invalidPlanDates,
  minDate,
  maxDate,
  onDayPointerDown,
  locale,
  weekdayLabels,
}) {
  const selectedDateSet = new Set(selectedDates);
  const invalidDateSet = new Set(invalidPlanDates);
  const firstDay = firstDayOfMonth(monthDate);
  const offset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const minIso = minDate ? toIsoDate(minDate) : null;
  const maxIso = maxDate ? toIsoDate(maxDate) : null;
  const todayIso = toIsoDate(startOfUtcDay(new Date()));

  return (
    <article className="month-card">
      <h4 className="month-title">
        {monthDate.toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })}
      </h4>

      <div className="weekday-row">
        {weekdayLabels.map((label) => (
          <div className="weekday" key={label}>
            {label}
          </div>
        ))}
      </div>

      <div className="days-grid">
        {Array.from({ length: offset }).map((_, index) => (
          <div className="empty-day" key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day));
          const iso = toIsoDate(date);
          const isDisabled =
            (minIso && compareIso(iso, minIso) < 0) ||
            (maxIso && compareIso(iso, maxIso) > 0);
          const isSelected = selectedDateSet.has(iso);
          const isInvalid = invalidDateSet.has(iso);

          let className = "day-button";
          if (iso === todayIso) {
            className += " is-today";
          }
          if (mode === "history" && isSelected) {
            className += " is-history-selected";
          }
          if (mode === "plans" && isSelected) {
            className += " is-plan-selected";
          }
          if (mode === "plans" && isInvalid) {
            className += " is-plan-invalid";
          }

          return (
            <button
              key={iso}
              type="button"
              className={className}
              disabled={isDisabled}
              aria-pressed={isSelected}
              data-date-button="true"
              data-date={iso}
              data-disabled={isDisabled ? "true" : "false"}
              onPointerDown={(event) => {
                event.preventDefault();
                onDayPointerDown(event, iso, isSelected);
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function NavButton({ route, currentRoute, label, description, icon, onNavigate }) {
  return (
    <button
      className={`nav-button ${route === currentRoute ? "is-active" : ""}`}
      type="button"
      onClick={() => onNavigate(route)}
    >
      <span className="nav-icon">{icon}</span>
      <span>
        <span className="nav-label">{label}</span>
        <span className="nav-copy">{description}</span>
      </span>
    </button>
  );
}

function MobileNavButton({ route, currentRoute, onNavigate, children }) {
  return (
    <button
      className={`mobile-nav-button ${route === currentRoute ? "is-active" : ""}`}
      type="button"
      onClick={() => onNavigate(route)}
    >
      {children}
    </button>
  );
}

function LanguageSwitcher({ language, onChange, t }) {
  return (
    <div className="language-switcher" role="group" aria-label={t.label}>
      <span className="language-icon" aria-hidden="true">
        <GlobeIcon />
      </span>
      <button
        className={`language-option ${language === "en" ? "is-active" : ""}`}
        type="button"
        onClick={() => onChange("en")}
      >
        {t.english}
      </button>
      <button
        className={`language-option ${language === "tr" ? "is-active" : ""}`}
        type="button"
        onClick={() => onChange("tr")}
      >
        {t.turkish}
      </button>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="globe-icon" focusable="false" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.92 9h-3.08a15.14 15.14 0 0 0-1.14-5A8.03 8.03 0 0 1 18.92 11ZM12 4.05c.95 1.16 1.94 3.5 2.27 6.95H9.73C10.06 7.55 11.05 5.21 12 4.05ZM4.08 13h3.08a15.14 15.14 0 0 0 1.14 5A8.03 8.03 0 0 1 4.08 13Zm3.08-2H4.08A8.03 8.03 0 0 1 8.3 6a15.14 15.14 0 0 0-1.14 5ZM12 19.95c-.95-1.16-1.94-3.5-2.27-6.95h4.54c-.33 3.45-1.32 5.79-2.27 6.95ZM9.53 18a13.14 13.14 0 0 1-1.35-5h7.64a13.14 13.14 0 0 1-1.35 5ZM15.84 13h3.08A8.03 8.03 0 0 1 14.7 18a15.14 15.14 0 0 0 1.14-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function useHashRoute(defaultRoute) {
  const [route, setRoute] = useState(() => getRouteFromHash(defaultRoute));

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#${defaultRoute}`);
      setRoute(defaultRoute);
    }

    const handleHashChange = () => {
      setRoute(getRouteFromHash(defaultRoute));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [defaultRoute]);

  return [
    route,
    (nextRoute) => {
      if (!ROUTES.includes(nextRoute)) {
        return;
      }
      window.location.hash = nextRoute;
      setRoute(nextRoute);
    },
  ];
}

function useStoredPreference(key, sanitize, fallbackValue) {
  const [value, setValue] = useState(() => {
    const storedValue = loadStoredValue(key);
    return storedValue == null ? fallbackValue : sanitize(storedValue);
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function useStoredDates(key, sanitize) {
  const [dates, setDates] = useState(() => sanitize(loadStoredDates(key)));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(dates));
  }, [dates, key]);

  return [dates, setDates];
}

function getCurrentHistoryStats(historyDates, todayIso) {
  const usedDays = countDaysInWindow(historyDates, todayIso);
  return {
    usedDays,
    remainingDays: Math.max(0, 90 - usedDays),
  };
}

function evaluatePlan(historyDates, planDates, todayIso) {
  if (planDates.length === 0) {
    return {
      hasPlan: false,
      isValid: true,
      remainingAfterPlan: getCurrentHistoryStats(historyDates, todayIso).remainingDays,
      firstViolationDate: null,
      violatingCount: null,
      invalidDates: [],
    };
  }

  const allDates = uniqueSortedDates([...historyDates, ...planDates]);
  const invalidDates = [];
  let firstViolationDate = null;
  let violatingCount = null;

  planDates.forEach((planDate) => {
    const daysUsed = countDaysInWindow(allDates, planDate);
    if (daysUsed > 90) {
      invalidDates.push(planDate);
      if (!firstViolationDate) {
        firstViolationDate = planDate;
        violatingCount = daysUsed;
      }
    }
  });

  const lastPlanDate = planDates[planDates.length - 1];
  const remainingAfterPlan = Math.max(0, 90 - countDaysInWindow(allDates, lastPlanDate));

  return {
    hasPlan: true,
    isValid: !firstViolationDate,
    remainingAfterPlan,
    firstViolationDate,
    violatingCount,
    invalidDates,
  };
}

function setDateSelection(dateList, iso, shouldSelect) {
  if (shouldSelect) {
    if (dateList.includes(iso)) {
      return dateList;
    }
    return uniqueSortedDates([...dateList, iso]);
  }

  if (!dateList.includes(iso)) {
    return dateList;
  }

  return dateList.filter((date) => date !== iso);
}

function sanitizeHistoryDates(dates, minIso, maxIso) {
  return uniqueSortedDates(
    dates.filter((date) => compareIso(date, minIso) >= 0 && compareIso(date, maxIso) <= 0),
  );
}

function sanitizePlanDates(dates, minIso, maxIso) {
  return uniqueSortedDates(
    dates.filter((date) => compareIso(date, minIso) >= 0 && compareIso(date, maxIso) <= 0),
  );
}

function sanitizeLanguage(value) {
  return LANGUAGES.includes(value) ? value : "en";
}

function buildValidPlanCopy(remainingDays, locale) {
  if (locale === "tr-TR") {
    return `Seçilen tüm seyahat tarihleri limit içinde kalıyor. Son plan tarihinden sonra ${remainingDays} gün daha kalır.`;
  }

  return `All selected travel dates stay within the limit. ${remainingDays} day(s) would still remain after the last planned day.`;
}

function buildInvalidPlanCopy(firstViolationDate, violatingCount, locale) {
  const dateLabel = formatHumanDate(firstViolationDate, locale);

  if (locale === "tr-TR") {
    return `Kuralı bozan ilk tarih ${dateLabel}. O gün hareketli 180 günlük toplam ${violatingCount} olur.`;
  }

  return `The first violating date is ${dateLabel}. That day would raise the rolling 180-day total to ${violatingCount}.`;
}

function countDaysInWindow(dateStrings, endIso) {
  const windowStart = shiftIsoDate(endIso, -179);
  return dateStrings.filter(
    (dateIso) => compareIso(dateIso, windowStart) >= 0 && compareIso(dateIso, endIso) <= 0,
  ).length;
}

function uniqueSortedDates(dateStrings) {
  return [...new Set(dateStrings)].sort(compareIso);
}

function buildMonthSequence(startDate, monthCount) {
  const months = [];
  for (let index = 0; index < monthCount; index += 1) {
    months.push(firstDayOfMonth(addMonths(startDate, index)));
  }
  return months;
}

function monthDiff(startDate, endDate) {
  return (
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth())
  );
}

function firstDayOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function lastDayOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function addMonths(date, monthOffset) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset, date.getUTCDate()));
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function shiftDate(date, dayOffset) {
  return new Date(date.getTime() + dayOffset * MS_PER_DAY);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function shiftIsoDate(iso, dayOffset) {
  const date = new Date(`${iso}T00:00:00Z`);
  return toIsoDate(new Date(date.getTime() + dayOffset * MS_PER_DAY));
}

function compareIso(left, right) {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

function formatHumanDate(iso, locale) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function loadStoredValue(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function loadStoredDates(key) {
  const value = loadStoredValue(key);
  return Array.isArray(value) ? value : [];
}

function getRouteFromHash(defaultRoute) {
  const hash = window.location.hash.replace("#", "");
  return ROUTES.includes(hash) ? hash : defaultRoute;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

registerServiceWorker();
createRoot(document.getElementById("root")).render(<App />);
