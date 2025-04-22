import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Menu, MenuItem, Button, } from "@mui/material";
import { MoreVert as MoreVertIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccountBalance as AccountIcon, ArrowDownward as ArrowDownwardIcon, AccountBalance, Add, } from "@mui/icons-material";
import { deleteBank, getAllBanks } from "../../api/bank";
import Loading from "../../Components/Loading";
import { formatDate } from "../../lib/constants";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../Components/ContextProvider";
import ClockedAlt from "../../Components/ClockedAlt";
const Banks = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const navigate = useNavigate();
    const handleMenuOpen = (event, bank) => {
        setAnchorEl(event.currentTarget);
        setSelectedBank(bank);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBank(null);
    };
    const handleBankDelete = async (id) => {
        const data = await deleteBank(id);
        if (data?.success) {
            const newBanks = banks.filter((bank) => bank.id !== id);
            setBanks(newBanks);
        }
    };
    const handleEditBank = async (id) => {
        navigate(`/banks/create?bankId=${id}`);
        return;
    };
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAllBanks();
                if (data?.success) {
                    setBanks(data.data);
                }
            }
            catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);
    if (loading)
        return _jsx(Loading, {});
    if (!user.clockedIn && user.userType !== "admin") {
        return _jsx(ClockedAlt, {});
    }
    return (_jsxs("div", { className: "space-y-6  min-h-screen font-primary", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Bank Management" }), _jsx("p", { className: "text-text2 mt-1", children: "Manage your bank accounts and transactions" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), className: "bg-button hover:bg-primary2 text-white shadow-lg normal-case", sx: {
                            backgroundColor: "#F8BC08",
                            "&:hover": {
                                backgroundColor: "#C6980C",
                            },
                        }, onClick: () => navigate("/banks/create"), children: "Add New Bank" })] }), _jsx(TableContainer, { component: Paper, className: "shadow-lg", children: _jsxs(Table, { children: [_jsx(TableHead, { className: "bg-muted/50", children: _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-semibold", children: _jsxs("div", { className: "flex items-center gap-2", children: ["Bank Name", _jsx(ArrowDownwardIcon, { fontSize: "small", className: "text-gray-400" })] }) }), _jsx(TableCell, { className: "font-semibold", children: "Account Name" }), _jsx(TableCell, { className: "font-semibold", children: "Account Number" }), _jsx(TableCell, { className: "font-semibold", children: "Funds" }), _jsx(TableCell, { className: "font-semibold", children: "Created Date" }), _jsx(TableCell, { align: "center", className: "font-semibold", children: "Actions" })] }) }), _jsx(TableBody, { children: banks.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, children: _jsxs("div", { className: "flex flex-col items-center justify-center py-16 px-4", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-button/10 flex items-center justify-center mb-4", children: _jsx(AccountBalance, { className: "text-button", sx: { fontSize: 40 } }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Banks Found" }), _jsx("p", { className: "text-text2 text-center max-w-md mb-6", children: "You haven't added any bank accounts yet. Click the button below to add your first bank account." }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), className: "bg-button hover:bg-primary2 text-white shadow-lg normal-case", sx: {
                                                    backgroundColor: "#F8BC08",
                                                    "&:hover": {
                                                        backgroundColor: "#C6980C",
                                                    },
                                                }, children: "Add New Bank" })] }) }) })) : (banks.map((bank) => (_jsxs(TableRow, { className: "hover:bg-muted/50 transition-colors", children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(AccountIcon, { className: "text-primary" }) }), _jsx("span", { className: "font-medium", children: bank.bankName })] }) }), _jsx(TableCell, { children: bank.accountName }), _jsx(TableCell, { className: "font-mono", children: bank.accountNumber }), _jsx(TableCell, { children: _jsxs("span", { className: "font-semibold", children: ["$", bank.funds.toLocaleString()] }) }), _jsx(TableCell, { className: "text-text2", children: formatDate(new Date(bank.createdAt)) }), _jsx(TableCell, { align: "center", children: _jsx(IconButton, { size: "small", onClick: (e) => handleMenuOpen(e, bank), children: _jsx(MoreVertIcon, {}) }) }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "right",
                                        }, transformOrigin: {
                                            vertical: "top",
                                            horizontal: "right",
                                        }, children: [_jsxs(MenuItem, { onClick: () => {
                                                    handleEditBank(bank.id);
                                                }, className: "flex items-center gap-2", children: [_jsx(EditIcon, { fontSize: "small" }), "Edit"] }), _jsxs(MenuItem, { onClick: () => {
                                                    handleBankDelete(bank.id);
                                                }, className: "flex items-center gap-2 text-destructive", children: [_jsx(DeleteIcon, { fontSize: "small" }), "Delete"] })] })] }, bank.id)))) })] }) })] }));
};
export default Banks;
