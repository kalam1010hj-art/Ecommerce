import { createContext, useState } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user ,setUser] = useState(()=>{
    let storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null;
  })

  const login = (token,user) => {
    setToken(token);
    setUser(user)
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!token;
  console.log("Authprovider rendered!")
  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;