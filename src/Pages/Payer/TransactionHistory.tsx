/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  Tooltip,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  styled,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  FilterList,
  Download,
  Refresh,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useUserContext } from "../../Components/ContextProvider";
import ClockedAlt from "../../Components/ClockedAlt";
import { getCompletedPayerTrades } from "../../api/trade";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

interface Trade {
  id: string;
  assignedPayer: { id: string; name: string };
  payingBank: string;
  platformAccount: string;
  tradeHash: string;
  sellerUsername: string;
  btcBought: number;
  ngnPaid: number;
  openedAt: string;
  paidAt: string;
  payerSpeed: number;
  ngnSellingPrice: number;
  ngnCostPrice: number;
  usdCost: number;
}

const TransactionHistory: React.FC = () => {
  const { user } = useUserContext();
  const userType = user?.userType;
  const isPrivileged = [ "payer"].includes(userType || "");

  const [transactions, setTransactions] = useState<Trade[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPayer, setSelectedPayer] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("today"); // default to today's transactions
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "",
    direction: "asc",
  });
  const [payers, setPayers] = useState<{ id: string; name: string }[]>([]);

  // Ensure non-privileged users filter to themselves
  useEffect(() => {
    if (!isPrivileged && user?.id) {
      setSelectedPayer(user.id);
    }
  }, [isPrivileged, user]);

  const formatBTC = (amount: number): string =>
    (amount / 1e8).toFixed(8) + " BTC";
  
  // const formatUSDT = (amount: number | undefined): string =>
  //   (amount || 0).toFixed(2) + " USDT";

  const formatDateTime = (dateStr: string): string =>
    new Date(dateStr).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  

  // Fetch trades with current filters and pagination
  const fetchTrades = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (dateRange) params.dateRange = dateRange;
      if (isPrivileged) {
        if (selectedPayer) params.payerId = selectedPayer;
      } else {
        params.payerId = user.id;
      }
      console.debug("Fetching completed trades with params:", params);

      const res = await getCompletedPayerTrades(params);
      if (res?.success) {
        setTransactions(res.data.trades);
        setPagination(res.data.pagination);

        if (isPrivileged) {
          // Build unique payer list for dropdown
          const map = new Map<string, { id: string; name: string }>();
          res.data.trades.forEach((t: any) => {
            if (t.assignedPayer?.id && t.assignedPayer.name) {
              map.set(t.assignedPayer.id, {
                id: t.assignedPayer.id,
                name: t.assignedPayer.name,
              });
            }
          });
          setPayers(Array.from(map.values()));
        }
      } else {
        setError(res?.message || "Failed to fetch transactions.");
      }
    } catch (err: any) {
      console.error("Error fetching trades:", err);
      setError(err.message || "Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  }, [user, isPrivileged, selectedPayer, searchTerm, dateRange, pagination.currentPage, pagination.itemsPerPage]);

  // Trigger fetch on mount and when dependencies change
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Handlers
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    // TODO: apply sorting via API or client-side
  };



  // Render loading, error, or content
  if (!user?.clockedIn && !isPrivileged) {
    return <ClockedAlt />;
  }
  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button onClick={fetchTrades} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isPrivileged
              ? "All payers’ completed trades"
              : "Your completed trades only"}
          </Typography>
        </Box>

        {/* Filters */}
        <HeaderCard>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
              <TextField
                size="small"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} /> }}
                sx={{ minWidth: 300 }}
              />

              {isPrivileged && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Payer</InputLabel>
                  <Select value={selectedPayer} label="Payer" onChange={(e) => setSelectedPayer(e.target.value)}>
                    <MenuItem value="">All Payers</MenuItem>
                    {payers.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Date Range</InputLabel>
                <Select value={dateRange} label="Date Range" onChange={(e) => setDateRange(e.target.value)}>
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" startIcon={<FilterList />}>More Filters</Button>
              <Button variant="outlined" startIcon={<Download />}>Export</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTrades}>Refresh</Button>
            </Box>
          </Box>
        </HeaderCard>

        {/* Content */}
        {transactions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No transactions found.</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: 1, overflow: "auto", maxHeight: "calc(100vh - 400px)" }}
          >
            <Table stickyHeader sx={{ minWidth: 2000 }}>
              <TableHead>
                <TableRow>
                  {[
                    { id: "sn", label: "S/N" },
                    { id: "payer", label: "Payer" },
                    { id: "payingBank", label: "Paying Bank" },
                    { id: "platformAccount", label: "Platform Account" },
                    { id: "tradeHash", label: "Trade Hash" },
                    { id: "sellerUsername", label: "Seller Username" },
                    { id: "btcBought", label: "BTC Bought" },
                    { id: "ngnPaid", label: "NGN Paid" },
                    { id: "openedAt", label: "Opened At" },
                    { id: "paidAt", label: "Paid At" },
                    { id: "payerSpeed", label: "Speed (s)" },
                    { id: "ngnSellingPrice", label: "NGN Sell Price" },
                    { id: "ngnCostPrice", label: "NGN Cost Price" },
                    { id: "usdCost", label: "USD Cost" },
                  ].map((col) => (
                    <StyledTableCell
                      key={col.id}
                      onClick={() => handleSort(col.id)}
                      sx={{ cursor: "pointer", position: "sticky", top: 0, zIndex: 1, py: 3, "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2" fontWeight={600}>{col.label}</Typography>
                        {sortConfig.field === col.id &&
                          (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                      </Box>
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, idx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{tx.assignedPayer.name}</TableCell>
                    <TableCell>{tx.payingBank}</TableCell>
                    <TableCell>{tx.platformAccount}</TableCell>
                    <TableCell>
                      <Tooltip title={tx.tradeHash}>
                        <Typography noWrap sx={{ maxWidth: 180, fontFamily: "monospace", color: "primary.main" }}>
                          {tx.tradeHash}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{tx.sellerUsername}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{formatBTC(tx.btcBought)}</TableCell>
                    <TableCell><Typography fontWeight={500}>{(tx.ngnPaid).toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{formatDateTime(tx.openedAt)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{formatDateTime(tx.paidAt)}</Typography></TableCell>
                    <TableCell>
                      <Chip label={`${tx.payerSpeed}s`} size="small" color={tx.payerSpeed < 90 ? "success" : "warning"} sx={{ minWidth: 70 }} />
                    </TableCell>
                    <TableCell>{tx.ngnSellingPrice}</TableCell>
                    <TableCell>{tx.ngnCostPrice}</TableCell>
                    <TableCell>{tx.usdCost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TODO: Pagination controls here, using pagination.currentPage and pagination.totalPages */}
      </Container>
    </Box>
  );
};

export default TransactionHistory;
