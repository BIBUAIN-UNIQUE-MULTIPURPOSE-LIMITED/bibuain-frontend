import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Card, Typography, IconButton, Stack, Button, useTheme, alpha, Menu, MenuItem, Tooltip, Switch, FormControlLabel, CircularProgress, } from "@mui/material";
import { TrendingUp, Assignment, Warning, CloudOff, Speed as SpeedIcon, WavingHand as WavingHandIcon, Construction as ConstructionIcon, Timeline,
// MonetizationOn, // New icon for Active Funded Trades
 } from "@mui/icons-material";
import { useUserContext } from "../../Components/ContextProvider";
import { RefreshCwIcon } from "lucide-react";
import { getDashboardStats } from "../../api/trade";
const StatusCard = ({ title, value, subtitle, icon, color }) => {
    const theme = useTheme();
    return (_jsx(Card, { sx: {
            height: "100%",
            background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.1)}`,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
            },
        }, children: _jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Box, { sx: {
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(color, 0.12),
                                color: color,
                            }, children: icon }), _jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: color }, children: value })] }), _jsx(Typography, { variant: "subtitle2", sx: {
                        mt: 2,
                        mb: 0.5,
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                    }, children: title }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: subtitle })] }) }));
};
const Dashboard = () => {
    const theme = useTheme();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user } = useUserContext();
    const [stats, setStats] = useState({
        currentlyAssigned: 0,
        notYetAssigned: 0,
        escalated: 0,
        paidButNotMarked: 0,
        activeFunded: 0,
        totalTradesNGN: 0,
        totalTradesBTC: 0,
        averageResponseTime: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboardStats();
            if (response?.data) {
                setStats({
                    currentlyAssigned: response.data.currentlyAssigned,
                    notYetAssigned: response.data.notYetAssigned,
                    escalated: response.data.escalated,
                    paidButNotMarked: response.data.paidButNotMarked,
                    activeFunded: response.data.activeFunded,
                    totalTradesNGN: response.data.totalTradesNGN,
                    totalTradesBTC: Number(response.data.totalTradesBTC),
                    averageResponseTime: Number(response.data.averageResponseTime),
                });
            }
            else {
                setError("No dashboard data returned.");
            }
        }
        catch (err) {
            console.error("Error fetching dashboard stats:", err);
            setError("Failed to load dashboard stats. Please try again later.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
    }, []);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleClearCache = () => {
        // This can be tied to a backend cache clear if needed.
        handleMenuClose();
    };
    const handleMaintenanceMode = () => {
        setMaintenanceMode(!maintenanceMode);
        handleMenuClose();
    };
    const handleRefreshStats = () => {
        fetchStats();
    };
    const fullName = user?.fullName?.toString() || "";
    const firstName = fullName.split(" ")[0];
    if (loading) {
        return (_jsx(Box, { sx: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
            }, children: _jsx(CircularProgress, { color: "primary" }) }));
    }
    if (error) {
        return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", color: "error", children: error }), _jsx(Button, { variant: "contained", onClick: handleRefreshStats, sx: { mt: 2 }, children: "Retry" })] }));
    }
    return (_jsxs(Box, { sx: { p: 3, maxWidth: "2xl", mx: "auto" }, children: [_jsxs(Box, { sx: {
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.error.dark} 100%)`,
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                }, children: [_jsx(Box, { sx: {
                            position: "absolute",
                            top: 0,
                            right: 0,
                            p: 1,
                        }, children: _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Tooltip, { title: "Clear Cache", children: _jsx(Button, { variant: "contained", size: "small", startIcon: _jsx(CloudOff, {}), onClick: handleClearCache, sx: {
                                            bgcolor: "rgba(255, 255, 255, 0.1)",
                                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                                        }, children: "Clear Cache" }) }), _jsx(Tooltip, { title: "Maintenance Settings", children: _jsx(IconButton, { onClick: handleMenuClick, sx: { color: "white" }, children: _jsx(ConstructionIcon, {}) }) })] }) }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsxs(Typography, { variant: "h4", fontWeight: 700, sx: { display: "flex", alignItems: "center", gap: 1 }, children: ["Hello ", firstName, _jsx(WavingHandIcon, { sx: { fontSize: 32 } })] }), _jsx(Tooltip, { title: "Refresh Stats", children: _jsx(IconButton, { onClick: handleRefreshStats, sx: { color: "white" }, children: _jsx(RefreshCwIcon, {}) }) })] }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsx(MenuItem, { onClick: handleMaintenanceMode, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: maintenanceMode, onChange: handleMaintenanceMode, color: "primary" }), label: "Maintenance Mode" }) }) }), _jsxs(Box, { sx: {
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 3,
                            mt: 2,
                        }, children: [_jsxs(Box, { sx: {
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(0, 0, 0, 0.1)",
                                    backdropFilter: "blur(10px)",
                                }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(SpeedIcon, {}), _jsx(Typography, { variant: "subtitle1", children: "Uptime" })] }), _jsx(Typography, { variant: "h4", sx: { color: "#4CAF50", fontWeight: 700 }, children: "99.9%" })] }), _jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Last 30 Days" })] }), _jsxs(Box, { sx: {
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(0, 0, 0, 0.1)",
                                    backdropFilter: "blur(10px)",
                                }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Warning, {}), _jsx(Typography, { variant: "subtitle1", children: "Errors" })] }), _jsx(Typography, { variant: "h4", sx: { color: "#f44336", fontWeight: 700 }, children: "5" })] }), _jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Last 30 Days" })] })] })] }), _jsxs(Box, { sx: {
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(5, 1fr)", // Updated for 5 cards
                    },
                    gap: 3,
                    mb: 4,
                }, children: [_jsx(StatusCard, { title: "Currently Assigned", value: stats.currentlyAssigned.toString(), subtitle: "Active assignments", icon: _jsx(Assignment, {}), color: theme.palette.primary.main }), _jsx(StatusCard, { title: "Not Yet Assigned", value: stats.notYetAssigned.toString(), subtitle: "Pending assignments", icon: _jsx(Timeline, {}), color: theme.palette.warning.main }), _jsx(StatusCard, { title: "Escalated", value: stats.escalated.toString(), subtitle: "Requires attention", icon: _jsx(TrendingUp, {}), color: theme.palette.error.main }), _jsx(StatusCard, { title: "Paid but not marked", value: stats.paidButNotMarked.toString(), subtitle: "Pending verification", icon: _jsx(RefreshCwIcon, {}), color: theme.palette.success.main })] }), _jsx(Card, { sx: { mb: 4 }, children: _jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", fontWeight: 600, children: "TRADES PAID REALTIME" }), _jsxs(Box, { sx: {
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                                gap: 3,
                                mt: 1,
                            }, children: [_jsxs(Box, { sx: {
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    }, children: [_jsx(Typography, { variant: "h4", fontWeight: 700, color: "primary", children: typeof stats.averageResponseTime === "number"
                                                ? stats.averageResponseTime.toFixed(1)
                                                : "N/A" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "AVERAGE RESPONSE TIME OF PAYER (SECS)" })] }), _jsxs(Box, { sx: {
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                                    }, children: [_jsx(Typography, { variant: "h4", fontWeight: 700, color: "warning.main", children: stats.totalTradesNGN.toLocaleString() }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "TOTAL (NGN)" })] }), _jsxs(Box, { sx: {
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                    }, children: [_jsx(Typography, { variant: "h4", fontWeight: 700, color: "success.main", children: typeof stats.totalTradesBTC === "number"
                                                ? stats.totalTradesBTC.toFixed(5)
                                                : "N/A" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "TOTAL (BTC)" })] })] })] }) })] }));
};
export default Dashboard;
