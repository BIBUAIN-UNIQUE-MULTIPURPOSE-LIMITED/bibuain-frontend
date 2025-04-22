/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/TradeDetailsPage.tsx
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
} from "@mui/material";
import { Send as SendIcon, AttachFile, Menu as MenuIcon } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "react-router-dom";
import { getTradeDetails, sendTradeMessage } from "../../api/trade";
import toast from "react-hot-toast";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useUserContext } from "../../Components/ContextProvider";
// import { enUS } from "@mui/material/locale";
import { enUS } from "date-fns/locale";

interface ChatMessage {
  id: string;
  content: any;
  sender?: { id: string; fullName: string };
  createdAt: string;
}
interface TradeChat {
  messages: ChatMessage[];
  attachments?: any[];
}
interface TradeRecord {
  ownerUsername: string;
  assignedPayer?: { fullName: string };
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
  tradeChat: TradeChat;
  tradeRecord: TradeRecord;
  tradeDuration: number | null;
}
interface ChatFormValues {
  message: string;
}
const messageValidation = Yup.object({
  message: Yup.string().required("Message is required"),
});

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
      } else {
        toast.error("Failed to fetch trade details.");
      }
    } catch (error) {
      console.error("Error fetching trade details:", error);
      toast.error("Error fetching trade details.");
    } finally {
      setLoading(false);
    }
  }, [platform, tradeHash, accountId]);

  useEffect(() => {
    fetchTradeData();
  }, [fetchTradeData]);

  useEffect(() => {
    if (tradeDetailsData?.tradeChat?.messages.length) {
      scrollToBottom();
    }
  }, [tradeDetailsData?.tradeChat?.messages]);

// inside your TradeDetailsPage component, *replace* your old handleSendMessage:
const handleSendMessage = async (
  values: ChatFormValues,
  { resetForm, setSubmitting }: FormikHelpers<ChatFormValues>
) => {
  // 1) make sure we have all the identifiers
  if (!platform || !tradeHash || !accountId) {
    toast.error("Missing trade identifiers.");
    setSubmitting(false);
    return;
  }

  try {
    // 2) call your API
    const res = await sendTradeMessage(
      accountId,
      values.message.trim()
    );

    if (res?.success) {
      resetForm();
      await fetchTradeData();
      scrollToBottom();
    } else {
      toast.error(res?.message || "Failed to send message.");
    }
  } catch (err) {
    console.error("Error sending message:", err);
    toast.error("Failed to send message.");
  } finally {
    setSubmitting(false);
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

  // Guard: if we failed to load data
  if (!tradeDetailsData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Unable to load trade details.</Typography>
      </Box>
    );
  }

  // Destructure safely
  const { externalTrade, tradeChat, tradeRecord, tradeDuration } = tradeDetailsData;
  const messages: ChatMessage[] = tradeChat.messages;
  const vendorUsername = tradeRecord.ownerUsername;

  // Left panel
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
          {tradeDuration !== null ? `${tradeDuration} sec` : "N/A"}
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

  // Right panel
  const ChatWindow = () => (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
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
        <Avatar sx={{ mr: 2 }}>
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

      {/* Messages */}
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
            const senderId   = msg.sender?.id || "";
            const senderName = msg.sender?.fullName?.trim() || "";
            const date = new Date(msg.createdAt);
            const formattedDate = isNaN(date.getTime())
              ? "Invalid date"
              : format(date, "MMM d, h:mm a");

            // classify
            const isExpired = typeof msg.content === "string" && /expired/i.test(msg.content);
            const isCancel = typeof msg.content === "string" && /cancel/i.test(msg.content);
const isSelf    = senderId === currentUserId;
const isVendor  = senderName === vendorUsername;
const isBot     = senderName === "System" || senderId === "system";

            // pick colors
            let bg: string, fg: string;
            if (isExpired) {
              bg = "#fdecea";
              fg = theme.palette.error.dark;
            } else if (isCancel) {
              bg = "#fdecea";
              fg = theme.palette.error.dark;
            } else if (isBot) {
              bg ="rgb(10, 144, 41)";
              fg = theme.palette.grey[800];
            } else if (isVendor) {
              bg ="rgb(242, 252, 159)";
              fg = theme.palette.warning.dark;
            } else if (isSelf) {
              bg ="rgb(241, 204, 84)";
              fg = theme.palette.primary.dark;
            } else {
              bg = theme.palette.background.paper;
              fg = theme.palette.text.primary;
            }

            // render content
            let messageContent: React.ReactNode;
            if (
              typeof msg.content === "object" &&
              (msg.content.bank_account || msg.content.bank_accounts)
            ) {
              const b = msg.content.bank_account || msg.content.bank_accounts;
              messageContent = (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1, bg:"yellow" }}
                  >
                    Bank Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bank:</strong> {b.bank_name || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Account #:</strong> {b.account_number || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Holder:</strong> {b.holder_name || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amt:</strong> {b.amount || "N/A"} {b.currency || ""}
                  </Typography>
                </>
              );
            } else {
              messageContent = <Typography variant="body1">{msg.content}</Typography>;
            }

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
                <Avatar sx={{ mx: 1 }}>{senderName.charAt(0)}</Avatar>
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: bg,
                    color: fg,
                    boxShadow: 1,
                  }}
                >
                  {messageContent}
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                  >
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Formik
  initialValues={{ message: "" }}
  validationSchema={messageValidation}
  onSubmit={handleSendMessage}
>
  {({ values, handleChange, isSubmitting }) => (
    <Form>
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
          name="message"
          value={values.message}
          onChange={handleChange}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={isSubmitting || !values.message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Form>
  )}
</Formik>

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