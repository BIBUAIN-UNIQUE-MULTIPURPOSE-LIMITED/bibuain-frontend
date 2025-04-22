/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL, errorStyles, loadingStyles, successStyles, } from "../lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 100000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});
api.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    if (error.response) {
        console.error("Response error: ", error.response.data);
        if (error.response.status === 401) {
            window.location.href = "/login";
        }
    }
    else if (error.request) {
        console.error("No response received: ", error.request);
    }
    else {
        console.error("Error: ", error.message);
    }
    return Promise.reject(error);
});
export const handleApiError = (error, defaultMessage) => {
    if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.message || error.message, errorStyles);
    }
    else if (error instanceof Error) {
        console.error(error.message, errorStyles);
    }
    else {
        console.error(defaultMessage || "Unexpected Error", errorStyles);
    }
    console.error(error);
};
export const logout = async () => {
    try {
        const res = await api.get("/user/logout");
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const editUserDetails = async (data) => {
    try {
        toast.loading("Saving User...", loadingStyles);
        const formData = new FormData();
        if (data.avatarFile) {
            formData.append("file", data.avatarFile);
        }
        formData.append("fullName", data.fullName);
        const res = await api.put("/user/update", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const getAllUsers = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/user?${queryString}`);
        return response.data;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
        throw error;
    }
};
export const changePassword = async (data) => {
    try {
        toast.loading("Saving new password...", loadingStyles);
        const res = await api.put("/user/change-password", data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const getSingleUser = async (id) => {
    try {
        const res = await api.get(`/admin/user/single/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const verifyEmail = async (values) => {
    try {
        toast.loading("Verifying Account...", loadingStyles);
        const res = await api.post("/user/verify-email", values);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const verify2fa = async ({ twoFaCode, email, }) => {
    try {
        toast.loading("Verifying 2FA...", loadingStyles);
        const res = await api.post("/user/verify-2fa", {
            twoFaCode,
            email,
        });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const forgetPassword = async (email) => {
    try {
        toast.loading("Sending reset link...", loadingStyles);
        const res = await api.post("/user/forget-password", {
            email,
        });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to send reset link.");
    }
};
export const resetPassword = async (data) => {
    try {
        toast.loading("Resetting password...", loadingStyles);
        const res = await api.post("/user/reset-password", data);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to reset password.");
    }
};
export const getAllNotifications = async () => {
    try {
        const res = await api.get("/notification/all");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const markAllNotificationsAsCompleted = async () => {
    try {
        const res = await api.get("/notification/read");
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to mark notifications as completed.");
    }
};
export const deleteNotificationById = async (notificationId) => {
    try {
        const res = await api.delete(`/notification/${notificationId}`);
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const createNotification = async (data) => {
    try {
        const res = await api.post("/notification", data);
        toast.success("Notification sent", successStyles);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to create notification");
        throw error;
    }
};
