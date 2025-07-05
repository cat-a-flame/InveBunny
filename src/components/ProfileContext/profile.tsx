"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type ProfileContextType = {
  username: string;
  setUsername: (name: string) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  username: "",
  setUsername: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ username, setUsername }}>
      {children}
    </ProfileContext.Provider>
  );
}
