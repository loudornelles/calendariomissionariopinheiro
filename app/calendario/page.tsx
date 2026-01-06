"use client";















import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";







import {
  bookEvent,
  getByMember,
  getEvents,
  unbookEvent,
  type AppEvent,
} from "../../lib/appsScript";















const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];















type DayInfo = {







  day: number;







  status: "free" | "partial" | "full" | "blocked";







  lunch: string;







  dinner: string;

  lunchPhone?: string;

  dinnerPhone?: string;







  blockLabel?: string;







};















type MonthInfo = {







  name: string;







  year: number;







  days: number;







  startsOn: number;







};















const months: MonthInfo[] = [







  { name: "Janeiro", year: 2026, days: 31, startsOn: 4 },







  { name: "Fevereiro", year: 2026, days: 28, startsOn: 0 },







  { name: "Março", year: 2026, days: 31, startsOn: 0 },







  { name: "Abril", year: 2026, days: 30, startsOn: 3 },







  { name: "Maio", year: 2026, days: 31, startsOn: 5 },







  { name: "Junho", year: 2026, days: 30, startsOn: 1 },







];















const statusStyles: Record<DayInfo["status"], string> = {







  free: "bg-[#dff3e7] border-[#b6e4c9] text-[#1b5a44]",







  partial: "bg-[#fff2c9] border-[#f0d28f] text-[#7a5a18]",







  full: "bg-[#ffe3cc] border-[#f1b07a] text-[#8a4a1c]",







  blocked: "bg-[#d9d9d9] border-[#bdbdbd] text-[#2d2d2d]",







};















function formatDateKey(year: number, monthIndex: number, day: number) {







  const month = String(monthIndex + 1).padStart(2, "0");







  const dayValue = String(day).padStart(2, "0");







  return `${year}-${month}-${dayValue}`;







}















function parseDateValue(value: unknown) {







  if (value instanceof Date) {







    return value;







  }







  if (typeof value === "number" && Number.isFinite(value)) {







    const excelEpoch = Date.UTC(1899, 11, 30);







    return new Date(excelEpoch + value * 86400000);







  }







  if (typeof value === "string") {







    const trimmed = value.trim();







    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);







    if (isoMatch) {







      return new Date(`${trimmed}T00:00:00`);







    }







    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);







    if (brMatch) {







      const [, day, month, year] = brMatch;







      return new Date(Number(year), Number(month) - 1, Number(day));







    }







    const parsed = new Date(trimmed);







    if (!Number.isNaN(parsed.getTime())) {







      return parsed;







    }







  }







  return null;







}

function getPeriodType(value?: string) {
  const period = (value || "").toLowerCase();
  if (["almoco", "almoço"].includes(period)) {
    return "lunch";
  }
  if (["janta", "jantar"].includes(period)) {
    return "dinner";
  }
  return "other";
}















function getPeriodLabel(value?: string) {
  const periodType = getPeriodType(value);
  if (periodType === "lunch") {
    return "AlmoВo";
  }
  if (periodType === "dinner") {
    return "Jantar";
  }
  return String(value || "Outro").trim();
}

function formatEventDate(value: unknown) {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return String(value || "");
  }
  return parsed.toLocaleDateString("pt-BR");
}

function normalizeDateKey(value: unknown) {







  const parsed = parseDateValue(value);







  if (!parsed) {







    return null;







  }







  return formatDateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());







}















function buildDays(







  month: MonthInfo,







  monthIndex: number,







  eventsByDate: Map<string, AppEvent[]>







): DayInfo[] {







  return Array.from({ length: month.days }, (_, index) => {







    const day = index + 1;







    const dateKey = formatDateKey(month.year, monthIndex, day);







    const dayEvents = eventsByDate.get(dateKey) ?? [];















    let lunch = "Livre";







    let dinner = "Livre";







    let status: DayInfo["status"] = "free";







    let blockLabel: string | undefined;
    let lunchPhone: string | undefined;
    let dinnerPhone: string | undefined;















    for (const event of dayEvents) {







      const period = (event.periodo || "").toLowerCase();







      const isLunch = ["almoco", "almoço"].includes(period);







      const isDinner = ["janta", "jantar"].includes(period);















      if (isLunch) {







        lunch = event.nome || "Ocupado";
        lunchPhone = event.telefone || "";







      } else if (isDinner) {







        dinner = event.nome || "Ocupado";
        dinnerPhone = event.telefone || "";







      } else {







        status = "blocked";







        blockLabel = event.nome || "Indisponivel";







      }







    }















    if (status !== "blocked") {







      if (lunch !== "Livre" && dinner !== "Livre") {







        status = "full";







      } else if (lunch !== "Livre" || dinner !== "Livre") {







        status = "partial";







      }







    }















    if (status === "blocked") {







      return {







        day,







        status,







        lunch: "Indisponivel",







        dinner: "Indisponivel",







        blockLabel,







      };







    }















    return {







      day,







      status,







      lunch,
      lunchPhone,







      dinner,
      dinnerPhone,







    };







  });







}























function getLeadingBlanks(startsOn: number) {







  return Array.from({ length: startsOn }, (_, index) => (







    <div







      key={`blank-${index}`}







      className="h-32 rounded-2xl border border-dashed border-[var(--line)] bg-white/40 sm:h-24"







    />







  ));







}















export default function CalendarioPage() {
  const router = useRouter();
  const [isAdminView, setIsAdminView] = useState(false);







  const [isModalOpen, setIsModalOpen] = useState(false);







  const [selectedDay, setSelectedDay] = useState<{







    dateLabel: string;







    dateKey: string;







    timestamp: string;







    lunch: string;







    dinner: string;







  } | null>(null);







  const [selectedPeriod, setSelectedPeriod] = useState<







    "lunch" | "dinner" | null







  >(null);







  const [memberName, setMemberName] = useState("Visitante");







  const [memberPhone, setMemberPhone] = useState("(00) 00000-0000");







  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEvents, setMemberEvents] = useState<AppEvent[]>([]);
  const [memberEventsError, setMemberEventsError] = useState<string | null>(
    null
  );
  const [isLoadingMemberEvents, setIsLoadingMemberEvents] = useState(false);







  const [eventsError, setEventsError] = useState<string | null>(null);







  const [isLoadingEvents, setIsLoadingEvents] = useState(false);







  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState<string | null>(null);







  const [modalError, setModalError] = useState<string | null>(null);















  useEffect(() => {







    const storedName = localStorage.getItem("cm_nome");







    const storedPhone = localStorage.getItem("cm_telefone");
    const storedAdminName = localStorage.getItem("cm_admin_nome");
    const storedAdminPhone = localStorage.getItem("cm_admin_telefone");
    setIsAdminView(Boolean(storedAdminName || storedAdminPhone));







    if (storedName) {







      setMemberName(storedName);







    }







    if (storedPhone) {







      setMemberPhone(storedPhone);







    }







  }, []);















  const startKey = formatDateKey(months[0].year, 0, 1);







  const lastMonth = months[months.length - 1];







  const endKey = formatDateKey(







    lastMonth.year,







    months.length - 1,







    lastMonth.days







  );















  const loadEvents = async () => {







    setIsLoadingEvents(true);







    setEventsError(null);







    try {







      const response = await getEvents(startKey, endKey);







      if (!response.ok) {







        setEventsError(response.error || "Falha ao carregar eventos.");







        return;







      }







      setEvents(response.events || []);







    } catch (error) {







      setEventsError("Falha ao carregar eventos.");







    } finally {







      setIsLoadingEvents(false);







    }







  };

  const loadMemberEvents = async () => {
    const trimmedName = memberName.trim();
    const trimmedPhone = memberPhone.trim();
    if (
      !trimmedName ||
      !trimmedPhone ||
      trimmedName === "Visitante" ||
      trimmedPhone === "(00) 00000-0000"
    ) {
      setMemberEvents([]);
      setMemberEventsError("Preencha nome e telefone na pagina inicial.");
      return;
    }
    setIsLoadingMemberEvents(true);
    setMemberEventsError(null);
    try {
      const response = await getByMember({
        nome: trimmedName,
        telefone: trimmedPhone,
      });
      if (!response.ok) {
        setMemberEvents([]);
        setMemberEventsError(
          response.error || "Falha ao carregar seus eventos."
        );
        return;
      }
      setMemberEvents(response.events || []);
    } catch (error) {
      setMemberEvents([]);
      setMemberEventsError("Falha ao carregar seus eventos.");
    } finally {
      setIsLoadingMemberEvents(false);
    }
  };

  const handleUnbook = async (
    payload: { dia: string; periodo: string },
    options?: {
      onError?: (message: string | null) => void;
      onSuccess?: () => void | Promise<void>;
    }
  ) => {
    if (isUnbooking) {
      return false;
    }
    const trimmedPhone = memberPhone.trim();
    if (!trimmedPhone || trimmedPhone === "(00) 00000-0000") {
      const reportError = options?.onError ?? setEventsError;
      reportError("Preencha nome e telefone na pagina inicial.");
      return false;
    }
    setIsUnbooking(`${payload.dia}-${payload.periodo}`);
    const reportError = options?.onError ?? setEventsError;
    reportError(null);
    try {
      const response = await unbookEvent({
        dia: payload.dia,
        periodo: payload.periodo,
        telefone: trimmedPhone,
      });
      if (!response.ok) {
        reportError(response.error || "Falha ao desmarcar.");
        return false;
      }
      await loadEvents();
      if (options?.onSuccess) {
        await options.onSuccess();
      }
      return true;
    } catch (error) {
      reportError("Falha ao desmarcar.");
      return false;
    } finally {
      setIsUnbooking(null);
    }
  };















  useEffect(() => {







    loadEvents();







  }, []);















  const eventsByDate = useMemo(() => {







    const map = new Map<string, AppEvent[]>();







    for (const event of events) {







      const key = normalizeDateKey(event.dia);







      if (!key) {







        continue;







      }







      if (!map.has(key)) {







        map.set(key, []);







      }







      map.get(key)?.push(event);







    }







    return map;







  }, [events]);

  const memberPhoneKey = memberPhone.trim();
  const selectedDayEvents = selectedDay
    ? eventsByDate.get(selectedDay.dateKey) ?? []
    : [];
  const lunchEvent = selectedDayEvents.find(
    (event) => getPeriodType(event.periodo) === "lunch"
  );
  const dinnerEvent = selectedDayEvents.find(
    (event) => getPeriodType(event.periodo) === "dinner"
  );
  const ownsSelectedLunch =
    !!selectedDay &&
    !!memberPhoneKey &&
    lunchEvent?.telefone?.trim() === memberPhoneKey;
  const ownsSelectedDinner =
    !!selectedDay &&
    !!memberPhoneKey &&
    dinnerEvent?.telefone?.trim() === memberPhoneKey;
  const modalLunchBusy = selectedDay
    ? isUnbooking === `${selectedDay.dateKey}-almoço`
    : false;
  const modalDinnerBusy = selectedDay
    ? isUnbooking === `${selectedDay.dateKey}-janta`
    : false;































  const openModalForDay = (







    month: MonthInfo,







    monthIndex: number,







    day: DayInfo







  ) => {







    const dateLabel = `${day.day} de ${month.name} de ${month.year}`;







    const dateKey = formatDateKey(month.year, monthIndex, day.day);







    const timestamp = new Date(month.year, monthIndex, day.day).toISOString();







    setSelectedDay({







      dateLabel,







      dateKey,







      timestamp,







      lunch: day.lunch,







      dinner: day.dinner,







    });







    setSelectedPeriod(null);







    setModalError(null);







    setIsModalOpen(true);







  };















  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }
    if (!selectedDay || !selectedPeriod) {
      setModalError("Selecione um periodo.");
      return;
    }
    const trimmedName = memberName.trim();
    const trimmedPhone = memberPhone.trim();
    if (
      !trimmedName ||
      !trimmedPhone ||
      trimmedName === "Visitante" ||
      trimmedPhone === "(00) 00000-0000"
    ) {
      setModalError("Preencha nome e telefone na pagina inicial.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    const payload = {








      nome: trimmedName,







      telefone: trimmedPhone,







      dia: selectedDay.dateKey,







      timestamp: selectedDay.timestamp,







      periodo: selectedPeriod === "lunch" ? "almo\u00e7o" : "janta",







    };







    try {







      const response = await bookEvent(payload);







      if (!response.ok) {







        setModalError(response.error || "Falha ao marcar.");







        return;







      }







      setIsModalOpen(false);







      await loadEvents();







    } catch (error) {







      setModalError("Falha ao marcar.");







    } finally {







      setIsSubmitting(false);







    }







  };

  const handleLogout = () => {
    localStorage.removeItem("cm_nome");
    localStorage.removeItem("cm_telefone");
    router.push("/");
  };



















  return (







    <div className="relative min-h-screen overflow-hidden">







      <div







        className="pointer-events-none absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f1b97e,transparent_70%)] blur-2xl"







        aria-hidden="true"







      />







      <div







        className="pointer-events-none absolute bottom-[-180px] right-[-140px] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_30%_30%,#88c7a9,transparent_70%)] blur-2xl"







        aria-hidden="true"







      />







      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">







        <header className="flex flex-col gap-4 rounded-3xl border border-[var(--line)] bg-[color:var(--card)] p-6 shadow-[0_30px_80px_-50px_rgba(24,20,16,0.55)] md:flex-row md:items-center md:justify-between">







          <div className="space-y-2">







            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">







              Ala Pinheiro







            </p>







            <h1 className="text-3xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">







              Calendário dos Missionários







            </h1>







            <p className="text-sm text-[var(--muted)]">







              Clique em um período livre para







              marcar.







            </p>







          </div>







          <div className="flex flex-wrap items-center gap-3">







            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">







              Bem-vindo(a), {memberName}







            </span>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              onClick={() => {
                setIsMemberModalOpen(true);
                loadMemberEvents();
              }}
            >
              Meus agendamentos
            </button>
            {isAdminView ? (
              <button
                type="button"
                className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                onClick={() => router.push("/admin")}
              >
                Voltar ao painel
              </button>
            ) : null}







            <button







              type="button"







              className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              onClick={handleLogout}
            >







              Sair







            </button>







          </div>







        </header>















        <section className="space-y-6">







          <div className="space-y-6">







            <div className="flex flex-wrap gap-3 rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">







              <span className="inline-flex items-center gap-2">







                <span className="h-3 w-3 rounded-full bg-[#3ea96b]" />







                Livre







              </span>







              <span className="inline-flex items-center gap-2">







                <span className="h-3 w-3 rounded-full bg-[#f0b74a]" />







                Parcial







              </span>







              <span className="inline-flex items-center gap-2">







                <span className="h-3 w-3 rounded-full bg-[#e98536]" />







                Ocupado







              </span>







              <span className="inline-flex items-center gap-2">







                <span className="h-3 w-3 rounded-full bg-[#2a2a2a]" />







                Bloqueado







              </span>







            </div>















            {isLoadingEvents ? (







              <p className="text-sm text-[var(--muted)]">







                Carregando eventos...







              </p>







            ) : null}







            {eventsError ? (







              <p className="text-sm text-[#9b3a3a]">{eventsError}</p>







            ) : null}















            <div className="grid gap-6">







              {months.map((month, monthIndex) => {







                const days = buildDays(month, monthIndex, eventsByDate);







                return (







                  <section







                    key={`${month.name}-${month.year}`}







                    className="rounded-3xl border border-[var(--line)] bg-white/80 p-5 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]"







                  >







                    <div className="flex items-center justify-between">







                      <div>







                        <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">







                          {month.name} {month.year}







                        </h2>







                        <p className="text-xs text-[var(--muted)]">







                          Visão mensal







                        </p>







                      </div>







                      <span className="rounded-full border border-[var(--line)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">







                        {month.days} dias







                      </span>







                    </div>







                    <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-[var(--muted)]">







                      {weekDays.map((label) => (







                        <div key={label} className="text-center">







                          {label}







                        </div>







                      ))}







                    </div>







                    <div className="mt-3 grid grid-cols-7 gap-2">







                      {getLeadingBlanks(month.startsOn)}







                      {days.map((day) => {
                        const dateKey = formatDateKey(
                          month.year,
                          monthIndex,
                          day.day
                        );
                        const memberPhoneKey = memberPhone.trim();
                        const lunchPhoneKey = (day.lunchPhone || "").trim();
                        const dinnerPhoneKey = (day.dinnerPhone || "").trim();
                        const ownsLunch =
                          day.lunch !== "Livre" &&
                          memberPhoneKey &&
                          memberPhoneKey === lunchPhoneKey;
                        const ownsDinner =
                          day.dinner !== "Livre" &&
                          memberPhoneKey &&
                          memberPhoneKey === dinnerPhoneKey;
                        const lunchBusy = isUnbooking === `${dateKey}-almoço`;
                        const dinnerBusy = isUnbooking === `${dateKey}-janta`;
                        return (







                        <div







                          key={`${month.name}-${day.day}`}
                          role="button"
                          tabIndex={day.status === "blocked" ? -1 : 0}
                          aria-disabled={day.status === "blocked"}














                          className={`flex h-32 flex-col justify-between rounded-2xl border px-2 py-2 text-[12px] shadow-sm transition hover:scale-[1.01] hover:shadow-md sm:h-24 sm:text-[11px] ${statusStyles[day.status]} ${day.status === "blocked" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}







                          onClick={() => {
                            if (day.status === "blocked") {
                              return;
                            }
                            openModalForDay(month, monthIndex, day);
                          }}
                          onKeyDown={(event) => {
                            if (day.status === "blocked") {
                              return;
                            }
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openModalForDay(month, monthIndex, day);
                            }
                          }}







                        >







                          <span className="text-base font-semibold sm:text-sm">







                            {day.day}







                          </span>







                          {day.status === "blocked" ? (







                            <span className="text-[11px] font-semibold uppercase sm:text-[10px]">







                              {day.blockLabel}







                            </span>







                          ) : (







                            <div className="space-y-1.5 sm:space-y-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] sm:text-[10px]">
                                <div className="flex min-w-0 flex-1 items-center gap-1">
                                  <span className="inline-flex shrink-0 items-center gap-1">
                                    {day.lunch === "Livre" ? (
                                      <svg
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 sm:hidden"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                                      </svg>
                                    ) : null}
                                    <span className="sr-only">Almoço</span>
                                    <span className="hidden sm:inline">Almoço:</span>
                                  </span>
                                  <span className="hidden min-w-0 flex-1 truncate font-semibold sm:inline">
                                    {day.lunch}
                                  </span>
                                </div>
                                {ownsLunch ? (
                                  <button
                                    type="button"
                                    disabled={lunchBusy}
                                    className="hidden rounded-full border border-[var(--line)] bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:inline-flex sm:text-[9px] shrink-0"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleUnbook({
                                        dia: dateKey,
                                        periodo: "almoço",
                                      });
                                    }}
                                  >
                                    {lunchBusy ? "Aguarde..." : "Desmarcar"}
                                  </button>
                                ) : null}
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] sm:text-[10px]">
                                <div className="flex min-w-0 flex-1 items-center gap-1">
                                  <span className="inline-flex shrink-0 items-center gap-1">
                                    {day.dinner === "Livre" ? (
                                      <svg
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 sm:hidden"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                      </svg>
                                    ) : null}
                                    <span className="sr-only">Janta</span>
                                    <span className="hidden sm:inline">Janta:</span>
                                  </span>
                                  <span className="hidden min-w-0 flex-1 truncate font-semibold sm:inline">
                                    {day.dinner}
                                  </span>
                                </div>
                                {ownsDinner ? (
                                  <button
                                    type="button"
                                    disabled={dinnerBusy}
                                    className="hidden rounded-full border border-[var(--line)] bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:inline-flex sm:text-[9px] shrink-0"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleUnbook({
                                        dia: dateKey,
                                        periodo: "janta",
                                      });
                                    }}
                                  >
                                    {dinnerBusy ? "Aguarde..." : "Desmarcar"}
                                  </button>
                                ) : null}
                              </div>
                            </div>







                          )}







                        </div>







                      );
                      })}







                    </div>







                  </section>







                );







              })}







            </div>







          </div>















        </section>







        {isModalOpen && selectedDay ? (







          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-[2px]">







            <div







              role="dialog"







              aria-modal="true"







              aria-label="Marcar Refeição"







              className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[color:var(--card)] p-6 shadow-[0_24px_64px_-40px_rgba(24,20,16,0.6)]"







            >







              <h4 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">







                Marcar Refeição – {selectedDay.dateLabel}







              </h4>







              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">







                <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-3">







                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">







                    Nome







                  </p>







                  <p className="text-base font-semibold text-[var(--ink)]">







                    {memberName}







                  </p>







                </div>







                <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-3">







                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">







                    Telefone







                  </p>







                  <p className="text-base font-semibold text-[var(--ink)]">







                    {memberPhone}







                  </p>







                </div>







              </div>







              <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between gap-3">
                  <p>
                    Almoço:{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {selectedDay.lunch}
                    </span>
                  </p>
                  {ownsSelectedLunch ? (
                    <button
                      type="button"
                      disabled={modalLunchBusy}
                      className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                      onClick={() =>
                        handleUnbook({
                          dia: selectedDay.dateKey,
                          periodo: "almoço",
                        })
                      }
                    >
                      {modalLunchBusy ? "Aguarde..." : "Desmarcar"}
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p>
                    Jantar:{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {selectedDay.dinner}
                    </span>
                  </p>
                  {ownsSelectedDinner ? (
                    <button
                      type="button"
                      disabled={modalDinnerBusy}
                      className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                      onClick={() =>
                        handleUnbook({
                          dia: selectedDay.dateKey,
                          periodo: "janta",
                        })
                      }
                    >
                      {modalDinnerBusy ? "Aguarde..." : "Desmarcar"}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 space-y-2">







                <p className="text-sm font-semibold text-[var(--ink)]">







                  Selecionar Período:







                </p>







                <div className="grid grid-cols-2 gap-3">







                  <button







                    type="button"
                    disabled={selectedDay?.lunch !== "Livre"}







                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${







                      selectedPeriod === "lunch"







                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"







                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"







                    } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--line)] disabled:hover:text-[var(--muted)]`}







                    onClick={() => setSelectedPeriod("lunch")}







                  >







                    Almoço







                  </button>







                  <button







                    type="button"
                    disabled={selectedDay?.dinner !== "Livre"}







                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${







                      selectedPeriod === "dinner"







                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"







                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"







                    } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--line)] disabled:hover:text-[var(--muted)]`}







                    onClick={() => setSelectedPeriod("dinner")}







                  >







                    Jantar







                  </button>







                </div>







              </div>







              <div className="mt-5 flex flex-col gap-3 sm:flex-row">







                <button







                  type="button"







                  disabled={isSubmitting}







                  className={`flex-1 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}







                  onClick={handleConfirm}







                >







                  {isSubmitting ? "Confirmando..." : "Confirmar"}







                </button>







                <button







                  type="button"







                  className="flex-1 rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"







                  onClick={() => {







                    setIsModalOpen(false);







                    setModalError(null);







                  }}







                >







                  Cancelar







                </button>







              </div>
              {isSubmitting ? (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Enviando sua marcacao...
                </p>
              ) : null}







              <input type="hidden" value={selectedDay.timestamp} />







            </div>







          </div>







        ) : null}







        {isMemberModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-[2px]">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Meus agendamentos"
              className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[color:var(--card)] p-6 shadow-[0_24px_64px_-40px_rgba(24,20,16,0.6)]"
            >
              <h4 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
                Meus agendamentos
              </h4>

              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Nome
                  </p>
                  <p className="text-base font-semibold text-[var(--ink)]">
                    {memberName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                    Telefone
                  </p>
                  <p className="text-base font-semibold text-[var(--ink)]">
                    {memberPhone}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingMemberEvents ? (
                  <p className="text-sm text-[var(--muted)]">
                    Carregando eventos...
                  </p>
                ) : null}
                {memberEventsError ? (
                  <p className="text-sm text-[#9b3a3a]">{memberEventsError}</p>
                ) : null}
                {!isLoadingMemberEvents &&
                !memberEventsError &&
                memberEvents.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    Nenhum evento encontrado.
                  </p>
                ) : null}
                {memberEvents.length ? (
                  <div className="space-y-3">
                    {memberEvents.map((event, index) => {
                      const eventDateKey =
                        normalizeDateKey(event.dia) ??
                        String(event.dia || "").trim();
                      const periodValue = String(event.periodo || "")
                        .trim()
                        .toLowerCase();
                      const periodLabel = getPeriodLabel(event.periodo);
                      const busy =
                        isUnbooking === `${eventDateKey}-${periodValue}`;
                      const canUnbook = Boolean(eventDateKey && periodValue);
                      return (
                        <div
                          key={`${eventDateKey}-${periodValue}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 p-3"
                        >
                          <div>
                            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                              {periodLabel}
                            </p>
                            <p className="text-base font-semibold text-[var(--ink)]">
                              {formatEventDate(event.dia)}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!canUnbook || busy}
                            className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                            onClick={() =>
                              handleUnbook(
                                {
                                  dia: eventDateKey,
                                  periodo: periodValue,
                                },
                                {
                                  onError: setMemberEventsError,
                                  onSuccess: loadMemberEvents,
                                }
                              )
                            }
                          >
                            {busy ? "Aguarde..." : "Desmarcar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  onClick={loadMemberEvents}
                >
                  Atualizar
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setMemberEventsError(null);
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </main>







    </div>







  );







}







