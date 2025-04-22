import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, IconButton, Typography, Grid, Box as MuiBox, } from "@mui/material";
import { styled } from "@mui/material/styles";
import { RefreshCw } from "lucide-react";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// Styled Components
const AnimatedValue = styled(Typography)(({ theme }) => ({
    transition: "all 0.3s ease-in-out",
    "&:hover": {
        transform: "scale(1.02)",
    },
}));
export const StyledCard = styled(Card)(({ theme }) => ({
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    "&:hover": {
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    },
    transition: "all 0.3s ease-in-out",
    borderRadius: "16px",
    overflow: "hidden",
}));
const GradientCard = styled(StyledCard)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: "white",
}));
const MetricCard = styled(MuiBox)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
}));
const StyledChip = styled("div")(({ theme }) => ({
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
}));
// Utility Functions
const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
};
const formatBTC = (value) => {
    return value.toFixed(4) + " BTC";
};
// Mock Data
const mockData = {
    platforms: {
        paxful: {
            name: "Paxful",
            logo: "/paxful.jpg",
            balance: 2.45,
            usdValue: 102900,
            change24h: 3.2,
            status: "active",
        },
        noones: {
            name: "Noones",
            logo: "/noones.png",
            balance: 1.82,
            usdValue: 76440,
            change24h: -1.5,
            status: "maintenance",
        },
        binance: {
            name: "Binance",
            logo: "/binance.jpg",
            balance: 3.21,
            usdValue: 134820,
            change24h: 2.8,
            status: "active",
        },
    },
    balances: {
        totalCoins: 7.48,
        capCoin: 5.0,
        excessCoin: 2.48,
        totalUSDT: 124500,
        averageRate: 41500,
        lastExchangeTime: "4 hours ago",
    },
    rateHistory: [
        { time: "12:00", rate: 41200, volume: 1.2 },
        { time: "13:00", rate: 41500, volume: 1.8 },
        { time: "14:00", rate: 41300, volume: 1.5 },
        { time: "15:00", rate: 41800, volume: 2.1 },
        { time: "16:00", rate: 42000, volume: 1.9 },
    ],
};
const BalanceSummary = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Grid, { container: true, spacing: 4, className: "mb-8", children: _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(GradientCard, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs(MuiBox, { className: "flex justify-between items-center mb-6", children: [_jsxs(MuiBox, { className: "flex items-center gap-2", children: [_jsx(CurrencyBitcoinIcon, { fontSize: "large" }), _jsx(Typography, { variant: "h5", className: "font-bold", children: "Total Balance Overview" })] }), _jsx(IconButton, { color: "inherit", size: "small", children: _jsx(RefreshCw, { className: "w-5 h-5" }) })] }), _jsxs(Grid, { container: true, spacing: 4, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(MetricCard, { children: _jsxs(MuiBox, { className: "space-y-2", children: [_jsx(Typography, { variant: "subtitle2", className: "opacity-80", children: "Total Coins" }), _jsx(AnimatedValue, { variant: "h4", className: "font-bold", children: formatBTC(mockData.balances.totalCoins) }), _jsxs(Typography, { variant: "body2", className: "opacity-75", children: ["\u2248", " ", formatCurrency(mockData.balances.totalCoins *
                                                                    mockData.balances.averageRate)] })] }) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(MetricCard, { children: _jsxs(MuiBox, { className: "space-y-2", children: [_jsx(Typography, { variant: "subtitle2", className: "opacity-80", children: "Excess Coins" }), _jsx(AnimatedValue, { variant: "h4", className: "font-bold", children: formatBTC(mockData.balances.excessCoin) }), _jsxs(Typography, { variant: "body2", className: "opacity-75", children: ["Cap: ", formatBTC(mockData.balances.capCoin)] })] }) }) })] })] }) }) }) }), _jsx(MuiBox, { className: "mb-4 flex items-center justify-between", children: _jsxs(MuiBox, { className: "flex items-center gap-2", children: [_jsx(AccountBalanceWalletIcon, {}), _jsx(Typography, { variant: "h5", className: "font-bold", children: "Platform Balances" })] }) }), _jsx(Grid, { container: true, spacing: 4, children: Object.entries(mockData.platforms).map(([key, platform]) => (_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(StyledCard, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs(MuiBox, { className: "flex justify-between items-start mb-6", children: [_jsxs(MuiBox, { className: "flex w-max items-center gap-4", children: [_jsx("img", { src: platform.logo, alt: platform.name, className: "w-max h-6 object-cover object-center" }), _jsx(MuiBox, { children: _jsx(Typography, { variant: "h6", className: "font-bold", children: platform.name }) })] }), _jsx(TrendingUpIcon, { className: "text-gray-400" })] }), _jsx(MuiBox, { className: "space-y-4", children: _jsxs(MuiBox, { children: [_jsx(AnimatedValue, { variant: "h4", className: "font-bold", children: formatBTC(platform.balance) }), _jsx(Typography, { className: "text-gray-500 mt-1", children: formatCurrency(platform.usdValue) })] }) })] }) }) }, key))) })] }));
};
export default BalanceSummary;
