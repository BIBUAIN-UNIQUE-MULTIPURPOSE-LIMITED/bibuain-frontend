import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Box, Paper, Typography, CircularProgress, } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, AccessTime as ClockIcon, LocalOffer as TagIcon, } from "@mui/icons-material";
import { createTemplate } from "../../api/autoTemplates";
const MessageTemplateForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        type: "welcome",
        platform: "paxful",
        content: "",
        availableVariables: [],
        followUpDelayMinutes: 0,
        followUpContent: [],
        isActive: true,
        displayOrder: 0,
        feedbackTemplates: [],
        tags: [],
    });
    const [showVariableModal, setShowVariableModal] = useState(false);
    const [newVariable, setNewVariable] = useState({
        name: "",
        description: "",
        defaultValue: "",
    });
    const [newTag, setNewTag] = useState("");
    const validateForm = () => {
        const errors = {};
        if (!formData.content.trim()) {
            errors.content = "Message content is required";
        }
        if (!formData.type) {
            errors.type = "Template type is required";
        }
        if (!formData.platform) {
            errors.platform = "Platform is required";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            setIsSubmitting(true);
            const templateData = {
                ...formData,
                followUpDelayMinutes: Number(formData.followUpDelayMinutes),
                displayOrder: Number(formData.displayOrder),
            };
            const response = await createTemplate(templateData);
            if (response?.success) {
                navigate("/admin/message-templates");
            }
        }
        catch (error) {
            console.error("Failed to create template:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const addVariable = () => {
        if (newVariable.name && newVariable.description) {
            setFormData({
                ...formData,
                availableVariables: [...formData.availableVariables, newVariable],
            });
            setNewVariable({ name: "", description: "", defaultValue: "" });
            setShowVariableModal(false);
        }
    };
    const addTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag],
            });
            setNewTag("");
        }
    };
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };
    return (_jsx("div", { className: "max-w-4xl mx-auto p-6 font-primary", children: _jsxs(Paper, { elevation: 0, className: "p-6 bg-background", children: [_jsx(Typography, { variant: "h5", sx: { mb: 4 }, className: "mb-6 text-foreground font-bold", children: "Create Message Template" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(FormControl, { fullWidth: true, error: !!formErrors.type, children: [_jsx(InputLabel, { children: "Template Type" }), _jsxs(Select, { value: formData.type, label: "Template Type", onChange: (e) => handleFieldChange("type", e.target.value), className: "bg-background", required: true, children: [_jsx(MenuItem, { value: "welcome", children: "Welcome" }), _jsx(MenuItem, { value: "payment_made", children: "Payment Made" }), _jsx(MenuItem, { value: "coin_release", children: "Coin Release" })] }), formErrors.type && (_jsx(Typography, { variant: "caption", color: "error", children: formErrors.type }))] }), _jsxs(FormControl, { fullWidth: true, error: !!formErrors.platform, children: [_jsx(InputLabel, { children: "Platform" }), _jsxs(Select, { value: formData.platform, label: "Platform", onChange: (e) => handleFieldChange("platform", e.target.value), className: "bg-background", required: true, children: [_jsx(MenuItem, { value: "paxful", children: "Paxful" }), _jsx(MenuItem, { value: "noones", children: "Noones" })] }), formErrors.platform && (_jsx(Typography, { variant: "caption", color: "error", children: formErrors.platform }))] })] }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 4, label: "Message Content", value: formData.content, onChange: (e) => handleFieldChange("content", e.target.value), className: "bg-background", required: true, error: !!formErrors.content, helperText: formErrors.content }), _jsxs(Box, { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Typography, { variant: "subtitle1", className: "text-foreground", children: "Available Variables" }), _jsx(Button, { startIcon: _jsx(AddIcon, {}), onClick: () => setShowVariableModal(true), className: "text-button hover:text-primary2", children: "Add Variable" })] }), _jsx("div", { className: "space-y-2", children: formData.availableVariables.map((variable, index) => (_jsxs(Paper, { className: "p-3 flex justify-between items-center bg-background", children: [_jsxs("div", { children: [_jsx(Typography, { variant: "subtitle2", className: "text-foreground", children: variable.name }), _jsx(Typography, { variant: "body2", className: "text-text2", children: variable.description })] }), _jsx(IconButton, { onClick: () => {
                                                    const updatedVariables = [...formData.availableVariables];
                                                    updatedVariables.splice(index, 1);
                                                    setFormData({
                                                        ...formData,
                                                        availableVariables: updatedVariables,
                                                    });
                                                }, className: "text-destructive", children: _jsx(RemoveIcon, {}) })] }, index))) })] }), _jsxs(Box, { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "mr-2 text-text2" }), _jsx(Typography, { variant: "subtitle1", className: "text-foreground", children: "Follow-up Delay (minutes)" })] }), _jsx(TextField, { type: "number", fullWidth: true, value: formData.followUpDelayMinutes, onChange: (e) => handleFieldChange("followUpDelayMinutes", parseInt(e.target.value)), inputProps: { min: 0 }, className: "bg-background" })] }), _jsxs(Box, { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(TagIcon, { className: "mr-2 text-text2" }), _jsx(Typography, { variant: "subtitle1", className: "text-foreground", children: "Tags" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: formData.tags.map((tag, index) => (_jsx(Chip, { label: tag, onDelete: () => {
                                            const updatedTags = formData.tags.filter((_, i) => i !== index);
                                            setFormData({ ...formData, tags: updatedTags });
                                        }, className: "bg-button text-foreground" }, index))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(TextField, { fullWidth: true, value: newTag, onChange: (e) => setNewTag(e.target.value), placeholder: "Add a tag...", className: "bg-background" }), _jsx(Button, { onClick: addTag, variant: "contained", className: "bg-button hover:bg-primary2 text-foreground", children: "Add" })] })] }), _jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: formData.isActive, onChange: (e) => handleFieldChange("isActive", e.target.checked), className: "text-button" }), label: "Active Template" }), _jsx(Box, { className: "flex justify-end", children: _jsx(Button, { type: "submit", variant: "contained", disabled: isSubmitting, className: `bg-button hover:bg-primary2 text-foreground ${isSubmitting ? "opacity-50" : ""}`, children: isSubmitting ? (_jsxs(Box, { className: "flex items-center", children: [_jsx(CircularProgress, { size: 20, className: "mr-2" }), "Saving..."] })) : ("Save Template") }) })] }), _jsxs(Dialog, { open: showVariableModal, onClose: () => setShowVariableModal(false), children: [_jsx(DialogTitle, { className: "text-foreground", children: "Add Variable" }), _jsxs(DialogContent, { className: "space-y-4", children: [_jsx(TextField, { fullWidth: true, label: "Variable Name", value: newVariable.name, onChange: (e) => setNewVariable({ ...newVariable, name: e.target.value }), className: "mt-4 bg-background" }), _jsx(TextField, { fullWidth: true, label: "Description", value: newVariable.description, onChange: (e) => setNewVariable({ ...newVariable, description: e.target.value }), className: "bg-background" }), _jsx(TextField, { fullWidth: true, label: "Default Value (Optional)", value: newVariable.defaultValue, onChange: (e) => setNewVariable({ ...newVariable, defaultValue: e.target.value }), className: "bg-background" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setShowVariableModal(false), className: "text-text2", children: "Cancel" }), _jsx(Button, { onClick: addVariable, className: "text-button hover:text-primary2", children: "Add" })] })] })] }) }));
};
export default MessageTemplateForm;
