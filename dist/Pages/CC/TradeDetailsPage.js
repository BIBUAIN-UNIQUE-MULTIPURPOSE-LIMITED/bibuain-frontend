import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/TradeDetailsPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Avatar, Paper, IconButton, InputBase, Divider, Container, CircularProgress, Drawer, useTheme, useMediaQuery, } from "@mui/material";
import { Send as SendIcon, AttachFile, Menu as MenuIcon } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "react-router-dom";
import { getTradeDetails, sendTradeMessage } from "../../api/trade";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUserContext } from "../../Components/ContextProvider";
// import { enUS } from "@mui/material/locale";
import { enUS } from "date-fns/locale";
const messageValidation = Yup.object({
    message: Yup.string().required("Message is required"),
});
const TradeDetailsPage = () => {
    const { platform, tradeHash, accountId } = useParams();
    const { user } = useUserContext();
    const currentUserId = user?.id || "";
    const [tradeDetailsData, setTradeDetailsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const fetchTradeData = useCallback(async () => {
        setLoading(true);
        try {
            if (!platform || !tradeHash || !accountId) {
                toast.error("Missing required parameters for fetching trade details.");
                return;
            }
            const res = await getTradeDetails(platform, tradeHash, accountId);
            if (res?.success) {
                setTradeDetailsData(res.data);
            }
            else {
                toast.error("Failed to fetch trade details.");
            }
        }
        catch (error) {
            console.error("Error fetching trade details:", error);
            toast.error("Error fetching trade details.");
        }
        finally {
            setLoading(false);
        }
    }, [platform, tradeHash, accountId]);
    useEffect(() => {
        fetchTradeData();
    }, [fetchTradeData]);
    useEffect(() => {
        if (tradeDetailsData?.tradeChat?.messages.length) {
            scrollToBottom();
        }
    }, [tradeDetailsData?.tradeChat?.messages]);
    // inside your TradeDetailsPage component, *replace* your old handleSendMessage:
    const handleSendMessage = async (values, { resetForm, setSubmitting }) => {
        // 1) make sure we have all the identifiers
        if (!platform || !tradeHash || !accountId) {
            toast.error("Missing trade identifiers.");
            setSubmitting(false);
            return;
        }
        try {
            // 2) call your API
            const res = await sendTradeMessage(accountId, values.message.trim());
            if (res?.success) {
                resetForm();
                await fetchTradeData();
                scrollToBottom();
            }
            else {
                toast.error(res?.message || "Failed to send message.");
            }
        }
        catch (err) {
            console.error("Error sending message:", err);
            toast.error("Failed to send message.");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (_jsx(Box, { sx: {
                display: "flex",
                minHeight: "100vh",
                alignItems: "center",
                justifyContent: "center",
            }, children: _jsx(CircularProgress, { color: "primary" }) }));
    }
    // Guard: if we failed to load data
    if (!tradeDetailsData) {
        return (_jsx(Box, { sx: { p: 3, textAlign: "center" }, children: _jsx(Typography, { color: "error", children: "Unable to load trade details." }) }));
    }
    // Destructure safely
    const { externalTrade, tradeChat, tradeRecord, tradeDuration } = tradeDetailsData;
    const messages = tradeChat.messages;
    const vendorUsername = tradeRecord.ownerUsername;
    // Left panel
    const TradeDetailsPanel = () => (_jsxs(Box, { sx: { p: 3, overflowY: "auto", height: "80vh" }, children: [_jsx(Typography, { sx: { fontWeight: "bold", mb: 2 }, children: "Trade Details" }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Trade Hash" }), _jsx(Typography, { children: tradeRecord.tradeHash })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Platform" }), _jsxs(Typography, { children: [tradeRecord.platform.toUpperCase(), " | ", vendorUsername] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", color: "textSecondary", children: "Trade Duration" }), _jsx(Typography, { children: tradeDuration !== null ? `${tradeDuration} sec` : "N/A" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { sx: { mb: 2 }, children: "Financial Details" }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Amount" }), _jsx(Typography, { children: tradeRecord.amount.toLocaleString() })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Crypto Total" }), _jsxs(Typography, { variant: "h6", children: [(tradeRecord.cryptoAmountTotal / 1e8).toFixed(8), " BTC"] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "BTC/NGN" }), _jsx(Typography, { children: Number(externalTrade.btcRate).toLocaleString() ?? "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Margin" }), _jsx(Typography, { children: tradeRecord.margin ?? "N/A" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Date/Time" }), _jsx(Typography, { children: formatWATDateTime(tradeRecord.createdAt) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Flagged" }), _jsx(Typography, { children: tradeRecord.flagged ? "Yes" : "No" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { sx: { mb: 2 }, children: "Notes & Feedback" }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Notes" }), _jsx(Typography, { sx: { whiteSpace: "pre-wrap" }, children: tradeRecord.notes || "None" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { color: "textSecondary", children: "Feedback" }), _jsx(Typography, { children: tradeRecord.feedback || "None" })] })] }));
    // Right panel
    const ChatWindow = () => (_jsxs(Box, { sx: {
            height: "80vh",
            display: "flex",
            flexDirection: "column",
        }, children: [_jsxs(Paper, { sx: {
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                }, children: [isMobile && (_jsx(IconButton, { edge: "start", onClick: () => setMobileOpen((o) => !o), sx: { mr: 2 }, children: _jsx(MenuIcon, {}) })), _jsx(Avatar, { sx: { mr: 2 }, children: tradeRecord.assignedPayer?.fullName.charAt(0) || "A" }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: tradeRecord.assignedPayer?.fullName || "Not Assigned" }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: "Trade Chat" })] })] }), _jsxs(Box, { sx: {
                    flex: 1,
                    p: 2,
                    overflowY: "auto",
                    backgroundColor: "#fafafa",
                }, children: [messages.length === 0 ? (_jsx(Box, { sx: { textAlign: "center", mt: 2 }, children: _jsx(Typography, { color: "textSecondary", children: "No messages yet." }) })) : (messages.map((msg) => {
                        const senderId = msg.sender?.id || "";
                        const senderName = msg.sender?.fullName?.trim() || "";
                        const date = new Date(msg.createdAt);
                        const formattedDate = isNaN(date.getTime())
                            ? "Invalid date"
                            : format(date, "MMM d, h:mm a");
                        // classify
                        const isExpired = typeof msg.content === "string" && /expired/i.test(msg.content);
                        const isCancel = typeof msg.content === "string" && /cancel/i.test(msg.content);
                        const isSelf = senderId === currentUserId;
                        const isVendor = senderName === vendorUsername;
                        const isBot = senderName === "System" || senderId === "system";
                        // pick colors
                        let bg, fg;
                        if (isExpired) {
                            bg = "#fdecea";
                            fg = theme.palette.error.dark;
                        }
                        else if (isCancel) {
                            bg = "#fdecea";
                            fg = theme.palette.error.dark;
                        }
                        else if (isBot) {
                            bg = "rgb(10, 144, 41)";
                            fg = theme.palette.grey[800];
                        }
                        else if (isVendor) {
                            bg = "rgb(242, 252, 159)";
                            fg = theme.palette.warning.dark;
                        }
                        else if (isSelf) {
                            bg = "rgb(241, 204, 84)";
                            fg = theme.palette.primary.dark;
                        }
                        else {
                            bg = theme.palette.background.paper;
                            fg = theme.palette.text.primary;
                        }
                        // render content
                        let messageContent;
                        if (typeof msg.content === "object" &&
                            (msg.content.bank_account || msg.content.bank_accounts)) {
                            const b = msg.content.bank_account || msg.content.bank_accounts;
                            messageContent = (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: "bold", mb: 1, bg: "yellow" }, children: "Bank Details:" }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Bank:" }), " ", b.bank_name || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Account #:" }), " ", b.account_number || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Holder:" }), " ", b.holder_name || "N/A"] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Amt:" }), " ", b.amount || "N/A", " ", b.currency || ""] })] }));
                        }
                        else {
                            messageContent = _jsx(Typography, { variant: "body1", children: msg.content });
                        }
                        return (_jsxs(Box, { sx: {
                                display: "flex",
                                flexDirection: isSelf ? "row-reverse" : "row",
                                alignItems: "flex-start",
                                mb: 2,
                            }, children: [_jsx(Avatar, { sx: { mx: 1 }, children: senderName.charAt(0) }), _jsxs(Box, { sx: {
                                        maxWidth: "70%",
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: bg,
                                        color: fg,
                                        boxShadow: 1,
                                    }, children: [messageContent, _jsx(Typography, { variant: "caption", sx: { display: "block", mt: 0.5, opacity: 0.7 }, children: formattedDate })] })] }, msg.id));
                    })), _jsx("div", { ref: messagesEndRef })] }), _jsx(Formik, { initialValues: { message: "" }, validationSchema: messageValidation, onSubmit: handleSendMessage, children: ({ values, handleChange, isSubmitting }) => (_jsx(Form, { children: _jsxs(Paper, { sx: {
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            borderTop: "1px solid #ddd",
                        }, children: [_jsx(IconButton, { children: _jsx(AttachFile, {}) }), _jsx(InputBase, { fullWidth: true, placeholder: "Type a message...", name: "message", value: values.message, onChange: handleChange }), _jsx(IconButton, { type: "submit", color: "primary", disabled: isSubmitting || !values.message.trim(), children: _jsx(SendIcon, {}) })] }) })) })] }));
    return (_jsx(Container, { maxWidth: "xl", sx: { mt: 3, minHeight: "100vh" }, children: _jsxs(Box, { sx: {
                display: "flex",
                height: "80vh",
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
            }, children: [!isMobile ? (_jsx(Box, { sx: { width: 300, borderRight: "1px solid #ddd" }, children: _jsx(TradeDetailsPanel, {}) })) : (_jsx(Drawer, { variant: "temporary", open: mobileOpen, onClose: () => setMobileOpen(false), ModalProps: { keepMounted: true }, sx: { "& .MuiDrawer-paper": { width: 300 } }, children: _jsx(TradeDetailsPanel, {}) })), _jsx(Box, { sx: { flex: 1 }, children: _jsx(ChatWindow, {}) })] }) }));
};
export default TradeDetailsPage;
