import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, Typography, Chip, IconButton, Tooltip, Badge, Tab, Tabs, Menu, MenuItem, InputAdornment, CircularProgress, } from "@mui/material";
import { Search, FilterList, Refresh, ArrowDownward, ArrowUpward, Assignment, SupportAgent, ErrorOutline, Sort, } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { getEscalatedTrades, getCompletedTrades, getAllTrades } from "../../api/trade";
import { createNotification } from "../../api/user";
import { exportToCSV, exportToPDF } from "../../lib/reportExporter";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
const ExportButtons = ({ data, type, }) => {
    return (_jsxs(Box, { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outlined", onClick: () => exportToCSV(data, type), startIcon: _jsx(Assignment, {}), sx: {
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                        borderColor: "secondary.main",
                        bgcolor: "rgba(248, 188, 8, 0.04)",
                    },
                }, children: "Export CSV" }), _jsx(Button, { variant: "outlined", onClick: () => exportToPDF(data, type), startIcon: _jsx(Assignment, {}), sx: {
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                        borderColor: "secondary.main",
                        bgcolor: "rgba(248, 188, 8, 0.04)",
                    },
                }, children: "Export PDF" })] }));
};
const TabPanel = ({ children, value, index, ...other }) => {
    return (_jsx("div", { role: "tabpanel", hidden: value !== index, id: `support-tabpanel-${index}`, "aria-labelledby": `support-tab-${index}`, ...other, children: value === index && _jsx(Box, { sx: { py: 3 }, children: children }) }));
};
const formatDate = (date) => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        const watDate = new Date(dateObj.getTime() + 60 * 60 * 1000);
        const relativeTime = formatDistanceToNow(watDate, {
            addSuffix: false,
            locale: enUS
        });
        return `${relativeTime}`;
    }
    catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};
const CustomerSupport = () => {
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [escalatedTrades, setEscalatedTrades] = useState([]);
    const [completedTrades, setCompletedTrades] = useState([]);
    const [allTrades, setAllTrades] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: "",
        direction: "asc"
    });
    const [filterAnchor, setFilterAnchor] = useState(null);
    const [filter, setFilter] = useState("");
    const previousMessageCounts = useRef({});
    const initialLoad = useRef(true);
    const handleTabChange = (_event, newValue) => {
        setTabValue(newValue);
        setSearchTerm("");
        setFilter("");
        setSortConfig({ field: "", direction: "asc" });
    };
    const getStatusStyles = (status) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("escalated")) {
            return { bgcolor: "#FFEDED", color: "#D32F2F" };
        }
        else if (statusLower.includes("completed") || statusLower.includes("resolved")) {
            return { bgcolor: "#EDF7ED", color: "#2E7D32" };
        }
        else if (statusLower.includes("pending") || statusLower.includes("open")) {
            return { bgcolor: "#FFF4E5", color: "#ED6C02" };
        }
        else {
            return { bgcolor: "#F5F5F5", color: "#616161" };
        }
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const [esData, compData, allData] = await Promise.all([getEscalatedTrades(), getCompletedTrades({}), getAllTrades()]);
            if (esData?.success) {
                setEscalatedTrades(esData.data.map((t) => ({
                    id: t.id,
                    tradeHash: t.tradeHash,
                    platform: t.platform,
                    amount: t.amount || 0,
                    status: t.status,
                    createdAt: t.createdAt,
                    ownerUsername: t.ownerUsername,
                    responderUsername: t.responderUsername,
                    reason: t.escalationReason,
                    cryptoCurrencyCode: t.cryptoCurrencyCode,
                    fiatCurrency: t.fiatCurrency,
                    paymentMethod: t.paymentMethod,
                    hasNewMessages: t.hasNewMessages,
                })));
            }
            if (compData?.success) {
                const arr = Array.isArray(compData.data) ? compData.data : compData.data.trades;
                setCompletedTrades(arr.map((t) => ({
                    id: t.id,
                    tradeHash: t.tradeHash,
                    platform: t.platform,
                    amount: t.amount || 0,
                    status: t.status,
                    createdAt: t.createdAt,
                    ownerUsername: t.ownerUsername,
                    responderUsername: t.responderUsername,
                    cryptoCurrencyCode: t.cryptoCurrencyCode,
                    fiatCurrency: t.fiatCurrency,
                    paymentMethod: t.paymentMethod,
                    accountId: t.accountId,
                })));
            }
            if (allData?.success) {
                const arr = Array.isArray(allData.data) ? allData.data : allData.data.trades;
                const mapped = arr.map((t) => ({
                    id: t.id,
                    tradeHash: t.tradeHash,
                    platform: t.platform,
                    amount: t.amount || 0,
                    status: t.tradeStatus || t.status,
                    createdAt: t.createdAt,
                    ownerUsername: t.accountId,
                    responderUsername: t.assignedPayer?.fullName || t.assignedPayer?.id,
                    cryptoCurrencyCode: t.cryptoCurrencyCode,
                    fiatCurrency: t.fiatCurrency,
                    paymentMethod: t.paymentMethod,
                    accountId: t.accountId,
                    messageCount: t.messageCount || 0,
                    hasNewMessages: (t.messageCount || 0) > 0,
                    isLive: t.isLive || false,
                }));
                setAllTrades(mapped);
                checkForNewMessages(mapped);
            }
        }
        catch (err) {
            console.error("Fetch error:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const sendNotification = async (trade, newCount) => {
        if (!trade.responderUsername || !trade.tradeHash)
            return;
        try {
            await createNotification({
                userId: trade.responderUsername,
                title: "New Trade Message",
                description: `Trade ${trade.tradeHash} has ${newCount} new message${newCount > 1 ? 's' : ''}`,
                type: "system",
                priority: "medium",
                relatedAccountId: trade.accountId,
            });
        }
        catch (err) {
            console.error("Notification error:", err);
        }
    };
    const checkForNewMessages = (trades) => {
        if (initialLoad.current) {
            initialLoad.current = false;
            previousMessageCounts.current = trades.reduce((acc, t) => ({ ...acc, [t.tradeHash || '']: t.messageCount || 0 }), {});
            return;
        }
        trades.forEach(t => {
            const key = t.tradeHash || '';
            const prev = previousMessageCounts.current[key] || 0;
            const curr = t.messageCount || 0;
            if (curr > prev && t.responderUsername)
                sendNotification(t, curr - prev);
        });
        previousMessageCounts.current = trades.reduce((acc, t) => ({ ...acc, [t.tradeHash || '']: t.messageCount || 0 }), {});
    };
    useEffect(() => {
        fetchData();
    }, []);
    const handleFilterClick = (event) => {
        setFilterAnchor(event.currentTarget);
    };
    const handleFilterClose = () => {
        setFilterAnchor(null);
    };
    const applyFilter = (filterType) => {
        setFilter(filterType);
        handleFilterClose();
    };
    const clearFilter = () => {
        setFilter("");
        setSortConfig({ field: "", direction: "asc" });
        handleFilterClose();
    };
    const handleSort = (field) => {
        let direction = "asc";
        if (sortConfig.field === field && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ field, direction });
    };
    const filterAndSortData = (data) => {
        let filteredData = [...data];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredData = filteredData.filter((trade) => {
                return ((trade.tradeHash?.toLowerCase().includes(searchLower)) ||
                    (trade.platform?.toLowerCase().includes(searchLower)) ||
                    (trade.amount?.toString().includes(searchTerm)) ||
                    (trade.status?.toLowerCase().includes(searchLower)) ||
                    (trade.escalatedBy?.fullName?.toLowerCase().includes(searchLower)) ||
                    (trade.assignedCcAgent?.fullName?.toLowerCase().includes(searchLower)) ||
                    (trade.reason?.toLowerCase().includes(searchLower)) ||
                    (trade.responderUsername?.toLowerCase().includes(searchLower)) ||
                    (trade.ownerUsername?.toLowerCase().includes(searchLower)) ||
                    (trade.cryptoCurrencyCode?.toLowerCase().includes(searchLower)) ||
                    (trade.fiatCurrency?.toLowerCase().includes(searchLower)) ||
                    (trade.paymentMethod?.toLowerCase().includes(searchLower)));
            });
        }
        if (filter === "latest") {
            filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        else if (filter === "oldest") {
            filteredData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        if (sortConfig.field) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.field];
                const bValue = b[sortConfig.field];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === "asc"
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === "asc"
                        ? aValue - bValue
                        : bValue - aValue;
                }
                if (sortConfig.field === 'createdAt') {
                    const aDate = new Date(a.createdAt).getTime();
                    const bDate = new Date(b.createdAt).getTime();
                    return sortConfig.direction === "asc"
                        ? aDate - bDate
                        : bDate - aDate;
                }
                return 0;
            });
        }
        return filteredData;
    };
    const filteredEscalatedTrades = filterAndSortData(escalatedTrades);
    const filteredCompletedTrades = filterAndSortData(completedTrades);
    const filteredAllTrades = filterAndSortData(allTrades);
    const refreshData = async () => {
        setLoading(true);
        try {
            await fetchData();
        }
        catch (error) {
            console.error("Error refreshing data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { className: "min-h-screen p-4 md:p-6", children: [_jsxs(Box, { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 700, color: "text.primary", mb: 1 }, children: "Customer Support Center" }), _jsx(Typography, { variant: "body1", sx: { color: "text.secondary" }, children: "Manage escalated trades and customer issues" })] }), _jsx(Box, { className: "flex items-center gap-4", children: _jsx(ExportButtons, { data: tabValue === 0
                                ? filteredEscalatedTrades
                                : tabValue === 1
                                    ? filteredCompletedTrades // Corrected to allTrades for Vendors Trade
                                    : filteredAllTrades // Corrected to completedTrades for AF Trades
                            , type: tabValue === 0
                                ? "escalatedTrades"
                                : tabValue === 1
                                    ? "allTrades" // Corrected type for Vendors Trade
                                    : "completedTrades" // Corrected type for AF Trades
                         }) })] }), _jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", mb: 3 }, children: _jsxs(Tabs, { value: tabValue, onChange: handleTabChange, sx: {
                        "& .MuiTab-root": {
                            minWidth: 120,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            textTransform: "none",
                            "&.Mui-selected": { color: "primary.main" },
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "primary.main",
                            height: 3,
                        },
                    }, children: [_jsx(Tab, { icon: _jsx(ErrorOutline, { sx: { mr: 1 } }), iconPosition: "start", label: "Escalated" }), _jsx(Tab, { icon: _jsx(SupportAgent, { sx: { mr: 1 } }), iconPosition: "start", label: "Vendors Trade" }), _jsx(Tab, { icon: _jsx(Assignment, { sx: { mr: 1 } }), iconPosition: "start", label: "AF Trades" })] }) }), _jsxs(Box, { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4", children: [_jsx(TextField, { placeholder: "Search trades...", variant: "outlined", size: "small", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), sx: {
                            width: { xs: "100%", md: 300 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "background.paper",
                            },
                        }, InputProps: {
                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Search, { color: "action" }) })),
                        } }), _jsxs(Box, { className: "flex items-center gap-2 w-full md:w-auto", children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(FilterList, {}), endIcon: _jsx(Sort, {}), onClick: handleFilterClick, sx: {
                                    textTransform: "none",
                                    borderColor: "divider",
                                    color: "text.secondary",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        color: "primary.main",
                                    },
                                }, children: filter ? `Sorted: ${filter === "latest" ? "Latest" : "Oldest"}` : "Sort By" }), _jsxs(Menu, { anchorEl: filterAnchor, open: Boolean(filterAnchor), onClose: handleFilterClose, children: [_jsx(MenuItem, { onClick: () => applyFilter("latest"), children: _jsxs(Box, { className: "flex items-center gap-2", children: [_jsx(ArrowUpward, { fontSize: "small" }), _jsx(Typography, { children: "Latest First" })] }) }), _jsx(MenuItem, { onClick: () => applyFilter("oldest"), children: _jsxs(Box, { className: "flex items-center gap-2", children: [_jsx(ArrowDownward, { fontSize: "small" }), _jsx(Typography, { children: "Oldest First" })] }) }), _jsx(MenuItem, { onClick: clearFilter, children: _jsx(Typography, { color: "error", children: "Clear Filter" }) })] }), _jsx(Tooltip, { title: "Refresh data", children: _jsx(IconButton, { onClick: refreshData, sx: {
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        "&:hover": { bgcolor: "action.hover" },
                                    }, children: _jsx(Refresh, { fontSize: "small" }) }) })] })] }), _jsx(Box, { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: _jsxs(Paper, { elevation: 0, sx: {
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                    }, children: [_jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 1 }, children: tabValue === 0
                                ? escalatedTrades.length
                                : tabValue === 1
                                    ? completedTrades.length
                                    : allTrades.length }), _jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 1 }, children: tabValue === 0
                                ? "Total Escalations"
                                : tabValue === 1
                                    ? "Total Completed"
                                    : "Total Trades" }), _jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: tabValue === 0
                                ? `${filteredEscalatedTrades.length} match current filters`
                                : tabValue === 1
                                    ? `${filteredCompletedTrades.length} match current filters`
                                    : `${filteredAllTrades.length} match current filters` })] }) }), _jsx(TabPanel, { value: tabValue, index: 0, children: _jsx(TableContainer, { component: Paper, elevation: 0, sx: { borderRadius: 3, border: "1px solid", borderColor: "divider" }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsx(TableRow, { children: [
                                        "Trade ID",
                                        "Platform",
                                        "Owner",
                                        "Username",
                                        "Amount",
                                        "Status",
                                        "Date",
                                        "Reason",
                                        "Actions",
                                    ].map((header) => (_jsx(TableCell, { sx: {
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            py: 2,
                                            "&:hover": { bgcolor: "action.hover" },
                                        }, onClick: () => handleSort(header.toLowerCase().replace(" ", "")), children: _jsxs(Box, { className: "flex items-center gap-1", children: [header, sortConfig.field === header.toLowerCase().replace(" ", "") && (sortConfig.direction === "asc" ? _jsx(ArrowUpward, { fontSize: "small" }) : _jsx(ArrowDownward, { fontSize: "small" }))] }) }, header))) }) }), _jsx(TableBody, { children: filteredEscalatedTrades.length > 0 ? (filteredEscalatedTrades.map((trade) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsxs(Box, { className: "flex items-center gap-2", children: [trade.hasNewMessages && _jsx(Badge, { color: "error", variant: "dot" }), _jsx(Typography, { sx: { fontWeight: 500 }, children: trade.tradeHash || trade.id })] }) }), _jsx(TableCell, { children: trade.platform }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.ownerUsername || "N/A" }) }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.responderUsername || "N/A" }) }), _jsxs(TableCell, { sx: { fontWeight: 500, color: "primary.main" }, children: [trade.amount?.toLocaleString(), " ", trade.fiatCurrency] }), _jsx(TableCell, { children: _jsx(Chip, { label: trade.status, size: "small", sx: { ...getStatusStyles(trade.status), fontWeight: 500 } }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: formatDate(trade.createdAt) }) }), _jsx(TableCell, { children: _jsx(Tooltip, { title: trade.reason || "No reason provided", children: _jsxs(Typography, { sx: { fontSize: "0.75rem" }, children: [trade.reason?.substring(0, 50) || "No reason provided", trade.reason && trade.reason.length > 50 && "..."] }) }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "contained", size: "small", component: Link, to: `/escalated-trade/${trade.id}`, sx: {
                                                    bgcolor: "primary.main",
                                                    color: "black",
                                                    "&:hover": { bgcolor: "secondary.main" },
                                                    textTransform: "none",
                                                }, children: "View" }) })] }, trade.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, sx: { textAlign: "center", py: 4 }, children: _jsx(Typography, { variant: "body1", color: "text.secondary", children: escalatedTrades.length === 0 ? "No escalated trades found" : "No trades match your search/filters" }) }) })) })] }) }) }), _jsx(TabPanel, { value: tabValue, index: 1, children: _jsx(TableContainer, { component: Paper, elevation: 0, sx: { borderRadius: 3, border: "1px solid", borderColor: "divider" }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsx(TableRow, { children: ["Trade ID", "Platform", "Owner", "Username", "Amount", "Status", "Date", "Actions"].map((header) => (_jsx(TableCell, { sx: {
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            py: 2,
                                            "&:hover": { bgcolor: "action.hover" },
                                        }, onClick: () => handleSort(header.toLowerCase().replace(" ", "")), children: _jsxs(Box, { className: "flex items-center gap-1", children: [header, sortConfig.field === header.toLowerCase().replace(" ", "") && (sortConfig.direction === "asc" ? _jsx(ArrowUpward, { fontSize: "small" }) : _jsx(ArrowDownward, { fontSize: "small" }))] }) }, header))) }) }), _jsx(TableBody, { children: filteredCompletedTrades.length > 0 ? (filteredCompletedTrades.map((trade) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx(Typography, { sx: { fontWeight: 500 }, children: trade.tradeHash || trade.id }) }), _jsx(TableCell, { children: trade.platform }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.ownerUsername || "N/A" }) }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.responderUsername || "N/A" }) }), _jsxs(TableCell, { sx: { fontWeight: 500, color: "primary.main" }, children: [trade.amount?.toLocaleString(), " ", trade.fiatCurrency] }), _jsx(TableCell, { children: _jsx(Chip, { label: trade.status, size: "small", sx: { ...getStatusStyles(trade.status), fontWeight: 500 } }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: formatDate(trade.createdAt) }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "contained", size: "small", component: Link, to: `/trade/details/${trade.platform}/${trade.tradeHash}/${trade.accountId}`, sx: {
                                                    bgcolor: "primary.main",
                                                    color: "black",
                                                    "&:hover": { bgcolor: "secondary.main" },
                                                    textTransform: "none",
                                                }, children: "View" }) })] }, trade.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, sx: { textAlign: "center", py: 4 }, children: _jsx(Typography, { variant: "body1", color: "text.secondary", children: completedTrades.length === 0 ? "No completed trades found" : "No trades match your search/filters" }) }) })) })] }) }) }), _jsx(TabPanel, { value: tabValue, index: 2, children: _jsx(TableContainer, { component: Paper, elevation: 0, sx: { borderRadius: 3, border: "1px solid", borderColor: "divider" }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsx(TableRow, { children: ["Trade ID", "Platform", "Owner", "Username", "Amount", "Status", "Date", "Message", "Actions"].map((header) => (_jsx(TableCell, { sx: {
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            py: 2,
                                            "&:hover": { bgcolor: "action.hover" },
                                        }, onClick: () => handleSort(header.toLowerCase().replace(" ", "")), children: _jsxs(Box, { className: "flex items-center gap-1", children: [header, sortConfig.field === header.toLowerCase().replace(" ", "") && (sortConfig.direction === "asc" ? _jsx(ArrowUpward, { fontSize: "small" }) : _jsx(ArrowDownward, { fontSize: "small" }))] }) }, header))) }) }), _jsx(TableBody, { children: filteredAllTrades.length > 0 ? (filteredAllTrades.map((trade) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsxs(Box, { className: "flex items-center gap-2", children: [trade.hasNewMessages && _jsx(Badge, { color: "error", variant: "dot" }), _jsx(Typography, { sx: { fontWeight: 500 }, children: trade.tradeHash || trade.id })] }) }), _jsx(TableCell, { children: trade.platform }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.ownerUsername || "N/A" }) }), _jsx(TableCell, { children: _jsx(Typography, { sx: { fontSize: "0.875rem" }, children: trade.responderUsername || "N/A" }) }), _jsxs(TableCell, { sx: { fontWeight: 500, color: "primary.main" }, children: [trade.amount?.toLocaleString(), " ", trade.fiatCurrency] }), _jsx(TableCell, { children: _jsx(Chip, { label: trade.status, size: "small", sx: { ...getStatusStyles(trade.status), fontWeight: 500 } }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: formatDate(trade.createdAt) }) }), _jsx(TableCell, { children: _jsx(Tooltip, { title: trade.messageCount, children: _jsx(Typography, { sx: { fontSize: "0.75rem" }, children: trade.messageCount }) }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "contained", size: "small", component: Link, to: `/trade/details/${trade.platform}/${trade.tradeHash}/${trade.accountId}`, sx: {
                                                    bgcolor: "primary.main",
                                                    color: "black",
                                                    "&:hover": { bgcolor: "secondary.main" },
                                                    textTransform: "none",
                                                }, children: "View" }) })] }, trade.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, sx: { textAlign: "center", py: 4 }, children: _jsx(Typography, { variant: "body1", color: "text.secondary", children: allTrades.length === 0 ? "No trades found" : "No trades match your search/filters" }) }) })) })] }) }) })] }));
};
export default CustomerSupport;
