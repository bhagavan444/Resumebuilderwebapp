import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const formattedUser = {
          name: user.displayName || user.email?.split("@")[0],
          email: user.email,
          uid: user.uid,
          photo: user.photoURL,
        };
        setCurrentUser(formattedUser);
        localStorage.setItem("user", JSON.stringify(formattedUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use in components
export const useAuth = () => useContext(AuthContext);
