/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { BASE_URL } from "../lib/constants";
import toast from "react-hot-toast";
import { clockIn, clockOut, startBreak, endBreak } from "../api/shift";
import { getFundedBanks, useBank as spendBank, updateBank } from "../api/bank";
// import { Socket } from "socket.io-client";

export function countUnreadNotifications(
  notifications: INotification[]
): number {
  return notifications?.filter((n) => !n.read).length;
}

const Header = () => {
  // const socketRef = useRef<Socket | null>(null);

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

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [shiftBanks, setShiftBanks] = useState<any[]>([]);
  const [closingBalances, setClosingBalances] = useState<Record<string, number>>({});

  const simpleClockOut = async () => {
    try {
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
    } catch (err) {
      toast.dismiss();
      console.error("Clock out failed:", err);
      toast.error("Failed to clock out");
    }
  };

  const fetchCurrentShift = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/shift/current-shift`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (!res.data.success) throw new Error();
      const { shift, clockedIn, workDuration, breaks } = res.data.data;
      setCurrentShift(res.data.data);
      setIsClockedIn(clockedIn);

      // attach bank if present
      if (shift?.bank) {
        setSelectedBank(shift.bank);
        setBankAmount(shift.bank.funds);
      } else {
        setSelectedBank(null);
        setBankAmount(0);
      }

      // timer + break logic...
      if (clockedIn) {
        const serverSec = (workDuration || 0) * 60;
        let calc = serverSec;
        if (shift.clockInTime) {
          const diff = Math.floor((Date.now() - new Date(shift.clockInTime).getTime()) / 1000);
          const breakSec = (breaks || []).reduce((sum: number, b: any) => {
            if (b.startTime && b.endTime) {
              return sum + Math.floor((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 1000);
            }
            return sum;
          }, 0);
          calc = Math.max(serverSec, diff - breakSec);
        }
        setElapsedTime(calc);
        setIsOnBreak(Boolean(breaks?.length && !breaks[breaks.length - 1].endTime));
      } else {
        setElapsedTime(0);
        setIsOnBreak(false);
      }

      setError("");
    } catch (err: any) {
      console.error("Error fetching current shift:", err);
      if (err.response?.status === 404) {
        setIsClockedIn(false);
        setIsOnBreak(false);
        setElapsedTime(0);
        setSelectedBank(null);
        setBankAmount(0);
      } else {
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
        const bankRes = await spendBank(selectedBank.id, { amountUsed: 0, shiftId });
        if (bankRes?.success) {
          toast.success("Clocked in and bank assigned");
          setShowBankModal(false);
          await fetchCurrentShift();
          setUser({ ...user, clockedIn: true } as any);
        } else {
          toast.error("Bank assignment failed");
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
    // payer & not clocked in → choose bank
    if (user?.userType === "payer" && !isClockedIn) {
      openBankSelection();
      return;
    }

    // already clocked in → either close‑bank flow for payer or simple for others
    if (isClockedIn) {
      if (user?.userType === "payer") {
        try {
          await openCloseBankModal();
        } catch (err) {
          console.error("Error preparing close‑bank:", err);
          toast.error("Failed to prepare for clock out");
        }
      } else {
        // everyone else
        await simpleClockOut();
      }
      return;
    }

    // not clocked in, not payer (or after bank selection) → clock in
    try {
      toast.loading("Clocking in...");
      const res = await clockIn();
      toast.dismiss();
      if (res?.success) {
        toast.success("Successfully clocked in");
        setUser({ ...user, clockedIn: true } as any);
        await fetchCurrentShift();
      }
    } catch (err) {
      toast.dismiss();
      console.error("Clock in failed:", err);
      toast.error("Failed to clock in");
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

  const openCloseBankModal = async () => {
    try {
      // Check if we have a valid shift ID
      const shiftId = currentShift?.shift?.id;
      console.log("Current shift for bank modal:", currentShift);
      console.log("Shift ID for bank modal:", shiftId);

      if (!shiftId) {
        console.error("No shift ID available for fetching banks");
        toast.error("Cannot fetch shift banks: No active shift");
        return;
      }

      toast.loading("Loading shift banks...");

      // Fetch banks for this shift
      const res = await axios.get(
        `${BASE_URL}/banks/shift/${shiftId}`,
        { withCredentials: true }
      );

      toast.dismiss();

      if (res.data.success) {
        const used = res.data.data as any[];
        console.log("Fetched shift banks:", used);

        if (!used || used.length === 0) {
          toast.error("No banks found for this shift");
          return;
        }

        setShiftBanks(used);

        // Initialize closing balances with current funds
        const initBalances: Record<string, number> = {};
        used.forEach((b) => {
          initBalances[b.id] = b.funds;
        });

        setClosingBalances(initBalances);
        setShowCloseModal(true);
      } else {
        console.error("API returned success: false");
        toast.error("Failed to load shift banks");
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Error opening close bank modal:", error);
      toast.error(`Failed to load shift banks: ${error.message || "Unknown error"}`);
    }
  };

  const confirmCloseAndClockOut = async () => {
    try {
      toast.loading("Saving balances...");
      // update each bank's funds
      await Promise.all(
        shiftBanks.map((bank) =>
          updateBank(bank.id, { funds: closingBalances[bank.id] })
        )
      );
      toast.dismiss();
      // now clock out
      toast.loading("Clocking out...");
      await clockOut();
      toast.dismiss();
      toast.success("Successfully clocked out");
      // reset all state
      setIsClockedIn(false);
      setIsOnBreak(false);
      setElapsedTime(0);
      setSelectedBank(null);
      setBankAmount(0);
      setShowCloseModal(false);
      setShiftBanks([]);
      setClosingBalances({});
      setUser({ ...user, clockedIn: false } as any);
    } catch (err) {
      toast.dismiss();
      toast.error("Error during clock-out");
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.clockedIn) {
        fetchCurrentShift();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [user?.clockedIn]);

  const handleReassignBank = async () => {
    if (!selectedBank || !currentShift?.shift?.id) return;
  
    try {
      toast.loading("Updating bank...");
      const res = await spendBank(selectedBank.id, {
        amountUsed: 0,
        shiftId: currentShift.shift.id,
      });
      
      toast.dismiss();
      
      if (res?.success) { // Now checking the correct response structure
        const updatedBank = res.data;
        toast.success("Bank reassigned successfully");
  
        // update to the *new* bank immediately
        setSelectedBank({
          id:            updatedBank.id,
          bankName:      updatedBank.bankName,
          accountNumber: updatedBank.accountNumber,
          funds:         updatedBank.funds,
        });
        setBankAmount(updatedBank.funds);
  
        // re‑sync the rest of the shift
        await fetchCurrentShift();
        setShowBankModal(false);
      } 
    } catch (error) {
      toast.dismiss();
      console.error("Error reassigning bank:", error);
      toast.error("Bank reassignment failed");
    }
  };
  

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
            {user?.userType === "payer" && isClockedIn && bankAmount === 0 && (
  <button
    onClick={openBankSelection}
    className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
  >
    Request New Bank
  </button>
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
              className={`px-4 py-2 rounded-md font-medium transition-colors ${isClockedIn
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
              className={`px-4 py-2 rounded-md font-medium transition-colors ${isOnBreak
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

        {/* Notifications + profile menu */}
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <h2 className="text-xl font-semibold mb-4">Select Bank for Today</h2>
      <ul className="max-h-64 overflow-y-auto mb-4">
        {banks.map((bank) => (
          <li key={bank.id} className="mb-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="bank"
                checked={selectedBank?.id === bank.id}
                onChange={() => {
                  setSelectedBank(bank);
                  setBankAmount(bank.funds);
                }}
              />
              <span className="ml-2">
                {bank.bankName} - {bank.accountNumber} (₦{bank.funds.toLocaleString()})
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => setShowBankModal(false)} 
          className="px-4 py-2 rounded bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={isClockedIn ? handleReassignBank : confirmBankAndClockIn}
          disabled={!selectedBank}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {isClockedIn ? "Update Bank" : "Confirm & Clock In"}
        </button>
      </div>
    </div>
  </div>
)}

        {/* Closing balances modal */}
        {showCloseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Confirm Closing Balances</h2>
              {shiftBanks.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto mb-4">
                  {shiftBanks.map((bank) => (
                    <li key={bank.id} className="mb-2">
                      <label className="flex flex-col">
                        <span className="font-medium">{bank.bankName}</span>
                        <input
                          type="number"
                          className="border rounded p-2 mt-1"
                          value={closingBalances[bank.id]}
                          onChange={(e) =>
                            setClosingBalances({
                              ...closingBalances,
                              [bank.id]: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mb-4">No banks found for this shift.</p>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCloseModal(false)} className="px-4 py-2 rounded bg-gray-200">
                  Cancel
                </button>
                <button
                  onClick={confirmCloseAndClockOut}
                  className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                >
                  Confirm & Clock Out
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