import { api, handleApiError } from "./user";
import toast from "react-hot-toast";
import { loadingStyles, successStyles } from "../lib/constants";
/**
 * Creates a new chat between two participants
 * @param participants Array containing exactly two participant IDs
 * @returns Response with the created chat data
 */
export const createChat = async (participants) => {
    try {
        toast.loading("Creating chat...", loadingStyles);
        const res = await api.post("/chat/create", { participants });
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to create chat");
    }
};
/**
 * Retrieves all chats for the current user
 * @returns Response with an array of chat data
 */
export const getAllChats = async () => {
    try {
        const res = await api.get("/chat/all");
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch chats");
    }
};
/**
 * Gets a single chat by ID including messages and participants
 * @param id The chat ID to retrieve
 * @returns Response with the chat data including messages
 */
export const getSingleChat = async (id) => {
    try {
        const res = await api.get(`/chat/${id}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch chat details");
    }
};
/**
 * Creates a new message in a chat
 * @param content FormData containing message content and optional file attachment
 * @param chatId The ID of the chat to send the message to
 * @returns Response with the created message data
 */
export const createMessage = async (content, chatId) => {
    try {
        content.append("chatId", chatId);
        const res = await api.post("/message/create", content, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to send message");
    }
};
/**
 * Deletes a chat and all its messages
 * @param chatId The ID of the chat to delete
 * @returns Response confirming the deletion
 */
export const deleteChat = async (chatId) => {
    try {
        toast.loading("Deleting chat...", loadingStyles);
        const res = await api.delete(`/chat/${chatId}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to delete chat");
    }
};
/**
 * Mark a message as seen by the current user
 * @param messageId The ID of the message to mark as seen
 * @returns Response confirming the message was marked as seen
 */
export const markMessageAsSeen = async (messageId) => {
    try {
        const res = await api.patch(`/message/seen/${messageId}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to mark message as read");
    }
};
/**
 * Gets all messages for a specific chat
 * @param chatId The ID of the chat to get messages for
 * @returns Response with an array of messages
 */
export const getChatMessages = async (chatId) => {
    try {
        const res = await api.get(`/message/chat/${chatId}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch messages");
    }
};
/**
 * Gets all unseen messages for a specific chat
 * @param chatId The ID of the chat to get unseen messages for
 * @returns Response with an array of unseen messages
 */
export const getUnseenMessages = async (chatId) => {
    try {
        const res = await api.get(`/message/unseen/${chatId}`);
        return res;
    }
    catch (error) {
        handleApiError(error, "Failed to fetch unseen messages");
    }
};
/**
 * Deletes a specific message
 * @param messageId The ID of the message to delete
 * @returns Response confirming the deletion
 */
export const deleteMessage = async (messageId) => {
    try {
        toast.loading("Deleting message...", loadingStyles);
        const res = await api.delete(`/message/${messageId}`);
        toast.dismiss();
        toast.success(res.message, successStyles);
        return res;
    }
    catch (error) {
        toast.dismiss();
        handleApiError(error, "Failed to delete message");
    }
};
