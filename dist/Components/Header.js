import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Search, Bell, Settings, User, LogOut, ChevronDown, Timer, Play, Square, Coffee, } from "lucide-react";
import { useUserContext } from "./ContextProvider";
import { logout } from "../api/user";
import { Avatar } from "@mui/material";
import { Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { clockIn, clockOut, endBreak, startBreak } from "../api/shift";
import axios from "axios";
import { BASE_URL } from "../lib/constants";
import toast from "react-hot-toast";
export function countUnreadNotifications(notifications) {
    return notifications?.filter((notification) => !notification.read).length;
}
const Header = () => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [_currentShift, setCurrentShift] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user, notifications, setUser } = useUserContext();
    const fetchCurrentShift = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/shift/current-shift`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success && res.data.data) {
                const { shift, clockedIn, workDuration, breaks } = res.data.data;
                setCurrentShift(shift);
                setIsClockedIn(clockedIn);
                // If user is clocked in, calculate the proper elapsed time
                if (clockedIn) {
                    // Convert workDuration from minutes to seconds
                    const serverTimeInSeconds = workDuration * 60 || 0;
                    // Set elapsed time from server or calculate it
                    if (shift?.clockInTime) {
                        const clockInTime = new Date(shift.clockInTime).getTime();
                        const now = new Date().getTime();
                        let calculatedSeconds = Math.floor((now - clockInTime) / 1000);
                        // Subtract durations of completed breaks
                        if (breaks && breaks.length > 0) {
                            const breakDuration = breaks.reduce((total, breakItem) => {
                                if (breakItem.endTime && breakItem.startTime) {
                                    // For completed breaks
                                    return total + Math.floor((new Date(breakItem.endTime).getTime() -
                                        new Date(breakItem.startTime).getTime()) / 1000);
                                }
                                return total;
                            }, 0);
                            calculatedSeconds -= breakDuration;
                        }
                        // Use the larger of server or calculated time to prevent jumps
                        setElapsedTime(Math.max(serverTimeInSeconds, calculatedSeconds));
                    }
                    else {
                        setElapsedTime(serverTimeInSeconds);
                    }
                }
                else {
                    setElapsedTime(0);
                }
                // Check if on break by examining the last break entry
                if (breaks && breaks.length > 0) {
                    const lastBreak = breaks[breaks.length - 1];
                    setIsOnBreak(lastBreak && !lastBreak.endTime);
                }
                else {
                    setIsOnBreak(false);
                }
                setError("");
            }
        }
        catch (err) {
            if (err.response && err.response.status === 404) {
                // 404 means no active shift – clear the active state
                setCurrentShift(null);
                setIsClockedIn(false);
                setElapsedTime(0);
                setIsOnBreak(false);
                setError("");
            }
            else {
                setError("Failed to fetch shift status");
                console.error("Shift fetch error:", err);
            }
        }
    };
    useEffect(() => {
        // Fetch shift data when component mounts
        if (user) {
            fetchCurrentShift();
        }
    }, [user]);
    // Timer effect that only runs when clocked in and not on break
    useEffect(() => {
        let timer;
        if (isClockedIn && !isOnBreak) {
            timer = window.setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) {
                window.clearInterval(timer);
            }
        };
    }, [isClockedIn, isOnBreak]);
    const handleClockInOut = async () => {
        try {
            if (!isClockedIn) {
                toast.loading("Clocking in...");
                const shiftData = await clockIn();
                toast.dismiss();
                if (shiftData?.success) {
                    toast.success("Successfully clocked in");
                    await fetchCurrentShift();
                    setUser({ ...user, clockedIn: true });
                }
            }
            else {
                toast.loading("Clocking out...");
                const res = await clockOut();
                toast.dismiss();
                toast.success("Successfully clocked out");
                setIsClockedIn(false);
                setIsOnBreak(false);
                setElapsedTime(0);
                setUser({ ...user, clockedIn: false });
            }
        }
        catch (err) {
            toast.dismiss();
            toast.error("Failed to clock in/out");
            console.error("Clock in/out error:", err);
            setError("Failed to clock in/out");
        }
    };
    const handleBreak = async () => {
        try {
            if (!isOnBreak) {
                toast.loading("Starting break...");
                const breakData = await startBreak();
                toast.dismiss();
                if (breakData?.success) {
                    toast.success("Break started successfully");
                    setIsOnBreak(true);
                    // Don't reset elapsedTime here
                }
            }
            else {
                toast.loading("Ending break...");
                const breakData = await endBreak();
                toast.dismiss();
                if (breakData?.success) {
                    toast.success("Break ended successfully");
                    setIsOnBreak(false);
                    // After ending break, fetch updated shift data but don't reset timer
                    await fetchCurrentShift();
                }
            }
        }
        catch (err) {
            toast.dismiss();
            toast.error("Failed to handle break");
            console.error("Break handling error:", err);
            setError("Failed to handle break");
        }
    };
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };
    const handleLogout = async () => {
        if (isClockedIn) {
            if (confirm("You are still clocked in. Clock out before logging out?")) {
                await clockOut();
                setIsClockedIn(false);
                setIsOnBreak(false);
                setElapsedTime(0);
            }
            else {
                return;
            }
        }
        toast.loading("Logging out...");
        const data = await logout();
        toast.dismiss();
        if (data?.success) {
            toast.success("Logged out successfully");
            setUser(null);
            navigate("/login");
        }
    };
    return (_jsx("header", { className: "w-full border-b bg-white shadow-sm", children: _jsxs("div", { className: "container mx-auto px-4 h-20 flex items-center justify-between", children: [_jsx("div", { className: "flex-1 max-w-md mx-auto", children: _jsxs("div", { className: `relative transition-all duration-200 ${searchFocused ? "scale-105" : ""}`, children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 mx-2" }), _jsx("input", { type: "search", placeholder: "Search anything...", className: "w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200", onFocus: () => setSearchFocused(true), onBlur: () => setSearchFocused(false) })] }) }), user?.userType !== "admin" && (_jsxs("div", { className: "flex items-center gap-4 mr-4", children: [error && _jsx("div", { className: "text-red-500", children: error }), isClockedIn && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Timer, { className: "h-5 w-5 text-gray-600" }), _jsx("span", { className: "font-mono text-lg", children: formatTime(elapsedTime) })] })), _jsx("button", { onClick: handleClockInOut, className: `px-4 py-2 rounded-md font-medium transition-colors ${isClockedIn
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-green-100 text-green-600 hover:bg-green-200"}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [isClockedIn ? (_jsx(Square, { className: "h-4 w-4" })) : (_jsx(Play, { className: "h-4 w-4" })), isClockedIn ? "Clock Out" : "Clock In"] }) }), _jsx("button", { onClick: handleBreak, disabled: !isClockedIn, className: `px-4 py-2 rounded-md font-medium transition-colors ${isOnBreak
                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"} ${!isClockedIn && "opacity-50 cursor-not-allowed"}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Coffee, { className: "h-4 w-4" }), isOnBreak ? "End Break" : "Break"] }) })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => navigate("/notifications"), className: "p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative", children: [_jsx(Bell, { className: "h-5 w-5" }), notifications?.length > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center", children: countUnreadNotifications(notifications) }))] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors", children: [_jsx("div", { className: "h-8 w-8 rounded-full overflow-hidden flex justify-center items-center bg-gray-200", children: _jsx(Avatar, { className: "object-cover object-center", src: user?.avatar, children: !user?.avatar && _jsx(Person, { sx: { fontSize: 40 } }) }) }), _jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { className: "text-sm font-medium leading-none", children: user?.fullName }), _jsx("span", { className: "text-xs text-gray-500", children: user?.userType })] }), _jsx(ChevronDown, { className: "h-4 w-4 text-gray-500 ml-2" })] }), isDropdownOpen && (_jsx("div", { className: "absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50", children: _jsxs("div", { className: "p-2", children: [_jsxs("div", { className: "px-3 py-2", children: [_jsx("p", { className: "text-sm font-medium", children: user?.fullName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user?.email })] }), _jsx("div", { className: "h-px bg-gray-200 my-1" }), _jsxs("button", { onClick: () => navigate("/settings"), className: "w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors", children: [_jsx(User, { className: "mr-2 h-4 w-4" }), "Profile"] }), _jsxs("button", { onClick: () => navigate("/settings"), className: "w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] }), _jsx("div", { className: "h-px bg-gray-200 my-1" }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Log out"] })] }) }))] })] })] }) }));
};
export default Header;
