import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAccount, updateAccount, getSingleAccount, } from "../../api/account";
import { Card, CardContent, TextField, MenuItem, Button, Alert, Box, InputLabel, FormControl, Select, CircularProgress, Container, } from "@mui/material";
import { ArrowLeft } from "lucide-react";
const CreateAccounts = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const accountId = queryParams.get("accountId");
    const [formData, setFormData] = useState({
        account_username: "",
        api_key: "",
        api_secret: "",
        platform: "noones",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const fetchAccountDetails = async (id) => {
        try {
            const data = await getSingleAccount(id);
            if (data.success) {
                const account = data.data;
                console.log(`This is the accounts Data `, account);
                setFormData({
                    account_username: account.username,
                    api_key: account.api_key,
                    api_secret: account.api_secret,
                    platform: account.platform,
                });
                setIsEditing(true);
            }
        }
        catch (error) {
            console.error("Failed to fetch account details:", error);
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.account_username.trim()) {
            newErrors.account_username = "Username is required";
        }
        if (!formData.api_key.trim()) {
            newErrors.api_key = "API Key is required";
        }
        if (!formData.api_secret.trim()) {
            newErrors.api_secret = "API Secret is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        const cfs = window.confirm("Are you sure if the api input is correct ?");
        if (!cfs) {
            return;
        }
        setIsSubmitting(true);
        try {
            let data;
            if (isEditing && accountId) {
                data = await updateAccount(accountId, formData);
                setSuccessMessage("Account updated successfully!");
            }
            else {
                data = await createAccount(formData);
                setSuccessMessage("Account created successfully!");
                setFormData({
                    account_username: "",
                    api_key: "",
                    api_secret: "",
                    platform: "noones",
                });
            }
            if (data.success) {
                navigate("/admin/account/all");
                return;
            }
        }
        catch (error) {
            console.error("Error:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };
    const inputProps = {
        sx: {
            "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                    backgroundColor: "#f8f9fa",
                },
                "&.Mui-focused": {
                    backgroundColor: "white",
                    "& fieldset": {
                        borderColor: "#F8BC08",
                        borderWidth: "2px",
                    },
                },
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: "#C6980C",
            },
        },
    };
    useEffect(() => {
        if (accountId) {
            fetchAccountDetails(accountId);
        }
    }, []);
    return (_jsx(Container, { maxWidth: false, className: "min-h-screen py-12 px-4", children: _jsx(Card, { className: "max-w-2xl mx-auto shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl", children: _jsxs("div", { className: "bg-white", children: [_jsxs("div", { className: "bg-gradient-to-r from-button to-primary2 py-8 px-6 flex justify-center items-center ", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex justify-center items-center gap-2 absolute top-0 left-0 m-4", children: [_jsx(ArrowLeft, {}), " Back"] }), _jsx("h1", { className: "text-center font-primary text-white text-[30px] font-bold", children: isEditing ? "Update Forex Account" : "Add Forex Account" })] }), _jsxs(CardContent, { className: "p-8", children: [successMessage && (_jsx(Alert, { severity: "success", className: "mb-8 rounded-lg", sx: {
                                    "& .MuiAlert-icon": {
                                        color: "#2e7d32",
                                    },
                                }, children: successMessage })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx(TextField, { fullWidth: true, label: "Account Username", name: "account_username", value: formData.account_username, onChange: handleInputChange, error: !!errors.account_username, helperText: errors.account_username, variant: "outlined", ...inputProps }), _jsxs(FormControl, { fullWidth: true, variant: "outlined", ...inputProps, children: [_jsx(InputLabel, { children: "Platform" }), _jsxs(Select, { name: "platform", value: formData.platform, onChange: handleInputChange, label: "Platform", className: "bg-white", children: [_jsx(MenuItem, { value: "noones", children: "Noones" }), _jsx(MenuItem, { value: "paxful", children: "Paxful" }), _jsx(MenuItem, { value: "binance", children: "Binance" })] })] }), _jsx(TextField, { fullWidth: true, label: "API Key", name: "api_key", type: "password", value: formData.api_key, onChange: handleInputChange, error: !!errors.api_key, helperText: errors.api_key, variant: "outlined", ...inputProps }), _jsx(TextField, { fullWidth: true, label: "API Secret", name: "api_secret", type: "password", value: formData.api_secret, onChange: handleInputChange, error: !!errors.api_secret, helperText: errors.api_secret, variant: "outlined", ...inputProps }), _jsx(Button, { type: "submit", variant: "contained", disabled: isSubmitting, className: "w-full text-white font-medium py-3.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", sx: {
                                            backgroundColor: "#F8BC08",
                                            "&:hover": {
                                                backgroundColor: "#C6980C",
                                            },
                                            textTransform: "none",
                                            fontSize: "1.0rem",
                                            boxShadow: "0 4px 6px rgba(248, 188, 8, 0.2)",
                                        }, children: isSubmitting ? (_jsxs(Box, { className: "flex items-center justify-center gap-3", children: [_jsx(CircularProgress, { size: 20, color: "inherit" }), _jsx("span", { children: isEditing
                                                        ? "Updating Account..."
                                                        : "Creating Account..." })] })) : isEditing ? ("Update Account") : ("Create Account") })] })] })] }) }) }));
};
export default CreateAccounts;
