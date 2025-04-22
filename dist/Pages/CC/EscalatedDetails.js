import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Box, Paper, Typography, Avatar, Button, Chip, IconButton, Badge, Tooltip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, TextField, useTheme, InputAdornment, } from "@mui/material";
import { Schedule, NotificationsActive, ArrowBack, Image, FileCopy, AttachFileOutlined, PictureAsPdf, Send, Sync, } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getEscalatedTradeById } from "../../api/trade";
import { getAllUsers } from "../../api/user";
import { reAssignTrade, sendTradeMessage, cancelTradeRequest } from "../../api/trade";
import toast from "react-hot-toast";
import { errorStyles, successStyles } from "../../lib/constants";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
const DEFAULT_AVATAR = "/default.png";
const EscalatedDetails = () => {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [escalatedTrade, setEscalatedTrade] = useState(null);
    const [messages, setMessages] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [_payer, setPayer] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [reminderOpen, setReminderOpen] = useState(false);
    const [cancelTradeState, setCancelTradeState] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const fetchTradeDetails = async () => {
        try {
            setLoading(true);
            if (!tradeId) {
                navigate("/customer-support");
                return;
            }
            const response = await getEscalatedTradeById(tradeId);
            console.log("API Response:", response);
            if (response?.success) {
                const { trade, tradeChat, externalTrade } = response.data;
                setEscalatedTrade({
                    ...trade,
                    externalTrade,
                    amount: trade.amount,
                    platform: trade.platform,
                    reason: trade.reason || trade.escalationReason || trade.escalatedReason
                });
                // Process messages to add isCurrentUser flag
                const processedMessages = (tradeChat?.messages || []).map((msg) => ({
                    ...msg,
                    sender: {
                        ...msg.sender,
                        isCurrentUser: msg.sender.id === "current-user" // Adjust this based on your auth system
                    }
                }));
                setMessages(processedMessages);
                setAttachments(tradeChat?.attachments || []);
            }
            else {
                toast.error("Failed to fetch trade details", errorStyles);
                navigate("/customer-support");
            }
            const payerResponse = await getAllUsers({
                userType: 'payer',
                clockedIn: 'true'
            });
            console.log("Payer agents response:", payerResponse);
            if (payerResponse && Array.isArray(payerResponse)) {
                setPayer(payerResponse);
            }
        }
        catch (error) {
            console.error("Error fetching trade details:", error);
            toast.error("Error loading trade details", errorStyles);
            navigate("/customer-support");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTradeDetails();
    }, [tradeId]);
    const handleCancelTrade = async () => {
        setCancelTradeState(true);
        try {
            if (!tradeId) {
                toast.error("Trade ID is missing", errorStyles);
                return;
            }
            const res = await cancelTradeRequest(tradeId);
            console.log("Cancel trade response:", res);
            if (res) {
                toast.success("Trade cancelled successfully", successStyles);
                // Update local state to reflect the cancelled status
                setEscalatedTrade((prev) => ({
                    ...prev,
                    status: 'cancelled'
                }));
                // Navigate back to the list after a short delay
                setTimeout(() => {
                    navigate("/customer-support");
                }, 2000);
            }
            else {
                setTimeout(() => {
                    navigate("/customer-support");
                }, 2000);
            }
        }
        catch (error) {
            console.error("Error cancelling trade:", error);
            toast.error("An error occurred while cancelling the trade", errorStyles);
        }
        finally {
            setCancelTradeState(false);
        }
    };
    const formatWATDateTime = (date) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) {
                return 'Invalid date';
            }
            const absoluteTime = dateObj.toLocaleString('en-NG', {
                timeZone: 'Africa/Lagos',
                dateStyle: 'short',
                timeStyle: 'short'
            });
            const watDate = new Date(dateObj.getTime() + 60 * 60 * 1000);
            const relativeTime = formatDistanceToNow(watDate, {
                addSuffix: true,
                locale: enUS
            });
            return `${absoluteTime} (${relativeTime})`;
        }
        catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };
    const handleReAssign = async () => {
        if (!escalatedTrade?.id) {
            toast.error("Missing required data", errorStyles);
            return;
        }
        try {
            console.log("Reassigning trade:", {
                tradeId: escalatedTrade.id,
            });
            const response = await reAssignTrade(escalatedTrade.id);
            if (response?.success) {
                toast.success("Trade reassigned successfully", successStyles);
                fetchTradeDetails();
            }
            else {
                toast.error(response?.message || "Failed to reassign trade", errorStyles);
            }
        }
        catch (error) {
            console.error("Error reassigning trade:", error);
            toast.error(error.response?.data?.message || "Failed to reassign trade", errorStyles);
        }
    };
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !tradeId)
            return;
        try {
            const tempMessage = {
                id: `temp-${Date.now()}`,
                content: newMessage,
                sender: {
                    id: "current-user",
                    fullName: "You",
                    avatar: DEFAULT_AVATAR,
                    isCurrentUser: true
                },
                createdAt: new Date().toISOString(),
                status: 'sending'
            };
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage("");
            const response = await sendTradeMessage(tradeId, newMessage);
            if (response?.success) {
                setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg));
                fetchTradeDetails();
            }
            else {
                setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg));
                toast.error("Failed to send message", errorStyles);
            }
        }
        catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message", errorStyles);
            setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
        }
    };
    const handleRetryMessage = async (message) => {
        if (typeof message.content !== 'string' || !tradeId)
            return;
        try {
            setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, status: 'sending' } : msg));
            const response = await sendTradeMessage(tradeId, message.content);
            if (response?.success) {
                setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, status: 'sent' } : msg));
            }
            else {
                setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, status: 'failed' } : msg));
            }
        }
        catch (error) {
            console.error("Error retrying message:", error);
            setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, status: 'failed' } : msg));
        }
    };
    const formatDate = (dateString) => {
        try {
            if (!dateString)
                return "N/A";
            const date = new Date(dateString);
            if (isNaN(date.getTime()))
                return "Invalid Date";
            return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }
        catch (e) {
            console.error("Error formatting date:", e);
            return "Invalid Date";
        }
    };
    const getFileIcon = (type) => {
        if (type.startsWith("image/"))
            return _jsx(Image, { color: "primary" });
        if (type === "application/pdf")
            return _jsx(PictureAsPdf, { color: "primary" });
        return _jsx(FileCopy, { color: "primary" });
    };
    const formatFileSize = (bytes) => {
        if (!bytes)
            return "0 B";
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    if (loading || !escalatedTrade) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { className: "flex flex-col md:flex-row h-full bg-gray-50", children: [_jsxs(Box, { className: "w-full md:w-1/3 lg:w-1/4 flex flex-col h-full border-r border-gray-200", children: [_jsx(Box, { className: "p-4 bg-white border-b border-gray-200", children: _jsxs(Box, { className: "flex items-center gap-2", children: [_jsx(IconButton, { onClick: () => navigate("/customer-support"), children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Trade Details" })] }) }), _jsxs(Box, { className: "flex-1 p-4 overflow-y-auto", children: [_jsxs(Paper, { elevation: 0, sx: { p: 3, mb: 3, borderRadius: 2, border: "1px solid #eee" }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Basic Information" }), _jsx(Button, { variant: "contained", fullWidth: true, sx: { mt: 2 }, onClick: handleReAssign, children: "Reassign Trade" }), _jsxs(Box, { sx: { mb: 2, mt: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Trade ID" }), _jsx(Typography, { children: escalatedTrade.tradeHash || "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Platform" }), _jsx(Typography, { children: escalatedTrade.platform || "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Amount" }), _jsx(Typography, { sx: { fontWeight: 600, color: "primary.main" }, children: Number(escalatedTrade.externalTrade.amount).toLocaleString() || "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Status" }), _jsx(Chip, { label: escalatedTrade.status || "N/A", size: "small", sx: {
                                                    ...(escalatedTrade.status?.toLowerCase() === "escalated"
                                                        ? { bgcolor: "#FFEBEE", color: "#C62828" }
                                                        : { bgcolor: "#E8F5E9", color: "#2E7D32" }),
                                                    fontWeight: 600
                                                } })] }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Escalation Details" }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Escalated By" }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mt: 1, children: [_jsx(Avatar, { src: escalatedTrade.escalatedBy?.avatar, sx: { width: 32, height: 32 } }), _jsx(Typography, { children: escalatedTrade.escalatedBy?.fullName || "N/A" })] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Reason" }), _jsx(Typography, { children: escalatedTrade.reason || "No reason provided" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Date Escalated" }), _jsx(Typography, { children: formatWATDateTime(escalatedTrade.createdAt) })] }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Trade Information" }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Payment Method" }), _jsx(Typography, { children: escalatedTrade.paymentMethod || "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "Dollar Rate" }), _jsx(Typography, { children: Number(escalatedTrade.externalTrade.dollarRate).toLocaleString() || "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: "BTC Rate" }), _jsx(Typography, { children: Number(escalatedTrade.externalTrade.btcRate).toLocaleString() || "N/A" })] }), _jsx(Button, { variant: "contained", fullWidth: true, sx: { mt: 2 }, onClick: () => setConfirmCancelOpen(true), disabled: cancelTradeState, children: cancelTradeState ? "Cancelling..." : "Cancel Trade" })] }), _jsxs(Paper, { elevation: 0, sx: { p: 3, mb: 3, borderRadius: 2, border: "1px solid #eee" }, children: [_jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: ["Attachments (", attachments.length, ")"] }), attachments.length > 0 ? (_jsx(List, { children: attachments.map((attachment) => (_jsxs(ListItem, { sx: {
                                                "&:hover": { bgcolor: "action.hover" },
                                                borderRadius: 1,
                                                cursor: "pointer"
                                            }, children: [_jsx(ListItemAvatar, { children: getFileIcon(attachment.type) }), _jsx(ListItemText, { primary: attachment.name, secondary: formatFileSize(attachment.size) })] }, attachment.id))) })) : (_jsx(Typography, { variant: "body2", color: "textSecondary", children: "No attachments found" }))] }), _jsxs(Paper, { elevation: 0, sx: { p: 3, borderRadius: 2, border: "1px solid #eee" }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Activity Timeline" }), escalatedTrade.activityLog?.length > 0 ? (_jsx(Box, { children: escalatedTrade.activityLog.map((activity, index) => (_jsxs(Box, { sx: { mb: 2, pl: 2, borderLeft: "2px solid #eee" }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: activity.action || "Activity" }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: [formatDate(activity.performedAt), " by ", activity.performedBy || "System"] })] }, index))) })) : (_jsx(Typography, { variant: "body2", color: "textSecondary", children: "No activity recorded" }))] })] })] }), _jsxs(Box, { className: "flex-1 flex flex-col bg-white", sx: { height: '100vh' }, children: [_jsx(Box, { className: "p-4 border-b border-gray-200", children: _jsxs(Box, { className: "flex justify-between items-center", children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Trade Chat" }), _jsxs(Box, { className: "flex gap-2", children: [_jsx(Tooltip, { title: "Set Reminder", children: _jsx(IconButton, { onClick: () => setReminderOpen(true), children: _jsx(Schedule, {}) }) }), _jsx(Tooltip, { title: "Notifications", children: _jsx(IconButton, { children: _jsx(Badge, { badgeContent: 0, color: "error", children: _jsx(NotificationsActive, {}) }) }) })] })] }) }), _jsx(Box, { sx: {
                            flex: 1,
                            p: 2,
                            overflowY: "auto",
                            height: "calc(100vh - 200px)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            bgcolor: "#f9f9f9",
                        }, children: messages.length === 0 ? (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "text.secondary", children: "No messages yet" })) : (messages.map((message) => {
                            // classify
                            const isExpired = typeof message.content === "string" && /expired/i.test(message.content);
                            const isSelf = Boolean(message.sender.isCurrentUser);
                            const isVendor = !isSelf && message.sender.id !== "system" && message.sender.fullName !== "System";
                            const isBot = message.sender.id === "system" || message.sender.fullName === "System";
                            // pick colors
                            let bg, fg;
                            if (isExpired) {
                                bg = "#fdecea";
                                fg = theme.palette.error.dark;
                            }
                            else if (isSelf) {
                                bg = "rgb(241, 204, 84)";
                                fg = theme.palette.primary.dark;
                            }
                            else if (isVendor) {
                                bg = "rgb(242, 252, 159)";
                                fg = theme.palette.warning.dark;
                            }
                            else if (isBot) {
                                bg = "rgb(10, 144, 41)";
                                fg = theme.palette.grey[800];
                            }
                            else {
                                bg = theme.palette.background.paper;
                                fg = theme.palette.text.primary;
                            }
                            return (_jsx(Box, { sx: {
                                    display: "flex",
                                    mb: 1,
                                    justifyContent: isSelf ? "flex-end" : "flex-start",
                                }, children: _jsxs(Box, { sx: {
                                        display: "flex",
                                        maxWidth: "80%",
                                        gap: 1,
                                        flexDirection: isSelf ? "row-reverse" : "row",
                                    }, children: [_jsx(Avatar, { src: message.sender.avatar || DEFAULT_AVATAR, sx: { width: 36, height: 36, alignSelf: "flex-end" } }), _jsxs(Paper, { elevation: 2, sx: {
                                                p: 1.5,
                                                borderRadius: 2,
                                                backgroundColor: bg,
                                                color: fg,
                                                maxWidth: "70%",
                                                wordBreak: "break-word",
                                                opacity: message.status === "sending" ? 0.7 : 1,
                                                border: message.status === "failed" ? "1px solid red" : "none",
                                            }, children: [typeof message.content === "object" ? (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: "bold" }, children: "Bank Transfer Details:" }), _jsxs(Box, { component: "ul", sx: { pl: 2, mt: 1, mb: 1 }, children: [_jsx(Box, { component: "li", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Bank:" }), " ", message.content.bank_account?.bank_name || "N/A"] }) }), _jsx(Box, { component: "li", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Account:" }), " ", message.content.bank_account?.account_number || "N/A"] }) }), _jsx(Box, { component: "li", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Holder:" }), " ", message.content.bank_account?.holder_name || "N/A"] }) }), _jsx(Box, { component: "li", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Amount:" }), " ", message.content.bank_account?.amount || "N/A", " ", message.content.bank_account?.currency || ""] }) })] })] })) : (_jsx(Typography, { variant: "body2", children: message.content })), _jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx(Typography, { variant: "caption", sx: {
                                                                color: fg,
                                                                fontStyle: message.status === "sending" ? "italic" : "normal",
                                                            }, children: message.status === "sending"
                                                                ? "Sending..."
                                                                : formatDate(message.createdAt) }), message.status === "failed" && (_jsx(Tooltip, { title: "Failed to send - click to retry", children: _jsx(IconButton, { size: "small", onClick: () => handleRetryMessage(message), sx: { color: "error.main" }, children: _jsx(Sync, {}) }) }))] })] })] }) }, message.id));
                        })) }), _jsx(Box, { sx: {
                            p: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "background.default",
                        }, children: _jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Type a message...", value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSendMessage(), InputProps: {
                                        sx: { borderRadius: "20px", backgroundColor: "background.paper" },
                                        endAdornment: (_jsxs(InputAdornment, { position: "end", children: [_jsx(IconButton, { onClick: () => fileInputRef.current?.click(), edge: "end", children: _jsx(AttachFileOutlined, {}) }), _jsx("input", { type: "file", ref: fileInputRef, style: { display: "none" } })] })),
                                    } }), _jsx(Button, { variant: "contained", color: "primary", onClick: handleSendMessage, disabled: !newMessage.trim(), sx: { minWidth: "40px", height: "40px", borderRadius: "50%", p: 0 }, children: _jsx(Send, {}) })] }) })] }), _jsxs(Dialog, { open: reminderOpen, onClose: () => setReminderOpen(false), children: [_jsx(DialogTitle, { children: "Set Reminder" }), _jsxs(DialogContent, { children: [_jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: "Set a reminder for this trade" }), _jsx(TextField, { fullWidth: true, type: "datetime-local", InputLabelProps: { shrink: true }, sx: { mt: 2 } })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setReminderOpen(false), children: "Cancel" }), _jsx(Button, { onClick: () => setReminderOpen(false), variant: "contained", children: "Set Reminder" })] })] }), _jsxs(Dialog, { open: confirmCancelOpen, onClose: () => setConfirmCancelOpen(false), children: [_jsx(DialogTitle, { children: "Confirm Cancellation" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Are you sure you want to cancel this trade?" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirmCancelOpen(false), children: "No" }), _jsx(Button, { variant: "contained", onClick: () => {
                                    setConfirmCancelOpen(false);
                                    handleCancelTrade(); // ← calls your existing cancellation logic
                                }, disabled: cancelTradeState, children: "Yes" })] })] })] }));
};
export default EscalatedDetails;
