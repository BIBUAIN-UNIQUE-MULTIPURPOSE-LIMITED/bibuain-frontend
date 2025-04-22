import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, Typography, Box, styled } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
const RateHistoryCard = styled(Card)(({ theme }) => ({
    borderRadius: "12px",
    marginBottom: theme.spacing(3),
    border: "1px solid #E5E7EB",
}));
const RateHistory = ({ data, lastUpdate }) => {
    return (_jsx(RateHistoryCard, { children: _jsxs(CardContent, { children: [_jsx(Box, { sx: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", fontWeight: "bold", children: "Rate History" }), _jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Last Update: ", lastUpdate] })] }) }), _jsx(Box, { sx: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB" }), _jsx(XAxis, { dataKey: "time", stroke: "#6B7280", tickLine: false }), _jsx(YAxis, { stroke: "#6B7280", tickLine: false, domain: ["auto", "auto"], tickFormatter: (value) => `$${value.toLocaleString()}` }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "8px",
                                    }, formatter: (value) => [
                                        `$${value.toLocaleString()}`,
                                        "Rate",
                                    ] }), _jsx(Line, { type: "monotone", dataKey: "rate", stroke: "#FFB800", strokeWidth: 2, dot: false, activeDot: { r: 6, fill: "#FFB800" } })] }) }) })] }) }));
};
export default RateHistory;
