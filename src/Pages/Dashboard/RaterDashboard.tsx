/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { BarChart2, Edit } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  Switch,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import {
  getCurrentRates,
  getRaterRates,
  setRaterRates,
  turnOffAllOffers,
  turnOnAllOffers,
  updateOffers,
  getOffersMargin,
  getAccounts,
  updateAccountRates,
  getCapRates,
  updateCapRates,
  // activateDeactivatedOffers,
} from "../../api/trade";
import Loading from "../../Components/Loading";
import MarketCard from "../../Components/MarketCard";
import FilterDialog from "../../Components/FilterDialog";
import toast from "react-hot-toast";
import { successStyles } from "../../lib/constants";
import { useUserContext } from "../../Components/ContextProvider";

// Define interface for filter object
interface FilterType {
  username: string;
  accountDetails: string;
  reason: string;
}

// Define interface for margin data from API
interface MarginData {
  account_username: string;
  platform: string;
  marginBTC?: number;
  marginUSDT?: number;
}

// Define interface for an Account (fetched from backend)
interface Account {
  id: string;
  account_username: string;
  platform: string;
}

// Define interface for per-account rate settings
interface AccountRate {
  costPrice: number;
  markup1: number;
  markup2: number;
}

const RaterDashboard = () => {
  // State Management
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editFilterDialogOpen, setEditFilterDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [autoUpdate, _setAutoUpdate] = useState(true);

  const [margin, setMargin] = useState('0');

  const [marginLoading, setMarginLoading] = useState(false);

  // Offers toggle state
  // Offers toggle state, initialized from localStorage (or false if missing)
  const [offersActive, setOffersActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("offersActive");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [offersLoading, setOffersLoading] = useState(false);

  // For account rates modal:
  const [accountRatesModalOpen, setAccountRatesModalOpen] = useState(false);

  // State for offer toggle modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [pendingOfferValue, setPendingOfferValue] = useState(false);

  const updatingOffersRef = useRef(false);
  const [savingRates, setSavingRates] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Rate States (global/live rates)
  const [rates, setRates] = useState({
    noonesRate: "0",
    paxfulRate: "0",
    binanceRate: "0",
    binanceBtcNgn: "0",
  });

  // Initialize markup2 and usdtNgnRate as numbers.
  const [markup2, setMarkup2] = useState('0');
  const [usdtNgnRate, setUsdtNgnRate] = useState(0);

  // Calculated rates now use only the USDT/NGN rate.
  const [calculatedRates, setCalculatedRates] = useState({
    sellingPrice: 0,
    paxfulBtcNgn: 0,
    noonesBtcNgn: 0,
    paxfulMarkup1: 0,
    noonesMarkup1: 0,
  });

  // State for dynamic per-account rates.
  const [platformRates, setPlatformRates] = useState<Record<string, AccountRate>>({});

  // State for list of registered accounts.
  const [accounts, setAccounts] = useState<Account[]>([]);

  // State for margin data from API.
  const [marginData, setMarginData] = useState<MarginData[]>([]);

  // — Reactivate all deactivated offers
  // const [reactivatingLoading, setReactivatingLoading] = useState(false);


  // Memoize margin data by account for easier lookup.
  const marginByAccount = useMemo(() => {
    const map: Record<string, { marginBTC?: number; marginUSDT?: number }> = {};
    marginData.forEach((item) => {
      map[item.account_username] = {
        marginBTC: item.marginBTC,
        marginUSDT: item.marginUSDT,
      };
    });
    return map;
  }, [marginData]);

  // Global rate calculation based solely on USDT/NGN conversion.
  const calculateRates = useCallback(() => {
    try {
      const binanceBtcUsdt = parseFloat(rates.binanceRate) || 0;
      const paxfulBtcUsdt = parseFloat(rates.paxfulRate) || 0;
      const noonesBtcUsdt = parseFloat(rates.noonesRate) || 0;

      const usdtNgn = Number(usdtNgnRate) || 0;

      const paxfulBtcNgn = paxfulBtcUsdt * usdtNgn;
      const noonesBtcNgn = noonesBtcUsdt * usdtNgn;

      const sellingPrice = binanceBtcUsdt * usdtNgn;

      const paxfulMarkup1 = binanceBtcUsdt < paxfulBtcUsdt
        ? (paxfulBtcUsdt - binanceBtcUsdt) * usdtNgn
        : 0;
      const noonesMarkup1 = binanceBtcUsdt < noonesBtcUsdt
        ? (noonesBtcUsdt - binanceBtcUsdt) * usdtNgn
        : 0;

      setCalculatedRates({
        sellingPrice,
        paxfulBtcNgn,
        noonesBtcNgn,
        paxfulMarkup1,
        noonesMarkup1,
      });
    } catch (error) {
      console.error("Error calculating rates:", error);
      toast.error("Error calculating rates. Please check your inputs.");
    }
  }, [rates, usdtNgnRate]);

  useEffect(() => {
    calculateRates();
  }, [rates, usdtNgnRate, markup2, calculateRates]);

  // Fetch registered accounts.
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await getAccounts();
      if (res?.success && Array.isArray(res.data)) {
        setAccounts(res.data);
        const defaults: Record<string, AccountRate> = {};
        res.data.forEach((acc: Account) => {
          if (["paxful", "noones"].includes(acc.platform.toLowerCase())) {
            defaults[acc.account_username] = {
              costPrice: 0,
              markup1: 0,
              markup2: Number(markup2),
            };
          }
        });
        setPlatformRates(defaults);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }, [markup2]);



  // Auto-update rates every 60 seconds if enabled.
  useEffect(() => {
    let interval: number | undefined;
    if (autoUpdate) {
      interval = window.setInterval(() => {
        fetchRates();
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [autoUpdate]);

  const saveRateSettings = useCallback(async () => {
    setSavingRates(true);
    try {
      const payload = {
        sellingPrice: calculatedRates.sellingPrice,
        usdtNgnRate: Number(usdtNgnRate),
        platformRates,
      };
      const response = await setRaterRates(payload);
      if (response?.success) {
        toast.success("Rates saved successfully!", successStyles);
        

        // After successfully saving rates, check if any markup2 is zero
        const anyZero = Object.values(platformRates).some(
          (rate) => Number(rate.markup2) === 0
        );
        if (anyZero) {
          setAccountRatesModalOpen(true);
        }
        // Then check if offers are off
        else if (!offersActive) {
          setPendingOfferValue(true);
          setOfferModalOpen(true);
        }
        await updateOffersCalculation();
      } else {
        toast.error("Failed to save rates");
      }
    } catch (error) {
      console.error("Error saving rate settings:", error);
      toast.error("Error saving rate settings.");
      setSavingRates(false);
    } finally {
      setSavingRates(false);
    }
  }, [calculatedRates, usdtNgnRate, platformRates, offersActive]);

  const updateOffersCalculation = useCallback(async () => {
    if (updatingOffersRef.current) {
      // console.log("Skipping updateOffersCalculation: already running");
      return;
    }
    updatingOffersRef.current = true;

    try {
      // console.log("Starting offer updates with accounts:", accounts);
      // console.log("Current rates:", calculatedRates, "USDT NGN rate:", margin);

      const updatePromises = accounts
        .filter((acc) => ["paxful", "noones"].includes(acc.platform.toLowerCase()))
        .map(async (account) => {
          const accountPlatform = account.platform.toLowerCase();
          const markup1 =
            accountPlatform === "paxful"
              ? calculatedRates.paxfulMarkup1
              : calculatedRates.noonesMarkup1;
          const markup2 = platformRates[account.account_username]?.markup2 || 0;
          const costPrice = calculatedRates.sellingPrice - markup1 - markup2;

          const offerPayload = {
            account_username: account.account_username,
            platform: accountPlatform,
            costprice: costPrice,
            usdtrate: Number(margin),
          };

          // console.log(`Updating offers for ${account.account_username} with payload:`, offerPayload);

          try {
            const response = await updateOffers(offerPayload);

            if (!response) {
              console.error(`No response received for ${account.account_username}`);
              // toast.error(`No response received for ${account.account_username}`);
              return false;
            }
            const { data } = response;
            // console.log(`Response for ${account.account_username}:`, data);

            if (data && data.success) {
              console.log(`Successfully updated offers for ${account.account_username}`);
              toast.success(`Offer update successful for ${account.account_username}`);
              return true;
            } else {
              console.error(`Failed to update offers for ${account.account_username}`, data);
              // toast.error(`Offer update failed for ${account.account_username}`);
              return false;
            }
          } catch (error) {
            console.error(`Error updating offers for ${account.account_username}:`, error);
            // toast.error(`Offer update error for ${account.account_username}`);
            updatingOffersRef.current = false;

            return false;
          } finally {
            updatingOffersRef.current = false;

          }
        });

      console.log(`Starting ${updatePromises.length} update operations`);
      const updateResults = await Promise.all(updatePromises);
      console.log(`Update results:`, updateResults);
    } catch (error) {
      console.error("Error in updateOffersCalculation:", error);
      // toast.error("Error updating offers.");
    }
  }, [accounts, calculatedRates, margin, platformRates]);


  // Separate function for fetching the margin (BTC/NGN rate).
  const fetchMargin = async () => {
    try {
      const capRes = await getCapRates();
      if (capRes && capRes.data) {
        setMargin(Number(capRes.data.btcngnrate).toFixed(0));
      }
    } catch (error) {
      console.error("Error fetching margin:", error);
      toast.error("Error fetching margin");
    }
  };

  // Fetch offers margin data.
  const fetchMarginData = async () => {
    try {
      const res = await getOffersMargin();
      if (res?.success) {
        // console.log("Margin Data Received:", res.data);
        setMarginData(res.data);
      } else {
        console.error("Margin data fetch failed:", res);
      }
    } catch (error) {
      console.error("Error fetching margin data:", error);
      toast.error("Error fetching margin data");
    }
  };

  const fetchRates = async () => {
    try {
      setRefreshing(true);
      const [currentRates, raterRates] = await Promise.all([
        getCurrentRates(),
        getRaterRates(),
      ]);
      if (currentRates?.success) {
        setRates(currentRates.data);
      }
      if (raterRates?.success) {
        setMarkup2((raterRates.data.markup2));
        setUsdtNgnRate(Number(raterRates.data.usdtNgnRate));
        if (raterRates.data.platformRates) {
          setPlatformRates(raterRates.data.platformRates);
        }
      }
      return true;
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Error fetching rates");
      return false;
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    const refreshData = async () => {
      await fetchAccounts();
      await fetchRates();
      await fetchMargin();

      await fetchMarginData();
    };

    if (autoUpdate) {
      refreshData(); // Initial fetch

      interval = window.setInterval(refreshData, 100000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate]);


  useEffect(() => {
    if (
      !autoUpdate || 
      !initialLoadDone || 
      updatingOffersRef.current
    ) {
      return;
    }
    updateOffersCalculation();
  }, [
    autoUpdate,
    initialLoadDone,
    accounts,
    calculatedRates,
    margin,
    platformRates
  ]);


  useEffect(() => {
    if (!autoUpdate) return;

    const refreshData = async () => {
      await fetchAccounts();
      await fetchRates();
      await fetchMargin();
      await fetchMarginData();
      setInitialLoadDone(true);          
    };

    refreshData();                    
    const id = window.setInterval(refreshData, 100_000);
    return () => clearInterval(id);
  }, [autoUpdate]);
  



  // Persist offersActive to localStorage on change
  useEffect(() => {
    localStorage.setItem("offersActive", JSON.stringify(offersActive));
  }, [offersActive]);


  // Offers toggle handlers.
  const handleOfferSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setPendingOfferValue(newValue);
    setOfferModalOpen(true);
  };

  const confirmOfferToggle = async () => {
    setOfferModalOpen(false);
    setOffersLoading(true);
    try {
      let response;
      if (offersActive) {
        response = await turnOffAllOffers();
        if (response?.success) {
          toast.success("Offers turned off successfully", successStyles);
          setOffersActive(false);
        } else {
          toast.error("Failed to turn off offers");
        }
      } else {
        response = await turnOnAllOffers();
        if (response?.success) {
          toast.success("Offers turned on successfully", successStyles);
          setOffersActive(true);
        } else {
          toast.error("Failed to turn on offers");
        }
      }
    } catch (error) {
      toast.error("Error toggling offers");
      console.error(error);
    } finally {
      setOffersLoading(false);
    }
  };

  const cancelOfferToggle = () => {
    setOfferModalOpen(false);
  };


  // Handler for per-account markup2 change.
  const handleAccountRateChange = (
    accountUsername: string,
    field: keyof AccountRate,
    value: string
  ) => {
    const formattedValue = value === "0" ? value : value.replace(/^0+/, '');
    setPlatformRates((prev) => ({
      ...prev,
      [accountUsername]: {
        ...prev[accountUsername],
        [field]: formattedValue,
      },
    }));
  };

  // Modal save handler for per-account rates.
  const saveAccountRates = async () => {
    try {
      const response = await updateAccountRates({ platformRates });
      if (response?.success) {
        setAccountRatesModalOpen(false);
        toast.success("Account rates updated successfully!");
      } else {
        toast.error("Failed to update account rates.");
      }
    } catch (error) {
      console.error("Error saving account rates:", error);
      toast.error("Error saving account rates.");
    }
  };


  const handleSetMargin = async () => {
    setMarginLoading(true);
    try {
      const res = await updateCapRates({ btcngnrate: Number(margin) });
      if (res) {
        toast.success("Margin updated successfully");
        // Re-fetch the margin value independently.
        fetchMargin();
      } else {
        toast.error("Failed to update margin");
      }
    } catch (error) {
      console.error("Error updating margin:", error);
      toast.error("Error updating margin");
    } finally {
      setMarginLoading(false);
    }
  };


  // Reactivate all deactivated offers
  // const handleReactivateDeactivated = async () => {
  //   setReactivatingLoading(true);
  //   try {
  //     const res = await activateDeactivatedOffers();
  //     if (res?.success) {
  //       toast.success(res.message || "Reactivated deactivated offers", successStyles);
  //     } else {
  //       toast.error(res?.message || "Failed to reactivate offers");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error reactivating offers");
  //   } finally {
  //     setReactivatingLoading(false);
  //   }
  // };


  // // For the MarketCard components, pick a representative account for Paxful and Noones.
  // const paxfulAccount = accounts.find(
  //   (acc) => acc.platform.toLowerCase() === "paxful"
  // );
  // const noonesAccount = accounts.find(
  //   (acc) => acc.platform.toLowerCase() === "noones"
  // );

  if (loading) return <Loading />;
  if (!user) return <Loading />;

  return (
    <div className="min-h-screen p-3 lg:p-3 space-y-6">
      {/* Market Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MarketCard
          platform="Binance"
          rate={rates?.binanceRate}
          logo="/binance.jpg"
          bgColor="bg-yellow-100"
          rate2={calculatedRates.sellingPrice}
        />
        <MarketCard
          platform="Paxful"
          rate={rates?.paxfulRate}
          logo="/paxful.jpg"
          bgColor="bg-blue-100"
          rate2={
            Number(calculatedRates.paxfulBtcNgn.toFixed(2))
          }
        />
        <MarketCard
          platform="Noones"
          rate={rates?.noonesRate}
          logo="/noones.png"
          bgColor="bg-purple-100"
          rate2={
            Number(calculatedRates.noonesBtcNgn.toFixed(2))
          }
        />
      </div>

      {/* Rate Settings and Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate Settings Card */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8BC08]/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[#F8BC08]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Rate Settings</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="contained"
                onClick={fetchRates}
                disabled={refreshing}
                className="flex items-center gap-2"
                sx={{
                  bgcolor: "#F8BC08",
                  "&:hover": { bgcolor: "#C6980C" },
                }}
              >
                {refreshing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Auto Update</span>
                  <div className="font-semibold text-gray-900">
                    {autoUpdate ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <Switch
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
              </div>
            </div> */}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Selling Price (NGN)</span>
                  <div className="font-semibold text-gray-900">
                    ₦{calculatedRates.sellingPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-4">
              {/* Margin (isolated from other rates) */}
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="USDT/NGN"
                  variant="outlined"
                  type="number"
                  value={margin}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formattedValue = value === "0" ? value : value.replace(/^0+/, '');
                    setMargin(formattedValue);
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSetMargin}
                  disabled={marginLoading}
                >
                  {marginLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Set"
                  )}
                </Button>
              </Box>
              <TextField
                fullWidth
                label="BTC/NGN Rate"
                variant="outlined"
                type="number"
                value={usdtNgnRate}
                onChange={(e) => {
                  const value = Number(e.target.value).toFixed(2);
                  const formattedValue = value === "0" ? value : value.replace(/^0+/, '');
                  setUsdtNgnRate(Number(formattedValue));
                }}

              />
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border mt-4 border-gray-100 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="contained"
                onClick={saveRateSettings}
                disabled={savingRates}
                sx={{
                  bgcolor: "#F8BC08",
                  "&:hover": { bgcolor: "#C6980C" },
                  minWidth: '120px'
                }}
              >
                {savingRates ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Save Rates"
                )}
              </Button>
              <Button
                variant="contained"
                onClick={() => setAccountRatesModalOpen(true)}
                sx={{ bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }}
              >
                Setup Markup 2
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium">Offers</span>
            <Switch
              checked={offersActive}
              onChange={handleOfferSwitchChange}
              disabled={offersLoading}
            />
            {offersLoading && <CircularProgress size={20} />}
          </div>
        </div>

        {/* Cost Price Analysis Card */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8BC08]/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[#F8BC08]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cost Price Analysis</h2>
            </div>

          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Markup 1</TableCell>
                  <TableCell>Markup 2</TableCell>
                  <TableCell>Cost Price</TableCell>
                  <TableCell>M/BTC</TableCell>
                  <TableCell>M/USDT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts
                  .filter((acc) =>
                    ["paxful", "noones"].includes(acc.platform.toLowerCase())
                  )
                  .map((acc) => {
                    const marginInfo = marginByAccount[acc.id] || {};
                    const accountMarkup1 =
                      acc.platform.toLowerCase() === "paxful"
                        ? calculatedRates.paxfulMarkup1
                        : calculatedRates.noonesMarkup1;
                    const accountMarkup2 = platformRates[acc.account_username]?.markup2 || 0;
                    const costPrice =
                      calculatedRates.sellingPrice - accountMarkup1 - accountMarkup2;
                    return (
                      <TableRow key={acc.id}>
                        <TableCell>{acc.account_username}</TableCell>
                        <TableCell>{accountMarkup1.toLocaleString()}</TableCell>
                        <TableCell>{accountMarkup2}</TableCell>
                        <TableCell>{costPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          {marginInfo.marginBTC !== undefined
                            ? `${marginInfo.marginBTC}%`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {marginInfo.marginUSDT !== undefined
                            ? `${marginInfo.marginUSDT}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

          
{/* <Button
  variant="contained"
  onClick={handleReactivateDeactivated}
  disabled={reactivatingLoading}
  sx={{ bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }}
>
  {reactivatingLoading
    ? <CircularProgress size={20} color="inherit" />
    : "Reactivate Deactivated Offers"}
</Button>  */}

          </div>
        </div>
      </div>

      <FilterDialog filterDialogOpen={filterDialogOpen} setFilterDialogOpen={setFilterDialogOpen} />

      <Dialog open={editFilterDialogOpen} onClose={() => setEditFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#F8BC08]" />
            <span>Edit Filter</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="mt-4 space-y-4">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={selectedFilter?.username || ""}
              onChange={(e) =>
                setSelectedFilter({ ...selectedFilter!, username: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Account Details"
              variant="outlined"
              value={selectedFilter?.accountDetails || ""}
              onChange={(e) =>
                setSelectedFilter({ ...selectedFilter!, accountDetails: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Filter Reason</InputLabel>
              <Select
                label="Filter Reason"
                value={selectedFilter?.reason || ""}
                onChange={(e) =>
                  setSelectedFilter({ ...selectedFilter!, reason: e.target.value as string })
                }
              >
                <MenuItem value="overpayment">Overpayment</MenuItem>
                <MenuItem value="negative">Negative Feedback</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setEditFilterDialogOpen(false)} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditFilterDialogOpen(false);
              setSelectedFilter(null);
            }}
            sx={{ bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={offerModalOpen} onClose={cancelOfferToggle}>
        <DialogTitle>Confirm Offer Toggle</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to turn offers {pendingOfferValue ? "ON" : "OFF"}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelOfferToggle} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmOfferToggle} sx={{ bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Modal for editing per-account rates --- */}
      <Dialog open={accountRatesModalOpen} onClose={() => setAccountRatesModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Per-Account Rates</DialogTitle>
        <DialogContent dividers>
          {accounts.length === 0 ? (
            <p>No accounts found.</p>
          ) : (
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Username</TableCell>
                    <TableCell>Markup 1</TableCell>
                    <TableCell>Markup 2</TableCell>
                    <TableCell>Cost Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts
                    .filter((acc) =>
                      ["paxful", "noones"].includes(acc.platform.toLowerCase())
                    )
                    .map((acc) => {
                      const accKey = acc.account_username;
                      const currentMarkup2 = platformRates[accKey]?.markup2 || 0;
                      const markup1 =
                        acc.platform.toLowerCase() === "paxful"
                          ? calculatedRates.paxfulMarkup1
                          : calculatedRates.noonesMarkup1;
                      const costPrice =
                        calculatedRates.sellingPrice - markup1 - currentMarkup2;
                      return (
                        <TableRow key={acc.id}>
                          <TableCell>{acc.account_username}</TableCell>
                          <TableCell>{markup1.toLocaleString()}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={currentMarkup2}
                              onChange={(e) =>
                                handleAccountRateChange(accKey, "markup2", (e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>{costPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountRatesModalOpen(false)} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button onClick={saveAccountRates} variant="contained" sx={{ bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }}>
            Save Account Markup
          </Button>
        </DialogActions>
      </Dialog>


    </div>
  );
};

export default RaterDashboard;
