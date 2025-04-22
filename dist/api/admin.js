/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { api, handleApiError } from "./user";
import { loadingStyles, successStyles } from "../lib/constants";
export const createUser = async (data) => {
    try {
        toast.loading("Creating User", loadingStyles);
        const res = await api.post("/admin/create-user", data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const getAllUsers = async (query) => {
    try {
        const res = await api.get(`/admin/user/all?${query}`);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
// Function for Delete Users
export const deleteUser = async (id) => {
    try {
        toast.loading("Deleting User", loadingStyles);
        const res = await api.delete(`/admin/user/${id}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const getActivityLogs = async () => {
    try {
        const res = await api.get("/activity");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
