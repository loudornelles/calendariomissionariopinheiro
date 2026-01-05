"use client";

import { useState } from "react";

export default function AdminPage() {
  const [blockType, setBlockType] = useState("P-Day");

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
          <button
            type="button"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Sair
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]">
            <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
              Bloquear data
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Defina datas especiais como P-Day ou Transferencia.
            </p>
            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Data
                </label>
                <input
                  type="date"
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
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)]"
              >
                Bloquear
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_64px_-48px_rgba(24,20,16,0.5)]">
            <h2 className="text-xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
              Lista de eventos
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Visualize e remova marcacoes de membros quando necessario.
            </p>
            <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              {[
                {
                  date: "12/03/2026",
                  period: "Almoco",
                  name: "Maria Fernandes",
                  phone: "11 99999-9999",
                },
                {
                  date: "15/03/2026",
                  period: "Jantar",
                  name: "Familia Souza",
                  phone: "11 98888-8888",
                },
                {
                  date: "20/03/2026",
                  period: "Almoco",
                  name: "Familia Rocha",
                  phone: "11 97777-7777",
                },
              ].map((item) => (
                <div
                  key={`${item.date}-${item.period}`}
                  className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/70 p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                      Data
                    </p>
                    <p className="text-base font-semibold text-[var(--ink)]">
                      {item.date} - {item.period}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                      Nome / Telefone
                    </p>
                    <p className="text-base font-semibold text-[var(--ink)]">
                      {item.name}
                    </p>
                    <p>{item.phone}</p>
                  </div>
                  <button
                    type="button"
                    className="h-11 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] md:w-24"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
