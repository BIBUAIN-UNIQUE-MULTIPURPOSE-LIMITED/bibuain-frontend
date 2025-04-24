/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  FilterList,
  Refresh,
  ArrowDownward,
  ArrowUpward,
  Assignment,
  SupportAgent,
  ErrorOutline,
  Sort,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  getEscalatedTrades,
  getCompletedTrades,
  getAllTrades
} from "../../api/trade";
import { createNotification } from "../../api/user";
import { exportToCSV, exportToPDF } from "../../lib/reportExporter";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface Trade {
  messageCount: any;
  accountId: any;
  id: string;
  tradeHash?: string;
  platform: string;
  amount: number;
  status: string;
  createdAt: string;
  escalatedBy?: {
    id: string;
    fullName?: string;
    avatar?: string;
  };
  assignedCcAgent?: {
    id: string;
    fullName?: string;
    avatar?: string;
  };
  reason?: string;
  trade?: {
    tradeHash?: string;
    accountId?: string;
  };
  hasNewMessages?: boolean;
  responderUsername?: string;
  ownerUsername?: string;
  cryptoCurrencyCode?: string;
  fiatCurrency?: string;
  paymentMethod?: string;
}

const ExportButtons = ({
  data,
  type,
}: {
  data: Trade[];
  type: "completedTrades" | "escalatedTrades" | "allTrades";
}) => {
  return (
    <Box className="flex items-center gap-2">
      <Button
        variant="outlined"
        onClick={() => exportToCSV(data, type)}
        startIcon={<Assignment />}
        sx={{
          borderColor: "primary.main",
          color: "primary.main",
          "&:hover": {
            borderColor: "secondary.main",
            bgcolor: "rgba(248, 188, 8, 0.04)",
          },
        }}
      >
        Export CSV
      </Button>
      <Button
        variant="outlined"
        onClick={() => exportToPDF(data, type)}
        startIcon={<Assignment />}
        sx={{
          borderColor: "primary.main",
          color: "primary.main",
          "&:hover": {
            borderColor: "secondary.main",
            bgcolor: "rgba(248, 188, 8, 0.04)",
          },
        }}
      >
        Export PDF
      </Button>
    </Box>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    // 1) format absolute time as h.mm a  (produces “2.53 pm”)
    const timeString = format(dateObj, 'h.mm a', { locale: enUS });

    // 2) format relative time as “2 mins ago”
    const relative = formatDistanceToNow(dateObj, { addSuffix: true, locale: enUS });

    // 3) combine
    return `${timeString} (${relative})`;
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid date';
  }
};


const CustomerSupport: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [escalatedTrades, setEscalatedTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc"
  }>({
    field: "",
    direction: "asc"
  });
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [filter, setFilter] = useState<"latest" | "oldest" | "">("");
  const previousMessageCounts = useRef<Record<string, number>>({});
  const initialLoad = useRef(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null); 
  

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm("");
    setFilter("");
    setSortConfig({ field: "", direction: "asc" });
  };

  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("escalated")) {
      return { bgcolor: "#FFEDED", color: "#D32F2F" };
    } else if (statusLower.includes("completed") || statusLower.includes("resolved")) {
      return { bgcolor: "#EDF7ED", color: "#2E7D32" };
    } else if (statusLower.includes("pending") || statusLower.includes("open")) {
      return { bgcolor: "#FFF4E5", color: "#ED6C02" };
    } else {
      return { bgcolor: "#F5F5F5", color: "#616161" };
    }
  };

  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [esData, compData, allData] = await Promise.all([getEscalatedTrades(), getCompletedTrades({}), getAllTrades()]);
      if (esData?.success) {
        setEscalatedTrades(esData.data.map((t: any) => ({
          id: t.id,
          tradeHash: t.tradeHash,
          platform: t.platform,
          amount: t.amount || 0,
          status: t.status,
          createdAt: t.createdAt,
          ownerUsername: t.ownerUsername,
          responderUsername: t.responderUsername,
          reason: t.escalationReason,
          cryptoCurrencyCode: t.cryptoCurrencyCode,
          fiatCurrency: t.fiatCurrency,
          paymentMethod: t.paymentMethod,
          hasNewMessages: t.hasNewMessages,
        })));
      }
      if (compData?.success) {
        const arr = Array.isArray(compData.data) ? compData.data : compData.data.trades;
        setCompletedTrades(arr.map((t: any) => ({
          id: t.id,
          tradeHash: t.tradeHash,
          platform: t.platform,
          amount: t.amount || 0,
          status: t.status,
          createdAt: t.createdAt,
          ownerUsername: t.ownerUsername,
          responderUsername: t.responderUsername,
          cryptoCurrencyCode: t.cryptoCurrencyCode,
          fiatCurrency: t.fiatCurrency,
          paymentMethod: t.paymentMethod,
          accountId: t.accountId,
        })));
      }
      if (allData?.success) {
        const arr = Array.isArray(allData.data) ? allData.data : allData.data.trades;
        const mapped = arr.map((t: any) => ({
          id: t.id,
          tradeHash: t.tradeHash,
          platform: t.platform || 'Unknown',
          amount: t.amount || 0,
          status: t.status || 'Unknown',
          createdAt: t.createdAt || new Date().toISOString(),
          ownerUsername: t.ownerUsername || 'N/A',
          responderUsername: t.assignedPayer?.fullName || t.responderUsername || 'N/A',
          cryptoCurrencyCode: t.cryptoCurrencyCode || 'N/A',
          fiatCurrency: t.fiatCurrency || 'N/A',
          paymentMethod: t.paymentMethod || 'N/A',
          accountId: t.accountId || (t.trade && t.trade.accountId) || t.account_id,
          messageCount: t.messageCount || 0,
          hasNewMessages: (t.messageCount || 0) > 0,
          isLive: t.isLive || false,
        }));
        setAllTrades(mapped);
        checkForNewMessages(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const sendNotification = async (trade: Trade, newCount: number) => {
    if (!trade.responderUsername || !trade.tradeHash) return;
    try {
      await createNotification({
        userId: trade.responderUsername,
        title: "New Trade Message",
        description: `Trade ${trade.tradeHash} has ${newCount} new message${newCount > 1 ? 's' : ''}`,
        type: "system",
        priority: "medium",
        relatedAccountId: trade.accountId,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  
  const checkForNewMessages = (trades: Trade[]) => {
    if (initialLoad.current) {
      initialLoad.current = false;
      previousMessageCounts.current = trades.reduce((acc, t) => {
        const key = t.tradeHash || t.id || '';
        return { ...acc, [key]: t.messageCount || 0 };
      }, {});
      return;
    }
    
    trades.forEach(t => {
      const key = t.tradeHash || t.id || '';
      const prev = previousMessageCounts.current[key] || 0;
      const curr = t.messageCount || 0;
      if (curr > prev && t.responderUsername) sendNotification(t, curr - prev);
    });
    
    previousMessageCounts.current = trades.reduce((acc, t) => {
      const key = t.tradeHash || t.id || '';
      return { ...acc, [key]: t.messageCount || 0 };
    }, {});
  };


  useEffect(() => {
    fetchData(true); 
    refreshInterval.current = setInterval(() => {
      fetchData(false);
    }, 3000);
  
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);
  


  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const applyFilter = (filterType: "latest" | "oldest") => {
    setFilter(filterType);
    handleFilterClose();
  };

  const clearFilter = () => {
    setFilter("");
    setSortConfig({ field: "", direction: "asc" });
    handleFilterClose();
  };

  const handleSort = (field: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
  };

  const filterAndSortData = (data: Trade[]) => {
    let filteredData = [...data];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter((trade) => {
        return (
          (trade.tradeHash?.toLowerCase().includes(searchLower)) ||
          (trade.platform?.toLowerCase().includes(searchLower)) ||
          (trade.amount?.toString().includes(searchTerm)) ||
          (trade.status?.toLowerCase().includes(searchLower)) ||
          (trade.escalatedBy?.fullName?.toLowerCase().includes(searchLower)) ||
          (trade.assignedCcAgent?.fullName?.toLowerCase().includes(searchLower)) ||
          (trade.reason?.toLowerCase().includes(searchLower)) ||
          (trade.responderUsername?.toLowerCase().includes(searchLower)) ||
          (trade.ownerUsername?.toLowerCase().includes(searchLower)) ||
          (trade.cryptoCurrencyCode?.toLowerCase().includes(searchLower)) ||
          (trade.fiatCurrency?.toLowerCase().includes(searchLower)) ||
          (trade.paymentMethod?.toLowerCase().includes(searchLower))
        );
      });
    }

    if (filter === "latest") {
      filteredData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filter === "oldest") {
      filteredData.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    if (sortConfig.field) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.field];
        const bValue = (b as any)[sortConfig.field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (sortConfig.field === 'createdAt') {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return sortConfig.direction === "asc"
            ? aDate - bDate
            : bDate - aDate;
        }

        return 0;
      });
    }

    return filteredData;
  };

  const filteredEscalatedTrades = filterAndSortData(escalatedTrades);
  const filteredCompletedTrades = filterAndSortData(completedTrades);
  const filteredAllTrades = filterAndSortData(allTrades);

  const refreshData = async () => {
    await fetchData(true).catch(err => console.error("Error refreshing data:", err));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
            Customer Support Center
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Manage escalated trades and customer issues
          </Typography>
        </Box>
        <Box className="flex items-center gap-4">
        <ExportButtons
  data={
    tabValue === 0
      ? filteredEscalatedTrades
      : tabValue === 1
        ? filteredCompletedTrades // Corrected to allTrades for Vendors Trade
        : filteredAllTrades  // Corrected to completedTrades for AF Trades
  }
  type={
    tabValue === 0
      ? "escalatedTrades"
      : tabValue === 1
        ? "allTrades"   // Corrected type for Vendors Trade
        : "completedTrades" // Corrected type for AF Trades
  }
/>

        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              minWidth: 120,
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              "&.Mui-selected": { color: "primary.main" },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 3,
            },
          }}
        >
          <Tab icon={<ErrorOutline sx={{ mr: 1 }} />} iconPosition="start" label="Escalated" />
          <Tab icon={<SupportAgent sx={{ mr: 1 }} />} iconPosition="start" label="Vendors Trade" />
          <Tab icon={<Assignment sx={{ mr: 1 }} />} iconPosition="start" label="AF Trades" />
        </Tabs>
      </Box>

      {/* Search and Filter Section */}
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <TextField
          placeholder="Search trades..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: "100%", md: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            endIcon={<Sort />}
            onClick={handleFilterClick}
            sx={{
              textTransform: "none",
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
          >
            {filter ? `Sorted: ${filter === "latest" ? "Latest" : "Oldest"}` : "Sort By"}
          </Button>
          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
            <MenuItem onClick={() => applyFilter("latest")}>
              <Box className="flex items-center gap-2">
                <ArrowUpward fontSize="small" />
                <Typography>Latest First</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => applyFilter("oldest")}>
              <Box className="flex items-center gap-2">
                <ArrowDownward fontSize="small" />
                <Typography>Oldest First</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={clearFilter}>
              <Typography color="error">Clear Filter</Typography>
            </MenuItem>
          </Menu>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={refreshData}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {tabValue === 0
              ? escalatedTrades.length
              : tabValue === 1
                ? completedTrades.length
                : allTrades.length}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {tabValue === 0
              ? "Total Escalations"
              : tabValue === 1
                ? "Total Completed"
                : "Total Trades"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {tabValue === 0
              ? `${filteredEscalatedTrades.length} match current filters`
              : tabValue === 1
                ? `${filteredCompletedTrades.length} match current filters`
                : `${filteredAllTrades.length} match current filters`}
          </Typography>
        </Paper>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Trade ID",
                  "Platform",
                  "Owner",
                  "Username",
                  "Amount",
                  "Status",
                  "Date",
                  "Reason",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      py: 2,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
                  >
                    <Box className="flex items-center gap-1">
                      {header}
                      {sortConfig.field === header.toLowerCase().replace(" ", "") && (
                        sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEscalatedTrades.length > 0 ? (
                filteredEscalatedTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        {trade.hasNewMessages && <Badge color="error" variant="dot" />}
                        <Typography sx={{ fontWeight: 500 }}>
                          {trade.tradeHash || trade.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{trade.platform}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.ownerUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.responderUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                      {trade.amount?.toLocaleString()} {trade.fiatCurrency}
                    </TableCell>
                    <TableCell>
                      <Chip label={trade.status} size="small" sx={{ ...getStatusStyles(trade.status), fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(trade.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={trade.reason || "No reason provided"}>
                        <Typography sx={{ fontSize: "0.75rem" }}>
                          {trade.reason?.substring(0, 50) || "No reason provided"}
                          {trade.reason && trade.reason.length > 50 && "..."}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        to={`/escalated-trade/${trade.id}`}
                        sx={{
                          bgcolor: "primary.main",
                          color: "black",
                          "&:hover": { bgcolor: "secondary.main" },
                          textTransform: "none",
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {escalatedTrades.length === 0 ? "No escalated trades found" : "No trades match your search/filters"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Trade ID", "Platform", "Owner", "Username", "Amount", "Status", "Date", "Actions"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      py: 2,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
                  >
                    <Box className="flex items-center gap-1">
                      {header}
                      {sortConfig.field === header.toLowerCase().replace(" ", "") && (
                        sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompletedTrades.length > 0 ? (
                filteredCompletedTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {trade.tradeHash || trade.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{trade.platform}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.ownerUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.responderUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                      {trade.amount?.toLocaleString()} {trade.fiatCurrency}
                    </TableCell>
                    <TableCell>
                      <Chip label={trade.status} size="small" sx={{ ...getStatusStyles(trade.status), fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(trade.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        to={`/trade/details/${trade.platform}/${trade.tradeHash}/${trade.accountId}`}
                        sx={{
                          bgcolor: "primary.main",
                          color: "black",
                          "&:hover": { bgcolor: "secondary.main" },
                          textTransform: "none",
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {completedTrades.length === 0 ? "No completed trades found" : "No trades match your search/filters"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Trade ID", "Platform", "Owner", "Username", "Amount", "Status", "Date", "Message", "Actions"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      py: 2,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
                  >
                    <Box className="flex items-center gap-1">
                      {header}
                      {sortConfig.field === header.toLowerCase().replace(" ", "") && (
                        sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAllTrades.length > 0 ? (
                filteredAllTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        {trade.hasNewMessages && <Badge color="error" variant="dot" />}
                        <Typography sx={{ fontWeight: 500 }}>
                          {trade.tradeHash || trade.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{trade.platform}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.ownerUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem" }}>
                        {trade.responderUsername || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                      {trade.amount?.toLocaleString()} {trade.fiatCurrency}
                    </TableCell>
                    <TableCell>
                      <Chip label={trade.status} size="small" sx={{ ...getStatusStyles(trade.status), fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(trade.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={trade.messageCount}>
                        <Typography sx={{ fontSize: "0.75rem" }}>{trade.messageCount}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        to={`/trade/details/${trade.platform}/${trade.tradeHash}/${trade.accountId}`}
                        sx={{
                          bgcolor: "primary.main",
                          color: "black",
                          "&:hover": { bgcolor: "secondary.main" },
                          textTransform: "none",
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {allTrades.length === 0 ? "No trades found" : "No trades match your search/filters"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default CustomerSupport;
