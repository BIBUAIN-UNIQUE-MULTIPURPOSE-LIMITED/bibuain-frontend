import { loadingStyles, successStyles } from "../lib/constants";
import { api, handleApiError } from "./user";
import toast from "react-hot-toast";
import { ResInterface } from "../lib/interface";

export const createEscalatedTrade = async ({
  tradeId,
  complaint,
  escalatedById,
  assignedPayerId,
}: {
  tradeId: string;
  complaint: string;
  escalatedById: string;
  assignedPayerId: string;
}) => {
  try {
    const response = await api.post(
      `/escalated-trades/escalate/${tradeId}/${escalatedById}/${assignedPayerId}`,
      { complaint },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error escalating trade:", error);
    throw error;
  }
};


export const getAllEscalatedTrades = async (status?: string) => {
  try {
    const params = status ? { status } : {};
    const res: ResInterface = await api.get("/escalated-trades/all", {
      params,
    });
    return res;
  } catch (error) {
    handleApiError(error, "Failed to fetch escalated trades.");
  }
};

export const getEscalatedTradeById = async (id: string) => {
  try {
    const res: ResInterface = await api.get(`/escalated-trades/${id}`);
    return res;
  } catch (error) {
    handleApiError(error, "Failed to fetch trade details.");
  }
};

export const updateEscalatedTrade = async (id: string, updateData: unknown) => {
  try {
    toast.loading("Updating Trade...", loadingStyles);
    const res: ResInterface = await api.put(
      `/escalated-trades/${id}`,
      updateData
    );
    toast.dismiss();
    toast.success(res.message, successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error, "Failed to update the trade.");
  }
};

export const deleteEscalatedTrade = async (id: string) => {
  try {
    toast.loading("Deleting Trade...", loadingStyles);
    const res: ResInterface = await api.delete(`/escalated-trades/${id}`);
    toast.dismiss();
    toast.success(res.message, successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error, "Failed to delete the trade.");
  }
};
