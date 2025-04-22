// shiftApi.ts
import { api, handleApiError } from "./user";
import toast from "react-hot-toast";
import { loadingStyles, successStyles } from "../lib/constants";
export const clockIn = async () => {
    try {
        toast.loading("Clocking in...", loadingStyles);
        const res = await api.post("/shift/clock-in");
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const clockOut = async () => {
    try {
        toast.loading("Clocking out...", loadingStyles);
        const res = await api.post("/shift/clock-out");
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const startBreak = async () => {
    try {
        toast.loading("Starting break...", loadingStyles);
        const res = await api.post("/shift/break/start");
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const endBreak = async () => {
    try {
        toast.loading("Ending break...", loadingStyles);
        const res = await api.post("/shift/break/end");
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error);
    }
};
export const getShiftMetrics = async (userId, startDate, endDate) => {
    try {
        const res = await api.get(`/shift/metrics/${userId}`, {
            params: { startDate, endDate },
        });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getCurrentShift = async () => {
    try {
        const res = await api.get("/shift/current-shift");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
