import api from "../axiosInstance";

const healthService = {
  check: () => api.get("/v1/healthCheck"),
};

export default healthService;