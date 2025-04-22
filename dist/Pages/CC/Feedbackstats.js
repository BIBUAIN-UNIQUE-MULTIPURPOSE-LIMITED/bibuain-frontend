import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { getFeedbackStats } from "../../api/trade"; // adjust the path as needed
const FeedbackStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getFeedbackStats({ username: "", platform: "" });
                if (res?.success) {
                    setStats(res.data);
                }
            }
            catch (error) {
                console.error("Error fetching feedback stats", error);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", mt: 4, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { mt: 4, mx: 2, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Feedback Statistics" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "flex-start", mt: 2, children: stats.map((stat) => (_jsxs(Paper, { elevation: 1, sx: {
                        p: 1,
                        flex: "1 1 10px",
                        border: "0.5px solid",
                        borderColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: 2,
                        backgroundColor: "#f9f9f9",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    }, children: [_jsx(Typography, { color: "primary", children: stat.accountUsername }), _jsxs(Box, { mt: 1, children: [_jsxs(Typography, { color: "success.main", children: [_jsx("strong", { children: "+ve:" }), " ", stat.positiveFeedback, " (", stat.positivePercentage, "%)"] }), _jsxs(Typography, { color: "error.main", children: [_jsx("strong", { children: "-ve:" }), " ", stat.negativeFeedback, " (", stat.negativePercentage, "%)"] })] })] }, stat.accountId))) })] }));
};
export default FeedbackStats;
