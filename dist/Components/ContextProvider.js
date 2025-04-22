import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect, useContext, } from "react";
import axios from "axios";
import { BASE_URL } from "../lib/constants";
import { handleApiError } from "../api/user";
const UserContext = createContext(undefined);
// The ContextProvider component
export const ContextProvider = ({ children, }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/notification/all`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            const data = res.data;
            if (data.success) {
                setNotifications(data.data);
            }
        }
        catch (error) {
            handleApiError(error);
        }
    };
    const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/user/me`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            setUser(response.data.data);
        }
        catch (err) {
            setError(err.message || "Failed to fetch user data.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
        fetchUser();
    }, []);
    console.log(user);
    return (_jsx(UserContext.Provider, { value: {
            user,
            loading,
            setUser,
            error,
            refresh: fetchUser,
            onlineUsers,
            setOnlineUsers,
            notifications,
            setNotifications,
        }, children: children }));
};
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a ContextProvider");
    }
    return context;
};
