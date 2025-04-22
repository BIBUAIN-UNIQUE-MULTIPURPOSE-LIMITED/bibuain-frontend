import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getShiftMetrics } from "../api/shift";
import { format } from "date-fns";
import { Box, Grid, Paper, Stack, Typography, useTheme, alpha, } from "@mui/material";
import { AccessTime as ClockIcon, Warning as WarningIcon, Timer as TimerIcon, LocalCafe as BreakIcon, Update as DurationIcon, Speed as PerformanceIcon, } from "@mui/icons-material";
const TimeAttendancePanel = ({ userId }) => {
    const theme = useTheme();
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        const fetchMetrics = async () => {
            const startDate = format(new Date().setDate(1), "yyyy-MM-dd");
            const endDate = format(new Date(), "yyyy-MM-dd");
            const response = await getShiftMetrics(userId, startDate, endDate);
            if (response?.success) {
                setMetrics(response.data);
            }
        };
        fetchMetrics();
    }, [userId]);
    const metricsData = [
        {
            title: "Total Shifts",
            value: metrics?.totalShifts || 0,
            icon: _jsx(ClockIcon, {}),
            color: theme.palette.primary.main,
            suffix: "",
        },
        {
            title: "Work Duration",
            value: metrics?.totalWorkDuration || 0,
            icon: _jsx(DurationIcon, {}),
            color: theme.palette.success.main,
            suffix: " mins",
        },
        {
            title: "Break Duration",
            value: metrics?.totalBreakDuration || 0,
            icon: _jsx(BreakIcon, {}),
            color: theme.palette.info.main,
            suffix: " mins",
        },
        {
            title: "Late Minutes",
            value: metrics?.totalLateMinutes || 0,
            icon: _jsx(WarningIcon, {}),
            color: theme.palette.error.main,
            suffix: " mins",
        },
        {
            title: "Overtime",
            value: metrics?.totalOvertimeMinutes || 0,
            icon: _jsx(TimerIcon, {}),
            color: theme.palette.warning.main,
            suffix: " mins",
        },
        {
            title: "Late Clock-ins",
            value: metrics?.lateClockIns || 0,
            icon: _jsx(PerformanceIcon, {}),
            color: theme.palette.error.main,
            suffix: "",
        },
    ];
    return (_jsxs(Box, { sx: { p: "10px" }, children: [_jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: metricsData.map((item, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Paper, { sx: {
                            p: 3,
                            height: "100%",
                            bgcolor: alpha(item.color, 0.04),
                            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                                bgcolor: alpha(item.color, 0.08),
                            },
                        }, children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Box, { sx: {
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: alpha(item.color, 0.12),
                                        color: item.color,
                                    }, children: item.icon }), _jsxs(Box, { children: [_jsx(Typography, { color: "text.secondary", variant: "body2", children: item.title }), _jsxs(Typography, { variant: "h5", sx: { fontWeight: 600, mt: 0.5 }, children: [item.value, item.suffix] })] })] }) }) }, index))) }), _jsxs("div", { children: [_jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Shifts by Type" }), _jsx(Grid, { container: true, spacing: 3, children: Object.entries(metrics?.shiftsByType || {}).map(([type, count]) => (_jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsxs(Paper, { sx: {
                                    p: 2,
                                    textAlign: "center",
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: [type.charAt(0).toUpperCase() + type.slice(1), " Shift"] }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 600 }, children: count })] }) }, type))) })] })] }));
};
export default TimeAttendancePanel;
