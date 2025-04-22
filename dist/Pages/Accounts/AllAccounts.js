import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Container, Typography, Card, IconButton, Select, MenuItem, FormControl, InputLabel, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllAccounts, deleteAccount, } from "../../api/account";
import { useNavigate } from "react-router-dom";
const AllAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetchAccounts();
    }, []);
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await getAllAccounts();
            // Add serial numbers to the data
            const accountsWithSerial = data.map((account, index) => ({
                ...account,
                serialNo: index + 1,
            }));
            setAccounts(accountsWithSerial);
            setError("");
        }
        catch (err) {
            setError("Failed to fetch accounts");
            console.error("Error fetching accounts:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const handlePlatformChange = (event) => {
        setSelectedPlatform(event.target.value);
    };
    const handleDelete = async () => {
        try {
            await deleteAccount(selectedAccountId);
            await fetchAccounts();
            setDeleteDialogOpen(false);
            setSelectedAccountId(null);
        }
        catch (err) {
            console.error("Error deleting account:", err);
        }
    };
    const confirmDelete = (id) => {
        setSelectedAccountId(id);
        setDeleteDialogOpen(true);
    };
    const detectImage = (platform) => {
        switch (platform) {
            case "binance":
                return "/binance.png";
                break;
            case "noones":
                return "/noones.png";
                break;
            case "paxful":
                return "/paxful.jpg";
                break;
        }
    };
    const filteredAccounts = accounts.filter((account) => selectedPlatform === "all" ? true : account.platform === selectedPlatform);
    const columns = [
        {
            field: "serialNo",
            headerName: "Serial No",
            width: 100,
            headerClassName: "table-header",
        },
        {
            field: "account_username",
            headerName: "Account Username",
            flex: 1,
            headerClassName: "table-header",
            renderCell: (params) => (_jsx(Typography, { className: "font-medium", children: params.value })),
        },
        {
            field: "platform",
            headerName: "Platform",
            width: 150,
            headerClassName: "table-header",
            renderCell: (params) => (_jsx("img", { src: detectImage(params.value), className: "h-6 w-max object-cover object-center" })),
        },
        // {
        //   field: "total_trades",
        //   headerName: "Total Trades",
        //   width: 130,
        //   headerClassName: "table-header",
        //   renderCell: (params) => (
        //     <Typography className="font-medium">{params.value || 0}</Typography>
        //   ),
        // },
        {
            field: "paid_trades",
            headerName: "Paid Trades",
            width: 130,
            headerClassName: "table-header",
            renderCell: (params) => (_jsx(Typography, { className: "font-medium", children: params.value || 0 })),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            headerClassName: "table-header",
            sortable: false,
            renderCell: (params) => {
                return (_jsxs(Box, { className: "flex gap-2", children: [_jsx(IconButton, { onClick: () => navigate(`/admin/account/create?accountId=${params.row.id}`), className: "text-green-600 hover:bg-green-50", size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { onClick: () => confirmDelete(params.row.id), className: "text-red-600 hover:bg-red-50", size: "small", children: _jsx(DeleteIcon, {}) })] }));
            },
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-[#f8f9fa]", children: [_jsx("div", { className: "h-1 bg-gradient-to-r from-button to-primary2" }), _jsxs(Container, { maxWidth: "xl", className: "py-6", children: [_jsxs(Box, { className: "flex justify-between items-center mb-6", children: [_jsx("div", { children: _jsx("h1", { className: "text-4xl font-bold font-secondary bg-gradient-to-r from-primary2 to-primary bg-clip-text text-transparent", children: "Forex Accounts" }) }), _jsx(Button, { variant: "contained", onClick: () => navigate("/admin/account/create"), className: "bg-button hover:bg-primary2 text-white shadow-md", startIcon: _jsx(AddIcon, {}), sx: {
                                    backgroundColor: "#F8BC08",
                                    "&:hover": { backgroundColor: "#C6980C" },
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    px: 3,
                                    py: 1,
                                }, children: "Add Account" })] }), _jsxs(Card, { className: "shadow-sm rounded-lg w-full py-4 px-4 overflow-hidden", children: [_jsx(Box, { className: "px-4 py-3 w-max bg-white border-b flex flex-row justify-between items-center gap-4", children: _jsx("div", { className: "flex items-center gap-3  w-max", children: _jsxs(FormControl, { size: "small", className: "w-[200px]", children: [_jsx(InputLabel, { children: "Platform" }), _jsxs(Select, { value: selectedPlatform, onChange: handlePlatformChange, label: "Platform", className: "bg-white", children: [_jsx(MenuItem, { value: "all", children: "All Platforms" }), _jsx(MenuItem, { value: "noones", children: "Noones" }), _jsx(MenuItem, { value: "paxful", children: "Paxful" }), _jsx(MenuItem, { value: "binance", children: "Binance" })] })] }) }) }), error && (_jsx(Alert, { severity: "error", className: "mx-4 mt-4", sx: { borderRadius: 1 }, children: error })), _jsx(DataGrid, { rows: filteredAccounts, columns: columns, paginationModel: { pageSize: 10, page: 0 }, pageSizeOptions: [10, 25, 50], disableRowSelectionOnClick: true, autoHeight: true, loading: loading, className: "bg-white", sx: {
                                    border: "none",
                                    "& .table-header": {
                                        backgroundColor: "#ffffff",
                                        color: "#64748b",
                                        fontWeight: "600",
                                        fontSize: "0.875rem",
                                    },
                                    "& .MuiDataGrid-cell": {
                                        borderBottom: "1px solid #f1f5f9",
                                        padding: "12px 16px",
                                    },
                                    "& .MuiDataGrid-row:hover": {
                                        backgroundColor: "#f8fafc",
                                    },
                                    "& .MuiDataGrid-columnHeaders": {
                                        borderBottom: "1px solid #e2e8f0",
                                    },
                                    "& .MuiDataGrid-footerContainer": {
                                        borderTop: "1px solid #e2e8f0",
                                        backgroundColor: "#ffffff",
                                    },
                                } })] }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), maxWidth: "xs", fullWidth: true, PaperProps: {
                            elevation: 0,
                            className: "rounded-lg",
                        }, children: [_jsx(DialogTitle, { className: "px-6 py-4 bg-gray-50 border-b", children: _jsx(Typography, { className: "font-semibold text-gray-800", children: "Delete Account" }) }), _jsxs(DialogContent, { className: "p-6", children: [_jsx(Alert, { severity: "warning", className: "mb-4", children: "This action cannot be undone." }), _jsx(Typography, { className: "text-gray-600 text-sm", children: "Are you sure you want to delete this account? All associated data will be permanently removed." })] }), _jsxs(DialogActions, { className: "px-6 py-4 border-t bg-gray-50", children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), className: "text-gray-600 hover:bg-gray-100", size: "small", children: "Cancel" }), _jsx(Button, { onClick: handleDelete, variant: "contained", className: "bg-red-600 hover:bg-red-700", size: "small", sx: {
                                            bgcolor: "#dc2626",
                                            "&:hover": { bgcolor: "#b91c1c" },
                                            textTransform: "none",
                                        }, children: "Delete Account" })] })] })] })] }));
};
export default AllAccounts;
