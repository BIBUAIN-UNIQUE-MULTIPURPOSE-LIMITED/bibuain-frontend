import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Typography, IconButton, Stack, Button, useTheme, alpha, ButtonGroup, Avatar, Chip, } from "@mui/material";
import { ArrowUpward, ArrowDownward, Analytics, Refresh, } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Bar, Legend, } from "recharts";
// Sample forex data
const forexData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    EUR: 1.0 + Math.random() * 0.1,
    GBP: 1.2 + Math.random() * 0.1,
    JPY: 110 + Math.random() * 5,
    volume: 1000 + Math.random() * 500,
    volatility: Math.random() * 0.5,
}));
const currencyPairData = [
    { pair: "BTC/NGN", change: 0.75, price: 1.0876, volume: "12.5M" },
    { pair: "GBP/USD", change: -0.45, price: 1.2534, volume: "8.2M" },
    { pair: "USD/JPY", change: 1.2, price: 115.67, volume: "10.1M" },
    { pair: "USD/CHF", change: -0.3, price: 0.9245, volume: "5.8M" },
];
const ForexAnalytics = () => {
    const theme = useTheme();
    const [timeframe, setTimeframe] = useState("1H");
    const timeframes = ["1H", "4H", "1D", "1W", "1M"];
    return (_jsx(Box, { sx: { mt: 4 }, children: _jsxs(Card, { sx: {
                my: 2,
                boxShadow: "none",
                background: "transparent",
            }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 3 }, children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Avatar, { sx: {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                    }, children: _jsx(Analytics, {}) }), _jsx(Typography, { variant: "h5", fontWeight: 600, children: "Forex Market Analytics" })] }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(ButtonGroup, { size: "small", children: timeframes.map((tf) => (_jsx(Button, { variant: timeframe === tf ? "contained" : "outlined", onClick: () => setTimeframe(tf), children: tf }, tf))) }), _jsx(IconButton, { children: _jsx(Refresh, {}) })] })] }), _jsx(Box, { sx: {
                        display: "grid",
                        // xs: 1 column, sm: 2 columns, md: 4 columns
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
                        gap: 3,
                        mb: 4,
                    }, children: currencyPairData.map((pair) => (_jsx(Card, { sx: {
                            p: 2,
                            backgroundColor: "background.paper",
                            transition: "transform 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                            },
                        }, children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h6", fontWeight: 600, children: pair.pair }), _jsx(Chip, { size: "small", icon: pair.change > 0 ? _jsx(ArrowUpward, {}) : _jsx(ArrowDownward, {}), label: `${Math.abs(pair.change)}%`, color: pair.change > 0 ? "success" : "error" })] }), _jsx(Typography, { variant: "h4", fontWeight: 700, children: pair.price }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Volume: ", pair.volume] })] }) }, pair.pair))) }), _jsxs(Card, { sx: { p: 3, mb: 4 }, children: [_jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Currency Pair Performance" }), _jsx(Box, { sx: { height: 400 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: forexData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "EUR", stroke: theme.palette.primary.main, strokeWidth: 2 }), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "GBP", stroke: theme.palette.success.main, strokeWidth: 2 }), _jsx(Bar, { yAxisId: "right", dataKey: "volume", fill: alpha(theme.palette.warning.main, 0.4), barSize: 20 })] }) }) })] }), _jsxs(Box, { sx: {
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 3,
                    }, children: [_jsxs(Card, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Market Volatility" }), _jsx(Box, { sx: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: forexData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "volatility", stroke: theme.palette.error.main, fill: alpha(theme.palette.error.main, 0.1) })] }) }) })] }), _jsxs(Card, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Price Movements" }), _jsx(Box, { sx: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: forexData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "JPY", stroke: theme.palette.info.main, strokeWidth: 2, dot: false })] }) }) })] })] })] }) }));
};
export default ForexAnalytics;
