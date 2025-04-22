import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Typography, IconButton, Alert, Card, CardContent, Collapse, styled, Button, Chip, AlertTitle, } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarningIcon from "@mui/icons-material/Warning";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RefreshIcon from "@mui/icons-material/Refresh";
// Styled Components
const AccountCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: "12px",
    border: "1px solid rgba(248, 188, 8, 0.1)",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s ease",
    "&:hover": {
        boxShadow: "0 4px 20px rgba(248, 188, 8, 0.1)",
    },
}));
const PlatformHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
        backgroundColor: "rgba(248, 188, 8, 0.05)",
    },
}));
const StyledIconButton = styled(IconButton)({
    color: "#F8BC08",
    "&:hover": {
        backgroundColor: "rgba(248, 188, 8, 0.1)",
    },
});
const formatBTC = (value) => `${value.toFixed(4)} BTC`;
const formatUSDT = (value) => `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;
const AccountDetails = ({ account, onRefresh, lastUpdate, isLoading, }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    return (_jsxs(AccountCard, { elevation: 0, children: [_jsxs(PlatformHeader, { onClick: () => setIsExpanded(!isExpanded), children: [_jsxs(Box, { className: "flex items-center gap-3", children: [_jsx(Box, { className: "w-10 h-10 rounded-lg bg-button/10 flex items-center justify-center", children: _jsx(AccountBalanceWalletIcon, { className: "text-button" }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", className: "font-primary font-semibold", children: account.name }), _jsxs(Typography, { variant: "body2", className: "text-text2 font-secondary", children: ["Last update: ", lastUpdate] })] })] }), _jsxs(Box, { className: "flex items-center gap-4", children: [_jsx(Chip, { label: account.status.toUpperCase(), color: account.status === "active" ? "success" : "warning", size: "small", className: "font-secondary" }), _jsx(StyledIconButton, { size: "small", onClick: (e) => {
                                    e.stopPropagation();
                                    onRefresh();
                                }, className: isLoading ? "animate-spin" : "", children: _jsx(RefreshIcon, {}) }), _jsx(KeyboardArrowDownIcon, { className: `transform transition-transform duration-300 text-button
              ${isExpanded ? "rotate-180" : ""}` })] })] }), _jsx(Collapse, { in: isExpanded, children: _jsx(CardContent, { className: "px-6 pt-4 pb-6", children: account.status === "error" ? (_jsxs(Alert, { severity: "error", className: "rounded-lg font-secondary", action: _jsx(Button, { color: "inherit", size: "small", onClick: onRefresh, children: "Retry" }), children: ["Unable to fetch balance for ", account.name] })) : (_jsxs(_Fragment, { children: [_jsxs(Box, { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsx(BalanceCard, { title: "Total Wallet Balance", value: formatBTC(account.balances.totalBalance), subtitle: "Available BTC" }), _jsx(BalanceCard, { title: "Total USDT Balance", value: formatUSDT(account.balances.usdtBalance), subtitle: "Available USDT" })] }), account.balances.excessCoins &&
                                account.balances.excessCoins > 0 && (_jsxs(Alert, { severity: "warning", className: "mb-6 rounded-lg", icon: _jsx(WarningIcon, {}), children: [_jsx(AlertTitle, { className: "font-primary", children: "Excess Coins Detected" }), _jsxs(Typography, { className: "font-secondary", children: [formatBTC(account.balances.excessCoins), " above capital limit", account.balances.capitalCoinLimit &&
                                                ` of ${formatBTC(account.balances.capitalCoinLimit)}`] })] }))] })) }) })] }));
};
const BalanceCard = ({ title, value, subtitle }) => (_jsxs(Card, { className: "p-4 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors", children: [_jsx(Typography, { variant: "body2", className: "text-text2 font-secondary mb-1", children: title }), _jsx(Typography, { variant: "h5", className: "font-primary font-bold text-gray-900", children: value }), _jsx(Typography, { variant: "body2", className: "text-text2 font-secondary", children: subtitle })] }));
export default AccountDetails;
