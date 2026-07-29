import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.API_URL ?? "http://localhost:8000/api",
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/refresh"];

const isPublicEndpoint = (url?: string) =>
  PUBLIC_ENDPOINTS.some((ep) => (url ?? "").includes(ep));

api.interceptors.request.use((config) => {
  if (!isPublicEndpoint(config.url)) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

const doRefresh = async () => {
  const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
  useAuthStore.setState({ accessToken: data.accessToken });
  return data.accessToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isPublicEndpoint(original.url)
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return api(original);
      } catch {
        const { role, hydrated } = useAuthStore.getState();
        if (hydrated && role) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    }

    if (status === 401 && original && isPublicEndpoint(original.url)) {
      const { role, hydrated } = useAuthStore.getState();
      if (hydrated && role) {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;