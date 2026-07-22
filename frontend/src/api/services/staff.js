import api from "../axios.js";

const BASE = "/v1/staff";

const staffService = {
    login: (data) =>
        api.post(`${BASE}/login`, data),

    logout: () =>
        api.post(`${BASE}/logout`),

    refreshToken: () =>
        api.post(`${BASE}/refresh-token`),

    getProfile: () =>
        api.get(`${BASE}/profile`),
};

export default staffService;

