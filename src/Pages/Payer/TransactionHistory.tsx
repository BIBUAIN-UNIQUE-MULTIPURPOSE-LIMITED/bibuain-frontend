/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Search,
  FilterList,
  Download,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Close,
} from "@mui/icons-material";
import { useUserContext } from "../../Components/ContextProvider";
import ClockedAlt from "../../Components/ClockedAlt";
import { getCompletedPayerTrades } from "../../api/trade";
import {
  exportTxHistoryCSV,
  exportTxHistoryPDF,
  TxHistoryRow,
} from "../../lib/transactionHistoryExporter";

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

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
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

// Local storage keys for persistence
const RESET_TIME_KEY = "tx_history_reset_time";
const CLOCKED_STATUS_KEY = "tx_history_clocked_status";

const TransactionHistory: React.FC = () => {
  const { user } = useUserContext();
  const userType = user?.userType;
  const isPrivileged = ["payer"].includes(userType || "");

  const [transactions, setTransactions] = useState<Trade[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [dateRange, setDateRange] = useState<"" | "today" | "week" | "month">("");
  const [sortConfig, setSortConfig] = useState<{
    field: keyof Trade | "";
    direction: "asc" | "desc";
  }>({ field: "", direction: "asc" });

  // More filters state
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [speedFilter, setSpeedFilter] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 300 });
  const [amountFilter, setAmountFilter] = useState<{
    minBtc: number;
    maxBtc: number;
    minNgn: number;
    maxNgn: number;
  }>({ minBtc: 0, maxBtc: 10, minNgn: 0, maxNgn: 10000000 });
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [payers, setPayers] = useState<{ id: string; name: string }[]>([]);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [resetActive, setResetActive] = useState(false);

  // Get unique banks and platforms for filter options
  const bankOptions = useMemo(() => {
    const banks = new Set<string>();
    transactions.forEach(tx => banks.add(tx.payingBank));
    return Array.from(banks);
  }, [transactions]);

  const platformOptions = useMemo(() => {
    const platforms = new Set<string>();
    transactions.forEach(tx => platforms.add(tx.platformAccount));
    return Array.from(platforms);
  }, [transactions]);

  // Set default payer to the logged-in user's name
  useEffect(() => {
    if (user?.id && user?.fullName) {
      setSelectedPayer(user.id);
      setPayers(prev => {
        const exists = prev.some(p => p.id === user.id);
        return exists ? prev : [...prev, { id: user.id, name: user.fullName }];
      });
    }
  }, [user]);

  // Load reset time from localStorage on component mount
  useEffect(() => {
    const savedResetTime = localStorage.getItem(RESET_TIME_KEY);
    const savedClockedStatus = localStorage.getItem(CLOCKED_STATUS_KEY);
    
    if (savedResetTime) {
      const resetDate = new Date(savedResetTime);
      if (resetDate > new Date()) {
        setResetTime(resetDate);
        setShowResetAlert(true);
        setResetActive(true);
      } else {
        localStorage.removeItem(RESET_TIME_KEY);
        localStorage.removeItem(CLOCKED_STATUS_KEY);
      }
    }
    
    if (savedClockedStatus && user) {
      const storedStatus = JSON.parse(savedClockedStatus);
      if (storedStatus === false && user.clockedIn === true) {
        localStorage.removeItem(RESET_TIME_KEY);
        localStorage.removeItem(CLOCKED_STATUS_KEY);
        setResetTime(null);
        setShowResetAlert(false);
        setResetActive(false);
      }
    }
  }, [user]);

  // Clock-out reset logic
  useEffect(() => {
    if (!user) return;

    localStorage.setItem(CLOCKED_STATUS_KEY, JSON.stringify(user.clockedIn));

    if (user.clockedIn === false && !resetActive) {
      const reset = new Date();
      reset.setHours(reset.getHours() + 2);
      setResetTime(reset);
      setShowResetAlert(true);
      setResetActive(true);
      localStorage.setItem(RESET_TIME_KEY, reset.toISOString());

      const timer = setTimeout(() => {
        handleManualReset();
      }, reset.getTime() - Date.now());

      return () => clearTimeout(timer);
    } else if (user.clockedIn === true && resetActive) {
      handleManualReset();
    }
  }, [user, user?.clockedIn, resetActive]);

  // Fetch from API
  const fetchTrades = useCallback(async () => {
    if (!user) return;
    
    if (resetActive && resetTime && new Date() >= resetTime) {
      handleManualReset();
      return;
    }
    
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

      // Add more filters to params if they exist
      if (speedFilter.min > 0 || speedFilter.max < 300) {
        params.speedMin = speedFilter.min;
        params.speedMax = speedFilter.max;
      }
      if (amountFilter.minBtc > 0 || amountFilter.maxBtc < 10) {
        params.btcMin = amountFilter.minBtc;
        params.btcMax = amountFilter.maxBtc;
      }
      if (amountFilter.minNgn > 0 || amountFilter.maxNgn < 10000000) {
        params.ngnMin = amountFilter.minNgn;
        params.ngnMax = amountFilter.maxNgn;
      }
      if (selectedBanks.length > 0) {
        params.banks = selectedBanks.join(',');
      }
      if (selectedPlatforms.length > 0) {
        params.platforms = selectedPlatforms.join(',');
      }

      const res = await getCompletedPayerTrades(params);
      if (!res?.success) throw new Error(res?.message || "Fetch failed");

      setTransactions(res.data.trades);
      setPagination(res.data.pagination);

      if (isPrivileged) {
        const map = new Map<string, { id: string; name: string }>();
        res.data.trades.forEach((t: any) => {
          if (t.assignedPayer?.id) {
            map.set(t.assignedPayer.id, t.assignedPayer);
          }
        });
        setPayers(Array.from(map.values()));
      }
    } catch (err: any) {
      setError(err.message || "Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    dateRange,
    selectedPayer,
    isPrivileged,
    resetTime,
    resetActive,
    speedFilter,
    amountFilter,
    selectedBanks,
    selectedPlatforms,
  ]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Manual reset handler
  const handleManualReset = () => {
    setTransactions([]);
    setShowResetAlert(false);
    setResetTime(null);
    setResetActive(false);
    localStorage.removeItem(RESET_TIME_KEY);
    localStorage.removeItem(CLOCKED_STATUS_KEY);
    fetchTrades();
  };

  // More filters handlers
  const handleMoreFilters = () => {
    setShowMoreFilters(true);
  };

  const handleCloseMoreFilters = () => {
    setShowMoreFilters(false);
  };

  const handleApplyMoreFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowMoreFilters(false);
    fetchTrades();
  };

  const handleResetMoreFilters = () => {
    setSpeedFilter({ min: 0, max: 300 });
    setAmountFilter({ minBtc: 0, maxBtc: 10, minNgn: 0, maxNgn: 10000000 });
    setSelectedBanks([]);
    setSelectedPlatforms([]);
  };

  const handleBankToggle = (bank: string) => {
    setSelectedBanks(prev =>
      prev.includes(bank)
        ? prev.filter(b => b !== bank)
        : [...prev, bank]
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Export handlers
  const handleExportPDF = () => exportTxHistoryPDF(rows);
  const handleExportCSV = () => exportTxHistoryCSV(rows);

  // UI Handlers
  const handlePageChange = (_: any, page: number) =>
    setPagination((p) => ({ ...p, currentPage: page }));
  const handleItemsPerPageChange = (e: any) =>
    setPagination((p) => ({
      ...p,
      itemsPerPage: +e.target.value,
      currentPage: 1,
    }));
  const handleSort = (field: keyof Trade) =>
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, currentPage: 1 }));
    fetchTrades();
  };
  

  // Memoize filtered, sorted data
  const displayed = useMemo(() => {
    let arr = [...transactions];

    if (searchTerm) {
      const lc = searchTerm.toLowerCase();
      arr = arr.filter(
        (tx) =>
          tx.platformAccount.toLowerCase().includes(lc) ||
          tx.tradeHash.toLowerCase().includes(lc) ||
          tx.sellerUsername.toLowerCase().includes(lc)
      );
    }
    if (selectedPayer) {
      arr = arr.filter((tx) => tx.assignedPayer.id === selectedPayer);
    }
    if (dateRange === "today") {
      const today = new Date().toDateString();
      arr = arr.filter((tx) => new Date(tx.openedAt).toDateString() === today);
    } else if (dateRange === "week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      arr = arr.filter((tx) => new Date(tx.openedAt).getTime() >= weekAgo);
    } else if (dateRange === "month") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      arr = arr.filter((tx) => new Date(tx.openedAt).getTime() >= monthAgo);
    }

    // Apply more filters locally (in case backend doesn't support them)
    if (speedFilter.min > 0 || speedFilter.max < 300) {
      arr = arr.filter(tx => 
        tx.payerSpeed >= speedFilter.min && tx.payerSpeed <= speedFilter.max
      );
    }
    if (amountFilter.minBtc > 0 || amountFilter.maxBtc < 10) {
      arr = arr.filter(tx => 
        (tx.btcBought / 1e8) >= amountFilter.minBtc && 
        (tx.btcBought / 1e8) <= amountFilter.maxBtc
      );
    }
    if (amountFilter.minNgn > 0 || amountFilter.maxNgn < 10000000) {
      arr = arr.filter(tx => 
        tx.ngnPaid >= amountFilter.minNgn && 
        tx.ngnPaid <= amountFilter.maxNgn
      );
    }
    if (selectedBanks.length > 0) {
      arr = arr.filter(tx => selectedBanks.includes(tx.payingBank));
    }
    if (selectedPlatforms.length > 0) {
      arr = arr.filter(tx => selectedPlatforms.includes(tx.platformAccount));
    }

    if (sortConfig.field) {
      arr.sort((a, b) => {
        const aVal = a[sortConfig.field] as any;
        const bVal = b[sortConfig.field] as any;
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [
    transactions,
    searchTerm,
    selectedPayer,
    dateRange,
    sortConfig,
    speedFilter,
    amountFilter,
    selectedBanks,
    selectedPlatforms,
  ]);

  const rows: TxHistoryRow[] = displayed.map((tx, idx) => ({
    serial: (pagination.currentPage - 1) * pagination.itemsPerPage + idx + 1,
    payer: tx.assignedPayer.name,
    payingBank: tx.payingBank,
    platformAccount: tx.platformAccount,
    tradeHash: tx.tradeHash,
    sellerUsername: tx.sellerUsername,
    btcBought: (tx.btcBought / 1e8).toFixed(8) + " BTC",
    ngnPaid: tx.ngnPaid.toLocaleString(),
    openedAt: new Date(tx.openedAt).toLocaleString(),
    paidAt: new Date(tx.paidAt).toLocaleString(),
    payerSpeed: tx.payerSpeed,
    ngnSellingPrice: tx.ngnSellingPrice.toLocaleString(),
    ngnCostPrice: tx.ngnCostPrice.toLocaleString(),
    usdCost: tx.usdCost.toString(),
  }));

  // Render
  if (!user?.clockedIn && !isPrivileged) return <ClockedAlt />;
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchTrades} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Transaction History
          </Typography>
          <Typography color="text.secondary">
            {isPrivileged
              ? "All payers' completed trades"
              : "Your completed trades only"}
          </Typography>
        </Box>           

        {/* Filters & Export */}
        <HeaderCard>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
              <form
                onSubmit={handleSearchSubmit}
                style={{ display: "flex", gap: "1rem" }}
              >
                <TextField
                  size="small"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: "text.secondary", mr: 1 }} />
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
                <Button type="submit" variant="contained" size="small">
                  Search
                </Button>
              </form>

              {isPrivileged && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Payer</InputLabel>
                  <Select
                    value={selectedPayer}
                    label="Payer"
                    onChange={(e) => setSelectedPayer(e.target.value as string)}
                  >
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
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value as any)}
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterList />}
                onClick={handleMoreFilters}
              >
                More Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchTrades}
              >
                Refresh
              </Button>
              {!showResetAlert && !isPrivileged && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleManualReset}
                >
                  Clear History
                </Button>
              )}
            </Box>
          </Box>
        </HeaderCard>

        {/* More Filters Dialog */}
        <Dialog
          open={showMoreFilters}
          onClose={handleCloseMoreFilters}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">More Filters</Typography>
              <Button onClick={handleCloseMoreFilters}>
                <Close />
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Payer Speed (seconds)
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  type="number"
                  label="Min"
                  value={speedFilter.min}
                  onChange={(e) => 
                    setSpeedFilter({...speedFilter, min: Number(e.target.value)})
                  }
                  size="small"
                />
                <Typography>to</Typography>
                <TextField
                  type="number"
                  label="Max"
                  value={speedFilter.max}
                  onChange={(e) => 
                    setSpeedFilter({...speedFilter, max: Number(e.target.value)})
                  }
                  size="small"
                />
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Amount Filters
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box>
                  <Typography variant="body2">BTC Amount</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      type="number"
                      label="Min BTC"
                      value={amountFilter.minBtc}
                      onChange={(e) => 
                        setAmountFilter({...amountFilter, minBtc: Number(e.target.value)})
                      }
                      size="small"
                    />
                    <Typography>to</Typography>
                    <TextField
                      type="number"
                      label="Max BTC"
                      value={amountFilter.maxBtc}
                      onChange={(e) => 
                        setAmountFilter({...amountFilter, maxBtc: Number(e.target.value)})
                      }
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2">NGN Amount</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      type="number"
                      label="Min NGN"
                      value={amountFilter.minNgn}
                      onChange={(e) => 
                        setAmountFilter({...amountFilter, minNgn: Number(e.target.value)})
                      }
                      size="small"
                    />
                    <Typography>to</Typography>
                    <TextField
                      type="number"
                      label="Max NGN"
                      value={amountFilter.maxNgn}
                      onChange={(e) => 
                        setAmountFilter({...amountFilter, maxNgn: Number(e.target.value)})
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Banks
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {bankOptions.map((bank) => (
                  <FormControlLabel
                    key={bank}
                    control={
                      <Checkbox
                        checked={selectedBanks.includes(bank)}
                        onChange={() => handleBankToggle(bank)}
                      />
                    }
                    label={bank}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Platform Accounts
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {platformOptions.map((platform) => (
                  <FormControlLabel
                    key={platform}
                    control={
                      <Checkbox
                        checked={selectedPlatforms.includes(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                      />
                    }
                    label={platform}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleResetMoreFilters}>Reset Filters</Button>
            <Button onClick={handleCloseMoreFilters}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleApplyMoreFilters}
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Table */}
        {displayed.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>No transactions found.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: 1,
                overflow: "auto",
                maxHeight: "calc(100vh - 400px)",
              }}
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
                        onClick={() => handleSort(col.id as any)}
                        sx={{
                          cursor: "pointer",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          py: 3,
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography fontWeight={600}>{col.label}</Typography>
                          {sortConfig.field === col.id &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            ))}
                        </Box>
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayed
                    .slice(
                      (pagination.currentPage - 1) * pagination.itemsPerPage,
                      pagination.currentPage * pagination.itemsPerPage
                    )
                    .map((tx, idx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          {(pagination.currentPage - 1) *
                            pagination.itemsPerPage +
                            idx +
                            1}
                        </TableCell>
                        <TableCell>{tx.assignedPayer.name}</TableCell>
                        <TableCell>{tx.payingBank}</TableCell>
                        <TableCell>{tx.platformAccount}</TableCell>
                        <TableCell>
                          <Tooltip title={tx.tradeHash}>
                            <Typography
                              noWrap
                              sx={{
                                maxWidth: 180,
                                fontFamily: "monospace",
                                color: "primary.main",
                              }}
                            >
                              {tx.tradeHash}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{tx.sellerUsername}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {(tx.btcBought / 1e8).toFixed(8)} BTC
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {tx.ngnPaid.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            {new Date(tx.openedAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            {new Date(tx.paidAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${tx.payerSpeed}s`}
                            size="small"
                            color={tx.payerSpeed < 90 ? "success" : "warning"}
                            sx={{ minWidth: 70 }}
                          />
                        </TableCell>
                        <TableCell>
                          {tx.ngnSellingPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {tx.ngnCostPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>{tx.usdCost}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <PaginationContainer>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography>
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    displayed.length
                  )}{" "}
                  of {displayed.length} entries
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={pagination.itemsPerPage}
                    onChange={handleItemsPerPageChange as any}
                    size="small"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n} per page
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(displayed.length / pagination.itemsPerPage)}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            </PaginationContainer>

          </>
        )}
      </Container>
    </Box>
  );
};

export default TransactionHistory;