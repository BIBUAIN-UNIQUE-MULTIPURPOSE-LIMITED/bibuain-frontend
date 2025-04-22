import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, useTheme, IconButton, Card, CardContent, } from "@mui/material";
import { Timeline, Warning, AccessTime, TrendingUp, Gavel, Message, CheckCircle, Cancel, Group, InfoOutlined, } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, } from "recharts";
import { getCCstats, getDashboardStats, getEscalatedTrades } from "../../api/trade";
// Mock data
const chartData = [
    { month: "Jan", trades: 120, complaints: 20 },
    { month: "Feb", trades: 150, complaints: 25 },
    { month: "Mar", trades: 180, complaints: 30 },
    { month: "Apr", trades: 220, complaints: 28 },
];
const responseTimeData = [
    { time: "00:00", value: 2.5 },
    { time: "06:00", value: 3.1 },
    { time: "12:00", value: 2.8 },
    { time: "18:00", value: 2.2 },
];
const StatCard = ({ title, value, icon, trend, color = "primary", secondary, }) => {
    return (_jsxs(Card, { className: "relative overflow-hidden", sx: {
            backgroundColor: "background.paper",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            height: "100%",
            transition: "transform 0.2s",
            "&:hover": {
                transform: "translateY(-2px)",
            },
        }, children: [_jsxs(CardContent, { className: "p-6", children: [_jsxs(Box, { className: "flex justify-between items-start", children: [_jsxs(Box, { className: "flex flex-col", children: [_jsx(Typography, { variant: "subtitle2", color: "textSecondary", className: "mb-1", children: title }), _jsx(Typography, { variant: "h4", color: "textPrimary", className: "font-bold", children: value }), secondary && (_jsx(Typography, { variant: "caption", color: "textSecondary", className: "mt-1", children: secondary }))] }), _jsx(Box, { className: "rounded-full p-2", sx: { backgroundColor: `${color}.lighter` }, children: icon })] }), trend !== undefined && (_jsxs(Box, { className: "mt-4 flex items-center", children: [_jsxs(Box, { component: "span", className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${trend >= 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"}`, children: [trend >= 0 ? "+" : "", trend, "%"] }), _jsx(Typography, { variant: "caption", className: "ml-2 text-gray-500", children: "vs last period" })] }))] }), _jsx(Box, { className: "absolute bottom-0 left-0 right-0 h-1", sx: { backgroundColor: `${color}.main` } })] }));
};
const TransactionReports = () => {
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [escalatedTrades, setEscalatedTrades] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ccRes, dashRes, escRes] = await Promise.all([
                    getCCstats(),
                    getDashboardStats(),
                    getEscalatedTrades(),
                ]);
                if (ccRes && ccRes.data) {
                    setStats(ccRes.data);
                }
                if (dashRes && dashRes.data) {
                    setDashboardStats(dashRes.data);
                }
                if (escRes && Array.isArray(escRes.data)) {
                    setEscalatedTrades(escRes.data);
                }
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
    // if (!stats) return <Typography>Loading...</Typography>;
    return (_jsxs(Box, { className: " min-h-screen", children: [_jsxs(Box, { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Transaction Reports" }), _jsxs(Box, { className: "flex items-center text-gray-500", children: [_jsx(Timeline, { className: "mr-2" }), _jsx(Typography, { variant: "subtitle1", children: "Real-time monitoring of trades and complaints" })] })] }), _jsxs(Grid, { container: true, spacing: 3, className: "mb-8", children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Total Trades", value: Number(stats?.totalTrades), icon: _jsx(TrendingUp, {}), color: "primary", secondary: `${stats?.newTradesToday} new today` }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Average Response Time", value: `${stats?.avgResponseTimeHours.toFixed(1)}h`, icon: _jsx(AccessTime, {}), 
                            // trend={-8}
                            color: "warning", secondary: "Target: 2h" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Escalation Rate", value: `${(stats?.escalationRatePercent || 0).toFixed(1)}%`, icon: _jsx(Warning, {}), 
                            // trend={-2.1}
                            color: "error", secondary: `${escalatedTrades.length} active cases` }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Resolution Rate", value: `${(stats?.resolutionRatePercent || 0).toFixed(1)}%`, icon: _jsx(CheckCircle, {}), 
                            // trend={5.3}
                            color: "success", secondary: "Above target" }) })] }), _jsxs(Grid, { container: true, spacing: 3, className: "mb-8", children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs(Paper, { className: "p-6", children: [_jsxs(Box, { className: "flex justify-between items-center mb-6", children: [_jsx(Typography, { variant: "h6", className: "font-semibold", children: "Trade Activity Overview" }), _jsx(IconButton, { size: "small", children: _jsx(InfoOutlined, {}) })] }), _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "trades", fill: theme.palette.primary.main, name: "Total Trades" }), _jsx(Bar, { dataKey: "complaints", fill: theme.palette.secondary.main, name: "Complaints" })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Paper, { className: "p-6", children: [_jsx(Typography, { variant: "h6", className: "font-semibold mb-6", children: "Response Time Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(LineChart, { data: responseTimeData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "value", stroke: theme.palette.primary.main, strokeWidth: 2 })] }) })] }) })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Paid Trade", value: "45", icon: dashboardStats?.paidButNotMarked || 0, trend: -2.5, color: "info" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Dispute Trade", value: "28", icon: _jsx(Gavel, {}), trend: 5.8, color: "error" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Moderator Messages", value: "156", icon: _jsx(Message, {}), trend: 12.3, color: "primary" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Released Complaints", value: "72", icon: _jsx(CheckCircle, {}), color: "success" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Unreleased Complaints", value: "13", icon: _jsx(Cancel, {}), color: "error" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(StatCard, { title: "Active Vendors", value: Number(stats?.activeVendors) || 0, icon: _jsx(Group, {}), secondary: "45 before / 52 after shift", color: "secondary" }) })] })] }));
};
export default TransactionReports;
