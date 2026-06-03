import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refresh_token")
            : null;

        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refresh_token: refreshToken },
        );

        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
