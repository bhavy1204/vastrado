import api from "../axios.js";

const healthService = {
  check: () => api.get("/v1/healthCheck"),
};

export default healthService;