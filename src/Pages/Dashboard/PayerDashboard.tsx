/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  styled,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Divider,
  Avatar,
  Paper,
  // useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Report as AlertIcon,
  CheckCircle,
  PauseCircle,
  AccountBalance as Bank,
  Flag as FlagIcon,
  Person,
} from "@mui/icons-material";
import { format } from "date-fns";
import EscalateTrade from "../Payer/EscalateTrade";
import { useUserContext } from "../../Components/ContextProvider";
import { ITrade, Message, Attachment, TradeStatus } from "../../lib/interface";
import { getPayerTrade, getTradeDetails, markTradeAsPaid, getPlatformCostPrice } from "../../api/trade";
import toast from "react-hot-toast";
import { successStyles, SOCKET_BASE_URL } from "../../lib/constants";
import { CreditCardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentShift } from "../../api/shift";
import { io, Socket } from "socket.io-client";


// Styled components
const MessageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

interface MessageBubbleProps {
  isAuthor: boolean;
}

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isAuthor",
})<MessageBubbleProps>(({ theme, isAuthor }) => ({
  padding: theme.spacing(1.5),
  maxWidth: "70%",
  borderRadius: theme.spacing(2),
  backgroundColor: isAuthor ? theme.palette.primary.light : theme.palette.grey[100],
  color: isAuthor ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.shape.borderRadius,
}));

interface PaymentInfo {
  btcRate?: string | number;
  dollarRate?: string | number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  buyer_name?: string;
  [key: string]: unknown;
}

const PayerDashboard = () => {
  // Local state for trade/chat data

  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [tradeStatus, setTradeStatus] = useState("good");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({});
  const [assignedTrade, setAssignedTrade] = useState<ITrade | null>(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const { user } = useUserContext();
  // Use a separate flag for the very first load only.
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [isUserClockedIn, setIsUserClockedIn] = useState<boolean | null>(null);
  const [isCheckingClockStatus, setIsCheckingClockStatus] = useState(true);

  const [elapsed, setElapsed] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number | null>(null);

  const socketRef = useRef<Socket>();
  // const theme = useTheme();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const accountName = useMemo(() => {
    return assignedTrade?.platformMetadata?.accountUsername ||
      paymentInfo?.buyer_name ||
      "N/A";
  }, [
    assignedTrade?.platformMetadata?.accountUsername,
    paymentInfo?.buyer_name
  ]);

  const fetchTradeData = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
  
      const tradeData = await getPayerTrade(user?.id);
      console.log('Trade data from API:', tradeData);
  
      const newTrade = tradeData?.data;
  
      // Determine if the *current* trade should be cleared
      const isCurrentTradeTerminal = assignedTrade && ["escalated", "paid", "completed", "successful", "cancelled", "expired", "disputed"]
        .includes(assignedTrade.status?.toLowerCase());
  
      // Scenario 1: No trade returned from API OR current trade is terminal
      if (!newTrade || isCurrentTradeTerminal) {
        if (assignedTrade?.id) { // Only clear local storage if a trade was previously assigned
          localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
        }
        // Only set to null if there was an assigned trade before or if it's the initial load and no trade is found
        if (assignedTrade !== null || isInitial) {
          setAssignedTrade(null);
          setPaymentInfo({});
          setMessages([]);
        }
        return; // Exit early if no new trade or current is terminal
      }
  
      // Scenario 2: New trade available
      // Only update if trade actually changed or if this is the initial load, or if no trade was assigned before
      if (isInitial || !assignedTrade || assignedTrade.id !== newTrade.id || assignedTrade.status !== newTrade.status) {
        // Clear elapsed time for the *previous* trade if the ID changes
        if (assignedTrade && assignedTrade.id !== newTrade.id) {
          localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
        }
        setAssignedTrade(newTrade);
  
        // Fetch detailed trade information for the new/updated trade
        try {
          const detailsResponse = await getTradeDetails(
            newTrade.platform,
            newTrade.tradeHash,
            newTrade.accountId
          );
  
          if (detailsResponse?.data) {
            const { externalTrade, tradeChat } = detailsResponse.data;
  
            const msgs = Array.isArray(tradeChat?.messages) ? tradeChat.messages : [];
            const atts = Array.isArray(tradeChat?.attachments) ? tradeChat.attachments : [];
  
            const bankMsg = msgs.find(
              (m: { content: any; }) => m.content && typeof m.content === "object" && (m.content as any).bank_account
            );
            const ba = bankMsg ? (bankMsg.content as any).bank_account : {};
  
            setPaymentInfo({
              ...externalTrade,
              bankName: ba.bank_name || externalTrade?.bankName,
              accountNumber: ba.account_number || externalTrade?.accountNumber,
              accountHolder: ba.holder_name || externalTrade?.accountHolder,
            });
  
            setMessages(msgs);
            setAttachments(atts);
  
            if (externalTrade?.buyer_name) {
              setAssignedTrade((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  platformMetadata: {
                    ...prev?.platformMetadata,
                    accountUsername: externalTrade.buyer_name,
                  },
                };
              });
            }
          }
        } catch (error) {
          console.error("Error fetching trade details:", error);
          // Do not clear the trade here; keep the main trade data if details fail
        }
      }
    } catch (error: any) {
      // No active trade scenario: only clear if the API explicitly says so (e.g., 404)
      if (error.response?.status === 404) {
        if (assignedTrade?.id) {
          localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
        }
        setAssignedTrade(null);
        setPaymentInfo({});
        setMessages([]);
      } else {
        console.error("Error fetching trade data:", error);
        // For other errors, you might want to keep the current trade displayed
        // or show an error message without clearing the entire dashboard.
      }
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTradeData(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
  
    const intervalId = setInterval(() => {
      // Only poll if NO trade is currently assigned.
      // If a trade IS assigned, we rely on Socket.IO for updates on that trade.
      if (!assignedTrade) {
        fetchTradeData(false);
      }
    }, 6000); 
  
    return () => clearInterval(intervalId);
  }, [user, assignedTrade]); 

  // Refresh handler for manual refresh
  const handleRefresh = async () => {
    await fetchTradeData(true);
  };

  const handleFlagSubmit = () => {
    setFlagDialogOpen(false);
    setAlertOpen(true);
  };

  const refreshtrade = async () => {
    try {
      setAssignedTrade(null);
      setPaymentInfo({});
      setMessages([]);
      await fetchTradeData(true);
    } catch (error) {
      console.error("Error refreshing trade:", error);
    }
  };

  const approveTrade = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    setConfirmDialogOpen(false);
    if (!assignedTrade) return;
    setIsPaymentLoading(true);
    try {
      const response = await markTradeAsPaid(assignedTrade.id);
      if (response?.success) {
        toast.success("Trade marked as paid successfully!", successStyles);
        localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
        setTimeout(() => {
          fetchTradeData(true);
          setAssignedTrade(null);
          setPaymentInfo({});
          setMessages([]);
        }, 1000);
      } else {
        await refreshtrade();
      }
    } catch {
      await refreshtrade();
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setConfirmDialogOpen(false);
  };

  const handleEscalationSuccess = async () => {
    // Clear current trade data
    localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
    setAssignedTrade(null);
    setPaymentInfo({});
    setMessages([]);

    toast.success("Trade escalated successfully", successStyles);

  };

  useEffect(() => {
    async function checkClockInStatus() {
      if (user) {
        try {
          const shiftData = await getCurrentShift();
          if (shiftData?.success && shiftData.data) {
            const { clockedIn } = shiftData.data;
            setIsUserClockedIn(clockedIn);
          } else {
            setIsUserClockedIn(false);
          }
        } catch (error) {
          console.error("Error checking clock-in status:", error);
          setIsUserClockedIn(false);
        } finally {
          setIsCheckingClockStatus(false);
        }
      }
    }

    checkClockInStatus();
  }, [user]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!assignedTrade?.id) return;

    const tradeId = assignedTrade.id;
    const storageKey = `elapsed_start_${tradeId}`;

    let startTime: number;

    const storedStart = localStorage.getItem(storageKey);
    if (storedStart) {
      startTime = parseInt(storedStart, 10);
    } else {
      startTime = Date.now();
      localStorage.setItem(storageKey, startTime.toString());
    }

    const calculateElapsed = () => Math.floor((Date.now() - startTime) / 1000);
    setElapsed(calculateElapsed());

    const timer = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(timer);
  }, [assignedTrade?.id]);


  useEffect(() => {
    if (!user?.id) return;

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_BASE_URL, {
        auth: { userId: user.id },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.emit("joinNotificationRoom", user.id);

      // Reconnection logic
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        socketRef.current?.emit("joinNotificationRoom", user.id);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socketRef.current || !user?.id) return;

    // Clear trade handler
    const clearCurrentTrade = (reason: string) => {
      console.log(`Clearing trade: ${reason}`);
      if (assignedTrade?.id) {
        localStorage.removeItem(`elapsed_start_${assignedTrade.id}`);
      }
      setAssignedTrade(null);
      setMessages([]);
      setPaymentInfo({});
    };

    // Listen for trade deletions
    const handleTradeDeleted = ({ tradeId }: { tradeId: string }) => {
      console.log(`Received tradeDeleted event for trade: ${tradeId}`);
      if (assignedTrade?.id === tradeId) {
        clearCurrentTrade("Trade deleted");
        toast.success("Your trade was cancelled by the system", successStyles);
      }
    };

    // Listen for trade status changes
    const handleTradeStatusChanged = ({ tradeId, status, previousStatus }: {
      tradeId: string;
      status: string;
      previousStatus?: string;
    }) => {
      console.log(`Received tradeStatusChanged: ${tradeId}, ${previousStatus} -> ${status}`);

      if (assignedTrade?.id === tradeId) {
        const terminalStatuses = ["escalated", "paid", "completed", "successful", "cancelled", "expired", "disputed"];

        if (terminalStatuses.includes(status.toLowerCase())) {
          clearCurrentTrade(`Status changed to ${status}`);
          toast.success(`Trade status updated to ${status}`, successStyles);
        } else {
          // For non-terminal status changes, just update the trade status
          setAssignedTrade(prev => prev ? { ...prev, status: status as TradeStatus } : null);
        }
      }
    };

    // Listen for trade completion (specific to assigned payers)
    const handleTradeCompleted = ({ tradeId, status, message }: {
      tradeId: string;
      status: string;
      message: string;
    }) => {
      console.log(`Received tradeCompleted: ${tradeId}, ${status}`);

      if (assignedTrade?.id === tradeId) {
        clearCurrentTrade(`Trade completed: ${status}`);
        toast.success(message, successStyles);
      }
    };

    // Attach listeners
    socketRef.current.on("tradeDeleted", handleTradeDeleted);
    socketRef.current.on("tradeStatusChanged", handleTradeStatusChanged);
    socketRef.current.on("tradeCompleted", handleTradeCompleted);

    // Register interest in current trade if exists
    if (assignedTrade?.id) {
      socketRef.current.emit("watchTrade", assignedTrade.id);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("tradeDeleted", handleTradeDeleted);
        socketRef.current.off("tradeStatusChanged", handleTradeStatusChanged);
        socketRef.current.off("tradeCompleted", handleTradeCompleted);

        // Unregister trade watching
        if (assignedTrade?.id) {
          socketRef.current.emit("unwatchTrade", assignedTrade.id);
        }
      }
    };
  }, [assignedTrade?.id, user?.id]);

  useEffect(() => {
    async function fetchCostPrice() {
      if (assignedTrade?.platform) {
        try {
          const result = await getPlatformCostPrice(assignedTrade.platform);
          console.log("API Response:", result);

          if (result && result.costPrice !== undefined) {
            setCostPrice(result.costPrice);
          } else {
            console.error("Cost price not found in the response");
            setCostPrice(null);
          }
        } catch (error) {
          console.error("Error fetching cost price:", error);
          setCostPrice(null);
        }
      }
    }

    fetchCostPrice();
  }, [assignedTrade?.platform]);

  // Rate comparison logic
  const btcRateNum = paymentInfo.btcRate ? Number(paymentInfo.btcRate) : null;

  // console.log("Cost Price", costPrice);
  const isGoodRate =
    costPrice !== null &&
    btcRateNum !== null &&
    (btcRateNum >= costPrice || (btcRateNum >= (costPrice - 200000)));

  if (initialLoading || isCheckingClockStatus) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isUserClockedIn) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          You are currently clocked out.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please clock in to access your dashboard.
        </Typography>
      </Box>
    );
  }

  if (assignedTrade === null) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: "400px",
                  py: 4,
                }}
              >
                <PauseCircle
                  sx={{
                    fontSize: 80,
                    color: "text.secondary",
                    mb: 3,
                    opacity: 0.7,
                  }}
                />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  No Active Trade Assigned
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                  You currently don't have any trades assigned. New trades will appear here once they're allocated to you.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Link
                    to="/transaction/history"
                    className="px-4 py-2 bg-gray-500 text-white rounded-md font-semibold"
                  >
                    View History
                  </Link>
                  <Button
                    variant="contained"
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Typography variant="h6">Trade Chat</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box
      sx={{
        mt: 3,
        minHeight: "100vh",
        zIndex: -1,
        backgroundColor: isGoodRate ? "transparent" : "rgba(255, 69, 0, 0.1)", // Light amber red background
      }}
    >
      {assignedTrade?.flagged && (
        <div className="w-[1230px] right-0 h-[100vh] top-[0px] bg-red-500/20 absolute z-[0]" />
      )}
      <Container maxWidth="xl">
        <Grid container>
          {/* Left Column: Trade Details */}
          <Grid item xs={12} lg={8}>
            <div className="w-full z-[1] bg-white shadow-xl rounded-2xl p-8 space-y-8">
              {/* Header Section */}
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="text-3xl font-extrabold text-gray-800">Trade Details</h2>
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`px-4 py-2 text-white rounded-md font-semibold ${isGoodRate ? "bg-green-500" : "bg-red-500"
                      }`}
                  >
                    {isGoodRate ? "GOOD" : "BAD"}
                  </span>

                  {assignedTrade?.flagged && (
                    <span className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold">
                      FLAGGED
                    </span>
                  )}
                  <button
                    onClick={() => setFlagDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-yellow-500 text-yellow-600 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                    type="button"
                  >
                    <FlagIcon />
                    Flag Issue
                  </button>
                  <button
                    onClick={() => setEscalateModalOpen(true)}
                    className="flex items-center gap-2 border-2 border-red-500 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                    type="button"
                  >
                    <AlertIcon />
                    Escalate
                  </button>
                </div>
              </div>
              {/* Trade Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Platform</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {assignedTrade?.platform?.toUpperCase()}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">BTC Rate</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {paymentInfo?.btcRate ?
                      Number(paymentInfo.btcRate).toLocaleString(undefined, {
                        maximumFractionDigits: 0
                      })
                      : "N/A"}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Account</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {accountName}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Dollar Rate</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {paymentInfo?.dollarRate ? Number(paymentInfo.dollarRate).toFixed(0) : "N/A"}
                  </h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Amount</p>
                  <h3 className="text-[35px] font-bold text-green-600">
                    {assignedTrade?.amount ? Number(assignedTrade.amount).toLocaleString() : "N/A"}
                  </h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Elapsed Time</p>
                  <h3 className="text-[15px] font-bold text-gray-600">
                    {formatElapsedTime(elapsed)}
                  </h3>
                </div>

              </div>
              {/* Payment Details */}

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-2">
                    <div className="flex items-center gap-2">
                      <Bank className="text-blue-600" />
                      <p className="text-sm text-gray-500">Bank Name</p>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      {paymentInfo?.bankName || "N/A"}
                    </h1>
                  </div>
                  <div className="space-2">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="text-blue-600" />
                      <p className="text-sm text-gray-500">Account Number</p>
                    </div>
                    <h1 className="font-bold text-gray-800 text-[35px]">
                      {paymentInfo?.accountNumber || "N/A"}
                    </h1>
                  </div>
                  <div className="space-2">
                    <div className="flex items-center gap-2">
                      <Person className="text-blue-600" />
                      <p className="text-sm text-gray-500">Account Holder</p>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800 text-[25px]">
                      {paymentInfo?.accountHolder || "N/A"}
                    </h1>
                  </div>
                </div>
              </div>
              {/* Confirm Payment Button */}
              <button
                onClick={approveTrade}
                disabled={isPaymentLoading}
                className={`w-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition ${isPaymentLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                type="button"
              >
                {isPaymentLoading ? (
                  <>
                    <CircularProgress size={24} color="inherit" className="mr-2" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <CheckCircle className="inline-block mr-2" />
                    CONFIRM PAYMENT
                  </>
                )}
              </button>
            </div>
          </Grid>
          {/* Chat Section */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ p: 2, flexGrow: 0 }}>
                <Typography variant="h6" gutterBottom>
                  Trade Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {messages?.length} messages • {attachments?.length} attachments
                </Typography>
              </CardContent>
              <Divider />
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  p: 2,
                  maxHeight: "400px",
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
                  "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
                }}
              >
                {messages &&
                  messages.map((message: Message) => (
                    <MessageContainer key={message.id}>
                      <Avatar sx={{ width: 40, height: 40 }} src={`https://i.pravatar.cc/150?u=${message.author?.id || ""}`}>
                        {paymentInfo?.buyer_name || "Anonymous"}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2">
                            {paymentInfo?.buyer_name || "Anonymous"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {message.createdAt
                              ? (() => {
                                try {
                                  return format(new Date(message.createdAt), "MMM d, h:mm a");
                                } catch (error) {
                                  console.error(error);
                                  return "Unknown date";
                                }
                              })()
                              : "Unknown date"}
                          </Typography>
                        </Box>
                        <MessageBubble isAuthor={message.sender?.id === user?.id} elevation={0}>
                          {typeof message.content === "object" &&
                            message.content !== null &&
                            'bank_account' in message.content ? (
                            <Box sx={{ p: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                                Bank Account Details:
                              </Typography>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Typography variant="body2">
                                  <strong>Bank:</strong> {message.content.bank_account?.bank_name || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Account Number:</strong> {message.content.bank_account?.account_number || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Account Holder:</strong> {message.content.bank_account?.holder_name || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Amount:</strong> {message.content.bank_account?.currency} {message.content.bank_account?.amount || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: typeof message.content === 'string' ? message.content : '' }} />
                          )}
                          {Array.isArray(message.content) && message.content.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {message.content.map((item, idx) => (
                                <Typography key={idx} variant="caption" color="inherit">
                                  {item}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </MessageBubble>
                      </Box>
                    </MessageContainer>
                  ))}
                <div ref={messagesEndRef} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {/* Flag Issue Dialog */}
      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FlagIcon color="warning" />
            <Typography variant="h6">Flag Trade Issue</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Issue Type</InputLabel>
              <Select value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value)} label="Issue Type">
                <MenuItem value="overpayment">Overpayment</MenuItem>
                <MenuItem value="negative">Negative Feedback</MenuItem>
                <MenuItem value="bad_rate">Bad Rate</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Please provide details about the issue..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFlagDialogOpen(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleFlagSubmit} startIcon={<FlagIcon />}>
            Submit Flag
          </Button>
        </DialogActions>
      </Dialog>
      {/* Alert Snackbar */}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setAlertOpen(false)} severity="warning" variant="filled" sx={{ width: "100%", "& .MuiAlert-icon": { color: "inherit" } }}>
          Trade issue has been flagged. Supervisors have been notified.
        </Alert>
      </Snackbar>
      {/* Escalate Trade Dialog */}
      {assignedTrade && user?.id && (
        <EscalateTrade
          open={escalateModalOpen}
          onClose={() => setEscalateModalOpen(false)}
          onSuccess={handleEscalationSuccess}
          escalateData={{
            tradeId: assignedTrade.id,
            assignedPayerId: assignedTrade?.assignedPayer?.id || user.id,
            escalatedById: user.id,
          }}
        />
      )}
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelPayment}
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this trade as paid?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelPayment}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isPaymentLoading}
            variant="contained"
            startIcon={isPaymentLoading ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            {isPaymentLoading ? "Processing…" : "Yes, mark as paid"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayerDashboard;
