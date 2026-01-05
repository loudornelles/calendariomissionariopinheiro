"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      return;
    }
    localStorage.setItem("cm_nome", trimmedName);
    localStorage.setItem("cm_telefone", trimmedPhone);
    router.push("/calendario");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 right-[-140px] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f1b97e,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_30%_30%,#88c7a9,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <section className="grid w-full gap-10 rounded-3xl border border-[var(--line)] bg-[color:var(--card)] p-8 shadow-[0_32px_80px_-48px_rgba(24,20,16,0.55)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-6 animate-[float-in_900ms_ease-out_both]">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Ala Pinheiro
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl md:leading-[1.08] font-[var(--font-heading)]">
                  Calendário de Almoços e Jantas dos Missionários
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                  Organize as refeições com antecedência. Veja datas livres,
                  parciais ou ocupadas e marque seu almoço ou janta de forma
                  simples e transparente.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-1">
                  Calendário compartilhado
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-1">
                  Atualização em tempo real
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-6 text-sm text-[var(--muted)] animate-[fade-up_800ms_ease-out_200ms_both]">
              <p className="font-semibold text-[var(--ink)]">
                Como funciona
              </p>
              <p className="mt-3 leading-relaxed">
                Informe seu nome e telefone para acessar o calendário. Seus
                dados ficam salvos neste navegador para facilitar os próximos
                acessos. Você pode desmarcar apenas o que você marcou.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-8 animate-[fade-up_900ms_ease-out_120ms_both]">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[var(--ink)] font-[var(--font-heading)]">
                Acesse o calendário
              </h2>
              <p className="text-base text-[var(--muted)]">
                Informe seu nome e telefone para entrar.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Maria Fernandes"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)]"
              >
                Entrar
              </button>
              <button
                type="button"
                className="w-full rounded-2xl border border-[var(--line)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                Sou administrador
              </button>
            </form>
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-5 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--ink)]">
                Status das datas
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
