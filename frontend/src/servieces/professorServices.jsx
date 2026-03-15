import { formatDate } from "./noticeServices";

export const fetchProfessor = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

    const res = await fetch("http://localhost:5000/admin/professors", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await res.json()
    console.log(data);
    if (!res.ok) {
        const error = new Error(data.message || data.err || "Failed to fetch notices");
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