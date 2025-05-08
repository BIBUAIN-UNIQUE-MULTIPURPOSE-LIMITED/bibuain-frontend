/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Schedule,
  NotificationsActive,
  ArrowBack,
  Image,
  FileCopy,
  AttachFileOutlined,
  PictureAsPdf,
  Send,
  Sync,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getEscalatedTradeById, ApiResponse, ChatMessage } from "../../api/trade";
import { getAllUsers } from "../../api/user";
import { reAssignTrade, sendTradeMessage, cancelTradeRequest } from "../../api/trade";
import toast from "react-hot-toast";
import { errorStyles, successStyles } from "../../lib/constants";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const DEFAULT_AVATAR = "/default.png";

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  content: string | { [key: string]: any };
  sender: {
    id: string;
    fullName: string;
    avatar?: string;
    isCurrentUser?: boolean;
  };
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
}


const EscalatedDetails: React.FC = () => {
  const { tradeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [escalatedTrade, setEscalatedTrade] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [_payer, setPayer] = useState<any[]>([]);

  const [newMessage, setNewMessage] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);

  const [cancelTradeState, setCancelTradeState] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();



  const fetchTradeDetails = async () => {
    try {
      setLoading(true);
      if (!tradeId) {
        navigate("/customer-support");
        return;
      }

      const response = await getEscalatedTradeById(tradeId);
      console.log("API Response:", response);

      if (response?.success) {
        const { trade, tradeChat, externalTrade } = response.data;

        setEscalatedTrade({
          ...trade,
          externalTrade,
          amount: trade.amount,
          platform: trade.platform,
          reason: trade.reason || trade.escalationReason || trade.escalatedReason
        });

        // Process messages to add isCurrentUser flag
        const processedMessages = (tradeChat?.messages || []).map((msg: { sender: { id: string; }; }) => ({
          ...msg,
          sender: {
            ...msg.sender,
            isCurrentUser: msg.sender.id === "current-user" // Adjust this based on your auth system
          }
        }));

        setMessages(processedMessages);
        setAttachments(tradeChat?.attachments || []);
      } else {
        toast.error("Failed to fetch trade details", errorStyles);
        navigate("/customer-support");
      }
      const payerResponse = await getAllUsers({
        userType: 'payer',
        clockedIn: 'true'
      });
      console.log("Payer agents response:", payerResponse);
      if (payerResponse && Array.isArray(payerResponse)) {
        setPayer(payerResponse);
      }
    } catch (error) {
      console.error("Error fetching trade details:", error);
      toast.error("Error loading trade details", errorStyles);
      navigate("/customer-support");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeDetails();
  }, [tradeId]);


  const handleCancelTrade = async () => {
    setCancelTradeState(true);
    try {
      if (!tradeId) {
        toast.error("Trade ID is missing", errorStyles);
        return;
      }

      const res = await cancelTradeRequest(tradeId);
      console.log("Cancel trade response:", res);

      if (res) {
        toast.success("Trade cancelled successfully", successStyles);

        // Update local state to reflect the cancelled status
        setEscalatedTrade((prev: any) => ({
          ...prev,
          status: 'cancelled'
        }));

        // Navigate back to the list after a short delay
        setTimeout(() => {
          navigate("/customer-support");
        }, 2000);
      } else {
        setTimeout(() => {
          navigate("/customer-support");
        }, 2000);
      }
    } catch (error) {
      console.error("Error cancelling trade:", error);
      toast.error("An error occurred while cancelling the trade", errorStyles);
    } finally {
      setCancelTradeState(false);
    }
  };


  const formatWATDateTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }

      const absoluteTime = dateObj.toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'short',
        timeStyle: 'short'
      });

      const watDate = new Date(dateObj.getTime() + 60 * 60 * 1000);
      const relativeTime = formatDistanceToNow(watDate, {
        addSuffix: true,
        locale: enUS
      });

      return `${absoluteTime} (${relativeTime})`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleReAssign = async () => {
    if (!escalatedTrade?.id) {
      toast.error("Missing required data", errorStyles);
      return;
    }

    try {
      console.log("Reassigning trade:", {
        tradeId: escalatedTrade.id,
      });

      const response = await reAssignTrade(escalatedTrade.id);

      if (response?.success) {
        toast.success("Trade reassigned successfully", successStyles);
        fetchTradeDetails();
      } else {
        toast.error(response?.message || "Failed to reassign trade", errorStyles);
      }
    } catch (error: any) {
      console.error("Error reassigning trade:", error);
      toast.error(
        error.response?.data?.message || "Failed to reassign trade",
        errorStyles
      );
    }
  };

  const handleSendMessage = async () => {
    // 1) guard on having a trade ID & nonempty text
    if (!tradeId) return;
    const content = newMessage.trim();
    if (!content) return;
  
    // 2) optimistic‐UI: add a “sending…” bubble
    const tmpId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tmpId,
        content,
        sender: { id: "me", fullName: "You", isCurrentUser: true },
        createdAt: new Date().toISOString(),
        status: "sending"
      },
    ]);
    setNewMessage("");
  
    try {
      // 3) call API
      const res: ApiResponse<ChatMessage> = await sendTradeMessage(tradeId, content);
  
      if (res.success) {
        // 4a) mark that temp bubble as “sent”
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tmpId ? { ...msg, status: "sent" } : msg
          )
        );
        // 5) reload from server (pull in any other new messages)
        await fetchTradeDetails();
      } else {
        // 4b) mark it as “failed”
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tmpId ? { ...msg, status: "failed" } : msg
          )
        );
        toast.error(res.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // 6) remove the temp bubble entirely
      setMessages((prev) => prev.filter((msg) => msg.id !== tmpId));
      toast.error("Failed to send message");
    }
  };
  

  const handleRetryMessage = async (message: Message) => {
    if (typeof message.content !== 'string' || !tradeId) return;

    try {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, status: 'sending' } : msg
      ));

      const response = await sendTradeMessage(tradeId, message.content);

      if (response?.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'failed' } : msg
        ));
      }
    } catch (error) {
      console.error("Error retrying message:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image color="primary" />;
    if (type === "application/pdf") return <PictureAsPdf color="primary" />;
    return <FileCopy color="primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading || !escalatedTrade) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col md:flex-row h-full bg-gray-50">
      {/* Left Panel - Trade Details */}
      <Box className="w-full md:w-1/3 lg:w-1/4 flex flex-col h-full border-r border-gray-200">
        <Box className="p-4 bg-white border-b border-gray-200">
          <Box className="flex items-center gap-2">
            <IconButton onClick={() => navigate("/customer-support")}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Trade Details
            </Typography>
          </Box>
        </Box>

        <Box className="flex-1 p-4 overflow-y-auto">
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #eee" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Basic Information
            </Typography>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleReAssign}
            >
              Reassign Trade
            </Button>


            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Trade ID
              </Typography>
              <Typography>{escalatedTrade.tradeHash || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Platform
              </Typography>
              <Typography>{escalatedTrade.platform || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Amount
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                {Number(escalatedTrade.externalTrade.amount).toLocaleString() || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={escalatedTrade.status || "N/A"}
                size="small"
                sx={{
                  ...(escalatedTrade.status?.toLowerCase() === "escalated"
                    ? { bgcolor: "#FFEBEE", color: "#C62828" }
                    : { bgcolor: "#E8F5E9", color: "#2E7D32" }),
                  fontWeight: 600
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Escalation Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Escalated By
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Avatar src={escalatedTrade.escalatedBy?.avatar} sx={{ width: 32, height: 32 }} />
                <Typography>
                  {escalatedTrade.escalatedBy?.fullName || "N/A"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Reason
              </Typography>
              <Typography>{escalatedTrade.reason || "No reason provided"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Date Escalated
              </Typography>
              <Typography>{formatWATDateTime(escalatedTrade.createdAt)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Trade Information
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Payment Method
              </Typography>
              <Typography>{escalatedTrade.paymentMethod || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Dollar Rate
              </Typography>
              <Typography>{Number(escalatedTrade.externalTrade.dollarRate).toLocaleString() || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                BTC Rate
              </Typography>
              <Typography>{Number(escalatedTrade.externalTrade.btcRate).toLocaleString() || "N/A"}</Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setConfirmCancelOpen(true)}   // ← open dialog instead of cancelling immediately
              disabled={cancelTradeState}
            >
              {cancelTradeState ? "Cancelling..." : "Cancel Trade"}
            </Button>

          </Paper>

          {/* Attachments Section */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #eee" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Attachments ({attachments.length})
            </Typography>

            {attachments.length > 0 ? (
              <List>
                {attachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                      cursor: "pointer"
                    }}
                  >
                    <ListItemAvatar>
                      {getFileIcon(attachment.type)}
                    </ListItemAvatar>
                    <ListItemText
                      primary={attachment.name}
                      secondary={formatFileSize(attachment.size)}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No attachments found
              </Typography>
            )}
          </Paper>

          {/* Activity Log */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #eee" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Activity Timeline
            </Typography>

            {escalatedTrade.activityLog?.length > 0 ? (
              <Box>
                {escalatedTrade.activityLog.map((activity: any, index: number) => (
                  <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: "2px solid #eee" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activity.action || "Activity"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(activity.performedAt)} by {activity.performedBy || "System"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No activity recorded
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Right Panel - Chat */}
      <Box className="flex-1 flex flex-col bg-white" sx={{ height: '100vh' }}>
        {/* Chat Header */}
        <Box className="p-4 border-b border-gray-200">
          <Box className="flex justify-between items-center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Trade Chat
            </Typography>
            <Box className="flex gap-2">
              <Tooltip title="Set Reminder">
                <IconButton onClick={() => setReminderOpen(true)}>
                  <Schedule />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton>
                  <Badge badgeContent={0} color="error">
                    <NotificationsActive />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Messages Container */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            height: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: "#f9f9f9",
          }}
        >
          {messages.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              color="text.secondary"
            >
              No messages yet
            </Box>
          ) : (
            messages.map((message) => {
              // classify
              const isExpired =
                typeof message.content === "string" && /expired/i.test(message.content);
              const isSelf = Boolean(message.sender.isCurrentUser);
              const isVendor = !isSelf && message.sender.id !== "system" && message.sender.fullName !== "System";
              const isBot = message.sender.id === "system" || message.sender.fullName === "System";

              // pick colors
              let bg: string, fg: string;
              if (isExpired) {
                bg = "#fdecea";
                fg = theme.palette.error.dark;
              } else if (isSelf) {
                bg = "rgb(241, 204, 84)";
                fg = theme.palette.primary.dark;
              } else if (isVendor) {
                bg = "rgb(242, 252, 159)";
                fg = theme.palette.warning.dark;
              } else if (isBot) {
                bg = "rgb(10, 144, 41)";
                fg = theme.palette.grey[800];
              } else {
                bg = theme.palette.background.paper;
                fg = theme.palette.text.primary;
              }

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    mb: 1,
                    justifyContent: isSelf ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      maxWidth: "80%",
                      gap: 1,
                      flexDirection: isSelf ? "row-reverse" : "row",
                    }}
                  >
                    <Avatar
                      src={message.sender.avatar || DEFAULT_AVATAR}
                      sx={{ width: 36, height: 36, alignSelf: "flex-end" }}
                    />
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: bg,
                        color: fg,
                        maxWidth: "70%",
                        wordBreak: "break-word",
                        opacity: message.status === "sending" ? 0.7 : 1,
                        border: message.status === "failed" ? "1px solid red" : "none",
                      }}
                    >
                      {typeof message.content === "object" ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                            Bank Transfer Details:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
                            <Box component="li">
                              <Typography variant="body2">
                                <strong>Bank:</strong> {message.content.bank_account?.bank_name || "N/A"}
                              </Typography>
                            </Box>
                            <Box component="li">
                              <Typography variant="body2">
                                <strong>Account:</strong> {message.content.bank_account?.account_number || "N/A"}
                              </Typography>
                            </Box>
                            <Box component="li">
                              <Typography variant="body2">
                                <strong>Holder:</strong> {message.content.bank_account?.holder_name || "N/A"}
                              </Typography>
                            </Box>
                            <Box component="li">
                              <Typography variant="body2">
                                <strong>Amount:</strong> {message.content.bank_account?.amount || "N/A"}{" "}
                                {message.content.bank_account?.currency || ""}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2">{message.content}</Typography>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: fg,
                            fontStyle: message.status === "sending" ? "italic" : "normal",
                          }}
                        >
                          {message.status === "sending"
                            ? "Sending..."
                            : formatDate(message.createdAt)}
                        </Typography>
                        {message.status === "failed" && (
                          <Tooltip title="Failed to send - click to retry">
                            <IconButton
                              size="small"
                              onClick={() => handleRetryMessage(message)}
                              sx={{ color: "error.main" }}
                            >
                              <Sync />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              InputProps={{
                sx: { borderRadius: "20px", backgroundColor: "background.paper" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => fileInputRef.current?.click()} edge="end">
                      <AttachFileOutlined />
                    </IconButton>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ minWidth: "40px", height: "40px", borderRadius: "50%", p: 0 }}
            >
              <Send />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Reminder Dialog */}
      <Dialog open={reminderOpen} onClose={() => setReminderOpen(false)}>
        <DialogTitle>Set Reminder</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Set a reminder for this trade
          </Typography>
          <TextField
            fullWidth
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderOpen(false)}>Cancel</Button>
          <Button onClick={() => setReminderOpen(false)} variant="contained">
            Set Reminder
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this trade?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)}>
            No
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmCancelOpen(false);
              handleCancelTrade();    // ← calls your existing cancellation logic
            }}
            disabled={cancelTradeState}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EscalatedDetails;