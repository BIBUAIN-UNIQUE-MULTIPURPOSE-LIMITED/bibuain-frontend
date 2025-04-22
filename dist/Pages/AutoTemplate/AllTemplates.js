import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Button, Typography, Chip, TextField, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, } from "@mui/icons-material";
import { getAllTemplates, deleteTemplate, toggleTemplateStatus, } from "../../api/autoTemplates";
const AllTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        type: "",
        platform: "",
        isActive: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await getAllTemplates({
                ...filters,
                search: searchTerm || undefined,
            });
            if (response?.success) {
                setTemplates(response.data);
                setTotalCount(response.data.length);
            }
        }
        catch (error) {
            console.error("Failed to fetch templates:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTemplates();
    }, [filters, searchTerm]);
    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        try {
            if (templateToDelete) {
                await deleteTemplate(templateToDelete.id);
                fetchTemplates();
            }
        }
        catch (error) {
            console.error("Failed to delete template:", error);
        }
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
    };
    const handleStatusToggle = async (template) => {
        try {
            await toggleTemplateStatus(template.id, !template.isActive);
            fetchTemplates();
        }
        catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };
    const getStatusColor = (isActive) => isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    return (_jsxs("div", { className: "p-6 max-w-[1400px] mx-auto font-primary", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx(Typography, { variant: "h5", className: "text-foreground font-bold", children: "Message Templates" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => navigate("/admin/message-templates/create"), className: "bg-button hover:bg-primary2 text-foreground", children: "Create Template" })] }), _jsx(Paper, { elevation: 0, className: "p-4 mb-6 bg-background", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(TextField, { fullWidth: true, size: "small", placeholder: "Search templates...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                startAdornment: _jsx(SearchIcon, { className: "mr-2 text-text2" }),
                            }, className: "bg-background" }), _jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { children: "Type" }), _jsxs(Select, { value: filters.type, label: "Type", onChange: (e) => setFilters({ ...filters, type: e.target.value }), className: "bg-background", children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "welcome", children: "Welcome" }), _jsx(MenuItem, { value: "payment_made", children: "Payment Made" }), _jsx(MenuItem, { value: "coin_release", children: "Coin Release" })] })] }), _jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { children: "Platform" }), _jsxs(Select, { value: filters.platform, label: "Platform", onChange: (e) => setFilters({ ...filters, platform: e.target.value }), className: "bg-background", children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "paxful", children: "Paxful" }), _jsx(MenuItem, { value: "noones", children: "Noones" })] })] }), _jsxs(FormControl, { size: "small", fullWidth: true, children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: filters.isActive, label: "Status", onChange: (e) => setFilters({ ...filters, isActive: e.target.value }), className: "bg-background", children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "true", children: "Active" }), _jsx(MenuItem, { value: "false", children: "Inactive" })] })] })] }) }), _jsxs(Paper, { elevation: 0, className: "bg-background", children: [_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-semibold text-foreground", children: "Type" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Platform" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Content" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Variables" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Status" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Tags" }), _jsx(TableCell, { className: "font-semibold text-foreground", children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", className: "py-8", children: _jsx(CircularProgress, { className: "text-button" }) }) })) : templates.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", className: "py-8 text-text2", children: "No templates found" }) })) : (templates
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((template) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { className: "text-foreground", children: template.type }), _jsx(TableCell, { className: "text-foreground", children: template.platform }), _jsx(TableCell, { className: "text-foreground max-w-md", children: _jsx(Typography, { noWrap: true, children: template.content }) }), _jsx(TableCell, { className: "text-foreground", children: template.availableVariables?.length || 0 }), _jsx(TableCell, { children: _jsx(Chip, { label: template.isActive ? "Active" : "Inactive", className: `${getStatusColor(template.isActive)}` }) }), _jsx(TableCell, { children: _jsx("div", { className: "flex flex-wrap gap-1", children: template.tags?.map((tag, index) => (_jsx(Chip, { label: tag, size: "small", className: "bg-button text-foreground text-xs" }, index))) }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Tooltip, { title: "Edit", children: _jsx(IconButton, { onClick: () => navigate(`/message-templates/edit/${template.id}`), className: "text-button hover:text-primary2", children: _jsx(EditIcon, {}) }) }), _jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { onClick: () => handleDeleteClick(template), className: "text-destructive hover:text-red-700", children: _jsx(DeleteIcon, {}) }) })] }) })] }, template.id)))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: totalCount, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage, className: "border-t border-border" })] }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [_jsx(DialogTitle, { className: "text-foreground", children: "Confirm Delete" }), _jsx(DialogContent, { children: _jsx(Typography, { className: "text-foreground", children: "Are you sure you want to delete this template?" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), className: "text-text2", children: "Cancel" }), _jsx(Button, { onClick: handleDeleteConfirm, className: "text-destructive", autoFocus: true, children: "Delete" })] })] })] }));
};
export default AllTemplates;
