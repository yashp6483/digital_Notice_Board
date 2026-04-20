import { API_BASE_URL, buildApiUrl } from "../config/api";

export const fetchNotice = async () => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role");
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

    const res = await fetch(buildApiUrl(`${role}/notices`), {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await res.json()

    if (!res.ok) {
        const error = new Error(data.message || data.err || "Failed to fetch notices");
        error.status = res.status;
        throw error;
    }
    return data.notices || [];
}

export const mapNoticeForTable = (notice) => ({
    ...notice,
    displayDocumentUrl: resolveDocumentUrl(
        notice.documentUrl ||
        notice.document?.url ||
        notice.fileUrl ||
        notice.attachmentUrl ||
        notice.document
    ),
    displayPublishedAt: formatDate(notice.publishedAt),
    professor: notice.createdBy?.name || notice.professor || "-",
    displayStatus: notice.status === "inactive" ? "Inactive" : (notice.status === "scheduled" ? "Scheduled" : "Active")
})

export const resolveDocumentUrl = (value) => {
    if (!value || typeof value !== "string") return null;

    const url = value.trim().replace(/\\/g, "/");
    if (!url) return null;

    // Local absolute Windows paths are not browser-accessible URLs.
    if (/^[A-Za-z]:\//.test(url)) return null;

    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("//")) return `${window.location.protocol}${url}`;
    if (url.startsWith("/")) return `${API_BASE_URL}${url}`;

    return `${API_BASE_URL}/${url}`;
};

export const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");   // ✅ 01–31
    const month = String(date.getMonth() + 1).padStart(2, "0"); // ✅ 01–12
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const deleteNotice = async (id) => {
    const token = localStorage.getItem("token")
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }
    const res = await fetch(buildApiUrl(`admin/notice/delete/${id}`), {
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

export const updateNotice = async (id, formData) => {
    const token = localStorage.getItem("token");

    const res = await fetch(buildApiUrl(`admin/notice/update/${id}`), {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Update failed");
        error.status = res.status;
        throw error;
    }

    return data;
};

// services/noticeServices.js
export const fetchMyNotice = async () => {
    const role = localStorage.getItem("role");
    const res = await fetch(buildApiUrl(`${role}/my-notices`), {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch notices");
    }

    return res.json();
};

export const fetchPublicNotices = async () => {
    const res = await fetch(buildApiUrl("admin/notice"));

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || "Failed to fetch notices");
        error.status = res.status;
        throw error;
    }

    return data.notices || [];
};
