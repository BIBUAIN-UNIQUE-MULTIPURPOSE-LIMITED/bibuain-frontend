import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Card, CardContent, Typography, Tabs, Tab, Avatar, Button, TextField, Grid, Stack, Alert, Divider, useTheme, alpha, Switch, FormControlLabel, } from "@mui/material";
import { Person as PersonIcon, PhotoCamera as PhotoCameraIcon, Save as SaveIcon, Security as SecurityIcon, Email as EmailIcon, Phone as PhoneIcon, Lock as LockIcon, Key as KeyIcon, } from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUserContext } from "../../Components/ContextProvider";
import { changePassword, editUserDetails } from "../../api/user";
import toast from "react-hot-toast";
const TabPanel = ({ children, value, index }) => (_jsx("div", { role: "tabpanel", hidden: value !== index, children: value === index && _jsx(Box, { sx: { py: 3 }, children: children }) }));
const generalSettingsSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    language: Yup.string().required("Language is required"),
});
const securitySettingsSchema = Yup.object({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .required("New password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
});
const Settings = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = React.useState(0);
    const { user, setUser } = useUserContext();
    const [avatarFile, setAvatarFile] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const handleTabChange = (_event, newValue) => {
        setTabValue(newValue);
    };
    const handleAvatarChange = (event) => {
        if (event.target.files?.[0]) {
            setAvatarFile(event.target.files[0]);
        }
    };
    return (_jsx(Box, { sx: { maxWidth: "lg", mx: "auto", p: { xs: 2, sm: 3 } }, children: _jsxs(Card, { sx: {
                boxShadow: theme.shadows[3],
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                    boxShadow: theme.shadows[6],
                },
            }, children: [_jsx(Box, { sx: { borderBottom: 1, borderColor: "divider" }, children: _jsxs(Tabs, { value: tabValue, onChange: handleTabChange, "aria-label": "settings tabs", sx: {
                            px: 2,
                            "& .MuiTab-root": {
                                textTransform: "none",
                                minHeight: 64,
                                fontSize: "1rem",
                            },
                        }, children: [_jsx(Tab, { icon: _jsx(PersonIcon, {}), iconPosition: "start", label: "General Settings", sx: { px: 3 } }), _jsx(Tab, { icon: _jsx(SecurityIcon, {}), iconPosition: "start", label: "Security", sx: { px: 3 } })] }) }), _jsx(TabPanel, { value: tabValue, index: 0, children: _jsx(CardContent, { children: _jsx(Formik, { initialValues: {
                                fullName: user?.fullName,
                                email: user?.email,
                                phone: user?.phone,
                                language: "English",
                                emailNotifications: true,
                            }, validationSchema: generalSettingsSchema, onSubmit: async (values) => {
                                const data = await editUserDetails({ ...values, avatarFile });
                                if (data?.success) {
                                    setUser(data.data);
                                }
                            }, children: ({ values, errors, touched, handleChange, handleBlur }) => (_jsx(Form, { className: "px-[2rem]", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(Stack, { direction: "column", alignItems: "center", spacing: 2, sx: { mb: 4 }, children: [_jsx(Avatar, { sx: {
                                                            width: 150,
                                                            height: 150,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main,
                                                        }, src: avatarFile
                                                            ? URL.createObjectURL(avatarFile)
                                                            : user?.avatar, children: !avatarFile && _jsx(PersonIcon, { sx: { fontSize: 100 } }) }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleAvatarChange, accept: "image/*", style: { display: "none" } }), _jsx(Button, { variant: "outlined", startIcon: _jsx(PhotoCameraIcon, {}), onClick: () => fileInputRef.current?.click(), children: "Change Avatar" })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "fullName", label: "Full Name", value: values.fullName, onChange: handleChange, onBlur: handleBlur, error: touched.fullName && Boolean(errors.fullName), helperText: touched.fullName && errors.fullName, InputProps: {
                                                    startAdornment: (_jsx(PersonIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "email", disabled: true, label: "Email Address", value: values.email, onChange: handleChange, onBlur: handleBlur, error: touched.email && Boolean(errors.email), helperText: touched.email && errors.email, InputProps: {
                                                    startAdornment: (_jsx(EmailIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(TextField, { fullWidth: true, name: "phone", label: "Phone Number", value: values.phone, disabled: true, onChange: handleChange, onBlur: handleBlur, error: touched.phone && Boolean(errors.phone), helperText: touched.phone && errors.phone, InputProps: {
                                                    startAdornment: (_jsx(PhoneIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Notifications" }), _jsx(FormControlLabel, { control: _jsx(Switch, { name: "emailNotifications", checked: values.emailNotifications, onChange: handleChange }), label: "Email Notifications" })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { type: "submit", variant: "contained", startIcon: _jsx(SaveIcon, {}), sx: { mt: 2 }, children: "Save Changes" }) })] }) })) }) }) }), _jsx(TabPanel, { value: tabValue, index: 1, children: _jsx(CardContent, { className: "w-full flex justify-center items-center", children: _jsx(Formik, { initialValues: {
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                            }, validationSchema: securitySettingsSchema, onSubmit: async (values, { resetForm }) => {
                                if (values.newPassword !== values.confirmPassword) {
                                    toast.error("New password's don't match");
                                    return;
                                }
                                const data = await changePassword(values);
                                if (data?.success) {
                                    resetForm();
                                }
                            }, children: ({ values, errors, touched, handleChange, handleBlur }) => (_jsx(Form, { className: "max-w-[30vw]", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "Ensure your new password is strong and unique. Use a mix of letters, numbers, and symbols." }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "password", name: "currentPassword", label: "Current Password", value: values.currentPassword, onChange: handleChange, onBlur: handleBlur, error: touched.currentPassword &&
                                                    Boolean(errors.currentPassword), helperText: touched.currentPassword && errors.currentPassword, InputProps: {
                                                    startAdornment: (_jsx(LockIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "password", name: "newPassword", label: "New Password", value: values.newPassword, onChange: handleChange, onBlur: handleBlur, error: touched.newPassword && Boolean(errors.newPassword), helperText: touched.newPassword && errors.newPassword, InputProps: {
                                                    startAdornment: (_jsx(KeyIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "password", name: "confirmPassword", label: "Confirm New Password", value: values.confirmPassword, onChange: handleChange, onBlur: handleBlur, error: touched.confirmPassword &&
                                                    Boolean(errors.confirmPassword), helperText: touched.confirmPassword && errors.confirmPassword, InputProps: {
                                                    startAdornment: (_jsx(KeyIcon, { color: "action", sx: { mr: 1 } })),
                                                } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { type: "submit", variant: "contained", color: "primary", startIcon: _jsx(SaveIcon, {}), children: "Update Password" }) })] }) })) }) }) })] }) }));
};
export default Settings;
