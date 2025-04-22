import { loadingStyles, successStyles } from "../lib/constants";
import { api, handleApiError } from "./user";
import toast from "react-hot-toast";
export const createEscalatedTrade = async ({ tradeId, complaint, escalatedById, assignedPayerId, }) => {
    try {
        const response = await api.post(`/escalated-trades/escalate/${tradeId}/${escalatedById}/${assignedPayerId}`, { complaint }, { withCredentials: true });
        return response.data;
    }
    catch (error) {
        console.error("Error escalating trade:", error);
        throw error;
    }
};
export const getAllEscalatedTrades = async (status) => {
    try {
        const params = status ? { status } : {};
        const res = await api.get("/escalated-trades/all", {
            params,
        });
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch escalated trades.");
    }
};
export const getEscalatedTradeById = async (id) => {
    try {
        const res = await api.get(`/escalated-trades/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch trade details.");
    }
};
export const updateEscalatedTrade = async (id, updateData) => {
    try {
        toast.loading("Updating Trade...", loadingStyles);
        const res = await api.put(`/escalated-trades/${id}`, updateData);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to update the trade.");
    }
};
export const deleteEscalatedTrade = async (id) => {
    try {
        toast.loading("Deleting Trade...", loadingStyles);
        const res = await api.delete(`/escalated-trades/${id}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to delete the trade.");
    }
};
