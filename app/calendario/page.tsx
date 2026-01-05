"use client";















import { useEffect, useMemo, useState } from "react";







import { bookEvent, getEvents, type AppEvent } from "../../lib/appsScript";















const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];















type DayInfo = {







  day: number;







  status: "free" | "partial" | "full" | "blocked";







  lunch: string;







  dinner: string;







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















    for (const event of dayEvents) {







      const period = (event.periodo || "").toLowerCase();







      const isLunch = ["almoco", "almoço"].includes(period);







      const isDinner = ["janta", "jantar"].includes(period);















      if (isLunch) {







        lunch = event.nome || "Ocupado";







      } else if (isDinner) {







        dinner = event.nome || "Ocupado";







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







      dinner,







    };







  });







}























function getLeadingBlanks(startsOn: number) {







  return Array.from({ length: startsOn }, (_, index) => (







    <div







      key={`blank-${index}`}







      className="h-24 rounded-2xl border border-dashed border-[var(--line)] bg-white/40"







    />







  ));







}















export default function CalendarioPage() {







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







  const [eventsError, setEventsError] = useState<string | null>(null);







  const [isLoadingEvents, setIsLoadingEvents] = useState(false);







  const [isSubmitting, setIsSubmitting] = useState(false);







  const [modalError, setModalError] = useState<string | null>(null);















  useEffect(() => {







    const storedName = localStorage.getItem("cm_nome");







    const storedPhone = localStorage.getItem("cm_telefone");







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







              Último mês + próximos 5 meses. Clique em um período livre para







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







                      {days.map((day) => (







                        <button







                          key={`${month.name}-${day.day}`}







                          type="button"







                          className={`flex h-24 flex-col justify-between rounded-2xl border px-2 py-2 text-[11px] shadow-sm transition hover:scale-[1.01] hover:shadow-md ${statusStyles[day.status]} ${day.status === "blocked" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}







                          onClick={() =>







                            day.status === "blocked"







                              ? null







                              : openModalForDay(month, monthIndex, day)







                          }







                        >







                          <span className="text-sm font-semibold">







                            {day.day}







                          </span>







                          {day.status === "blocked" ? (







                            <span className="text-[10px] font-semibold uppercase">







                              {day.blockLabel}







                            </span>







                          ) : (







                            <div className="space-y-1">







                              <div className="text-[10px]">







                                Almoço:{" "}







                                <span className="font-semibold">







                                  {day.lunch}







                                </span>







                              </div>







                              <div className="text-[10px]">







                                Janta:{" "}







                                <span className="font-semibold">







                                  {day.dinner}







                                </span>







                              </div>







                            </div>







                          )}







                        </button>







                      ))}







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







                <p>







                  Almoço:{" "}







                  <span className="font-semibold text-[var(--ink)]">







                    {selectedDay.lunch}







                  </span>







                </p>







                <p>







                  Jantar:{" "}







                  <span className="font-semibold text-[var(--ink)]">







                    {selectedDay.dinner}







                  </span>







                </p>







              </div>







              <div className="mt-4 space-y-2">







                <p className="text-sm font-semibold text-[var(--ink)]">







                  Selecionar Período:







                </p>







                <div className="grid grid-cols-2 gap-3">







                  <button







                    type="button"







                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${







                      selectedPeriod === "lunch"







                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"







                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"







                    }`}







                    onClick={() => setSelectedPeriod("lunch")}







                  >







                    Almoço







                  </button>







                  <button







                    type="button"







                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${







                      selectedPeriod === "dinner"







                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"







                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"







                    }`}







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







      </main>







    </div>







  );







}







