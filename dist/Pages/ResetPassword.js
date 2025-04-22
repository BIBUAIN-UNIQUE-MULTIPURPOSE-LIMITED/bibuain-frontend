import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent, TextField, Button, Typography, InputAdornment, Box, IconButton, LinearProgress, } from "@mui/material";
import { LockKeyhole, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL, loadingStyles, successStyles } from "../lib/constants";
import toast from "react-hot-toast";
import { handleApiError } from "../api/user";
const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [code, setCode] = useState(null);
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();
    const [params] = useSearchParams();
    // Fetch reset code from URL params
    useEffect(() => {
        const resetCode = params.get("code");
        if (!resetCode) {
            navigate("/login"); // Redirect to login if code is not found
        }
        else {
            setCode(resetCode);
        }
    }, [params, navigate]);
    // Password strength calculation
    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8)
            strength += 25;
        if (password.match(/[A-Z]/))
            strength += 25;
        if (password.match(/[0-9]/))
            strength += 25;
        if (password.match(/[^A-Za-z0-9]/))
            strength += 25;
        return strength;
    };
    const getStrengthColor = (strength) => {
        if (strength <= 25)
            return "#ef4444";
        if (strength <= 50)
            return "#f97316";
        if (strength <= 75)
            return "#F8BC08";
        return "#22c55e";
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {
            password: "",
            confirmPassword: "",
        };
        let isValid = true;
        if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
            isValid = false;
        }
        if (calculateStrength(password) < 75) {
            newErrors.password = "Password is not strong enough";
            isValid = false;
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }
        setErrors(newErrors);
        if (isValid && code) {
            try {
                toast.loading("Resetting password...", loadingStyles);
                const response = await axios.post(`${BASE_URL}/user/reset-password`, { code, newPassword: password, confirmNewPassword: confirmPassword }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = response.data;
                toast.dismiss();
                if (data.success) {
                    toast.success(data.message, successStyles);
                    navigate("/login");
                }
            }
            catch (error) {
                toast.dismiss();
                handleApiError(error);
            }
        }
    };
    return (_jsx(Box, { className: "min-h-screen flex items-center justify-center p-4", sx: {
            background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
            position: "relative",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at center, rgba(248,188,8,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            },
        }, children: _jsx(Card, { className: "w-full max-w-[500px]", sx: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
            }, children: _jsxs(CardContent, { className: "p-8", children: [_jsxs("div", { className: "flex flex-col items-center space-y-6", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-gradient-to-r from-button to-primary2 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shadow-lg", children: _jsx(LockKeyhole, { className: "w-10 h-10 text-white" }) }), _jsxs("div", { className: "text-center space-y-3", children: [_jsx(Typography, { variant: "h4", className: "text-3xl font-bold font-primary", sx: {
                                            background: "linear-gradient(135deg, #F8BC08, #C6980C)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }, children: "Reset Password" }), _jsx(Typography, { variant: "body1", className: "text-text2 font-secondary text-lg", children: "Create a new strong password for your account" })] })] }), !isSubmitted ? (_jsxs("form", { onSubmit: handleSubmit, className: "mt-10 space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { fullWidth: true, variant: "outlined", type: showPassword ? "text" : "password", placeholder: "Enter new password", value: password, onChange: (e) => setPassword(e.target.value), error: !!errors.password, helperText: errors.password, InputProps: {
                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(LockKeyhole, { className: "text-text2", size: 20 }) })),
                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", children: showPassword ? (_jsx(EyeOff, { className: "text-text2", size: 20 })) : (_jsx(Eye, { className: "text-text2", size: 20 })) }) })),
                                            sx: {
                                                borderRadius: "12px",
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                                },
                                            },
                                        }, sx: {
                                            "& .MuiOutlinedInput-root": {
                                                height: "56px",
                                                "& fieldset": {
                                                    borderColor: "rgba(0, 0, 0, 0.1)",
                                                    borderWidth: "2px",
                                                    borderRadius: "12px",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#F8BC08",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#F8BC08",
                                                    borderWidth: "2px",
                                                },
                                            },
                                        } }), password && (_jsxs("div", { className: "space-y-2", children: [_jsx(LinearProgress, { variant: "determinate", value: calculateStrength(password), sx: {
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                    "& .MuiLinearProgress-bar": {
                                                        backgroundColor: getStrengthColor(calculateStrength(password)),
                                                    },
                                                } }), _jsx("div", { className: "flex justify-between text-sm", children: _jsxs("div", { className: "space-x-4", children: [_jsx("span", { className: `${password.length >= 8
                                                                ? "text-green-500"
                                                                : "text-text2"}`, children: "8+ Characters" }), _jsx("span", { className: `${password.match(/[A-Z]/)
                                                                ? "text-green-500"
                                                                : "text-text2"}`, children: "Uppercase" }), _jsx("span", { className: `${password.match(/[0-9]/)
                                                                ? "text-green-500"
                                                                : "text-text2"}`, children: "Number" }), _jsx("span", { className: `${password.match(/[^A-Za-z0-9]/)
                                                                ? "text-green-500"
                                                                : "text-text2"}`, children: "Special" })] }) })] })), _jsx(TextField, { fullWidth: true, variant: "outlined", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm new password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), error: !!errors.confirmPassword, helperText: errors.confirmPassword, InputProps: {
                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(LockKeyhole, { className: "text-text2", size: 20 }) })),
                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowConfirmPassword(!showConfirmPassword), edge: "end", children: showConfirmPassword ? (_jsx(EyeOff, { className: "text-text2", size: 20 })) : (_jsx(Eye, { className: "text-text2", size: 20 })) }) })),
                                            sx: {
                                                borderRadius: "12px",
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                                },
                                            },
                                        }, sx: {
                                            "& .MuiOutlinedInput-root": {
                                                height: "56px",
                                                "& fieldset": {
                                                    borderColor: "rgba(0, 0, 0, 0.1)",
                                                    borderWidth: "2px",
                                                    borderRadius: "12px",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#F8BC08",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#F8BC08",
                                                    borderWidth: "2px",
                                                },
                                            },
                                        } })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", className: "font-primary text-lg", sx: {
                                    background: "linear-gradient(135deg, #F8BC08, #C6980C)",
                                    height: "56px",
                                    borderRadius: "12px",
                                    textTransform: "none",
                                    fontSize: "1.1rem",
                                    boxShadow: "0 4px 15px rgba(248, 188, 8, 0.3)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #C6980C, #F8BC08)",
                                        boxShadow: "0 6px 20px rgba(248, 188, 8, 0.4)",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }, children: "Reset Password" })] })) : (_jsxs("div", { className: "text-center space-y-6 mt-10", children: [_jsx("div", { className: "w-20 h-20 rounded-full mx-auto flex items-center justify-center", style: {
                                    background: "linear-gradient(135deg, #4ade80, #22c55e)",
                                    boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
                                }, children: _jsx(CheckCircle2, { className: "w-10 h-10 text-white" }) }), _jsx(Typography, { variant: "h5", className: "font-semibold font-primary text-2xl", sx: {
                                    color: "#22c55e",
                                }, children: "Password Reset Successfully" }), _jsxs(Typography, { variant: "body1", className: "text-text2 font-secondary text-lg", children: ["Your password has been reset successfully.", _jsx("br", {}), "You can now login with your new password."] }), _jsx(Button, { href: "/login", variant: "outlined", className: "mt-8 font-primary", sx: {
                                    borderColor: "#F8BC08",
                                    color: "#F8BC08",
                                    borderWidth: "2px",
                                    borderRadius: "12px",
                                    padding: "12px 24px",
                                    textTransform: "none",
                                    fontSize: "1.1rem",
                                    "&:hover": {
                                        borderColor: "#C6980C",
                                        color: "#C6980C",
                                        borderWidth: "2px",
                                        backgroundColor: "rgba(248, 188, 8, 0.05)",
                                    },
                                    transition: "all 0.3s ease",
                                }, children: "Back to Login" })] }))] }) }) }));
};
export default ResetPassword;
