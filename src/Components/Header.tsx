/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
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
import axios from "axios";
import { BASE_URL, SOCKET_BASE_URL, successStyles } from "../lib/constants";
import toast from "react-hot-toast";
import { clockIn, clockOut, startBreak, endBreak } from "../api/shift";
import { getFundedBanks, useBank as spendBank } from "../api/bank";
import { io, Socket } from "socket.io-client";

export function countUnreadNotifications(
  notifications: INotification[]
): number {
  return notifications?.filter((n) => !n.read).length;
}

const Header = () => {
  const socketRef = useRef<Socket | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, notifications, setUser } = useUserContext();

  const [banks, setBanks] = useState<any[]>([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankAmount, setBankAmount] = useState<number>(0);

  const fetchCurrentShift = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/shift/current-shift`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
  
      if (res.data.success && res.data.data) {
        const payload = res.data.data;
        const shift = payload.shift;
        const clockedIn = payload.clockedIn;
        const workDuration = payload.workDuration;
        const breaks = payload.breaks;
  
        setCurrentShift(shift);
        setIsClockedIn(clockedIn);
        // console.log("Shift: ", shift)
  
        // Only if shift exists and has an associated bank
        if (shift && shift.bank) {
          setSelectedBank(shift.bank);
          setBankAmount((shift.bank.funds));
        } else {
          setSelectedBank(null);
          setBankAmount(0);
        }
  
        if (clockedIn && shift) {
          const serverSec = (workDuration || 0) * 60;
          let calc = serverSec;
          if (shift.clockInTime) {
            const diff = Math.floor(
              (Date.now() - new Date(shift.clockInTime).getTime()) / 1000
            );
            const breakSec = (breaks || []).reduce((sum: number, b: any) => {
              if (b.startTime && b.endTime) {
                return (
                  sum +
                  Math.floor(
                    (new Date(b.endTime).getTime() -
                      new Date(b.startTime).getTime()) /
                      1000
                  )
                );
              }
              return sum;
            }, 0);
            calc = Math.max(serverSec, diff - breakSec);
          }
          setElapsedTime(calc);
  
          if (breaks?.length) {
            const last = breaks[breaks.length - 1];
            setIsOnBreak(!!last.startTime && !last.endTime);
          }
        } else {
          setElapsedTime(0);
          setIsOnBreak(false);
        }
  
        setError("");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // no active shift
        setIsClockedIn(false);
        setIsOnBreak(false);
        setElapsedTime(0);
        setSelectedBank(null);
        setBankAmount(0);
      } else {
        console.error(err);
        setError("Failed to fetch shift status");
      }
    }
  };

  useEffect(() => {
    if (user) fetchCurrentShift();
  }, [user]);

  // live timer tick
  useEffect(() => {
    let timer: number;
    if (isClockedIn && !isOnBreak) {
      timer = window.setInterval(() => setElapsedTime((p) => p + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, isOnBreak]);

  const openBankSelection = async () => {
    try {
      const res = await getFundedBanks();
      if (res?.success) {
        setBanks(res.data);
        setShowBankModal(true);
      }
    } catch {
      toast.error("Failed to load banks");
    }
  };

  const confirmBankAndClockIn = async () => {
    if (!selectedBank) return;
    try {
      toast.loading("Clocking in...");
      const shiftRes = await clockIn();
      toast.dismiss();
      if (shiftRes?.success && shiftRes.data) {
        const shiftId = shiftRes.data.id;
        const bankRes = await spendBank(selectedBank.id, { 
          amountUsed: 0, 
          shiftId 
        });
        
        if (bankRes?.success) {
          toast.success("Clocked in and bank assigned");
          setShowBankModal(false);
          await fetchCurrentShift();
          setUser({ ...user, clockedIn: true } as any);
        } else {
          // Handle failure in bank assignment
          toast.error("Bank assignment failed");
          // Attempt to clock out to avoid inconsistent state
          await clockOut();
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to assign bank and clock in");
      console.error("Bank assignment error:", error);
      // Try to clean up by clocking out
      try {
        await clockOut();
      } catch (e) {
        console.error("Failed to clock out after error:", e);
      }
    }
  };

  const handleClockInOut = async () => {
    if (user?.userType === "payer" && !isClockedIn) {
      openBankSelection();
      return;
    }
    try {
      if (!isClockedIn) {
        toast.loading("Clocking in...");
        const res = await clockIn();
        toast.dismiss();
        if (res?.success) {
          toast.success("Successfully clocked in");
          setUser({ ...user, clockedIn: true } as any);
          await fetchCurrentShift();
        }
      } else {
        toast.loading("Clocking out...");
        await clockOut();
        toast.dismiss();
        toast.success("Successfully clocked out");
        setIsClockedIn(false);
        setIsOnBreak(false);
        setElapsedTime(0);
        setSelectedBank(null);
        setBankAmount(0);
        setUser({ ...user, clockedIn: false } as any);
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to clock in/out");
    }
  };

  const handleBreak = async () => {
    try {
      if (!isOnBreak) {
        toast.loading("Starting break...");
        const res = await startBreak();
        toast.dismiss();
        if (res?.success) {
          toast.success("Break started");
          setIsOnBreak(true);
        }
      } else {
        toast.loading("Ending break...");
        const res = await endBreak();
        toast.dismiss();
        if (res?.success) {
          toast.success("Break ended");
          setIsOnBreak(false);
          await fetchCurrentShift();
        }
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to handle break");
    }
  };

  const handleLogout = async () => {
    if (isClockedIn) {
      if (confirm("You are still clocked in. Clock out before logging out?")) {
        await clockOut();
      } else return;
    }
    toast.loading("Logging out...");
    const r = await logout();
    toast.dismiss();
    if (r?.success) {
      setUser(null as any);
      navigate("/login");
      toast.success("Logged out");
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(sec).padStart(2, "0")}`;
  };


  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.clockedIn) {
        fetchCurrentShift();
      }
    }, 10000);
  
    return () => clearInterval(interval);
  }, [user?.clockedIn]);
  
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {user?.userType !== "admin" && (
          <div className="flex items-center gap-4">
            {error && <div className="text-red-500">{error}</div>}

            {selectedBank && isClockedIn && (
  <div className="flex items-center gap-2">
    <span className="font-medium">
      Bank: {selectedBank.bankName}
    </span>
    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold">
    &#8358;{Number(bankAmount).toLocaleString()}
    </span>
  </div>
)}

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

        {/* Notifications + profile menu unchanged */}
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
                <Avatar src={user?.avatar}>
                  {!user?.avatar && <Person sx={{ fontSize: 40 }} />}
                </Avatar>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs text-gray-500">{user?.userType}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-2">
                  <p className="px-3 py-2 text-sm font-medium">{user?.fullName}</p>
                  <p className="px-3 py-2 text-xs text-gray-500 truncate">{user?.email}</p>
                  <div className="h-px bg-gray-200 my-1" />
                  <button onClick={() => navigate("/settings")} className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </button>
                  <button onClick={() => navigate("/settings")} className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </button>
                  <div className="h-px bg-gray-200 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank selection modal */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Select Bank for Today</h2>
              <ul className="max-h-64 overflow-y-auto mb-4">
                {banks.map((bank) => (
                  <li key={bank.id} className="mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bank"
                        value={bank.id}
                        onChange={() => {
                          setSelectedBank(bank);
                          setBankAmount(bank.funds);
                        }}
                      />
                      <span className="ml-2">{bank.bankName} – ${bank.funds.toLocaleString()}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {selectedBank && (
                <div className="mb-4">
                  <label>Confirm amount:</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2 mt-1"
                    value={bankAmount}
                    max={selectedBank.funds}
                    onChange={(e) => setBankAmount(Number(e.target.value))}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowBankModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button
                  onClick={confirmBankAndClockIn}
                  disabled={!selectedBank}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  Confirm & Clock In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
