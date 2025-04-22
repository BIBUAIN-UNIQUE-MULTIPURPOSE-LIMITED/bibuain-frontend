import toast from "react-hot-toast";
import { api, handleApiError } from "./user";
import { successStyles } from "../lib/constants";
export const getCurrentRates = async () => {
    try {
        const res = await api.get("/trade/currency/rates");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const updateAccountRates = async (payload) => {
    try {
        const res = await api.post("/trade/update-account-rates", payload);
        console.log("API Response from updateAccountRates:", res);
        return res;
    }
    catch (error) {
        console.error("Error in updateAccountRates:", error);
        handleApiError(error);
    }
};
export const getAccounts = async () => {
    try {
        const res = await api.get("/trade/accounts");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
// Trade Endpoints
export const getLiveTrades = async () => {
    try {
        const res = await api.get("/trade/live-trades");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const assignLiveTrades = async () => {
    try {
        const res = await api.post("/trade/assign-live-trade");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getPayerTrade = async (id) => {
    try {
        const res = await api.get(`/trade/payer/assignedTrade/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getTradeDetails = async (platform, tradeHash, accountId) => {
    try {
        const res = await api.get(`/trade/payer/trade/info/${platform}/${tradeHash}/${accountId}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
/**
 * Send a trade chat message.
 * Updated to match backend: route is POST /trade/message/:tradeId with { content } in the body.
 */
export const sendTradeMessage = async (tradeId, message) => {
    const response = await api.post(`/trade/${tradeId}/chat-message`, {
        content: message
    });
    return response.data;
};
export const markTradeAsPaid = async (tradeId) => {
    try {
        const res = await api.post(`/trade/mark-paid/${tradeId}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getDashboardStats = async () => {
    try {
        const res = await api.get("/trade/dashboard");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getFeedbackStats = async (params) => {
    try {
        const res = await api.get("/trade/feedback-stats", { params });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getCompletedTrades = async (params) => {
    try {
        const res = await api.get("/trade/completed", { params });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getCompletedPayerTrades = async (params) => {
    try {
        const res = await api.get("/trade/payer-trade", { params });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
// Wallet and Offers Endpoints
export const getWalletBalances = async () => {
    try {
        const res = await api.get("/trade/wallet-balances");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getOffersMargin = async () => {
    try {
        const res = await api.get("/trade/offers");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const updateOffers = async (payload) => {
    try {
        const response = await api.post('/trade/offers/update', payload);
        return response;
    }
    catch (error) {
        console.error('Error updating offers:', error);
        throw error;
    }
};
export const turnOnAllOffers = async () => {
    try {
        const res = await api.get("/trade/offers/turn-on");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const turnOffAllOffers = async () => {
    try {
        const res = await api.get("/trade/offers/turn-off");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const reAssignTrade = async (tradeId) => {
    try {
        const res = await api.post(`/trade/reassign-trade/${tradeId}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
        throw error;
    }
};
export const getAllTrades = async (page, limit) => {
    try {
        const res = await api.get("/trade/all-trades", {
            params: { page, limit },
        });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getUnfinishedTrades = async (page, limit) => {
    try {
        const res = await api.get("/trade/unfinished-trades", {
            params: { page, limit },
        });
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getCapRates = async () => {
    try {
        const res = await api.get("/trade/cap-btn/ngn");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const updateCapRates = async (payload) => {
    try {
        const res = await api.post("/trade/cap-btc/ngn", payload);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getRaterRates = async () => {
    try {
        const res = await api.get("/trade/get-rates");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const setRaterRates = async (payload) => {
    try {
        const res = await api.post("/trade/set-rates", payload);
        console.log("API Response from setRaterRates:", res);
        return res;
    }
    catch (error) {
        console.error("Error in setRaterRates:", error);
        handleApiError(error);
    }
};
export const getVendorCoin = async () => {
    try {
        const res = await api.get("/trade/vendor-coin");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
// Add to your trade API service (api/trade.ts)
export const escalateTrade = async (tradeId, payload) => {
    try {
        const res = await api.post(`/trade/${tradeId}/escalate`, payload);
        toast.success(res.message || "Trade escalated successfully", successStyles);
        return res;
    }
    catch (error) {
        handleApiError(error);
        throw error;
    }
};
export const getEscalatedTrades = async () => {
    try {
        const res = await api.get("/trade/escalated");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getEscalatedTradeById = async (id) => {
    try {
        const res = await api.get(`/trade/escalated-trades/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const getngnPlatformRate = async () => {
    try {
        const res = await api.get('/trade/get-ngnrates');
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
export const cancelTradeRequest = async (tradeId) => {
    try {
        const res = await api.post(`/trade/${tradeId}/cancel`);
        return res;
    }
    catch (error) {
        return handleApiError(error);
    }
};
export const activateDeactivatedOffers = async () => {
    try {
        const res = await api.post('/trade/activate-deactivated');
        toast.success(res.message || "Deactivated offers reactivated", successStyles);
        return res;
    }
    catch (error) {
        console.error("Error in activateDeactivatedOffers:", error);
        handleApiError(error);
    }
};
export const getCCstats = async () => {
    try {
        const res = await api.get("/trade/ccstat");
        return res;
    }
    catch (error) {
        handleApiError(error);
    }
};
