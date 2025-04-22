// src/api/account.ts
import { api, handleApiError } from "./user";
import toast from "react-hot-toast";
import { loadingStyles, successStyles } from "../lib/constants";
// Create Forex Account
export const createAccount = async (data) => {
    try {
        toast.loading("Creating account...", loadingStyles);
        const res = await api.post("/account/create", data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to create account");
    }
};
// Update Forex Account
export const updateAccount = async (id, data) => {
    try {
        toast.loading("Updating account...", loadingStyles);
        const res = await api.put(`/account/update/${id}`, data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to update account");
    }
};
// Delete Forex Account
export const deleteAccount = async (id) => {
    try {
        toast.loading("Deleting account...", loadingStyles);
        const res = await api.delete(`/account/delete/${id}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res.data;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to delete account");
    }
};
// Get All Forex Accounts
export const getAllAccounts = async () => {
    try {
        const res = await api.get("/account/all");
        return res.data;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch accounts");
        return [];
    }
};
// Get Single Forex Account
export const getSingleAccount = async (id) => {
    try {
        const res = await api.get(`/account/single/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch account details");
        return null;
    }
};
// Verify Account Ownership (Optional)
export const verifyAccountOwnership = async (accountId) => {
    try {
        const res = await api.post("/account/verify-ownership", {
            accountId,
        });
        return res.data;
    }
    catch (error) {
        handleApiError(error, "Ownership verification failed");
        return null;
    }
};
