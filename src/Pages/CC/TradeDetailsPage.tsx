import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  InputBase,
  Divider,
  Container,
  CircularProgress,
  Drawer,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { Send as SendIcon, AttachFile, Menu as MenuIcon, Sync } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "react-router-dom";
import { getTradeDetails, sendTradeMessage } from "../../api/trade";
import toast from "react-hot-toast";
import { useUserContext } from "../../Components/ContextProvider";
import { enUS } from "date-fns/locale";

interface BankAccountDetails {
  bank_name?: string;
  account_number?: string;
  holder_name?: string;
  amount?: string | number;
  currency?: string;
}

interface ChatMessageContent {
  bank_account?: BankAccountDetails;
  bank_accounts?: BankAccountDetails;
}

interface ChatMessage {
  id: string;
  content: string | ChatMessageContent;
  sender?: { id: string; fullName: string; avatar?: string };
  createdAt: string;
}

interface TradeRecord {
  id: string;
  ownerUsername: string;
  assignedPayer?: { fullName: string; avatar?: string };
  createdAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  tradeHash: string;
  platform: string;
  paymentMethod: string;
  amount: number;
  cryptoAmountTotal: number;
  margin?: number;
  flagged: boolean;
  notes?: string;
  feedback?: string;
}

interface TradeDetailsData {
  externalTrade: {
    btcRate: number | null;
    dollarRate: number | null;
    amount: number | null;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    buyer_name: string;
  };
  tradeChat: { messages: ChatMessage[] };
  tradeRecord: TradeRecord;
  tradeDuration: number | null;
}

interface Message {
  id: string;
  content: string | ChatMessageContent;
  sender: {
    id: string;
    fullName: string;
    avatar?: string;
    isCurrentUser?: boolean;
  };
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
}

const DEFAULT_AVATAR = "/default.png";

const TradeDetailsPage: React.FC = () => {
  const { platform, tradeHash, accountId } = useParams<{
    platform?: string;
    tradeHash?: string;
    accountId?: string;
  }>();
  const { user } = useUserContext();
  const currentUserId = user?.id || "";
  const [tradeDetailsData, setTradeDetailsData] = useState<TradeDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const fetchTradeData = useCallback(async () => {
    setLoading(true);
    try {
      if (!platform || !tradeHash || !accountId) {
        toast.error("Missing required parameters for fetching trade details.");
        return;
      }
      const res = await getTradeDetails(platform, tradeHash, accountId);
      if (res?.success) {
        setTradeDetailsData(res.data);
        // Initialize messages with proper sender information
        setMessages(res.data.tradeChat.messages.map(msg => ({
          ...msg,
          sender: {
            ...msg.sender,
            isCurrentUser: msg.sender?.id === currentUserId,
            avatar: msg.sender?.avatar || DEFAULT_AVATAR
          }
        })));
      } else {
        toast.error("Failed to fetch trade details.");
      }
    } catch (error) {
      console.error("Error fetching trade details:", error);
      toast.error("Error fetching trade details.");
    } finally {
      setLoading(false);
    }
  }, [platform, tradeHash, accountId, currentUserId]);

  useEffect(() => {
    fetchTradeData();
  }, [fetchTradeData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const tradeId = tradeDetailsData?.tradeRecord.id;
    if (!tradeId) return;
    const content = newMessage.trim();
    if (!content || sendingMessage) return;

    setSendingMessage(true);
    
    const tmpId = `tmp-${Date.now()}`;
    const tempMessage: Message = {
      id: tmpId,
      content,
      sender: { 
        id: currentUserId, 
        fullName: user?.fullName || "You",
        avatar: user?.avatar || DEFAULT_AVATAR,
        isCurrentUser: true 
      },
      createdAt: new Date().toISOString(),
      status: "sending"
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      await sendTradeMessage(tradeId, content);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === tmpId ? { ...msg, status: "sent" } : msg
        )
      );

      // Refresh messages from server after a short delay
      setTimeout(() => {
        fetchTradeData();
      }, 500);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tmpId ? { ...msg, status: "failed" } : msg
        )
      );
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRetryMessage = async (message: Message) => {
    if (typeof message.content !== 'string' || !tradeDetailsData?.tradeRecord.id) return;

    try {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, status: 'sending' } : msg
      ));

      const response = await sendTradeMessage(tradeDetailsData.tradeRecord.id, message.content);

      if (response?.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
        
        setTimeout(() => {
          fetchTradeData();
        }, 500);
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'failed' } : msg
        ));
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error retrying message:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ));
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!tradeDetailsData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Unable to load trade details.</Typography>
      </Box>
    );
  }

  const { externalTrade, tradeRecord } = tradeDetailsData;
  const vendorUsername = tradeRecord.ownerUsername;

  const TradeDetailsPanel = () => (
    <Box sx={{ p: 3, overflowY: "auto", height: "80vh" }}>
      <Typography sx={{ fontWeight: "bold", mb: 2 }}>Trade Details</Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Trade Hash</Typography>
        <Typography>{tradeRecord.tradeHash}</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Platform</Typography>
        <Typography>
          {tradeRecord.platform.toUpperCase()} | {vendorUsername}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Trade Duration
        </Typography>
        <Typography>
          {tradeDetailsData.tradeDuration !== null ? `${tradeDetailsData.tradeDuration} sec` : "N/A"}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      <Typography sx={{ mb: 2 }}>Financial Details</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Amount</Typography>
        <Typography>{tradeRecord.amount.toLocaleString()}</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Crypto Total</Typography>
        <Typography variant="h6">
          {(tradeRecord.cryptoAmountTotal / 1e8).toFixed(8)} BTC
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">BTC/NGN</Typography>
        <Typography>
          {Number(externalTrade.btcRate).toLocaleString() ?? "N/A"}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Margin</Typography>
        <Typography>{tradeRecord.margin ?? "N/A"}</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Date/Time</Typography>
        <Typography>
          {formatWATDateTime(tradeRecord.createdAt)}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Flagged</Typography>
        <Typography>{tradeRecord.flagged ? "Yes" : "No"}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography sx={{ mb: 2 }}>Notes & Feedback</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Notes</Typography>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          {tradeRecord.notes || "None"}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Feedback</Typography>
        <Typography>{tradeRecord.feedback || "None"}</Typography>
      </Box>
    </Box>
  );

  const ChatWindow = () => (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            onClick={() => setMobileOpen((o) => !o)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Avatar 
          src={tradeRecord.assignedPayer?.avatar || DEFAULT_AVATAR} 
          sx={{ mr: 2 }}
        >
          {tradeRecord.assignedPayer?.fullName.charAt(0) || "A"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {tradeRecord.assignedPayer?.fullName || "Not Assigned"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Trade Chat
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography color="textSecondary">No messages yet.</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const senderId = msg.sender?.id || "";
            const senderName = msg.sender?.fullName?.trim() || "";
            const date = new Date(msg.createdAt);
            const formattedDate = isNaN(date.getTime())
              ? "Invalid date"
              : format(date, "MMM d, h:mm a");

            const isExpired = typeof msg.content === "string" && /expired/i.test(msg.content);
            const isCancel = typeof msg.content === "string" && /cancel/i.test(msg.content);
            const isSelf = senderId === currentUserId;
            const isVendor = senderName === vendorUsername;
            const isBot = senderName === "System" || senderId === "system";

            let bg: string, fg: string;
            if (isExpired) {
              bg = "#fdecea";
              fg = theme.palette.error.dark;
            } else if (isCancel) {
              bg = "#fdecea";
              fg = theme.palette.error.dark;
            } else if (isBot) {
              bg = "rgb(10, 144, 41)";
              fg = theme.palette.grey[800];
            } else if (isVendor) {
              bg = "rgb(242, 252, 159)";
              fg = theme.palette.warning.dark;
            } else if (isSelf) {
              bg = "rgb(246, 245, 239)";
              fg = theme.palette.primary.dark;
            } else {
              bg = theme.palette.background.paper;
              fg = theme.palette.text.primary;
            }

            const renderMessageContent = () => {
              if (typeof msg.content === "string") {
                return <Typography variant="body1">{msg.content}</Typography>;
              }

              const bankDetails = msg.content.bank_account || msg.content.bank_accounts;
              if (bankDetails) {
                return (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Bank Details:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Bank:</strong> {bankDetails.bank_name || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Account #:</strong> {bankDetails.account_number || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Holder:</strong> {bankDetails.holder_name || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Amt:</strong> {bankDetails.amount || "N/A"} {bankDetails.currency || ""}
                    </Typography>
                  </>
                );
              }

              return <Typography variant="body1">Unknown message format</Typography>;
            };

            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: isSelf ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Avatar 
                  src={msg.sender?.avatar || DEFAULT_AVATAR}
                  sx={{ mx: 1 }}
                >
                  {senderName.charAt(0)}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: bg,
                    color: fg,
                    boxShadow: 1,
                    opacity: msg.status === "sending" ? 0.7 : 1,
                    border: msg.status === "failed" ? "1px solid red" : "none",
                  }}
                >
                  {renderMessageContent()}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7 }}
                    >
                      {formattedDate}
                    </Typography>
                    {msg.status === "failed" && (
                      <Tooltip title="Failed to send - click to retry">
                        <IconButton
                          size="small"
                          onClick={() => handleRetryMessage(msg)}
                          sx={{ color: "error.main" }}
                        >
                          <Sync fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Paper
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderTop: "1px solid #ddd",
        }}
      >
        <IconButton>
          <AttachFile />
        </IconButton>
        <InputBase
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          multiline
          maxRows={4}
        />
        <IconButton
          onClick={handleSendMessage}
          color="primary"
          disabled={!newMessage.trim() || sendingMessage}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          height: "80vh",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {!isMobile ? (
          <Box sx={{ width: 300, borderRight: "1px solid #ddd" }}>
            <TradeDetailsPanel />
          </Box>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: 300 } }}
          >
            <TradeDetailsPanel />
          </Drawer>
        )}

        <Box sx={{ flex: 1 }}>
          <ChatWindow />
        </Box>
      </Box>
    </Container>
  );
};

export default TradeDetailsPage;