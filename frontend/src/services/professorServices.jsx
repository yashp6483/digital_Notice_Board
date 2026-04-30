import { formatDate } from "./noticeServices";
import { buildApiUrl } from "../config/api";

export const fetchProfessor = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

    const res = await fetch(buildApiUrl("admin/professors"), {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await res.json()
    if (!res.ok) {
        const error = new Error(data.message || data.err || "Failed to fetch professor");
        error.status = res.status;
        throw error;
    }
    return data.professors || [];
}

export const mapProfessorForTable = (professor) => ({
    ...professor,
    name: professor.name,
    dept: professor.department,
    email: professor.email,
    birthdate: formatDate(professor.birthdate), 
    phone: professor.phone,
    status: professor.status === "inactive" ? "Inactive" : "Active"
})

export const deleteProfessor = async (id) => {
    const token = localStorage.getItem("token")
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }
    const res = await fetch(buildApiUrl(`admin/professor/delete/${id}`), {
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

export const updateProfessor = async (id, formData) => {
    const token = localStorage.getItem("token");

    const res = await fetch(buildApiUrl(`admin/professor/update/${id}`), {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Update professor failed");
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
    const source = payload?.professor || payload?.user || payload?.profile || payload || {};
    return {
        id: source._id || source.id || "",
        name: source.name || localStorage.getItem("name") || "",
        email: source.email || localStorage.getItem("email") || "",
        phone: source.phone || "",
        department: source.department || "",
        birthdate: source.birthdate || "",
        status: source.status || "active"
    };
};

export const getProfessorProfile = async () => {
    const headers = getAuthHeader();
    const res = await fetch(buildApiUrl("admin/professor/profile"), { headers });
    const data = await res.json();

    if (!res.ok) {
        throwApiError(res, data, "Failed to fetch profile");
    }

    return normalizeProfile(data);
};

export const updateProfessorProfile = async (formData) => {
    const headers = {
        ...getAuthHeader(),
        "Content-Type": "application/json"
    };

    const payload = {
        ...formData,
        status: formData.status || "active"
    };

    const res = await fetch(buildApiUrl("admin/professor/profile"), {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
        throwApiError(res, data, "Profile update failed");
    }

    return data;
};
