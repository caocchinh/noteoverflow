"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

type AuthData = typeof authClient.$Infer.Session;

interface AuthContextType {
  session: AuthData | undefined | null;
  user: AuthData["user"] | undefined | null;
  isAuthenticated: boolean;
  isSessionPending: boolean;
  isSessionFetching: boolean;
  isSessionLoading: boolean;
  isSessionError: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    data: session,
    isPending: isSessionPending,
    isLoading: isSessionLoading,
    isError: isSessionError,
    isFetching: isSessionFetching,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
    retry: 3,
  });

  const isAuthenticated = !!session?.data?.session;
  const user = session?.data?.user;
  const sessionData = session?.data;

  const value: AuthContextType = {
    session: sessionData,
    user,
    isAuthenticated,
    isSessionPending,
    isSessionLoading,
    isSessionError,
    isSessionFetching,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
