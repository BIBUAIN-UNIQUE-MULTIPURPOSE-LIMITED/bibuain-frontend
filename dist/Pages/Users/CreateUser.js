import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, Typography, Button, Box, Grid, TextField, MenuItem, Switch, FormControlLabel, IconButton, InputAdornment, Alert, Stack, useTheme, alpha, CircularProgress, } from "@mui/material";
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, VpnKey as KeyIcon, Badge as BadgeIcon, Security as SecurityIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Save as SaveIcon, Clear as ClearIcon, } from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { createUser } from "../../api/admin";
import { useNavigate } from "react-router-dom";
// Define the UserType enum to match backend
var UserType;
(function (UserType) {
    UserType["ADMIN"] = "admin";
    UserType["PAYER"] = "payer";
    UserType["RATER"] = "rater";
    UserType["CEO"] = "ceo";
    UserType["CC"] = "customer-support";
})(UserType || (UserType = {}));
// Validation schema using Yup
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    fullName: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Full name is required"),
    userType: Yup.string()
        .oneOf(Object.values(UserType), "Invalid user type")
        .required("User type is required"),
    phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
        .nullable(),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), undefined], "Passwords must match")
        .required("Please confirm your password"),
    twoFaEnabled: Yup.boolean(),
    status: Yup.string()
        .oneOf(["active", "inactive", "suspended"], "Invalid status")
        .required("Status is required"),
});
const CreateUser = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const initialValues = {
        email: "",
        fullName: "",
        userType: "",
        phone: "",
        password: "",
        confirmPassword: "",
        twoFaEnabled: true,
        status: "active",
    };
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const data = await createUser(values);
            if (data?.success) {
                resetForm();
                navigate("/admin/users");
                return;
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx(Box, { sx: { p: { xs: 2, sm: 3 }, maxWidth: "lg", mx: "auto" }, children: _jsxs(Card, { sx: {
                p: 2,
                boxShadow: theme.shadows[3],
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                    boxShadow: theme.shadows[6],
                },
            }, children: [_jsx(CardHeader, { avatar: _jsx(Box, { sx: {
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }, children: _jsx(PersonIcon, { sx: { color: theme.palette.primary.main } }) }), title: _jsx(Typography, { variant: "h5", sx: { fontWeight: 600, color: theme.palette.text.primary }, children: "Create New User" }), subheader: "Add a new user to the system" }), _jsx(CardContent, { children: _jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, onSubmit: handleSubmit, children: ({ values, errors, touched, handleChange, handleBlur, isSubmitting, resetForm, }) => (_jsx(Form, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "fullName", label: "Full Name", value: values.fullName, onChange: handleChange, onBlur: handleBlur, error: touched.fullName && Boolean(errors.fullName), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(BadgeIcon, { color: "action" }) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "email", label: "Email Address", value: values.email, onChange: handleChange, onBlur: handleBlur, error: touched.email && Boolean(errors.email), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(EmailIcon, { color: "action" }) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "phone", label: "Phone Number", value: values.phone, onChange: handleChange, onBlur: handleBlur, error: touched.phone && Boolean(errors.phone), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(PhoneIcon, { color: "action" }) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, select: true, name: "userType", label: "User Type", value: values.userType, onChange: handleChange, onBlur: handleBlur, error: touched.userType && Boolean(errors.userType), children: Object.entries(UserType).map(([key, value]) => (_jsx(MenuItem, { value: value, children: key.charAt(0) + key.slice(1).toLowerCase() }, key))) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "password", label: "Password", type: showPassword ? "text" : "password", value: values.password, onChange: handleChange, onBlur: handleBlur, error: touched.password && Boolean(errors.password), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(KeyIcon, { color: "action" }) })),
                                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", children: showPassword ? (_jsx(VisibilityOffIcon, {})) : (_jsx(VisibilityIcon, {})) }) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "confirmPassword", label: "Confirm Password", type: showConfirmPassword ? "text" : "password", value: values.confirmPassword, onChange: handleChange, onBlur: handleBlur, error: touched.confirmPassword &&
                                                Boolean(errors.confirmPassword), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(KeyIcon, { color: "action" }) })),
                                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowConfirmPassword(!showConfirmPassword), edge: "end", children: showConfirmPassword ? (_jsx(VisibilityOffIcon, {})) : (_jsx(VisibilityIcon, {})) }) })),
                                            } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(TextField, { fullWidth: true, select: true, name: "status", label: "Status", value: values.status, onChange: handleChange, onBlur: handleBlur, error: touched.status && Boolean(errors.status), children: [_jsx(MenuItem, { value: "active", children: "Active" }), _jsx(MenuItem, { value: "inactive", children: "Inactive" }), _jsx(MenuItem, { value: "suspended", children: "Suspended" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(FormControlLabel, { control: _jsx(Switch, { name: "twoFaEnabled", checked: values.twoFaEnabled, onChange: handleChange, color: "primary" }), label: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(SecurityIcon, { color: "action" }), _jsx(Typography, { children: "Enable Two-Factor Authentication" })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters." }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "flex-end", children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(ClearIcon, {}), onClick: () => resetForm(), disabled: isSubmitting, children: "Reset" }), _jsx(Button, { type: "submit", variant: "contained", startIcon: isSubmitting ? (_jsx(CircularProgress, { size: 20, color: "inherit" })) : (_jsx(SaveIcon, {})), disabled: isSubmitting, sx: {
                                                        bgcolor: theme.palette.primary.main,
                                                        "&:hover": {
                                                            bgcolor: theme.palette.primary.dark,
                                                        },
                                                    }, children: isSubmitting ? "Creating..." : "Create User" })] }) })] }) })) }) })] }) }));
};
export default CreateUser;
