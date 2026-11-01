import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);
const storedUser = () => {
  try { return JSON.parse(localStorage.getItem("lsh_user")) || null; } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const signIn = (account, token) => {
    localStorage.setItem("lsh_user", JSON.stringify(account));
    localStorage.setItem("lsh_token", token);
    setUser(account);
  };
  const signOut = () => {
    localStorage.removeItem("lsh_user");
    localStorage.removeItem("lsh_token");
    setUser(null);
  };
  const refreshSession = async () => {
    try {
      const { user: freshUser } = await api("/auth/me");
      localStorage.setItem("lsh_user", JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (error) {
      signOut();
      throw error;
    }
  };
  useEffect(() => {
    if (!localStorage.getItem("lsh_token")) return;
    refreshSession().catch(() => {});
  }, []);
  return <AuthContext.Provider value={{ user, signIn, signOut, refreshSession }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
