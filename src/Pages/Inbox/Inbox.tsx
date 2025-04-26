/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Badge,
  IconButton,
  InputBase,
  Paper,
  useTheme,
  alpha,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import {
  Send as SendIcon,
  Menu as MenuIcon,
  AttachFile as AttachFileIcon,
  Message as MessageIcon,
  Delete,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Attachment, Chat, Message, User } from "../../lib/interface";
import {
  createMessage,
  deleteChat,
  getAllChats,
  getSingleChat,
  markMessageAsSeen,
  getUnseenMessages,
  deleteMessage,
  createChat,
} from "../../api/chats";
import { getAllUsers } from "../../api/user";
import { useSearchParams } from "react-router-dom";
import { useUserContext } from "../../Components/ContextProvider";
import io from "socket.io-client";
import Loading from "../../Components/Loading";
import {
  Description as FileIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf,
  TableChart,
  Code,
} from "@mui/icons-material";

const messageValidation = Yup.object({
  message: Yup.string().required(),
});

const notificationSound = new Audio("/message.mp3");
const Inbox: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { onlineUsers, setOnlineUsers } = useUserContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);
  const [unseenCounts, setUnseenCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { user } = useUserContext();
  const [params] = useSearchParams();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Initialize socket connection
  useEffect(() => {
    // socketRef.current = io("https://r845fh.bibuain.ng"); 
<<<<<<< HEAD
    socketRef.current = io("https://bibuain-backend.onrender.com/");
=======
    socketRef.current = io("https://bibuain-backend-jhq3.onrender.com");
>>>>>>> a4f02292178c89d558a27a126109453d2663baf8

    if (user?.id) {
      socketRef.current.emit("join", user.id);
    }

    socketRef.current.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    socketRef.current.on("userStatusUpdate", ({ userId, status }: { userId: string, status: string }) => {
      setOnlineUsers((prev: string[]) =>
        status === "online"
          ? [...prev, userId]
          : prev.filter((id: string) => id !== userId)
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("userStatusUpdate", {
          userId: user?.id,
          status: "offline",
        });
        socketRef.current.disconnect();
      }
    };
  }, [user?.id, setOnlineUsers]);

  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit("joinChat", selectedChat.id);

      const handleNewMessage = (newMessage: Message) => {

        if (newMessage?.chat?.id === selectedChat.id) {
          if (newMessage?.sender?.id !== user?.id) {
            notificationSound.play();
            markMessageAsSeen(newMessage.id);
          }

          setMessages(prevMessages => {
            if (prevMessages?.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return prevMessages ? [...prevMessages, newMessage] : [newMessage];
          });
        }
      };

      socketRef.current.on("newMessage", handleNewMessage);

      return () => {
        socketRef.current.emit("leaveChat", selectedChat.id);
        socketRef.current.off("newMessage", handleNewMessage);
      };
    }
  }, [selectedChat, user?.id]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setLoadingUsers(true);

        // Fetch all users
        const usersResponse = await getAllUsers();
        if (Array.isArray(usersResponse)) {
          setUsers(usersResponse.filter((u: User) => u.id !== user?.id));
        } else if (usersResponse?.data && Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data.filter((u: User) => u.id !== user?.id));
        } else {
          console.error("Unexpected users response format:", usersResponse);
          setUsers([]);
        }

        // Fetch all chats
        const chatsData = await getAllChats();
        if (chatsData?.success && Array.isArray(chatsData.data)) {
          setChats(chatsData.data);

          const counts: Record<string, number> = {};
          for (const chat of chatsData.data) {
            const otherParticipant = chat.participants.find((p: User) => p.id !== user?.id);
            if (otherParticipant) {
              const unseenData = await getUnseenMessages(chat.id);
              if (unseenData?.success) {
                counts[otherParticipant.id] = unseenData.data.length;
              }
            }
          }
          setUnseenCounts(counts);
        } else {
          setChats([]);
        }

        // Check if there's a chat ID in the URL
        const chatId = params.get("chatId");
        if (chatId) {
          const chatData = await getSingleChat(chatId);
          if (chatData?.success) {
            setSelectedChat(chatData.data);
            setMessages(chatData.data.messages);

            const unseenMessages = chatData.data.messages
              .filter((msg: Message) => msg?.sender?.id !== user?.id && !msg?.seen);

            for (const msg of unseenMessages) {
              await markMessageAsSeen(msg.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setUsers([]);
        setChats([]);
      } finally {
        setLoading(false);
        setLoadingUsers(false);
      }
    };

    if (user?.id) {
      fetchInitialData();
    }
  }, [params, user?.id]);

  // Periodically check for unseen messages
  useEffect(() => {
    if (!chats || chats.length === 0 || !user?.id) return;

    const checkUnseenMessages = async () => {
      const counts: Record<string, number> = {};

      for (const chat of chats) {
        const otherParticipant = chat.participants.find((p: User) => p.id !== user?.id);
        if (otherParticipant) {
          const response = await getUnseenMessages(chat.id);
          if (response?.success) {
            counts[otherParticipant.id] = response.data.length;
          }
        }
      }

      setUnseenCounts(counts);
    };

    const interval = setInterval(checkUnseenMessages, 30000);
    return () => clearInterval(interval);
  }, [chats, user?.id]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserSelect = async (selectedUser: User) => {
    setLoading(true);
    try {
      // Check if a chat already exists with this user
      let chat = chats?.find(c =>
        c.participants.some((p: User) => p.id === selectedUser.id)
      );

      // If no chat exists, create a new one
      if (!chat) {
        if (!user?.id) {
          throw new Error("Current user not available");
        }

        // Include both current user and selected user in participants
        const participants = [user.id, selectedUser.id];
        console.log('Creating new chat with participants:', participants);

        const newChatResponse = await createChat(participants);

        if (!newChatResponse?.success) {
          throw new Error(newChatResponse?.message || "Failed to create chat");
        }

        console.log('New chat created:', newChatResponse.data);
        chat = newChatResponse.data;

        // Update chats state
        setChats(prev => prev ? [...prev, chat!] : [chat!]);
      }

      // Set the selected chat with null check
      if (!chat) {
        throw new Error("Chat not available");
      }
      setSelectedChat(chat);
      console.log('Selected chat:', chat);

      // Fetch messages for this chat
      console.log('Fetching messages for chat:', chat.id);
      const chatData = await getSingleChat(chat.id);

      if (!chatData?.success) {
        throw new Error(chatData?.message || "Failed to fetch chat messages");
      }

      console.log('Chat messages:', chatData.data.messages);
      setMessages(chatData.data.messages || []);

      // Mark messages as seen
      const unseenMessages = chatData.data.messages
        ?.filter((msg: Message) => msg.sender?.id !== user?.id && !msg?.seen) || [];

      for (const msg of unseenMessages) {
        await markMessageAsSeen(msg.id);
      }

      // Update unseen counts
      setUnseenCounts(prev => ({
        ...prev,
        [selectedUser.id]: 0
      }));

      if (isMobile) handleDrawerToggle();
    } catch (error: any) {
      console.error("Error selecting user:", error);

    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (confirmDelete) {
      const response = await deleteMessage(messageId);
      if (response?.success) {
        setMessages(prevMessages =>
          prevMessages ? prevMessages.filter(msg => msg.id !== messageId) : null
        );
      }
    }
  };

  if (user === null) {
    return null;
  }

  if (loading) return <Loading />;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon />;
    if (type === "application/pdf") return <PictureAsPdf />;
    if (type === "text/csv") return <TableChart />;
    if (type.includes("javascript") || type.includes("typescript"))
      return <Code />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const AttachmentPreview = ({ attachment }: { attachment: Attachment }) => {
    const isImage = attachment.type.startsWith("image/");

    if (isImage) {
      return (
        <Box sx={{ mt: 1, mb: 1, maxWidth: "100%" }}>
          <img
            src={`https://r845fh.bibuain.ng${attachment.url}`}
            alt={attachment.name}
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "4px",
              objectFit: "contain",
            }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          mt: 1,
          mb: 1,
          display: "flex",
          alignItems: "center",
          p: 1,
          borderRadius: 1,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
        }}
      >
        <Box sx={{ mr: 1 }}>{getFileIcon(attachment.type)}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {attachment.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(attachment.size)}
          </Typography>
        </Box>
        <IconButton
          size="small"
          component="a"
          href={`https://r845fh.bibuain.ng${attachment.url}`}
          download
          sx={{ ml: 1 }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const UsersList = () => (
    <Box
      sx={{
        width: { xs: "100%", md: 300 },
        height: "80vh",
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          All Users
        </Typography>
      </Box>
      <Box sx={{ overflow: "auto", height: "calc(100% - 64px)" }}>
        {loadingUsers ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Loading />
          </Box>
        ) : users === null ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">Failed to load users</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No users available</Typography>
          </Box>
        ) : (
          users.map((userItem) => (
            <Box
              key={userItem.id}
              onClick={() => handleUserSelect(userItem)}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
                bgcolor:
                  selectedChat?.participants.some((p: User) => p.id === userItem.id)
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: onlineUsers.includes(userItem.id)
                      ? "#44b700"
                      : "#ccc",
                  },
                }}
              >
                <Avatar src={userItem.avatar}>
                  {userItem.fullName.charAt(0)}
                </Avatar>
              </Badge>
              <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                  {userItem.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {userItem.userType || ''}
                </Typography>
              </Box>
              {unseenCounts[userItem.id] > 0 && (
                <Badge
                  badgeContent={unseenCounts[userItem.id]}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  const DefaultChatWindow = () => (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <MessageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Select a user to start messaging
      </Typography>
    </Box>
  );

  const ChatWindow = () => {
    if (!selectedChat) {
      return <DefaultChatWindow />;
    }

    const otherParticipant = selectedChat.participants.find((p: User) => p.id !== user?.id);

    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: onlineUsers.includes(otherParticipant?.id || "")
                  ? "#44b700"
                  : "#ccc",
              },
            }}
          >
            <Avatar src={otherParticipant?.avatar}>
              {otherParticipant?.fullName.charAt(0)}
            </Avatar>
          </Badge>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {otherParticipant?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {onlineUsers.includes(otherParticipant?.id || "")
                ? "Online"
                : "Offline"}
            </Typography>
          </Box>
          <IconButton
            onClick={async () => {
              const cfs = window.confirm("Do you want to delete this Chat?");
              if (!cfs) {
                return;
              }
              const data = await deleteChat(selectedChat.id);
              if (data?.success) {
                setSelectedChat(null);
                const updatedChats = await getAllChats();
                if (updatedChats?.success) {
                  setChats(updatedChats.data);
                }
              }
            }}
          >
            <Delete className="text-red-500" />
          </IconButton>
        </Box>

        <Box
          ref={messageContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            bgcolor: "#f5f5f5",
            height: "100%",
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography color="text.secondary">
                Loading messages...
              </Typography>
            </Box>
          ) : messages?.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 2, minHeight: "80vh" }}>
              <MessageIcon
                sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
              />
              <Typography color="text.secondary">
                Send a message to start the conversation
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                position: "relative",
                overflow: "auto",
                p: 2,
                bgcolor: "#f5f5f5",
                minHeight: "80vh",
              }}
            >
              {messages?.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.sender?.id === user?.id ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  {msg.sender?.id !== user?.id && (
                    <Avatar
                      src={
                        selectedChat.participants.find(
                          (p: User) => p.id === msg?.sender?.id
                        )?.avatar
                      }
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {selectedChat.participants
                        .find((p: User) => p.id === msg?.sender?.id)
                        ?.fullName.charAt(0)}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 2,
                      bgcolor:
                        msg?.sender?.id === user?.id
                          ? theme.palette.primary.main
                          : "white",
                      color: msg?.sender?.id === user?.id ? "white" : "inherit",
                      borderRadius: 2,
                      boxShadow: 1,
                      position: "relative",
                    }}
                  >
                    {msg.content && (
                      <Typography variant="body1">

                        {String(msg.content)}
                      </Typography>
                    )}

                    {msg?.attachments &&
                      msg.attachments.map((attachment: Attachment, index: any) => (
                        <AttachmentPreview
                          key={`${msg.id}-attachment-${index}`}
                          attachment={attachment}
                        />
                      ))}

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 0.5
                    }}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          color:
                            msg?.sender?.id === user?.id
                              ? "inherit"
                              : "text.secondary",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Typography>

                      {msg?.sender?.id === user?.id && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMessage(msg.id)}
                          sx={{
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                            p: 0.5,
                            ml: 1,
                            color: 'inherit'
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Formik
            initialValues={{ message: "" }}
            validationSchema={messageValidation}
            onSubmit={async (values, { resetForm }) => {
              try {
                const formData = new FormData();
                formData.append("content", values.message);
                if (selectedFile) {
                  formData.append("file", selectedFile);
                }

                const data = await createMessage(formData, selectedChat.id);
                if (data?.success) {
                  if (messages !== null) {
                    const updatedMessages = [...messages, data.data];
                    setMessages(updatedMessages);
                  } else {
                    setMessages([data.data]);
                  }
                  resetForm();
                  setSelectedFile(null);
                }
              } catch (error) {
                console.error("Error in onSubmit handler:", error);
              }
            }}
          >
            {({ values, handleChange }) => (
              <Form>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <IconButton onClick={() => fileInputRef.current?.click()}>
                    <AttachFileIcon
                      color={selectedFile ? "primary" : "inherit"}
                    />
                  </IconButton>
                  {selectedFile && (
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      {selectedFile.name}
                      <IconButton
                        size="small"
                        onClick={() => setSelectedFile(null)}
                        sx={{ ml: 0.5 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Typography>
                  )}
                  <InputBase
                    fullWidth
                    placeholder="Type a message"
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!values.message && !selectedFile}
                  >
                    <SendIcon />
                  </IconButton>
                </Paper>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "max-content" }}>
      {!isMobile ? (
        <UsersList />
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            "& .MuiDrawer-paper": { width: 300 },
          }}
        >
          <UsersList />
        </Drawer>
      )}

      <Box sx={{ flex: 1 }}>
        <ChatWindow />
      </Box>
    </Box>
  );
};

export default Inbox;