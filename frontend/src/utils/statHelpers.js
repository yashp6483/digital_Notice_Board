export const getInitialNoticeStats = () => ({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0
});

export const calculateNoticeStats = (notices = []) => {
  return notices.reduce(
    (acc, notice) => {
      acc.total += 1;
      const status = String(notice.status || "").toLowerCase();
      if (status === "active") acc.active += 1;
      else if (status === "inactive") acc.inactive += 1;
      else if (status === "pending") acc.pending += 1;
      return acc;
    },
    getInitialNoticeStats()
  );
};

export const getInitialProfessorStats = () => ({
  total: 0,
  active: 0,
  inactive: 0
});

export const calculateProfessorStats = (professors = []) => {
  return professors.reduce(
    (acc, professor) => {
      acc.total += 1;
      const status = String(professor.status || "").toLowerCase();
      if (status === "active") acc.active += 1;
      else if (status === "inactive") acc.inactive += 1;
      return acc;
    },
    getInitialProfessorStats()
  );
};

// ✅ Initial Admin Stats
export const getInitialAdminStats = () => ({
  total: 0,
  active: 0,
  inactive: 0
});


// ✅ Calculate Admin Stats
export const calculateAdminStats = (admins = []) => {
  return admins.reduce(
    (acc, admin) => {
      acc.total += 1;

      const status = String(admin.status || "").toLowerCase();

      if (status === "active") acc.active += 1;
      else if (status === "inactive") acc.inactive += 1;

      return acc;
    },
    getInitialAdminStats()
  );
};
