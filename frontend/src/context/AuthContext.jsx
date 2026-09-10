import { createContext, useContext } from "react";

// 1. Create the base context
const AuthContext = createContext(null);

// 2. Create the hook to consume the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider.");
  return context;
};

export default AuthContext;
