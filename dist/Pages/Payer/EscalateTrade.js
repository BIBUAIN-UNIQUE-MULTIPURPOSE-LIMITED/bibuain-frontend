import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, TextField, Box, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { Formik, Form } from "formik";
import { escalateTrade } from "../../api/trade";
import toast from "react-hot-toast";
const EscalateTrade = ({ open, onClose, onSuccess, escalateData, }) => {
    const [loading, setLoading] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const escalationReasons = [
        { value: "bank not going", label: "Bank Not Going" },
        { value: "account not complete", label: "Account not complete" },
        { value: "account namenot_correlated", label: "Account Name not Correlated" },
        { value: "other", label: "Other (please specify)" },
    ];
    const handleSubmit = async (values) => {
        if (!selectedReason)
            return;
        setLoading(true);
        try {
            const payload = {
                reason: selectedReason === "other" ? values.additionalDetails || "" : selectedReason,
                escalatedById: escalateData.escalatedById,
                assignedPayerId: escalateData.assignedPayerId
            };
            console.log("Sending payload:", payload); // Debug log
            const response = await escalateTrade(escalateData.tradeId, payload);
            if (response?.success) {
                // Show toast after successful API call
                toast.success("Trade escalated successfully");
                onSuccess();
                onClose();
            }
            else {
                toast.error(response?.message || "Failed to escalate trade");
            }
        }
        catch (error) {
            console.error("Escalation error:", error);
            toast.error(error.response?.data?.message ||
                error.message ||
                "Error escalating trade");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Escalate Trade" }), _jsx(Formik, { initialValues: {
                    additionalDetails: "",
                }, onSubmit: handleSubmit, children: ({ values, handleChange, handleBlur, touched }) => (_jsxs(Form, { children: [_jsx(DialogContent, { children: _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 3 }, children: loading ? (_jsx(CircularProgress, { sx: { display: "block", margin: "auto", my: 3 } })) : (_jsxs(_Fragment, { children: [_jsxs(FormControl, { fullWidth: true, sx: { mb: 3 }, required: true, children: [_jsx(InputLabel, { children: "Escalation Reason *" }), _jsxs(Select, { value: selectedReason, onChange: (e) => setSelectedReason(e.target.value), label: "Escalation Reason *", required: true, children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "Select a reason" }) }), escalationReasons.map((reason) => (_jsx(MenuItem, { value: reason.value, children: reason.label }, reason.value)))] })] }), selectedReason === "other" && (_jsx(TextField, { fullWidth: true, multiline: true, rows: 4, label: "Additional Details *", name: "additionalDetails", value: values.additionalDetails, onChange: handleChange, onBlur: handleBlur, error: touched.additionalDetails && !values.additionalDetails, helperText: touched.additionalDetails && !values.additionalDetails ? "Please provide details" : "", placeholder: "Please provide detailed explanation...", disabled: loading, inputProps: { maxLength: 500 }, required: true }))] })) }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: onClose, disabled: loading, color: "inherit", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "contained", disabled: loading || !selectedReason || (selectedReason === "other" && !values.additionalDetails), color: "primary", children: loading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 24, sx: { color: 'white', mr: 1 } }), "Escalating..."] })) : "Escalate Trade" })] })] })) })] }));
};
export default EscalateTrade;
