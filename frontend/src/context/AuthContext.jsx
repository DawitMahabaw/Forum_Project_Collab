import { createContext, useContext,useState} from "react";
import { loginUser, registerUser } from "../services/authService.js";
import { getToken, removeToken, saveToken } from "../utils/auth.js";

// 1. Create the base context
const AuthContext = createContext(null);

// 2. Create the hook to consume the context easily

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  const [isInitializing, setIsInitializing] = useState(true); // Left true for step 3 initialization

  const register = async (userData) => await registerUser(userData);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setUser(response.user);
    setToken(response.token);
    saveToken(response.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeToken();
  };

  const value = {
    user,
    token,
    isInitializing,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider.");
  return context;
};
