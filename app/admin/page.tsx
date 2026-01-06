"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  blockDate,
  bookEvent,
  getEvents,
  unblockDate,
  unbookEvent,
  type AppEvent,
} from "@/lib/appsScript";

const BLOCK_COLORS: Record<string, string> = {
  "P-Day": "#2a2a2a",
  Transferencia: "#e98536",
  Outro: "#6b7280",
};

export default function AdminPage() {
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [blockType, setBlockType] = useState("P-Day");
  const [blockDateValue, setBlockDateValue] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [bookingDateValue, setBookingDateValue] = useState("");
  const [bookingPeriod, setBookingPeriod] = useState<"almo\u00e7o" | "janta">(
    "almo\u00e7o"
  );
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isRemovingEvent, setIsRemovingEvent] = useState<string | null>(null);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const response = await getEvents();
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

  const handleBlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBlocking) {
      return;
    }
    const trimmedDate = blockDateValue.trim();
    const trimmedReason = blockReason.trim();
    const blockName = blockType === "Outro" ? trimmedReason : blockType;
    if (!trimmedDate || !blockName) {
      setBlockError("Informe a data e o motivo do bloqueio.");
      setBlockSuccess(null);
      return;
    }
    setIsBlocking(true);
    setBlockError(null);
    setBlockSuccess(null);
    try {
      const response = await blockDate({
        dia: trimmedDate,
        nome: blockName,
        cor: BLOCK_COLORS[blockType] ?? "#6b7280",
      });
      if (!response.ok) {
        setBlockError(response.error || "Falha ao bloquear a data.");
        return;
      }
      setBlockSuccess("Bloqueio aplicado com sucesso.");
      if (blockType === "Outro") {
        setBlockReason("");
      }
      setBlockDateValue("");
      await loadEvents();
    } catch (error) {
      setBlockError("Falha ao bloquear a data.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBooking) {
      return;
    }
    const trimmedDate = bookingDateValue.trim();
    const trimmedName = bookingName.trim();
    const trimmedPhone = bookingPhone.trim();
    if (!trimmedDate || !trimmedName || !trimmedPhone) {
      setBookingError("Informe data, nome e telefone.");
      setBookingSuccess(null);
      return;
    }
    const parsedDate = new Date(`${trimmedDate}T00:00:00`);
    const timestamp = Number.isNaN(parsedDate.getTime())
      ? undefined
      : parsedDate.toISOString();
    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const response = await bookEvent({
        dia: trimmedDate,
        periodo: bookingPeriod,
        nome: trimmedName,
        telefone: trimmedPhone,
        timestamp,
        admin: "admin",
      });
      if (!response.ok) {
        setBookingError(response.error || "Falha ao marcar a refeicao.");
        return;
      }
      setBookingSuccess("Marcacao realizada com sucesso.");
      setBookingDateValue("");
      setBookingName("");
      setBookingPhone("");
      await loadEvents();
    } catch (error) {
      setBookingError("Falha ao marcar a refeicao.");
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    const storedAdminName = localStorage.getItem("cm_admin_nome");
    const storedAdminPhone = localStorage.getItem("cm_admin_telefone");
    const storedAdminCall = localStorage.getItem("cm_admin_chamado");
    const isAdmin = Boolean(
      storedAdminName || storedAdminPhone || storedAdminCall
    );
    setIsAuthorized(isAdmin);
    setHasCheckedAuth(true);
    if (!isAdmin) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }
    loadEvents();
  }, [isAuthorized]);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeDateKey = (value: unknown) => {
    if (value instanceof Date) {
      return formatLocalDate(value);
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      return formatLocalDate(new Date(excelEpoch + value * 86400000));
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (brMatch) {
        const [, day, month, year] = brMatch;
        return `${year}-${month}-${day}`;
      }
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return formatLocalDate(parsed);
      }
      return trimmed;
    }
    return "";
  };

  const formatEventDate = (value: unknown) => {
    if (value instanceof Date) {
      return value.toLocaleDateString("pt-BR");
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      return new Date(excelEpoch + value * 86400000).toLocaleDateString("pt-BR");
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(`${trimmed}T00:00:00`).toLocaleDateString("pt-BR");
      }
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("pt-BR");
      }
      return trimmed;
    }
    return "";
  };

  const formatPeriodLabel = (value?: string) => {
    const period = (value || "").trim().toLowerCase();
    if (!period) {
      return "Bloqueio";
    }
    if (["almoco", "almoço"].includes(period)) {
      return "Almoco";
    }
    if (["janta", "jantar"].includes(period)) {
      return "Janta";
    }
    return value || "Outro";
  };

  const todayKey = formatLocalDate(new Date());
  const sortedEvents = [...events].sort((a, b) => {
    const aKey = normalizeDateKey(a.dia);
    const bKey = normalizeDateKey(b.dia);
    if (!aKey && !bKey) {
      return 0;
    }
    if (!aKey) {
      return 1;
    }
    if (!bKey) {
      return -1;
    }
    const aBucket = aKey < todayKey ? 1 : 0;
    const bBucket = bKey < todayKey ? 1 : 0;
    if (aBucket !== bBucket) {
      return aBucket - bBucket;
    }
    if (aKey !== bKey) {
      return aKey.localeCompare(bKey);
    }
    const aPeriod = String(a.periodo || "").toLowerCase();
    const bPeriod = String(b.periodo || "").toLowerCase();
    return aPeriod.localeCompare(bPeriod);
  });

  const handleRemove = async (eventItem: AppEvent, key: string) => {
    if (isRemovingEvent) {
      return;
    }
    const dia = normalizeDateKey(eventItem.dia);
    const periodo = String(eventItem.periodo || "").trim().toLowerCase();
    const telefone = String(eventItem.telefone || "").trim();
    setIsRemovingEvent(key);
    setEventsError(null);
    try {
    const isBlock = !telefone && (!periodo || periodo === "bloqueio");
      if (isBlock) {
        const adminNome =
          localStorage.getItem("cm_admin_nome")?.trim() || "";
        if (!dia || !adminNome) {
          setEventsError("Informe o login do admin para desbloquear.");
          return;
        }
        const response = await unblockDate({ dia, adminNome });
        if (!response.ok) {
          setEventsError(response.error || "Falha ao desbloquear.");
          return;
        }
      } else {
        if (!dia || !periodo || !telefone) {
          setEventsError("Nao foi possivel remover este item.");
          return;
        }
        const response = await unbookEvent({ dia, periodo, telefone });
        if (!response.ok) {
          setEventsError(response.error || "Falha ao remover.");
          return;
        }
      }
      await loadEvents();
    } catch (error) {
      setEventsError("Falha ao remover.");
    } finally {
      setIsRemovingEvent(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cm_admin_nome");
    localStorage.removeItem("cm_admin_chamado");
    localStorage.removeItem("cm_admin_telefone");
    router.push("/");
  };

  if (!hasCheckedAuth || !isAuthorized) {
    return null;
  }

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
              Painel Administrativo
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Gerencie bloqueios e eventos do calendario dos missionarios.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/calendario")}
              className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              Ver calendario
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]">
              <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
                Bloquear data
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Defina datas especiais como P-Day ou Transferencia.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleBlockSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Data
                  </label>
                  <input
                    type="date"
                    value={blockDateValue}
                    onChange={(event) => setBlockDateValue(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Tipo
                  </label>
                  <select
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                    value={blockType}
                    onChange={(event) => setBlockType(event.target.value)}
                  >
                    <option>P-Day</option>
                    <option>Transferencia</option>
                    <option>Outro</option>
                  </select>
                </div>
                {blockType === "Outro" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--ink)]">
                      Especificacao
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Reuniao especial"
                      value={blockReason}
                      onChange={(event) => setBlockReason(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                    />
                  </div>
                ) : null}
                {blockError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {blockError}
                  </p>
                ) : null}
                {blockSuccess ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {blockSuccess}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isBlocking}
                  className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBlocking ? "Bloqueando..." : "Bloquear"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]">
              <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
                Marcar refeição
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Registre um almoço ou janta manualmente.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleBookingSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Data
                  </label>
                  <input
                    type="date"
                    value={bookingDateValue}
                    onChange={(event) =>
                      setBookingDateValue(event.target.value)
                    }
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Periodo
                  </label>
                  <select
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                    value={bookingPeriod}
                    onChange={(event) =>
                      setBookingPeriod(
                        event.target.value === "janta" ? "janta" : "almo\u00e7o"
                      )
                    }
                  >
                    <option value="almo\u00e7o">Almoco</option>
                    <option value="janta">Janta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Familia Pereira"
                    value={bookingName}
                    onChange={(event) => setBookingName(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--ink)]">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={bookingPhone}
                    onChange={(event) => setBookingPhone(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
                {bookingError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {bookingError}
                  </p>
                ) : null}
                {bookingSuccess ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {bookingSuccess}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBooking ? "Marcando..." : "Marcar"}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]">
            <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
              Lista de eventos
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Visualize e remova marcacoes de membros quando necessario.
            </p>
            <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              {isLoadingEvents ? (
                <p className="text-sm text-[var(--muted)]">
                  Carregando eventos...
                </p>
              ) : null}
              {eventsError ? (
                <p className="text-sm text-[#9b3a3a]">{eventsError}</p>
              ) : null}
              {!isLoadingEvents && !eventsError && events.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Nenhum evento encontrado.
                </p>
              ) : null}
              {sortedEvents.map((item, index) => {
                const key = `${item.dia}-${item.periodo}-${index}`;
                const periodValue = String(item.periodo || "")
                  .trim()
                  .toLowerCase();
                const isBlockCard =
                  !String(item.telefone || "").trim() &&
                  (!periodValue || periodValue === "bloqueio");
                const isLunchCard = ["almoco", "almoço"].includes(periodValue);
                const isDinnerCard = ["janta", "jantar"].includes(periodValue);
                const cardTone = isBlockCard
                  ? "border-[#c6c6c6] bg-[#efefef]"
                  : isLunchCard
                    ? "border-[#e9d38f] bg-[#fff5cf]"
                    : isDinnerCard
                      ? "border-[#f2b48a] bg-[#ffe3cf]"
                      : "border-[var(--line)] bg-white/70";
                const hasRemoveData = Boolean(
                  normalizeDateKey(item.dia) &&
                    ((String(item.periodo || "").trim() &&
                      String(item.telefone || "").trim()) ||
                      !String(item.telefone || "").trim())
                );
                const isRemoving = isRemovingEvent === key;
                return (
                  <div
                    key={key}
                  className={`grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_1fr_auto] ${cardTone}`}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                      Data
                    </p>
                    <p className="text-base font-semibold text-[var(--ink)]">
                      {formatEventDate(item.dia)} -{" "}
                      {formatPeriodLabel(item.periodo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                      Nome / Telefone
                    </p>
                    <p className="text-base font-semibold text-[var(--ink)]">
                      {item.nome}
                    </p>
                    <p>{item.telefone || "Sem telefone"}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!hasRemoveData || isRemoving}
                    onClick={() => handleRemove(item, key)}
                    className="h-11 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70 md:w-24"
                  >
                    {isRemoving ? "Removendo..." : "Remover"}
                  </button>
                </div>
              );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
