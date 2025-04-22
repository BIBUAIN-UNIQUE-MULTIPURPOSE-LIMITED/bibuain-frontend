import toast from "react-hot-toast";
import { ResInterface } from "../lib/interface";
import { api, handleApiError } from "./user";
import { successStyles } from "../lib/constants";

interface OfferUpdatePayload {
  account_username: string;
  platform: string;
  costprice: number;
  usdtrate: number;
}



export const getCurrentRates = async () => {
  try {
    const res: ResInterface = await api.get("/trade/currency/rates");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAccountRates = async (payload: {
  platformRates: Record<string, { costPrice: number; markup1: number; markup2: number }>;
}) => {
  try {
    const res: ResInterface = await api.post("/trade/update-account-rates", payload);
    console.log("API Response from updateAccountRates:", res);
    return res;
  } catch (error) {
    console.error("Error in updateAccountRates:", error);
    handleApiError(error);
  }
};


export const getAccounts = async () => {
  try {
    const res: ResInterface = await api.get("/trade/accounts");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Trade Endpoints
export const getLiveTrades = async () => {
  try {
    const res: ResInterface = await api.get("/trade/live-trades");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const assignLiveTrades = async () => {
  try {
    const res: ResInterface = await api.post("/trade/assign-live-trade");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPayerTrade = async (id: string) => {
  try {
    const res: ResInterface = await api.get(`/trade/payer/assignedTrade/${id}`);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTradeDetails = async (
  platform: string,
  tradeHash: string,
  accountId: string
) => {
  try {
    const res: ResInterface = await api.get(
      `/trade/payer/trade/info/${platform}/${tradeHash}/${accountId}`
    );
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Send a trade chat message.
 * Updated to match backend: route is POST /trade/message/:tradeId with { content } in the body.
 */
export const sendTradeMessage = async (tradeId: string, message: string) => {
  const response = await api.post(`/trade/${tradeId}/chat-message`, {
    content: message
  });
  return response.data;
};

export const markTradeAsPaid = async (
  tradeId: string
) => {
  try {
    const res: ResInterface = await api.post(`/trade/mark-paid/${tradeId}`);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getDashboardStats = async () => {
  try {
    const res: ResInterface = await api.get("/trade/dashboard");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getFeedbackStats = async (params: { username: string; platform: string }) => {
  try {
    const res: ResInterface = await api.get("/trade/feedback-stats", { params });
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


export const getCompletedTrades = async (params: {
  page?: number;
  limit?: number;
  payerId?: string;
  search?: string;
  dateRange?: string;
})=> {
  try {
    const res: ResInterface = await api.get("/trade/completed", { params });
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


export const getCompletedPayerTrades = async (params: {
  page?: number;
  limit?: number;
  payerId?: string;
  search?: string;
  dateRange?: string;
})=> {
  try {
    const res: ResInterface = await api.get("/trade/payer-trade", { params });
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Wallet and Offers Endpoints
export const getWalletBalances = async () => {
  try {
    const res: ResInterface = await api.get("/trade/wallet-balances");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getOffersMargin = async () => {
  try {
    const res: ResInterface = await api.get("/trade/offers");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


export const updateOffers = async (payload: OfferUpdatePayload) => {
  try {
    const response = await api.post('/trade/offers/update', payload);
    return response
  } catch (error) {
    console.error('Error updating offers:', error);
    throw error;
  }
};

export const turnOnAllOffers = async () => {
  try {
    const res: ResInterface = await api.get("/trade/offers/turn-on");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const turnOffAllOffers = async () => {
  try {
    const res: ResInterface = await api.get("/trade/offers/turn-off");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const reAssignTrade = async (tradeId: string) => {
  try {
    const res: ResInterface = await api.post(
      `/trade/reassign-trade/${tradeId}`);
    return res;
  } catch (error) {
    handleApiError(error);
    throw error; 
  }
};

export const getAllTrades = async (page?: number, limit?: number) => {
  try {
    const res: ResInterface = await api.get("/trade/all-trades", {
      params: { page, limit },
    });
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getUnfinishedTrades = async (page?: number, limit?: number) => {
  try {
    const res: ResInterface = await api.get("/trade/unfinished-trades", {
      params: { page, limit },
    });
    return res;
  } catch (error) {
    handleApiError(error);
  }
};


export const getCapRates = async (): Promise<ResInterface | void> => {
  try {
    const res: ResInterface = await api.get("/trade/cap-btn/ngn");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCapRates = async (payload: {
  marketCap?: number;
  btcngnrate?: number;
}): Promise<ResInterface | void> => {
  try {
    const res: ResInterface = await api.post("/trade/cap-btc/ngn", payload);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getRaterRates = async () => {
  try {
    const res: ResInterface = await api.get("/trade/get-rates");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const setRaterRates = async (payload: {
  sellingPrice: number;
  usdtNgnRate: number;
  platformRates: Record<string, { costPrice: number; markup1: number; markup2: number }>;
}) => {
  try {
    const res: ResInterface = await api.post("/trade/set-rates", payload);
    console.log("API Response from setRaterRates:", res);
    return res;
  } catch (error) {
    console.error("Error in setRaterRates:", error);
    handleApiError(error);
  }
};

export const getVendorCoin = async () => {
  try {
    const res: ResInterface = await api.get("/trade/vendor-coin");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

// Add to your trade API service (api/trade.ts)
export const escalateTrade = async (
  tradeId: string,
  payload: {
    reason: string;
    escalatedById: string;
    assignedPayerId: string;
  }
) => {
  try {
    const res: ResInterface = await api.post(`/trade/${tradeId}/escalate`, payload);
    toast.success(res.message || "Trade escalated successfully", successStyles);
    return res;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getEscalatedTrades = async () => {
  try {
    const res: ResInterface = await api.get("/trade/escalated");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getEscalatedTradeById = async (id: string) => {
  try {
    const res: ResInterface = await api.get(`/trade/escalated-trades/${id}`);
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

export const getngnPlatformRate = async () => {
  try {
    const res: ResInterface = await api.get('/trade/get-ngnrates');
    return res;
  } catch(error) {
    handleApiError (error)
  }
};

export const cancelTradeRequest = async (tradeId: string) => {
  try {
    const res = await api.post(`/trade/${tradeId}/cancel`);
    return res;
  } catch (error) {
    return handleApiError(error);
  }
};

export const activateDeactivatedOffers = async () => {
  try {
    const res: ResInterface = await api.post('/trade/activate-deactivated');
    toast.success(res.message || "Deactivated offers reactivated", successStyles);
    return res;
  } catch (error) {
    console.error("Error in activateDeactivatedOffers:", error);
    handleApiError(error);
  }
};

export const getCCstats = async () => {
  try {
    const res: ResInterface = await api.get("/trade/ccstat");
    return res;
  } catch (error) {
    handleApiError(error);
  }
};

