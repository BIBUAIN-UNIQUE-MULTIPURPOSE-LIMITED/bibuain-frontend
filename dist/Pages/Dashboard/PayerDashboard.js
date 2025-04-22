import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Box, Card, CardContent, Typography, Grid, Select, MenuItem, Button, FormControl, InputLabel, styled, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Divider, Avatar, Paper, 
// useTheme,
CircularProgress, } from "@mui/material";
import { Report as AlertIcon, CheckCircle, PauseCircle, AccountBalance as Bank, Flag as FlagIcon, Person, } from "@mui/icons-material";
import { format } from "date-fns";
import EscalateTrade from "../Payer/EscalateTrade";
import { useUserContext } from "../../Components/ContextProvider";
import { getPayerTrade, getTradeDetails, markTradeAsPaid } from "../../api/trade";
import toast from "react-hot-toast";
import { successStyles } from "../../lib/constants";
import { CreditCardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentShift } from "../../api/shift";
// Styled components
const MessageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
}));
const MessageBubble = styled(Paper, {
    shouldForwardProp: (prop) => prop !== "isAuthor",
})(({ theme, isAuthor }) => ({
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
const PayerDashboard = () => {
    // Local state for trade/chat data
    const [flagDialogOpen, setFlagDialogOpen] = useState(false);
    const [flagReason, setFlagReason] = useState("");
    const [messages, setMessages] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [alertOpen, setAlertOpen] = useState(false);
    const [tradeStatus, setTradeStatus] = useState("good");
    const [paymentInfo, setPaymentInfo] = useState({});
    const [assignedTrade, setAssignedTrade] = useState(null);
    const [escalateModalOpen, setEscalateModalOpen] = useState(false);
    const { user } = useUserContext();
    // Use a separate flag for the very first load only.
    const [initialLoading, setInitialLoading] = useState(true);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isUserClockedIn, setIsUserClockedIn] = useState(null);
    const [isCheckingClockStatus, setIsCheckingClockStatus] = useState(true);
    // const theme = useTheme();
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    // const fetchTradeData = async (isInitial = false) => {
    //   try {
    //     if (isInitial) setInitialLoading(true);
    //     const tradeData = await getPayerTrade(user?.id || "");
    //     if (tradeData?.success) {
    //       const newTrade = tradeData.data;
    //       console.log("Upper New trade staus: ", newTrade.status)
    //       if (newTrade.status === "escalated") {
    //         setAssignedTrade(null);
    //         console.log("New trade staus: ", newTrade.status)
    //         return;
    //       }
    //       if (newTrade.status === "paid" || newTrade.status === "completed") {
    //         setAssignedTrade(null);
    //         console.log("New trade staus: ", newTrade.status)
    //         return;
    //       }
    //       // if (isTradeDataDifferent(newTrade, assignedTrade)) 
    //       setAssignedTrade(newTrade);
    //       const detailsResponse = await getTradeDetails(
    //         newTrade.platform,
    //         newTrade.tradeHash,
    //         newTrade.accountId
    //       );
    //       if (detailsResponse?.data) {
    //         const { externalTrade, tradeChat } = detailsResponse.data;
    //         // 1) pull raw messages & attachments
    //         const msgs = Array.isArray(tradeChat?.messages)
    //           ? tradeChat.messages
    //           : [];
    //         const atts = Array.isArray(tradeChat?.attachments)
    //           ? tradeChat.attachments
    //           : [];
    //         // 2) find first message carrying bank_account payload
    //         const bankMsg = msgs.find(
    //           (m: { content: any; }) =>
    //             m.content &&
    //             typeof m.content === "object" &&
    //             (m.content as any).bank_account
    //         );
    //         const ba = bankMsg ? (bankMsg.content as any).bank_account : {};
    //         // 3) merge chat‑derived bank info over externalTrade
    //         setPaymentInfo({
    //           ...externalTrade,
    //           bankName: ba.bank_name || externalTrade?.bankName,
    //           accountNumber:
    //             ba.account_number || externalTrade?.accountNumber,
    //           accountHolder: ba.holder_name || externalTrade?.accountHolder,
    //         });
    //         // 4) now set messages & attachments
    //         setMessages(msgs);
    //         setAttachments(atts);
    //         // 5) preserve buyer_name into platformMetadata if present
    //         if (externalTrade?.buyer_name) {
    //           setAssignedTrade((prev) => ({
    //             ...prev!,
    //             platformMetadata: {
    //               ...prev?.platformMetadata,
    //               accountUsername: externalTrade.buyer_name,
    //             },
    //           }));
    //         }
    //       }
    //     }
    //   } catch (error: any) {
    //     // No active trade
    //     if (error.response?.status === 404) {
    //       setAssignedTrade(null);
    //     } else {
    //       console.error("Error fetching trade data:", error);
    //     }
    //   } finally {
    //     if (isInitial) setInitialLoading(false);
    //   }
    // };
    // Initial fetch on component mount
    const fetchTradeData = async (isInitial = false) => {
        try {
            if (isInitial)
                setInitialLoading(true);
            const tradeData = await getPayerTrade(user?.id || "");
            if (tradeData?.success) {
                const newTrade = tradeData.data;
                // Keep existing data during updates if there's no new data
                if (newTrade.status === "escalated" ||
                    newTrade.status === "paid" ||
                    newTrade.status === "completed") {
                    setAssignedTrade(null);
                    return;
                }
                // Only update the assigned trade if it's changed
                setAssignedTrade(prevTrade => {
                    // If it's a new trade or different trade, update it
                    if (!prevTrade || prevTrade.id !== newTrade.id) {
                        return newTrade;
                    }
                    // Otherwise keep existing state to avoid UI flickering
                    return prevTrade;
                });
                try {
                    const detailsResponse = await getTradeDetails(newTrade.platform, newTrade.tradeHash, newTrade.accountId);
                    if (detailsResponse?.data) {
                        const { externalTrade, tradeChat } = detailsResponse.data;
                        // 1) pull raw messages & attachments
                        const msgs = Array.isArray(tradeChat?.messages) ? tradeChat.messages : [];
                        const atts = Array.isArray(tradeChat?.attachments) ? tradeChat.attachments : [];
                        // 2) find first message carrying bank_account payload
                        const bankMsg = msgs.find((m) => m.content && typeof m.content === "object" && m.content.bank_account);
                        const ba = bankMsg ? bankMsg.content.bank_account : {};
                        // 3) merge chat‑derived bank info with existing externalTrade data
                        setPaymentInfo(prevInfo => {
                            const updatedInfo = {
                                ...prevInfo,
                                ...externalTrade,
                                bankName: ba.bank_name || externalTrade?.bankName || prevInfo?.bankName,
                                accountNumber: ba.account_number || externalTrade?.accountNumber || prevInfo?.accountNumber,
                                accountHolder: ba.holder_name || externalTrade?.accountHolder || prevInfo?.accountHolder,
                            };
                            // Only update if something actually changed to prevent re-renders
                            if (JSON.stringify(updatedInfo) !== JSON.stringify(prevInfo)) {
                                return updatedInfo;
                            }
                            return prevInfo;
                        });
                        // 4) now set messages & attachments
                        setMessages(prevMsgs => {
                            if (JSON.stringify(msgs) !== JSON.stringify(prevMsgs)) {
                                return msgs;
                            }
                            return prevMsgs;
                        });
                        setAttachments(prevAtts => {
                            if (JSON.stringify(atts) !== JSON.stringify(prevAtts)) {
                                return atts;
                            }
                            return prevAtts;
                        });
                        // 5) preserve buyer_name into platformMetadata if present
                        if (externalTrade?.buyer_name) {
                            setAssignedTrade((prev) => {
                                if (!prev)
                                    return null;
                                // Only update if the value changed
                                if (prev.platformMetadata?.accountUsername !== externalTrade.buyer_name) {
                                    return {
                                        ...prev,
                                        platformMetadata: {
                                            ...prev?.platformMetadata,
                                            accountUsername: externalTrade.buyer_name,
                                        },
                                    };
                                }
                                return prev;
                            });
                        }
                    }
                }
                catch (error) {
                    console.error("Error fetching trade details:", error);
                }
            }
        }
        catch (error) {
            // No active trade
            if (error.response?.status === 404) {
                setAssignedTrade(null);
            }
            else {
                console.error("Error fetching trade data:", error);
            }
        }
        finally {
            if (isInitial)
                setInitialLoading(false);
        }
    };
    useEffect(() => {
        if (user) {
            fetchTradeData(true);
        }
    }, [user]);
    // Polling mechanism: silently refresh trade data every 5 seconds.
    useEffect(() => {
        if (!user)
            return;
        const intervalId = setInterval(() => {
            fetchTradeData(false);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [user]);
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
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchTradeData(true);
        }
        catch (error) {
            console.error("Error refreshing trade:", error);
            console.error("Error refreshing trade data");
        }
    };
    const approveTrade = async () => {
        if (!assignedTrade)
            return;
        const confirmMsg = window.confirm("Do you want to mark this trade as paid?");
        if (!confirmMsg)
            return;
        setIsPaymentLoading(true);
        try {
            const response = await markTradeAsPaid(assignedTrade.id);
            if (response?.success) {
                toast.success("Trade marked as paid successfully!", successStyles);
                // Add a small delay before fetching updated data
                setTimeout(async () => {
                    await fetchTradeData(true);
                    setAssignedTrade(null);
                    setPaymentInfo({});
                    setMessages([]);
                }, 1000);
            }
            else {
                const errorMessage = response?.message || "Failed to mark trade as paid";
                console.error(errorMessage);
                await refreshtrade();
            }
        }
        catch (error) {
            console.error("Payment error:", error);
            // Your existing error handling code
            await refreshtrade();
        }
        finally {
            setIsPaymentLoading(false);
        }
    };
    const handleEscalationSuccess = async () => {
        // Clear current trade data
        setAssignedTrade(null);
        setPaymentInfo({});
        setMessages([]);
        // Don't try to fetch new trade data immediately since there won't be any
        // await fetchTradeData(true);  
        toast.success("Trade escalated successfully", successStyles);
        // Optional: After a delay, check if there's a new trade assigned
        setTimeout(() => {
            fetchTradeData(true);
        }, 2000);
    };
    useEffect(() => {
        async function checkClockInStatus() {
            if (user) {
                try {
                    const shiftData = await getCurrentShift();
                    if (shiftData?.success && shiftData.data) {
                        const { clockedIn } = shiftData.data;
                        setIsUserClockedIn(clockedIn);
                    }
                    else {
                        setIsUserClockedIn(false);
                    }
                }
                catch (error) {
                    console.error("Error checking clock-in status:", error);
                    setIsUserClockedIn(false);
                }
                finally {
                    setIsCheckingClockStatus(false);
                }
            }
        }
        checkClockInStatus();
    }, [user]);
    // Show initial loading only; do not show loading state during silent polling.
    if (initialLoading || isCheckingClockStatus) {
        return (_jsx(Box, { sx: {
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
            }, children: _jsx(CircularProgress, { color: "primary" }) }));
    }
    if (!isUserClockedIn) {
        return (_jsxs(Box, { sx: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                p: 3,
            }, children: [_jsx(Typography, { variant: "h5", gutterBottom: true, children: "You are currently clocked out." }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: "Please clock in to access your dashboard." })] }));
    }
    if (assignedTrade === null) {
        return (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(StyledCard, { children: _jsx(CardContent, { sx: { p: 4 }, children: _jsxs(Box, { sx: {
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    minHeight: "400px",
                                    py: 4,
                                }, children: [_jsx(PauseCircle, { sx: {
                                            fontSize: 80,
                                            color: "text.secondary",
                                            mb: 3,
                                            opacity: 0.7,
                                        } }), _jsx(Typography, { variant: "h5", gutterBottom: true, sx: { fontWeight: 600 }, children: "No Active Trade Assigned" }), _jsx(Typography, { variant: "body1", color: "text.secondary", sx: { maxWidth: 400, mb: 3 }, children: "You currently don't have any trades assigned. New trades will appear here once they're allocated to you." }), _jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [_jsx(Link, { to: "/transaction/history", className: "px-4 py-2 bg-gray-500 text-white rounded-md font-semibold", children: "View History" }), _jsx(Button, { variant: "contained", onClick: handleRefresh, sx: {
                                                    backgroundColor: "primary.main",
                                                    "&:hover": {
                                                        backgroundColor: "primary.dark",
                                                    },
                                                }, children: "Refresh" })] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsx(Typography, { variant: "h6", children: "Trade Chat" }) })] }));
    }
    return (_jsxs(Box, { sx: { mt: 3, minHeight: "100vh", zIndex: -1 }, children: [assignedTrade?.flagged && (_jsx("div", { className: "w-[1230px] right-0 h-[100vh] top-[0px] bg-red-500/20 absolute z-[0]" })), _jsx(Container, { maxWidth: "xl", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs("div", { className: "w-full z-[1] bg-white shadow-xl rounded-2xl p-8 space-y-8", children: [_jsxs("div", { className: "flex flex-wrap justify-between items-center", children: [_jsx("h2", { className: "text-3xl font-extrabold text-gray-800", children: "Trade Details" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [assignedTrade?.flagged ? (_jsx("span", { className: "px-4 py-2 bg-red-500 text-white rounded-md font-semibold", children: "BAD" })) : (_jsx("span", { className: "px-4 py-2 bg-green-500 text-white rounded-md font-semibold", children: "GOOD" })), _jsxs("button", { onClick: () => setFlagDialogOpen(true), className: "flex items-center gap-2 border-2 border-yellow-500 text-yellow-600 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors", children: [_jsx(FlagIcon, {}), "Flag Issue"] }), _jsxs("button", { onClick: () => setEscalateModalOpen(true), className: "flex items-center gap-2 border-2 border-red-500 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors", children: [_jsx(AlertIcon, {}), "Escalate"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Platform" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: assignedTrade?.platform?.toUpperCase() })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "BTC Rate" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: paymentInfo?.btcRate ? Number(paymentInfo.btcRate).toLocaleString() : "N/A" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Account" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: assignedTrade?.platformMetadata?.accountUsername || "N/A" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Dollar Rate" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: paymentInfo?.dollarRate ? Number(paymentInfo.dollarRate).toLocaleString() : "N/A" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Amount" }), _jsx("h3", { className: "text-2xl font-bold text-blue-600", children: assignedTrade?.amount ? Number(assignedTrade.amount).toLocaleString() : "N/A" })] })] }), _jsxs("div", { className: "bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Payment Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bank, { className: "text-blue-600" }), _jsx("p", { className: "text-sm text-gray-500", children: "Bank Name" })] }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: paymentInfo?.bankName || "N/A" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CreditCardIcon, { className: "text-blue-600" }), _jsx("p", { className: "text-sm text-gray-500", children: "Account Number" })] }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: paymentInfo?.accountNumber || "N/A" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Person, { className: "text-blue-600" }), _jsx("p", { className: "text-sm text-gray-500", children: "Account Holder" })] }), _jsx("h3", { className: "text-lg font-semibold text-gray-800", children: paymentInfo?.accountHolder || "N/A" })] })] })] }), _jsx("button", { onClick: approveTrade, disabled: isPaymentLoading, className: `w-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition ${isPaymentLoading ? "opacity-75 cursor-not-allowed" : ""}`, children: isPaymentLoading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 24, color: "inherit", className: "mr-2" }), "PROCESSING..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "inline-block mr-2" }), "CONFIRM PAYMENT"] })) })] }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Card, { sx: { width: "100%", height: "100%", display: "flex", flexDirection: "column" }, children: [_jsxs(CardContent, { sx: { p: 2, flexGrow: 0 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Trade Chat" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [messages?.length, " messages \u2022 ", attachments?.length, " attachments"] })] }), _jsx(Divider, {}), _jsxs(Box, { sx: {
                                            flexGrow: 1,
                                            overflowY: "auto",
                                            p: 2,
                                            maxHeight: "400px",
                                            "&::-webkit-scrollbar": { width: "8px" },
                                            "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
                                            "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
                                        }, children: [messages &&
                                                messages.map((message) => (_jsxs(MessageContainer, { children: [_jsx(Avatar, { sx: { width: 40, height: 40 }, src: `https://i.pravatar.cc/150?u=${message.author?.id || ""}`, children: paymentInfo?.buyer_name || "Anonymous" }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [_jsx(Typography, { variant: "subtitle2", children: paymentInfo?.buyer_name || "Anonymous" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: message.createdAt
                                                                                ? (() => {
                                                                                    try {
                                                                                        return format(new Date(message.createdAt), "MMM d, h:mm a");
                                                                                    }
                                                                                    catch (error) {
                                                                                        console.error(error);
                                                                                        return "Unknown date";
                                                                                    }
                                                                                })()
                                                                                : "Unknown date" })] }), _jsxs(MessageBubble, { isAuthor: message.sender?.id === user?.id, elevation: 0, children: [typeof message.content === "object" &&
                                                                            message.content !== null &&
                                                                            'bank_account' in message.content ? (_jsxs(Box, { sx: { p: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 1, fontWeight: "bold" }, children: "Bank Account Details:" }), _jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 0.5 }, children: [_jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Bank:" }), " ", message.content.bank_account?.bank_name || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Account Number:" }), " ", message.content.bank_account?.account_number || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Account Holder:" }), " ", message.content.bank_account?.holder_name || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Amount:" }), " ", message.content.bank_account?.currency, " ", message.content.bank_account?.amount || "N/A"] })] })] })) : (_jsx("div", { dangerouslySetInnerHTML: { __html: typeof message.content === 'string' ? message.content : '' } })), Array.isArray(message.content) && message.content.length > 0 && (_jsx(Box, { sx: { mt: 1 }, children: message.content.map((item, idx) => (_jsx(Typography, { variant: "caption", color: "inherit", children: item }, idx))) }))] })] })] }, message.id))), _jsx("div", { ref: messagesEndRef })] })] }) })] }) }), _jsxs(Dialog, { open: flagDialogOpen, onClose: () => setFlagDialogOpen(false), children: [_jsx(DialogTitle, { children: _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [_jsx(FlagIcon, { color: "warning" }), _jsx(Typography, { variant: "h6", children: "Flag Trade Issue" })] }) }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { mt: 2 }, children: [_jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { children: "Issue Type" }), _jsxs(Select, { value: tradeStatus, onChange: (e) => setTradeStatus(e.target.value), label: "Issue Type", children: [_jsx(MenuItem, { value: "overpayment", children: "Overpayment" }), _jsx(MenuItem, { value: "negative", children: "Negative Feedback" }), _jsx(MenuItem, { value: "bad_rate", children: "Bad Rate" })] })] }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 4, label: "Description", value: flagReason, onChange: (e) => setFlagReason(e.target.value), placeholder: "Please provide details about the issue..." })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setFlagDialogOpen(false), sx: { color: "text.secondary" }, children: "Cancel" }), _jsx(Button, { variant: "contained", color: "warning", onClick: handleFlagSubmit, startIcon: _jsx(FlagIcon, {}), children: "Submit Flag" })] })] }), _jsx(Snackbar, { open: alertOpen, autoHideDuration: 6000, onClose: () => setAlertOpen(false), anchorOrigin: { vertical: "top", horizontal: "right" }, children: _jsx(Alert, { onClose: () => setAlertOpen(false), severity: "warning", variant: "filled", sx: { width: "100%", "& .MuiAlert-icon": { color: "inherit" } }, children: "Trade issue has been flagged. Supervisors have been notified." }) }), assignedTrade && user?.id && (_jsx(EscalateTrade, { open: escalateModalOpen, onClose: () => setEscalateModalOpen(false), onSuccess: handleEscalationSuccess, escalateData: {
                    tradeId: assignedTrade.id,
                    assignedPayerId: assignedTrade?.assignedPayer?.id || user.id,
                    escalatedById: user.id,
                } }))] }));
};
export default PayerDashboard;
