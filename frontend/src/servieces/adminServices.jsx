import { formatDate } from "./noticeServices";

const BASE_URL = "/admin";


// ✅ Get All Admins
export const fetchAdmins = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

    const res = await fetch(`${BASE_URL}/admins`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Failed to fetch admins");
        error.status = res.status;
        throw error;
    }

    return data.admins || [];
};

export const mapAdminForTable = (admin) => ({
    ...admin,
    name: admin.name,
    email: admin.email,
    role: admin.role || "Admin",
    createdAt: admin.createdAt ? formatDate(admin.createdAt) : "",
    status: admin.status === "inactive" ? "Inactive" : "Active"
});

export const deleteAdmin = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

    const res = await fetch(`${BASE_URL}/delete/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Delete failed");
        error.status = res.status;
        throw error;
    }

    return data;
};

export const addAdmin = async (formData) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/addAdmin`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Add admin failed");
        error.status = res.status;
        throw error;
    }

    return data;
};

export const updateAdmin = async (id, formData) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/update/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Update failed");
        error.status = res.status;
        throw error;
    }

    return data;
};

const throwApiError = (res, data, fallbackMessage) => {
    const error = new Error(data?.message || fallbackMessage);
    error.status = res.status;
    throw error;
};

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }
    return { Authorization: `Bearer ${token}` };
};

const normalizeProfile = (payload) => {
    const source = payload?.admin || payload?.user || payload?.profile || payload || {};
    return {
        id: source._id || source.id || localStorage.getItem("id") || "",
        name: source.name || localStorage.getItem("name") || "",
        email: source.email || localStorage.getItem("email") || "",
        phone: source.phone || "",
        department: source.department || "",
        birthdate: source.birthdate || "",
        status: source.status || "active"
    };
};

export const getAdminProfile = async () => {
    const headers = getAuthHeader();

    const endpoints = [`${BASE_URL}/profile`, `${BASE_URL}/me`];
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(endpoint, { headers });
            const data = await res.json();
            if (!res.ok) {
                throwApiError(res, data, "Failed to fetch profile");
            }
            return normalizeProfile(data);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Failed to fetch profile");
};

export const updateAdminProfile = async (formData) => {
    const headers = {
        ...getAuthHeader(),
        "Content-Type": "application/json"
    };

    const payload = {
        ...formData,
        status: formData.status || "active"
    };

    const endpoints = [`${BASE_URL}/profile`, `${BASE_URL}/profile/update`];
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                throwApiError(res, data, "Profile update failed");
            }
            return data;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Profile update failed");
};
