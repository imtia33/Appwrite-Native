import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, getUserAvatar } from "@/appwrite/auth/auth";
import { useOrganizationStore } from "@/appwrite/store/organizationStore";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(true); // Default to true for now

  const { currentOrganization, organizations, fetchOrganizations, setCurrentOrganization } = useOrganizationStore();

  useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then(async (res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          const avatar = await getUserAvatar(res.name);
          setAvatarUrl(avatar);
          await fetchOrganizations();
        } else {
          setIsLogged(false);
          setUser(null);
          setAvatarUrl(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        avatarUrl,
        setAvatarUrl,
        loading,
        currentOrganization,
        organizations,
        setCurrentOrganization,
        isCloud,
        setIsCloud
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;