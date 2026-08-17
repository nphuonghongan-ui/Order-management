import type { GoogleButtonOptions, GoogleCredentialResponse, GoogleInitializeConfig, GooglePromptMomentNotification } from "./types";

const GIS_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

type GoogleAccountsId = {
  initialize: (config: GoogleInitializeConfig) => void;
  prompt: (momentListener?: (notification: GooglePromptMomentNotification) => void) => void;
  cancel: () => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleButtonOptions,
  ) => void;
  disableAutoSelect: () => void;
  store: {
    get: () => Promise<GoogleCredentialResponse | null>;
    cancel: () => void;
  };
};

type GoogleAccounts = {
  id: GoogleAccountsId;
};

type GoogleWindow = typeof window & {
  google?: { accounts: GoogleAccounts };
};

export const isGoogleReady = (): boolean => {
  const w = window as GoogleWindow;
  return Boolean(w.google?.accounts?.id);
};

const loadGisScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const w = window as GoogleWindow;
    if (w.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

let initialized = false;
let currentClientId: string | null = null;

export const initGoogleAccounts = async (
  clientId: string,
  callback: (response: GoogleCredentialResponse) => void,
  options: Omit<GoogleInitializeConfig, "client_id" | "callback"> = {},
): Promise<void> => {
  await loadGisScript();
  const w = window as GoogleWindow;
  const id = w.google?.accounts?.id;
  if (!id) {
    throw new Error("Google Identity Services is not available");
  }
  if (initialized && currentClientId === clientId) {
    return;
  }
  id.initialize({ client_id: clientId, callback, ...options });
  initialized = true;
  currentClientId = clientId;
};

export const promptGoogleOneTap = (
  momentListener?: (n: GooglePromptMomentNotification) => void,
): void => {
  const w = window as GoogleWindow;
  w.google?.accounts?.id.prompt(momentListener);
};

export const cancelGoogleOneTap = (): void => {
  const w = window as GoogleWindow;
  w.google?.accounts?.id.cancel();
};

export const renderGoogleButton = (
  parent: HTMLElement,
  options: GoogleButtonOptions,
): void => {
  const w = window as GoogleWindow;
  w.google?.accounts?.id.renderButton(parent, options);
};

export const getStoredGoogleCredential = (): Promise<GoogleCredentialResponse | null> => {
  const w = window as GoogleWindow;
  if (!w.google?.accounts?.id) return Promise.resolve(null);
  return w.google.accounts.id.store.get();
};
