export type AppEvent = {
  dia: string;
  periodo: string;
  nome: string;
  telefone: string;
  cor?: string;
  timestamp?: string;
};

type ApiResponse<T> = {
  ok: boolean;
  error?: string;
} & T;

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? "";

function requireBaseUrl() {
  if (!BASE_URL) {
    throw new Error("Apps Script URL not configured.");
  }
  return BASE_URL;
}

async function callAppsScript<T>(
  action: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const url = new URL(requireBaseUrl());
  url.searchParams.set("action", action);
  const response = await fetch(url.toString(), init);
  return response.json();
}

function toFormBody(payload: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    params.set(key, value);
  });
  return params;
}

export async function getEvents(start?: string, end?: string) {
  const url = new URL(requireBaseUrl());
  url.searchParams.set("action", "events");
  if (start) {
    url.searchParams.set("start", start);
  }
  if (end) {
    url.searchParams.set("end", end);
  }
  const response = await fetch(url.toString(), { cache: "no-store" });
  return response.json() as Promise<ApiResponse<{ events: AppEvent[] }>>;
}

export async function getByMember(payload: { nome: string; telefone: string }) {
  const url = new URL(requireBaseUrl());
  url.searchParams.set("action", "getByMember");
  url.searchParams.set("nome", payload.nome);
  url.searchParams.set("telefone", payload.telefone);
  const response = await fetch(url.toString(), { cache: "no-store" });
  return response.json() as Promise<ApiResponse<{ events: AppEvent[] }>>;
}

export async function bookEvent(payload: {
  dia: string;
  periodo: string;
  nome: string;
  telefone: string;
  timestamp?: string;
}) {
  return callAppsScript<{}>("book", {
    method: "POST",
    body: toFormBody({
      dia: payload.dia,
      periodo: payload.periodo,
      nome: payload.nome,
      telefone: payload.telefone,
      timestamp: payload.timestamp,
    }),
  });
}

export async function unbookEvent(payload: {
  dia: string;
  periodo: string;
  telefone: string;
}) {
  return callAppsScript<{}>("unbook", {
    method: "POST",
    body: toFormBody({
      dia: payload.dia,
      periodo: payload.periodo,
      telefone: payload.telefone,
    }),
  });
}

export async function adminLogin(payload: { telefone: string; senha: string }) {
  return callAppsScript<{
    admin?: { nome: string; chamado: string; telefone: string };
  }>("admin/login", {
    method: "POST",
    body: toFormBody({
      telefone: payload.telefone,
      senha: payload.senha,
    }),
  });
}

export async function blockDate(payload: {
  dia: string;
  periodo: string;
  nome: string;
  cor: string;
}) {
  return callAppsScript<{}>("block-date", {
    method: "POST",
    body: toFormBody({
      dia: payload.dia,
      periodo: payload.periodo,
      nome: payload.nome,
      cor: payload.cor,
    }),
  });
}
