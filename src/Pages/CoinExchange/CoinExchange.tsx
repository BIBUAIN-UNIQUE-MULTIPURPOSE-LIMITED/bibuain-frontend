/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CopyAll } from "@mui/icons-material";
import { api, createNotification } from "../../api/user";
import { ResInterface } from "../../lib/interface";
import Loading from "../../Components/Loading";
import { getCapRates, updateCapRates, getVendorCoin } from "../../api/trade";
import toast from "react-hot-toast";

enum UserType {
  ADMIN = "admin",
  PAYER = "payer", 
  RATER = "rater",
  CEO = "ceo",
  CC = "customer-support"
}

interface User {
  id: string;
  userType: UserType;
}


const getBalance = (balances: any[], currency: string): number => {
  const found = balances.find(
    (b) => b.currency.toUpperCase() === currency.toUpperCase()
  );
  if (!found) return 0;

  const raw = typeof found.balance === 'string' ? 
    parseFloat(found.balance) : 
    found.balance;
    
  return raw; 
};

const BalanceCheckUI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [activeFundedCoin, setActiveFundedCoin] = useState<{ btc: number; usdt: number }>({
    btc: 0,
    usdt: 0
  });
  const [capitalLimit, setCapitalLimit] = useState<number>(100);
  // New loading state for the cap
  const [capLoading, setCapLoading] = useState(false);
  const [vendorCoin, setVendorCoin] = useState<{ btc: number; usdt: number }>({
    btc: 0,
    usdt: 0
  });
  
  const [hasNotifiedExcess, setHasNotifiedExcess] = useState(false);


  // Separate Computations for Paxful/Noones vs Binance
  const totalWalletBTCNoonesPaxful = Object.values(balances).reduce(
    (acc, account: any) => {
      if (
        ["noones", "paxful"].includes(account.platform) &&
        Array.isArray(account.balances)
      ) {
        return acc + getBalance(account.balances, "BTC");
      }
      return acc;
    },
    0
  );

  const totalWalletUSDTNoonesPaxful = Object.values(balances).reduce(
    (acc, account: any) => {
      if (
        ["noones", "paxful"].includes(account.platform) &&
        Array.isArray(account.balances)
      ) {
        return acc + getBalance(account.balances, "USDT");
      }
      return acc;
    },
    0
  );

  const totalWalletBTCBinance = Object.values(balances).reduce(
    (acc, account: any) => {
      if (account.platform === "binance" && Array.isArray(account.balances)) {
        return acc + getBalance(account.balances, "BTC");
      }
      return acc;
    },
    0
  );
  
  const totalWalletUSDTBinance = Object.values(balances).reduce(
    (acc, account: any) => {
      if (account.platform === "binance" && Array.isArray(account.balances)) {
        return acc + getBalance(account.balances, "USDT");
      }
      return acc;
    },
    0
  );
  

  // Helper function to format crypto amounts (for example, if amounts are in satoshis)
  const formatCryptoAmount = (amount: number): string => {
    return amount.toFixed(8) + " BTC";
  };

  
  // API call to fetch wallet balances.
  const fetchWalletBalances = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response: ResInterface = await api.get("/trade/wallet-balances");
      if (response?.success) {
        setBalances(response.data);
      }
    } catch (err) {
      console.error("Error fetching wallet balances:", err);
      
    } finally {
      setIsLoading(false);
    }
  };

  // API call to fetch the live total active funded coin.
  const fetchActiveFundedCoin = async () => {
    try {
      const response: ResInterface = await api.get("/trade/active-funded-coin");
      if (response?.success) {
        const rawUSDT = response.data.usdt;      
        const realUSDT = rawUSDT / 10 ** 6;
        setActiveFundedCoin({
          btc: response.data.btc,
          usdt: realUSDT
        });        
      }
    } catch (err) {
      console.error("Error fetching active funded coin:", err);
    }
  };
  
  // Fetch the current capital limit (market cap) from the backend.
  const fetchCap = async () => {
    setCapLoading(true);
    try {
      const res = await getCapRates();
      if (res && res.data) {
        setCapitalLimit(Number(res.data.marketcap) / 1e8);
        toast.success("Cap Limit has been updated");
      }
    } catch (err) {
      console.error("Error fetching capital limit:", err);
    } finally {
      setCapLoading(false);
    }
  };

  const handleSetCap = async () => {
    try {
      const capInSatoshis = capitalLimit * 1e8;
      const res = await updateCapRates({ marketCap: capInSatoshis });
      if (res) {
        setCapitalLimit(capitalLimit);
        toast.success("Cap limit updated!");
      }
    } catch (err) {
      console.error("Error updating capital limit:", err);
      toast.error("Error updating cap. Please try again.");
    }
  };
  
  

  const fetchVendorCoin = async () => {
    try {
      const res = await getVendorCoin();
      if (res?.success) {
        setVendorCoin({
          btc: res.data.btc,
          usdt: res.data.usdt
        });
      }
    } catch (error) {
      console.error("Error fetching vendor coin:", error);
    }
  };
  

  // Total Coin is the sum of wallet BTC, active funded coin, and vendor coin.
  // Default to 0 if undefined or null
const totalCoin = (totalWalletBTCNoonesPaxful || 0) + (totalWalletBTCBinance || 0) + (vendorCoin.btc || 0);
const totalCoinUSDT = (totalWalletUSDTNoonesPaxful || 0) + (totalWalletUSDTBinance || 0) - (vendorCoin.usdt || 0);

// Default to 0 if undefined or null
const excessCoins = totalCoin - capitalLimit;

const [currentUser, setCurrentUser] = useState<User | null>(null);

useEffect(() => {
  api.get("/user/me")
    .then((response) => {
      setCurrentUser(response.data);
    })
    .catch(console.error);
}, []);

useEffect(() => {
  if (currentUser?.userType === "rater" && excessCoins > 0 && !hasNotifiedExcess) {
    createNotification({
      userId: currentUser.id,
      title: "Excess coin detected",
      description: `You have ${excessCoins.toFixed(4)} BTC above your cap.`,
      type: "system",
      priority: "high"
    })
    .then(() => setHasNotifiedExcess(true))
    .catch(console.error);
  }
}, [currentUser, excessCoins, hasNotifiedExcess]);


useEffect(() => {
  // initial load — show the global loader
  fetchWalletBalances(true);
  fetchActiveFundedCoin();
  fetchCap();
  fetchVendorCoin();
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchWalletBalances(false);
    fetchActiveFundedCoin();
    fetchVendorCoin();
  }, 10000);
  return () => clearInterval(interval);
}, []);

  const formatUSDT = (amount: number | undefined): string =>
    (amount || 0).toFixed(2) + " USDT";

  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
  };

  // Copy helper.
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  if (isLoading) return <Loading />;

  return (
    <Box className="min-h-screen bg-white font-primary p-6 rounded-md px-8">
      {/* Top Section */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-semibold text-gray-800">
          Coin Exchange Page
        </Typography>
        <Box className="flex items-center gap-4">
          <FormControl size="small" className="w-40">
            <InputLabel>Filter</InputLabel>
            <Select value={filter} onChange={handleFilterChange} label="Filter">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="usdt">USDT Only</MenuItem>
              <MenuItem value="btc">BTC Only</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchWalletBalances(true);
              fetchActiveFundedCoin();
              fetchCap();
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Two Column Layout */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" className="mb-2">
                Total Coin
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{totalCoin.toFixed(8)|| 0} </Typography>

                <Typography>{formatUSDT(totalCoinUSDT) || 0} </Typography>
                <IconButton onClick={() => handleCopy(totalCoin.toFixed(3))}>
                  <CopyAll />
                </IconButton>
              </Box>
              
            </CardContent>
          </Card>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
              mt: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" className="mb-2">
                Excess Coin
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{excessCoins.toFixed(8)} </Typography>
                <IconButton onClick={() => handleCopy(excessCoins.toFixed(8))}>
                  <CopyAll />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
              mt: 2,
            }}
          >
<CardContent>
  <Typography variant="h6" className="mb-2">
    Cap
  </Typography>
  <Box display="flex" alignItems="center" justifyContent="space-between">
    {capLoading ? (
      <CircularProgress size={20} />
    ) : (
      <Typography>
        {capitalLimit.toFixed(8)} BTC
      </Typography>
    )}
    <IconButton onClick={() => handleCopy(capitalLimit.toFixed(8))}>
      <CopyAll />
    </IconButton>
  </Box>
  {/* Input to set a new cap and a Set button */}
  <Box mt={2} display="flex" gap={1}>
    <TextField
      label="Set New Cap (BTC)"
      type="number"
      value={capitalLimit}
      onChange={(e) =>
        setCapitalLimit(parseFloat(e.target.value) || 0)
      }
      variant="outlined"
      size="small"
      fullWidth
      inputProps={{ step: "0.0001" }}
    />
    <Button variant="contained" onClick={handleSetCap}>
      Set
    </Button>
  </Box>
</CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" className="mb-2">
                Wallet Balances Coin
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>
                    (Paxful and Noones)
                    <br/>
                     BTC: {(totalWalletBTCNoonesPaxful.toFixed(8))},
                     <br/> USDT: {totalWalletUSDTNoonesPaxful.toFixed(2)}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      handleCopy(
                        `Paxful/Noones: BTC ${totalWalletBTCNoonesPaxful.toFixed(
                          8
                        )}, USDT ${totalWalletUSDTNoonesPaxful.toFixed(2)}`
                      )
                    }
                  >
                    <CopyAll />
                  </IconButton>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>
                    Binance
                    <br/>
                     BTC: {totalWalletBTCBinance.toFixed(8)},
                     <br/> USDT: {totalWalletUSDTBinance.toFixed(2)}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      handleCopy(
                        `Binance: BTC ${totalWalletBTCBinance.toFixed(
                          8
                        )}, USDT ${totalWalletUSDTBinance.toFixed(2)}`
                      )
                    }
                  >
                    <CopyAll />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
              mt: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" className="mb-2">
                Active Funded Coin
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>
                  {activeFundedCoin
                    ? formatCryptoAmount(activeFundedCoin.btc || 0)
                    : "0"}{" "}
                  
                </Typography>
                <Typography>
                  {activeFundedCoin
                    ? formatUSDT(activeFundedCoin.usdt || 0)
                    : "0"}{" "}
                </Typography>
                <IconButton onClick={() => handleCopy(`${activeFundedCoin.btc.toFixed(3)} BTC, ${activeFundedCoin.usdt.toFixed(2)} USDT`)}>
    <CopyAll />
  </IconButton>
              </Box>
            </CardContent>
          </Card>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 2,
              mt: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" className="mb-2">
                Vendor Coin
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{formatCryptoAmount(vendorCoin.btc || 0)} </Typography>
                <Typography>{formatUSDT(vendorCoin.usdt || 0)}</Typography>
                <IconButton onClick={() => handleCopy(`${vendorCoin.btc.toFixed(3)} BTC, ${vendorCoin.usdt.toFixed(2)} USDT`)}>
    <CopyAll />
  </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BalanceCheckUI;
