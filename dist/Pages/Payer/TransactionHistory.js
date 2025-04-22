import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Chip, Tooltip, Container, FormControl, InputLabel, Select, MenuItem, Card, styled, CircularProgress, } from "@mui/material";
import { Search, FilterList, Download, Refresh, ArrowUpward, ArrowDownward, } from "@mui/icons-material";
import { useUserContext } from "../../Components/ContextProvider";
import ClockedAlt from "../../Components/ClockedAlt";
import { getCompletedPayerTrades } from "../../api/trade";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));
const HeaderCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
}));
const TransactionHistory = () => {
    const { user } = useUserContext();
    const userType = user?.userType;
    const isPrivileged = ["payer"].includes(userType || "");
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 10,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPayer, setSelectedPayer] = useState("");
    const [dateRange, setDateRange] = useState("today"); // default to today's transactions
    const [sortConfig, setSortConfig] = useState({
        field: "",
        direction: "asc",
    });
    const [payers, setPayers] = useState([]);
    // Ensure non-privileged users filter to themselves
    useEffect(() => {
        if (!isPrivileged && user?.id) {
            setSelectedPayer(user.id);
        }
    }, [isPrivileged, user]);
    const formatBTC = (amount) => (amount / 1e8).toFixed(8) + " BTC";
    // const formatUSDT = (amount: number | undefined): string =>
    //   (amount || 0).toFixed(2) + " USDT";
    const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    // Fetch trades with current filters and pagination
    const fetchTrades = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
            };
            if (searchTerm)
                params.search = searchTerm;
            if (dateRange)
                params.dateRange = dateRange;
            if (isPrivileged) {
                if (selectedPayer)
                    params.payerId = selectedPayer;
            }
            else {
                params.payerId = user.id;
            }
            console.debug("Fetching completed trades with params:", params);
            const res = await getCompletedPayerTrades(params);
            if (res?.success) {
                setTransactions(res.data.trades);
                setPagination(res.data.pagination);
                if (isPrivileged) {
                    // Build unique payer list for dropdown
                    const map = new Map();
                    res.data.trades.forEach((t) => {
                        if (t.assignedPayer?.id && t.assignedPayer.name) {
                            map.set(t.assignedPayer.id, {
                                id: t.assignedPayer.id,
                                name: t.assignedPayer.name,
                            });
                        }
                    });
                    setPayers(Array.from(map.values()));
                }
            }
            else {
                setError(res?.message || "Failed to fetch transactions.");
            }
        }
        catch (err) {
            console.error("Error fetching trades:", err);
            setError(err.message || "Error fetching transactions.");
        }
        finally {
            setLoading(false);
        }
    }, [user, isPrivileged, selectedPayer, searchTerm, dateRange, pagination.currentPage, pagination.itemsPerPage]);
    // Trigger fetch on mount and when dependencies change
    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);
    // Handlers
    const handleSort = (field) => {
        setSortConfig((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
        }));
        // TODO: apply sorting via API or client-side
    };
    // Render loading, error, or content
    if (!user?.clockedIn && !isPrivileged) {
        return _jsx(ClockedAlt, {});
    }
    if (loading) {
        return (_jsx(Box, { sx: { display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }, children: _jsx(CircularProgress, {}) }));
    }
    if (error) {
        return (_jsxs(Box, { sx: { p: 4, textAlign: "center" }, children: [_jsx(Typography, { color: "error", variant: "h6", children: error }), _jsx(Button, { onClick: fetchTrades, sx: { mt: 2 }, children: "Retry" })] }));
    }
    return (_jsx(Box, { sx: { minHeight: "100vh" }, children: _jsxs(Container, { children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Transaction History" }), _jsx(Typography, { variant: "body1", color: "text.secondary", children: isPrivileged
                                ? "All payers’ completed trades"
                                : "Your completed trades only" })] }), _jsx(HeaderCard, { children: _jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [_jsxs(Box, { sx: { display: "flex", gap: 2, flex: 1 }, children: [_jsx(TextField, { size: "small", placeholder: "Search\u2026", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: { startAdornment: _jsx(Search, { sx: { color: "text.secondary", mr: 1 } }) }, sx: { minWidth: 300 } }), isPrivileged && (_jsxs(FormControl, { size: "small", sx: { minWidth: 200 }, children: [_jsx(InputLabel, { children: "Payer" }), _jsxs(Select, { value: selectedPayer, label: "Payer", onChange: (e) => setSelectedPayer(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Payers" }), payers.map((p) => (_jsx(MenuItem, { value: p.id, children: p.name }, p.id)))] })] })), _jsxs(FormControl, { size: "small", sx: { minWidth: 200 }, children: [_jsx(InputLabel, { children: "Date Range" }), _jsxs(Select, { value: dateRange, label: "Date Range", onChange: (e) => setDateRange(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Time" }), _jsx(MenuItem, { value: "today", children: "Today" }), _jsx(MenuItem, { value: "week", children: "This Week" }), _jsx(MenuItem, { value: "month", children: "This Month" })] })] })] }), _jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(FilterList, {}), children: "More Filters" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Download, {}), children: "Export" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Refresh, {}), onClick: fetchTrades, children: "Refresh" })] })] }) }), transactions.length === 0 ? (_jsx(Box, { sx: { p: 4, textAlign: "center" }, children: _jsx(Typography, { variant: "h6", children: "No transactions found." }) })) : (_jsx(TableContainer, { component: Paper, sx: { borderRadius: 2, boxShadow: 1, overflow: "auto", maxHeight: "calc(100vh - 400px)" }, children: _jsxs(Table, { stickyHeader: true, sx: { minWidth: 2000 }, children: [_jsx(TableHead, { children: _jsx(TableRow, { children: [
                                        { id: "sn", label: "S/N" },
                                        { id: "payer", label: "Payer" },
                                        { id: "payingBank", label: "Paying Bank" },
                                        { id: "platformAccount", label: "Platform Account" },
                                        { id: "tradeHash", label: "Trade Hash" },
                                        { id: "sellerUsername", label: "Seller Username" },
                                        { id: "btcBought", label: "BTC Bought" },
                                        { id: "ngnPaid", label: "NGN Paid" },
                                        { id: "openedAt", label: "Opened At" },
                                        { id: "paidAt", label: "Paid At" },
                                        { id: "payerSpeed", label: "Speed (s)" },
                                        { id: "ngnSellingPrice", label: "NGN Sell Price" },
                                        { id: "ngnCostPrice", label: "NGN Cost Price" },
                                        { id: "usdCost", label: "USD Cost" },
                                    ].map((col) => (_jsx(StyledTableCell, { onClick: () => handleSort(col.id), sx: { cursor: "pointer", position: "sticky", top: 0, zIndex: 1, py: 3, "&:hover": { backgroundColor: "action.hover" } }, children: _jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: 600, children: col.label }), sortConfig.field === col.id &&
                                                    (sortConfig.direction === "asc" ? _jsx(ArrowUpward, { fontSize: "small" }) : _jsx(ArrowDownward, { fontSize: "small" }))] }) }, col.id))) }) }), _jsx(TableBody, { children: transactions.map((tx, idx) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: idx + 1 }), _jsx(TableCell, { children: tx.assignedPayer.name }), _jsx(TableCell, { children: tx.payingBank }), _jsx(TableCell, { children: tx.platformAccount }), _jsx(TableCell, { children: _jsx(Tooltip, { title: tx.tradeHash, children: _jsx(Typography, { noWrap: true, sx: { maxWidth: 180, fontFamily: "monospace", color: "primary.main" }, children: tx.tradeHash }) }) }), _jsx(TableCell, { children: tx.sellerUsername }), _jsx(TableCell, { sx: { fontFamily: "monospace" }, children: formatBTC(tx.btcBought) }), _jsx(TableCell, { children: _jsx(Typography, { fontWeight: 500, children: (tx.ngnPaid).toLocaleString() }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: formatDateTime(tx.openedAt) }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: formatDateTime(tx.paidAt) }) }), _jsx(TableCell, { children: _jsx(Chip, { label: `${tx.payerSpeed}s`, size: "small", color: tx.payerSpeed < 90 ? "success" : "warning", sx: { minWidth: 70 } }) }), _jsx(TableCell, { children: tx.ngnSellingPrice }), _jsx(TableCell, { children: tx.ngnCostPrice }), _jsx(TableCell, { children: tx.usdCost })] }, tx.id))) })] }) }))] }) }));
};
export default TransactionHistory;
