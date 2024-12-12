import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/router";

// User context to hold user data and manage login state
interface User {
  id: number;
  username: string;
  role: string; // 'admin', 'staff', or 'user'
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  fetchUser: () => void;
  logout: () => void;
  login: (username: string, password: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

// Context provider to manage user data and login/logout functionality
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch the logged-in user's details (if any)
  const fetchUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    // Skip if no token exists (user isn't logged in)
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      setUser({
        id: data.id,
        username: data.username,
        role: data.role, // Ensure this is set properly
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null); // Clear user on error
    } finally {
      setLoading(false);
    }
  };

  // Handle user login (set token and fetch user data)
  const login = async (username: string, password: string) => {
    const response = await fetch("http://127.0.0.1:5000/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token); // Store the token
      fetchUser(); // Fetch the user's profile data after logging in
    } else {
      console.error("Login failed:", data.error);
    }
  };

  // Logout function to clear user and token
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login"); // Redirect to login page
  };

  useEffect(() => {
    fetchUser(); // Automatically fetch user data when the component mounts
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, fetchUser, logout, login }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context in other components
export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
