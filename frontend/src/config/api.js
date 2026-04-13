const RAW_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export const buildApiUrl = (path = "") => {
    const normalizedPath = String(path).replace(/^\/+/, "");
    return normalizedPath ? `${API_BASE_URL}/${normalizedPath}` : API_BASE_URL;
};

export const SOCKET_URL = API_BASE_URL;
