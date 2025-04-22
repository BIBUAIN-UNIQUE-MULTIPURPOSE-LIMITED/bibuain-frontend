import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField, Button, InputAdornment, Card, Alert, CircularProgress, } from "@mui/material";
import { AccountBalance as BankIcon, ArrowBack as ArrowBackIcon, Save as SaveIcon, AttachMoney as MoneyIcon, Person as PersonIcon, Numbers as NumbersIcon, Notes as NotesIcon, } from "@mui/icons-material";
import { addBank, getSingleBank, updateBank } from "../../api/bank";
import toast from "react-hot-toast";
import { errorStyles } from "../../lib/constants";
import ClockedAlt from "../../Components/ClockedAlt";
import { useUserContext } from "../../Components/ContextProvider";
const CreateBank = () => {
    const [searchParams] = useSearchParams();
    const bankId = searchParams.get("bankId");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [bank, setBank] = useState(null);
    const { user } = useUserContext();
    const [formData, setFormData] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        funds: "",
        additionalNotes: "",
        id: "",
    });
    useEffect(() => {
        const fetchBankData = async () => {
            if (bankId) {
                setLoading(true);
                try {
                    const data = await getSingleBank(bankId);
                    if (data?.success) {
                        const bankData = {
                            id: data.data.id,
                            bankName: data.data.bankName,
                            accountName: data.data.accountName,
                            accountNumber: data.data.accountNumber,
                            funds: data.data?.funds,
                            additionalNotes: data.data?.additionalNotes,
                        };
                        setBank(data.data);
                        setFormData(bankData);
                    }
                }
                catch (err) {
                    setError("Failed to fetch bank details");
                }
                finally {
                    setLoading(false);
                }
            }
        };
        fetchBankData();
    }, [bankId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (bank !== null && bankId) {
                const data = await updateBank(formData.id, formData);
                if (data?.success) {
                    navigate("/banks");
                    return;
                }
            }
            else {
                if (!formData.accountName ||
                    !formData.accountNumber ||
                    !formData.bankName) {
                    return toast.error("Incomplete fields!", errorStyles);
                }
                const data = await addBank(formData);
                if (data?.success) {
                    navigate("/banks");
                    return;
                }
            }
        }
        catch (err) {
            setError("Failed to save bank details");
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };
    const textFieldStyle = {
        "& .MuiOutlinedInput-root": {
            height: "60px",
        },
        "& .MuiOutlinedInput-input": {
            padding: "8px 14px",
        },
        "& .MuiInputLabel-root": {
            transform: "translate(14px, 12px) scale(1)",
        },
        "& .MuiInputLabel-shrink": {
            transform: "translate(14px, -9px) scale(0.75)",
        },
    };
    if (!user.clockedIn && user.userType !== "admin") {
        return _jsx(ClockedAlt, {});
    }
    return (_jsx("div", { className: "h-[80vh] w-full flex px-[7rem] justify-center items-center font-primary", children: _jsxs("div", { className: "w-full  mx-auto", children: [_jsxs("div", { className: "mb-6 flex items-center gap-3", children: [_jsx(Button, { startIcon: _jsx(ArrowBackIcon, {}), className: "text-text2 normal-case", onClick: () => window.history.back(), children: "Back" }), _jsx("h1", { className: "text-2xl font-semibold text-foreground", children: bankId ? "Edit Bank Account" : "Create New Bank Account" })] }), _jsxs(Card, { className: "shadow-md", children: [error && (_jsx(Alert, { severity: "error", className: "rounded-none", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(TextField, { label: "Bank Name", required: true, fullWidth: true, value: formData.bankName, onChange: handleChange("bankName"), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(BankIcon, { className: "text-text2", fontSize: "small" }) })),
                                            }, sx: textFieldStyle }), _jsx(TextField, { label: "Account Name", required: true, fullWidth: true, value: formData.accountName, onChange: handleChange("accountName"), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(PersonIcon, { className: "text-text2", fontSize: "small" }) })),
                                            }, sx: textFieldStyle }), _jsx(TextField, { label: "Account Number", required: true, fullWidth: true, value: formData.accountNumber, onChange: handleChange("accountNumber"), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(NumbersIcon, { className: "text-text2", fontSize: "small" }) })),
                                            }, sx: textFieldStyle }), _jsx(TextField, { label: "Initial Funds", type: "number", required: true, fullWidth: true, value: formData.funds, onChange: handleChange("funds"), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(MoneyIcon, { className: "text-text2", fontSize: "small" }) })),
                                            }, sx: textFieldStyle }), _jsx(TextField, { label: "Additional Notes", multiline: true, rows: 3, fullWidth: true, className: "col-span-2 mt-2", value: formData.additionalNotes, onChange: handleChange("additionalNotes"), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(NotesIcon, { className: "text-text2", fontSize: "small" }) })),
                                            } })] }), _jsxs("div", { className: "flex justify-end gap-3 mt-6 pt-4 border-t", children: [_jsx(Button, { variant: "outlined", className: "normal-case", onClick: () => window.history.back(), children: "Cancel" }), _jsx(Button, { type: "submit", variant: "contained", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 20 }) : _jsx(SaveIcon, {}), className: "normal-case bg-button hover:bg-primary2", sx: {
                                                backgroundColor: "#F8BC08",
                                                "&:hover": {
                                                    backgroundColor: "#C6980C",
                                                },
                                            }, children: loading ? "Saving..." : bankId ? "Update" : "Create" })] })] })] })] }) }));
};
export default CreateBank;
