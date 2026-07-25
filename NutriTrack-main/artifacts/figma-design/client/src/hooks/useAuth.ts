import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = import.meta.env.BASE_URL + "login";
  };

  return { user, loading: user === undefined, logout };
}
