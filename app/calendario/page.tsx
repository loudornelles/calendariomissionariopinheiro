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

function buildDays({ days }: MonthInfo): DayInfo[] {
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    if (day % 9 === 0) {
      return {
        day,
        status: "blocked",
        lunch: "Indisponível",
        dinner: "Indisponível",
        blockLabel: day % 18 === 0 ? "Transferência" : "P-Day",
      };
    }
    if (day % 5 === 0) {
      return {
        day,
        status: "full",
        lunch: "Família Souza",
        dinner: "Família Rocha",
      };
    }
    if (day % 3 === 0) {
      return {
        day,
        status: "partial",
        lunch: "Família Lima",
        dinner: "Livre",
      };
    }
    return {
      day,
      status: "free",
      lunch: "Livre",
      dinner: "Livre",
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
              Bem-vindo(a), visitante
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

            <div className="grid gap-6">
              {months.map((month) => {
                const days = buildDays(month);
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
                        <div
                          key={`${month.name}-${day.day}`}
                          className={`flex h-24 flex-col justify-between rounded-2xl border px-2 py-2 text-[11px] shadow-sm ${statusStyles[day.status]}`}
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
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
