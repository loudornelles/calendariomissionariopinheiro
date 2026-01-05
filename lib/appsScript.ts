export type AppEvent = {
  data: string;
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

export async function bookEvent(payload: {
  data: string;
  periodo: string;
  nome: string;
  telefone: string;
  timestamp?: string;
}) {
  return callAppsScript<{}>("book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function unbookEvent(payload: {
  data: string;
  periodo: string;
  telefone: string;
}) {
  return callAppsScript<{}>("unbook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function adminLogin(payload: {
  telefone: string;
  senha: string;
}) {
  return callAppsScript<{}>("admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function blockDate(payload: {
  data: string;
  motivo: string;
}) {
  return callAppsScript<{}>("block-date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
