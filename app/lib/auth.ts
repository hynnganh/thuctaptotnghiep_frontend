export type RoleType = "USER" | "ADMIN" | "SUPER_ADMIN";

export const TOKEN_MAP = {
  USER: "token_user",
  ADMIN: "token_admin",
  SUPER_ADMIN: "token_super_admin",
};

export const getTokenByRole = (role?: RoleType) => {
  if (typeof window === "undefined") return null;

  if (role) {
    return localStorage.getItem(TOKEN_MAP[role]);
  }

  // auto fallback
  return (
    localStorage.getItem("token_user") ||
    localStorage.getItem("token_admin") ||
    localStorage.getItem("token_super_admin")
  );
};