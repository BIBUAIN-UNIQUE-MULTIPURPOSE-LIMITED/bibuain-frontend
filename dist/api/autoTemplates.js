import { api, handleApiError } from "./user";
import { toast } from "react-hot-toast";
import { loadingStyles, successStyles } from "../lib/constants";
// Create new message template
export const createTemplate = async (data) => {
    try {
        toast.loading("Creating template...", loadingStyles);
        const res = await api.post("/message-templates", data);
        console.log(res);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to create template");
    }
};
// Update existing message template
export const updateTemplate = async (id, data) => {
    try {
        toast.loading("Updating template...", loadingStyles);
        const res = await api.put(`/message-templates/${id}`, data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to update template");
    }
};
// Delete message template
export const deleteTemplate = async (id) => {
    try {
        toast.loading("Deleting template...", loadingStyles);
        const res = await api.delete(`/message-templates/${id}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to delete template");
    }
};
// Get single message template
export const getSingleTemplate = async (id) => {
    try {
        const res = await api.get(`/message-templates/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch template");
    }
};
//Get All Template Messages
export const getAllTemplates = async (filters) => {
    try {
        let url = "/message-templates";
        if (filters) {
            const queryParams = new URLSearchParams();
            if (filters.type) {
                queryParams.append("type", filters.type);
            }
            if (filters.platform) {
                queryParams.append("platform", filters.platform);
            }
            if (filters.isActive !== undefined && filters.isActive !== "") {
                // Convert string 'true'/'false' to boolean if needed
                const isActive = filters.isActive === "true" ? true : false;
                queryParams.append("isActive", isActive.toString());
            }
            if (filters.tags?.length) {
                filters.tags.forEach((tag) => queryParams.append("tags", tag));
            }
            if (filters.search) {
                queryParams.append("search", filters.search);
            }
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }
        }
        const res = await api.get(url);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch templates");
    }
};
// Toggle template active status
export const toggleTemplateStatus = async (id, isActive) => {
    try {
        toast.loading("Updating template status...", loadingStyles);
        const res = await api.put(`/message-templates/${id}`, {
            isActive,
        });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to update template status");
    }
};
// Update template display order
export const updateTemplateOrder = async (id, displayOrder) => {
    try {
        toast.loading("Updating template order...", loadingStyles);
        const res = await api.put(`/message-templates/${id}`, {
            displayOrder,
        });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to update template order");
    }
};
