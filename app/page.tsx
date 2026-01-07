"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { adminLogin } from "@/lib/appsScript";
import {
  DEFAULT_DDD,
  DDD_OPTIONS,
  formatPhoneInput,
  normalizePhone,
  normalizePhoneForRequest,
  PHONE_PLACEHOLDER,
} from "@/lib/phone";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneDdd, setPhoneDdd] = useState(DEFAULT_DDD);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPhoneDdd, setAdminPhoneDdd] = useState(DEFAULT_DDD);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const passwordMirrorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!passwordMirrorRef.current) {
      return;
    }
    if (passwordMirrorRef.current.value !== phone) {
      passwordMirrorRef.current.value = phone;
    }
  }, [phone]);

  const syncPhoneFromMirror = () => {
    const mirrorValue = passwordMirrorRef.current?.value ?? "";
    if (mirrorValue && mirrorValue !== phone) {
      setPhone(formatPhoneInput(mirrorValue));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const mirrorPhone = passwordMirrorRef.current?.value || phone;
    const formattedPhone = normalizePhone(phoneDdd, mirrorPhone);
    if (!trimmedName || !formattedPhone) {
      return;
    }
    localStorage.removeItem("cm_admin_nome");
    localStorage.removeItem("cm_admin_chamado");
    localStorage.removeItem("cm_admin_telefone");
    localStorage.setItem("cm_nome", trimmedName);
    localStorage.setItem("cm_telefone", formattedPhone);
    router.push("/calendario");
  };

  const handleAdminClose = () => {
    setIsAdminModalOpen(false);
    setAdminPassword("");
    setAdminError("");
  };

  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedPhone = normalizePhone(adminPhoneDdd, adminPhone);
    const trimmedPassword = adminPassword.trim();
    if (!formattedPhone || !trimmedPassword) {
      setAdminError("Informe telefone e senha.");
      return;
    }
    setIsAdminSubmitting(true);
    setAdminError("");
    try {
      const response = await adminLogin({
        telefone: formattedPhone,
        senha: trimmedPassword,
      });
      if (!response.ok) {
        setAdminError("Telefone ou senha invalida.");
        return;
      }
      if (response.admin) {
        localStorage.setItem("cm_admin_nome", response.admin.nome);
        localStorage.setItem("cm_admin_chamado", response.admin.chamado);
        localStorage.setItem(
          "cm_admin_telefone",
          normalizePhoneForRequest(response.admin.telefone) || formattedPhone
        );
      }
      handleAdminClose();
      router.push("/admin");
    } catch (error) {
      console.error(error);
      setAdminError("Nao foi possivel entrar. Tente novamente.");
    } finally {
      setIsAdminSubmitting(false);
    }
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
                Informe seu nome e telefone para acessar o calendário. Você pode desmarcar apenas refeições que você marcou.
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
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              autoComplete="on"
            >
              <div className="space-y-2">
                <label
                  htmlFor="calendar-username"
                  className="text-sm font-semibold text-[var(--ink)]"
                >
                  Nome completo
                </label>
                <input
                  type="text"
                  id="calendar-username"
                  name="username"
                  autoComplete="username"
                  placeholder="Ex.: Maria Fernandes"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="calendar-password"
                  className="text-sm font-semibold text-[var(--ink)]"
                >
                  Telefone (WhatsApp)
                </label>
                <div className="flex gap-3">
                  <select
                    aria-label="DDD"
                    value={phoneDdd}
                    onChange={(event) => setPhoneDdd(event.target.value)}
                    className="w-24 rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {DDD_OPTIONS.map((ddd) => (
                      <option key={ddd} value={ddd}>
                        {ddd}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="calendar-password"
                    name="password-visible"
                    autoComplete="current-password"
                    inputMode="numeric"
                    placeholder={PHONE_PLACEHOLDER}
                    value={phone}
                    onFocus={syncPhoneFromMirror}
                    onChange={(event) =>
                      setPhone(formatPhoneInput(event.target.value))
                    }
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                  <input
                    ref={passwordMirrorRef}
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    onInput={syncPhoneFromMirror}
                    tabIndex={-1}
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)]"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminError("");
                  setIsAdminModalOpen(true);
                }}
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
      {isAdminModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleAdminClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
            className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[0_32px_80px_-48px_rgba(24,20,16,0.6)]"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Area administrativa
              </p>
              <h2
                id="admin-login-title"
                className="text-2xl font-semibold text-[var(--ink)] font-[var(--font-heading)]"
              >
                Login do administrador
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Use seu telefone e senha para acessar o painel.
              </p>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleAdminSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Telefone
                </label>
                <div className="flex gap-3">
                  <select
                    aria-label="DDD"
                    value={adminPhoneDdd}
                    onChange={(event) => setAdminPhoneDdd(event.target.value)}
                    className="w-24 rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {DDD_OPTIONS.map((ddd) => (
                      <option key={ddd} value={ddd}>
                        {ddd}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder={PHONE_PLACEHOLDER}
                    value={adminPhone}
                    onChange={(event) =>
                      setAdminPhone(formatPhoneInput(event.target.value))
                    }
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              {adminError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {adminError}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isAdminSubmitting}
                  className="flex-1 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(33,87,70,0.9)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAdminSubmitting ? "Entrando..." : "Entrar"}
                </button>
                <button
                  type="button"
                  onClick={handleAdminClose}
                  className="flex-1 rounded-2xl border border-[var(--line)] bg-transparent px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
