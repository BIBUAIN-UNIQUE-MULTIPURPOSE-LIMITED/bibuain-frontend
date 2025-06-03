import { api } from "./user";
import { ResInterface } from "../lib/interface";
import toast from "react-hot-toast";
import { handleApiError } from "./user";
import { loadingStyles, successStyles } from "../lib/constants";

// Function to add a new bank
export const addBank = async (data: unknown) => {
  try {
    toast.loading("Adding Bank...", loadingStyles);
    const res: ResInterface = await api.post("/banks/add", data);
    toast.dismiss();
    toast.success(res.message, successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error);
  }
};

export const getUsedBanks = async (): Promise<ResInterface> => {
  try {
    const res: ResInterface = await api.get("/banks/used");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get all banks (Admin/Rater)
export const getAllBanks = async () => {
  try {
    const res: ResInterface = await api.get("/banks");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get free (unfunded) banks (Admin/Rater)
export const getFreeBanks = async () => {
  try {
    const res: ResInterface = await api.get("/banks/free");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to get funded banks (Admin/Rater/Payer)
export const getFundedBanks = async () => {
  try {
    const res: ResInterface = await api.get("/banks/funded");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


// Function to get rollover banks (Admin/Rater)
export const getRolloverBanks = async () => {
  try {
    const res: ResInterface = await api.get("/banks/rollover");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


// Function to get a single bank by ID (Admin/Rater)
export const getSingleBank = async (id: string) => {
  try {
    const res: ResInterface = await api.get(`/banks/single/${id}`);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Function to update a bank's details (Admin/Rater)
export const updateBank = async (id: string, data: unknown) => {
  try {
    toast.loading("Updating Bank...", loadingStyles);
    const res: ResInterface = await api.put(`/banks/${id}`, data);
    toast.dismiss();
    toast.success(res.message, successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error);
  }
};

// Function to delete a bank (Admin/Rater)
export const deleteBank = async (id: string) => {
  try {
    toast.loading("Deleting Bank...", loadingStyles);
    const res: ResInterface = await api.delete(`/banks/${id}`);
    toast.dismiss();
    toast.success(res.message, successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error);
  }
};

// Function to use (spend) a bank (Payer)
export const useBank = async (id: string, payload: { amountUsed: number; shiftId: string }) => {
  try {
    toast.loading("Processing Transaction...", loadingStyles);
    const res: ResInterface = await api.post(`/banks/use/${id}`, payload);
    toast.dismiss();
    toast.success("Bank updated successfully", successStyles);
    return res;
  } catch (error) {
    toast.dismiss();
    handleApiError(error);
  }
};

// Function to refresh banks (Admin cron)
export const refreshBanks = async () => {
  try {
    const res: ResInterface = await api.post("/banks/refresh");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};