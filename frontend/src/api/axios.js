import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : import.meta.env.VITE_API_URL + "/api";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {

    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;

let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes("/refresh-token") ||
      originalRequest?.url?.includes("/register");

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }


    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;


    const actorType = localStorage.getItem("actorType");

    const refreshEndpoint =
      actorType === "seller"
        ? "/v1/seller/refresh-token"
        : "/v1/user/refresh-token";

    try {
      await refreshAxios.post(refreshEndpoint);

      processQueue(null);
      return axiosInstance(originalRequest);

    } catch (refreshError) {

      processQueue(refreshError);


      localStorage.removeItem("actorType");
      localStorage.removeItem("userRole");


      const loginPath =
        actorType === "seller" ? "/seller/login" : "/login";
      window.location.href = loginPath;

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;


