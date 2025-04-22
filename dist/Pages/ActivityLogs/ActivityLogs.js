import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Avatar, IconButton, Tooltip, Stack, } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getActivityLogs } from "../../api/admin";
import Loading from "../../Components/Loading";
const activityTypes = [
    { value: "authentication", label: "Login/Logout" },
    { value: "rate_update", label: "Rate Update" },
    { value: "bank_management", label: "Bank Edit" },
    { value: "profit_management", label: "Profit Declaration" },
    { value: "escalation", label: "Escalation" },
    { value: "complaint", label: "Complaint Resolution" },
    { value: "trade", label: "Trade Status Change" },
    { value: "admin", label: "Admin Action" },
];
const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
        case "admin":
            return "bg-red-100 text-red-800";
        case "rater":
            return "bg-blue-100 text-blue-800";
        case "payer":
            return "bg-green-100 text-green-800";
        case "ceo":
            return "bg-purple-100 text-purple-800";
        case "customer-support":
            return "bg-orange-100 text-orange-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};
const getActivityTypeColor = (activity) => {
    switch (activity) {
        case "user_login":
        case "user_logout":
            return "border-blue-500 text-blue-700";
        case "rate_update":
            return "border-green-500 text-green-700";
        case "bank_update":
        case "bank_create":
        case "bank_delete":
            return "border-purple-500 text-purple-700";
        case "profit_declaration":
            return "border-orange-500 text-orange-700";
        case "system":
            return "border-gray-500 text-gray-700";
        default:
            return "border-gray-500 text-gray-700";
    }
};
const getActivityLabel = (activity) => {
    return activity
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
const userRoles = [
    "Admin",
    "Rater",
    "Payer",
    "CC Agent",
    "Bank Manager",
    "Customer",
];
const sampleLogs = [
    {
        id: "1",
        timestamp: new Date(),
        user: {
            name: "John Doe",
            avatar: "/api/placeholder/32/32",
            role: "Rater",
        },
        activityType: "Rate Update",
        description: "Updated USD/EUR exchange rate",
        details: "Changed from 1.12 to 1.13",
        status: "success",
    },
    {
        id: "2",
        timestamp: new Date(Date.now() - 3600000),
        user: {
            name: "Sarah Smith",
            avatar: "/api/placeholder/32/32",
            role: "Admin",
        },
        activityType: "Admin Action",
        description: "Approved rate change request",
        details: "Request #4582 - USD/GBP rate modification",
        status: "success",
    },
    {
        id: "3",
        timestamp: new Date(Date.now() - 7200000),
        user: {
            name: "Mike Johnson",
            avatar: "/api/placeholder/32/32",
            role: "CC Agent",
        },
        activityType: "Complaint Resolution",
        description: "Resolved customer dispute",
        details: "Ticket #7823 - Transaction delay issue",
        status: "success",
    },
    {
        id: "4",
        timestamp: new Date(Date.now() - 10800000),
        user: {
            name: "Emma Davis",
            avatar: "/api/placeholder/32/32",
            role: "Bank Manager",
        },
        activityType: "Bank Edit",
        description: "Updated bank balance",
        details: "Manual adjustment for Account #9876",
        status: "warning",
    },
    {
        id: "5",
        timestamp: new Date(Date.now() - 14400000),
        user: {
            name: "Tom Wilson",
            avatar: "/api/placeholder/32/32",
            role: "Rater",
        },
        activityType: "Rate Update",
        description: "Updated JPY/EUR exchange rate",
        details: "System automated update",
        status: "success",
    },
];
const ActivityLogs = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [showFilters, setShowFilters] = useState(true);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const getStatusColor = (status = "success") => {
        const colors = {
            success: "bg-green-100 text-green-800 border-green-300",
            warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
            error: "bg-red-100 text-red-800 border-red-300",
        };
        return colors[status] || colors.success;
    };
    const getActivityTypeColor = (type) => {
        const colors = {
            "Rate Update": "border-blue-400 text-blue-600",
            "Admin Action": "border-purple-400 text-purple-600",
            "Complaint Resolution": "border-orange-400 text-orange-600",
            "Bank Edit": "border-green-400 text-green-600",
            "Login/Logout": "border-gray-400 text-gray-600",
        };
        return colors[type] || "border-primary text-primary";
    };
    console.log(logs);
    const filteredLogs = logs.filter((log) => {
        const matchesSearch = !searchQuery ||
            log.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            false ||
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            false ||
            (typeof log.details === "object"
                ? JSON.stringify(log.details)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                : log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    false);
        const matchesRole = !selectedRole ||
            log.userRole?.toLowerCase() === selectedRole.toLowerCase();
        const matchesActivity = !selectedActivity || log.activity === selectedActivity;
        const matchesDate = !selectedDate ||
            new Date(log.timestamp).toISOString().split("T")[0] === selectedDate;
        return matchesSearch && matchesRole && matchesActivity && matchesDate;
    });
    useEffect(() => {
        const fetch = async () => {
            const data = await getActivityLogs();
            if (data?.success) {
                setLogs(data.data);
            }
            else {
                setLogs([]);
            }
            setLoading(false);
        };
        fetch();
    }, []);
    if (loading)
        return _jsx(Loading, {});
    return (_jsx(Box, { className: "p-6 bg-gray-50 min-h-screen", children: _jsxs(Box, { className: "max-w-7xl mx-auto", children: [_jsxs(Box, { className: "flex justify-between items-center mb-6", children: [_jsx(Typography, { variant: "h4", className: "font-extrabold font-secondary text-gray-800", children: "Activity Logs" }), _jsxs(Box, { className: "flex gap-2", children: [_jsx(Tooltip, { title: "Refresh logs", children: _jsx(IconButton, { className: "text-gray-600 hover:bg-gray-100", children: _jsx(RefreshIcon, {}) }) }), _jsx(Tooltip, { title: "Toggle filters", children: _jsx(IconButton, { className: "text-gray-600 hover:bg-gray-100", onClick: () => setShowFilters(!showFilters), children: _jsx(FilterListIcon, {}) }) })] })] }), showFilters && (_jsx(Paper, { className: "p-4 mb-6 shadow-sm border border-gray-100", children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { variant: "outlined", placeholder: "Search by user or description...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), InputProps: {
                                    startAdornment: _jsx(SearchIcon, { className: "mr-2 text-gray-400" }),
                                }, fullWidth: true, size: "small" }), _jsxs(Box, { className: "flex flex-wrap gap-4 items-center", children: [_jsx(TextField, { type: "date", label: "Filter by date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), InputLabelProps: { shrink: true }, size: "small", className: "w-48" }), _jsxs(FormControl, { size: "small", className: "w-48", children: [_jsx(InputLabel, { children: "User Role" }), _jsxs(Select, { value: selectedRole, label: "User Role", onChange: (e) => setSelectedRole(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Roles" }), userRoles.map((role) => (_jsx(MenuItem, { value: role, children: role }, role)))] })] }), _jsxs(FormControl, { size: "small", className: "w-48", children: [_jsx(InputLabel, { children: "Activity Type" }), _jsxs(Select, { value: selectedActivity, label: "Activity Type", onChange: (e) => setSelectedActivity(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Activities" }), activityTypes.map((type) => (_jsx(MenuItem, { value: type.label, children: type.label }, type.label)))] })] })] })] }) })), _jsx(Paper, { className: "shadow-sm border border-gray-100", children: _jsxs(TableContainer, { children: [_jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { className: "bg-gray-50 font-semibold", children: "Timestamp" }), _jsx(TableCell, { className: "bg-gray-50 font-semibold", children: "User" }), _jsx(TableCell, { className: "bg-gray-50 font-semibold", children: "Role" }), _jsx(TableCell, { className: "bg-gray-50 font-semibold", children: "Activity" }), _jsx(TableCell, { className: "bg-gray-50 font-semibold", children: "Description" }), _jsx(TableCell, { className: "bg-gray-50 font-semibold" })] }) }), _jsx(TableBody, { children: filteredLogs.reverse().map((log) => (_jsxs(TableRow, { hover: true, className: "group", children: [_jsx(TableCell, { className: "whitespace-nowrap", children: _jsx(Typography, { variant: "body2", className: "text-gray-600", children: new Date(log.timestamp).toLocaleString() }) }), _jsx(TableCell, { children: log.user ? (_jsxs(Box, { className: "flex items-center justify-center gap-2 flex-col", children: [_jsx(Avatar, { src: log.user.avatar, alt: log.user.fullName, className: "w-8 h-8" }), _jsx(Typography, { variant: "body2", className: "font-medium w-max text-sm", children: log.user.fullName })] })) : (_jsx(Typography, { variant: "body2", className: "text-gray-500 italic", children: "System" })) }), _jsx(TableCell, { children: _jsx(Chip, { label: log.userRole || "System", size: "small", className: `${getRoleColor(log.userRole)}` }) }), _jsx(TableCell, { children: _jsx(Chip, { label: getActivityLabel(log.activity), size: "small", variant: "outlined", className: `${getActivityTypeColor(log.activity)}` }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: log.description }) }), _jsx(TableCell, { children: !log.isSystemGenerated && (_jsx(IconButton, { size: "small", className: "opacity-0 group-hover:opacity-100", children: _jsx(MoreVertIcon, { fontSize: "small" }) })) })] }, log.id))) })] }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: filteredLogs.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, newPage) => setPage(newPage), onRowsPerPageChange: (e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                } })] }) })] }) }));
};
export default ActivityLogs;
