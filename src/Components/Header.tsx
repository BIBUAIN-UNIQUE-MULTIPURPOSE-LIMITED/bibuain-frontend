/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Timer,
  Play,
  Square,
  Coffee,
} from "lucide-react";
import { useUserContext } from "./ContextProvider";
import { logout } from "../api/user";
import { Avatar } from "@mui/material";
import { Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { INotification } from "../lib/interface";
import { clockIn, clockOut, endBreak, startBreak } from "../api/shift";
import axios from "axios";
import { BASE_URL } from "../lib/constants";
import toast from "react-hot-toast";

export function countUnreadNotifications(
  notifications: INotification[]
): number {
  return notifications?.filter((notification) => !notification.read).length;
}

const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [_currentShift, setCurrentShift] = useState<any>(null);
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
              const breakDuration = breaks.reduce((total: number, breakItem: any) => {
                if (breakItem.endTime && breakItem.startTime) {
                  // For completed breaks
                  return total + Math.floor(
                    (new Date(breakItem.endTime).getTime() - 
                    new Date(breakItem.startTime).getTime()) / 1000
                  );
                }
                return total;
              }, 0);
              
              calculatedSeconds -= breakDuration;
            }
            
            // Use the larger of server or calculated time to prevent jumps
            setElapsedTime(Math.max(serverTimeInSeconds, calculatedSeconds));
          } else {
            setElapsedTime(serverTimeInSeconds);
          }
        } else {
          setElapsedTime(0);
        }
        
        // Check if on break by examining the last break entry
        if (breaks && breaks.length > 0) {
          const lastBreak = breaks[breaks.length - 1];
          setIsOnBreak(lastBreak && !lastBreak.endTime);
        } else {
          setIsOnBreak(false);
        }
        
        setError("");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // 404 means no active shift – clear the active state
        setCurrentShift(null);
        setIsClockedIn(false);
        setElapsedTime(0);
        setIsOnBreak(false);
        setError(""); 
      } else {
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
    let timer: number | undefined;
    
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
          setUser({ ...user, clockedIn: true } as any);
        }
      } else {
        toast.loading("Clocking out...");
        const res = await clockOut();
        toast.dismiss();
        
          toast.success("Successfully clocked out");
          setIsClockedIn(false);
          setIsOnBreak(false);
          setElapsedTime(0);
          setUser({ ...user, clockedIn: false } as any);
        
      }
    } catch (err) {
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
      } else {
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
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to handle break");
      console.error("Break handling error:", err);
      setError("Failed to handle break");
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    if (isClockedIn) {
      if (confirm("You are still clocked in. Clock out before logging out?")) {
        await clockOut();
        setIsClockedIn(false);
        setIsOnBreak(false);
        setElapsedTime(0);
      } else {
        return;
      }
    }
    
    toast.loading("Logging out...");
    const data = await logout();
    toast.dismiss();
    
    if (data?.success) {
      toast.success("Logged out successfully");
      setUser(null as any);
      navigate("/login");
    }
  };

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex-1 max-w-md mx-auto">
          <div
            className={`relative transition-all duration-200 ${
              searchFocused ? "scale-105" : ""
            }`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 mx-2" />
            <input
              type="search"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {user?.userType !== "admin" && (
          <div className="flex items-center gap-4 mr-4">
            {error && <div className="text-red-500">{error}</div>}
            
            {isClockedIn && (
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-gray-600" />
                <span className="font-mono text-lg">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
            
            <button
              onClick={handleClockInOut}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isClockedIn
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {isClockedIn ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isClockedIn ? "Clock Out" : "Clock In"}
              </div>
            </button>

            <button
              onClick={handleBreak}
              disabled={!isClockedIn}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isOnBreak
                  ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${!isClockedIn && "opacity-50 cursor-not-allowed"}`}
            >
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                {isOnBreak ? "End Break" : "Break"}
              </div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {notifications?.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {countUnreadNotifications(notifications)}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden flex justify-center items-center bg-gray-200">
                <Avatar
                  className="object-cover object-center"
                  src={user?.avatar}
                >
                  {!user?.avatar && <Person sx={{ fontSize: 40 }} />}
                </Avatar>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">
                  {user?.fullName}
                </span>
                <span className="text-xs text-gray-500">{user?.userType}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </button>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;