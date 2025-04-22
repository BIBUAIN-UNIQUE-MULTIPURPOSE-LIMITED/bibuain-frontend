import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { BarChart2, Edit } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Table, TableBody, TableCell, TableRow, TableHead, Paper, Switch, CircularProgress, FormControl, InputLabel, Select, MenuItem, Box, } from "@mui/material";
import { getCurrentRates, getRaterRates, setRaterRates, turnOffAllOffers, turnOnAllOffers, updateOffers, getOffersMargin, getAccounts, updateAccountRates, getCapRates, updateCapRates,
// activateDeactivatedOffers,
 } from "../../api/trade";
import Loading from "../../Components/Loading";
import MarketCard from "../../Components/MarketCard";
import FilterDialog from "../../Components/FilterDialog";
import toast from "react-hot-toast";
import { successStyles } from "../../lib/constants";
import { useUserContext } from "../../Components/ContextProvider";
const RaterDashboard = () => {
    // State Management
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [editFilterDialogOpen, setEditFilterDialogOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const { user } = useUserContext();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [margin, setMargin] = useState('0');
    const [marginLoading, setMarginLoading] = useState(false);
    // Offers toggle state
    // Offers toggle state, initialized from localStorage (or false if missing)
    const [offersActive, setOffersActive] = useState(() => {
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
    const [platformRates, setPlatformRates] = useState({});
    // State for list of registered accounts.
    const [accounts, setAccounts] = useState([]);
    // State for margin data from API.
    const [marginData, setMarginData] = useState([]);
    // — Reactivate all deactivated offers
    // const [reactivatingLoading, setReactivatingLoading] = useState(false);
    // Memoize margin data by account for easier lookup.
    const marginByAccount = useMemo(() => {
        const map = {};
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
        }
        catch (error) {
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
                const defaults = {};
                res.data.forEach((acc) => {
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
        }
        catch (error) {
            console.error("Error fetching accounts:", error);
        }
    }, [markup2]);
    // Auto-update rates every 60 seconds if enabled.
    useEffect(() => {
        let interval;
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
                const anyZero = Object.values(platformRates).some((rate) => Number(rate.markup2) === 0);
                if (anyZero) {
                    setAccountRatesModalOpen(true);
                }
                // Then check if offers are off
                else if (!offersActive) {
                    setPendingOfferValue(true);
                    setOfferModalOpen(true);
                }
            }
            else {
                toast.error("Failed to save rates");
            }
        }
        catch (error) {
            console.error("Error saving rate settings:", error);
            toast.error("Error saving rate settings.");
            setSavingRates(false);
        }
        finally {
            setSavingRates(false);
        }
    }, [calculatedRates, usdtNgnRate, platformRates, offersActive]);
    const updateOffersCalculation = useCallback(async () => {
        updatingOffersRef.current = true;
        try {
            // console.log("Starting offer updates with accounts:", accounts);
            // console.log("Current rates:", calculatedRates, "USDT NGN rate:", margin);
            const updatePromises = accounts
                .filter((acc) => ["paxful", "noones"].includes(acc.platform.toLowerCase()))
                .map(async (account) => {
                const accountPlatform = account.platform.toLowerCase();
                const markup1 = accountPlatform === "paxful"
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
                    console.log(`Response for ${account.account_username}:`, data);
                    if (data && data.success) {
                        console.log(`Successfully updated offers for ${account.account_username}`);
                        toast.success(`Offer update successful for ${account.account_username}`);
                        return true;
                    }
                    else {
                        console.error(`Failed to update offers for ${account.account_username}`, data);
                        // toast.error(`Offer update failed for ${account.account_username}`);
                        return false;
                    }
                }
                catch (error) {
                    console.error(`Error updating offers for ${account.account_username}:`, error);
                    // toast.error(`Offer update error for ${account.account_username}`);
                    updatingOffersRef.current = false;
                    return false;
                }
                finally {
                    updatingOffersRef.current = false;
                }
            });
            console.log(`Starting ${updatePromises.length} update operations`);
            const updateResults = await Promise.all(updatePromises);
            console.log(`Update results:`, updateResults);
        }
        catch (error) {
            console.error("Error in updateOffersCalculation:", error);
            // toast.error("Error updating offers.");
        }
    }, [accounts, calculatedRates, margin, platformRates]);
    // Separate function for fetching the margin (BTC/NGN rate).
    const fetchMargin = async () => {
        try {
            const capRes = await getCapRates();
            if (capRes && capRes.data) {
                setMargin((capRes.data.btcngnrate));
            }
        }
        catch (error) {
            console.error("Error fetching margin:", error);
            toast.error("Error fetching margin");
        }
    };
    // Fetch offers margin data.
    const fetchMarginData = async () => {
        try {
            const res = await getOffersMargin();
            if (res?.success) {
                console.log("Margin Data Received:", res.data);
                setMarginData(res.data);
            }
            else {
                console.error("Margin data fetch failed:", res);
            }
        }
        catch (error) {
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
        }
        catch (error) {
            console.error("Error fetching rates:", error);
            toast.error("Error fetching rates");
            return false;
        }
        finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAccounts();
    }, []);
    useEffect(() => {
        let interval;
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
            if (interval)
                clearInterval(interval);
        };
    }, [autoUpdate]);
    useEffect(() => {
        let interval;
        const refreshData = async () => {
            await updateOffersCalculation();
        };
        if (autoUpdate) {
            refreshData(); // Initial fetch
            interval = window.setInterval(refreshData, 100000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [autoUpdate]);
    // Persist offersActive to localStorage on change
    useEffect(() => {
        localStorage.setItem("offersActive", JSON.stringify(offersActive));
    }, [offersActive]);
    // Offers toggle handlers.
    const handleOfferSwitchChange = (event) => {
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
                }
                else {
                    toast.error("Failed to turn off offers");
                }
            }
            else {
                response = await turnOnAllOffers();
                if (response?.success) {
                    toast.success("Offers turned on successfully", successStyles);
                    setOffersActive(true);
                }
                else {
                    toast.error("Failed to turn on offers");
                }
            }
        }
        catch (error) {
            toast.error("Error toggling offers");
            console.error(error);
        }
        finally {
            setOffersLoading(false);
        }
    };
    const cancelOfferToggle = () => {
        setOfferModalOpen(false);
    };
    // Handler for per-account markup2 change.
    const handleAccountRateChange = (accountUsername, field, value) => {
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
            }
            else {
                toast.error("Failed to update account rates.");
            }
        }
        catch (error) {
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
            }
            else {
                toast.error("Failed to update margin");
            }
        }
        catch (error) {
            console.error("Error updating margin:", error);
            toast.error("Error updating margin");
        }
        finally {
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
    if (loading)
        return _jsx(Loading, {});
    if (!user)
        return _jsx(Loading, {});
    return (_jsxs("div", { className: "min-h-screen p-3 lg:p-3 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(MarketCard, { platform: "Binance", rate: rates?.binanceRate, logo: "/binance.jpg", bgColor: "bg-yellow-100", rate2: calculatedRates.sellingPrice }), _jsx(MarketCard, { platform: "Paxful", rate: rates?.paxfulRate, logo: "/paxful.jpg", bgColor: "bg-blue-100", rate2: Number(calculatedRates.paxfulBtcNgn.toFixed(2)) }), _jsx(MarketCard, { platform: "Noones", rate: rates?.noonesRate, logo: "/noones.png", bgColor: "bg-purple-100", rate2: Number(calculatedRates.noonesBtcNgn.toFixed(2)) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-md", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#F8BC08]/10 flex items-center justify-center", children: _jsx(BarChart2, { className: "w-5 h-5 text-[#F8BC08]" }) }), _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Rate Settings" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Button, { variant: "contained", onClick: fetchRates, disabled: refreshing, className: "flex items-center gap-2", sx: {
                                                bgcolor: "#F8BC08",
                                                "&:hover": { bgcolor: "#C6980C" },
                                            }, children: refreshing ? (_jsx(CircularProgress, { size: 20, color: "inherit" })) : ("Refresh") }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Auto Update" }), _jsx("div", { className: "font-semibold text-gray-900", children: autoUpdate ? "Enabled" : "Disabled" })] }), _jsx(Switch, { checked: autoUpdate, onChange: (e) => setAutoUpdate(e.target.checked) })] }) }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Selling Price (NGN)" }), _jsxs("div", { className: "font-semibold text-gray-900", children: ["\u20A6", calculatedRates.sellingPrice.toLocaleString()] })] }) }) }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg flex flex-col gap-4", children: [_jsxs(Box, { display: "flex", gap: 1, children: [_jsx(TextField, { fullWidth: true, label: "USDT/NGN", variant: "outlined", type: "number", value: margin, onChange: (e) => {
                                                            const value = e.target.value;
                                                            const formattedValue = value === "0" ? value : value.replace(/^0+/, '');
                                                            setMargin(formattedValue);
                                                        } }), _jsx(Button, { variant: "contained", onClick: handleSetMargin, disabled: marginLoading, children: marginLoading ? (_jsx(CircularProgress, { size: 20, color: "inherit" })) : ("Set") })] }), _jsx(TextField, { fullWidth: true, label: "BTC/NGN Rate", variant: "outlined", type: "number", value: usdtNgnRate, onChange: (e) => {
                                                    const value = Number(e.target.value).toFixed(2);
                                                    const formattedValue = value === "0" ? value : value.replace(/^0+/, '');
                                                    setUsdtNgnRate(Number(formattedValue));
                                                } })] })] }), _jsx("div", { className: "bg-gray-50 p-5 rounded-xl border mt-4 border-gray-100 flex items-center justify-between", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "contained", onClick: saveRateSettings, disabled: savingRates, sx: {
                                                bgcolor: "#F8BC08",
                                                "&:hover": { bgcolor: "#C6980C" },
                                                minWidth: '120px'
                                            }, children: savingRates ? (_jsx(CircularProgress, { size: 20, color: "inherit" })) : ("Save Rates") }), _jsx(Button, { variant: "contained", onClick: () => setAccountRatesModalOpen(true), sx: { bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }, children: "Setup Markup 2" })] }) }), _jsxs("div", { className: "mt-4 flex items-center gap-4", children: [_jsx("span", { className: "text-sm font-medium", children: "Offers" }), _jsx(Switch, { checked: offersActive, onChange: handleOfferSwitchChange, disabled: offersLoading }), offersLoading && _jsx(CircularProgress, { size: 20 })] })] }), _jsxs("div", { className: "bg-white rounded-xl p-6 shadow-md", children: [_jsx("div", { className: "flex items-center justify-between mb-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#F8BC08]/10 flex items-center justify-center", children: _jsx(BarChart2, { className: "w-5 h-5 text-[#F8BC08]" }) }), _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Cost Price Analysis" })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Account Name" }), _jsx(TableCell, { children: "Markup 1" }), _jsx(TableCell, { children: "Markup 2" }), _jsx(TableCell, { children: "Cost Price" }), _jsx(TableCell, { children: "M/BTC" }), _jsx(TableCell, { children: "M/USDT" })] }) }), _jsx(TableBody, { children: accounts
                                                .filter((acc) => ["paxful", "noones"].includes(acc.platform.toLowerCase()))
                                                .map((acc) => {
                                                const marginInfo = marginByAccount[acc.id] || {};
                                                const accountMarkup1 = acc.platform.toLowerCase() === "paxful"
                                                    ? calculatedRates.paxfulMarkup1
                                                    : calculatedRates.noonesMarkup1;
                                                const accountMarkup2 = platformRates[acc.account_username]?.markup2 || 0;
                                                const costPrice = calculatedRates.sellingPrice - accountMarkup1 - accountMarkup2;
                                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { children: acc.account_username }), _jsx(TableCell, { children: accountMarkup1.toLocaleString() }), _jsx(TableCell, { children: accountMarkup2 }), _jsx(TableCell, { children: costPrice.toLocaleString() }), _jsx(TableCell, { children: marginInfo.marginBTC !== undefined
                                                                ? `${marginInfo.marginBTC}%`
                                                                : "-" }), _jsx(TableCell, { children: marginInfo.marginUSDT !== undefined
                                                                ? `${marginInfo.marginUSDT}%`
                                                                : "-" })] }, acc.id));
                                            }) })] }) })] })] }), _jsx(FilterDialog, { filterDialogOpen: filterDialogOpen, setFilterDialogOpen: setFilterDialogOpen }), _jsxs(Dialog, { open: editFilterDialogOpen, onClose: () => setEditFilterDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Edit, { className: "w-5 h-5 text-[#F8BC08]" }), _jsx("span", { children: "Edit Filter" })] }) }), _jsx(DialogContent, { children: _jsxs("div", { className: "mt-4 space-y-4", children: [_jsx(TextField, { fullWidth: true, label: "Username", variant: "outlined", value: selectedFilter?.username || "", onChange: (e) => setSelectedFilter({ ...selectedFilter, username: e.target.value }) }), _jsx(TextField, { fullWidth: true, label: "Account Details", variant: "outlined", value: selectedFilter?.accountDetails || "", onChange: (e) => setSelectedFilter({ ...selectedFilter, accountDetails: e.target.value }) }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Filter Reason" }), _jsxs(Select, { label: "Filter Reason", value: selectedFilter?.reason || "", onChange: (e) => setSelectedFilter({ ...selectedFilter, reason: e.target.value }), children: [_jsx(MenuItem, { value: "overpayment", children: "Overpayment" }), _jsx(MenuItem, { value: "negative", children: "Negative Feedback" }), _jsx(MenuItem, { value: "custom", children: "Custom" })] })] })] }) }), _jsxs(DialogActions, { className: "p-4", children: [_jsx(Button, { onClick: () => setEditFilterDialogOpen(false), sx: { color: "gray" }, children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: () => {
                                    setEditFilterDialogOpen(false);
                                    setSelectedFilter(null);
                                }, sx: { bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }, children: "Save Changes" })] })] }), _jsxs(Dialog, { open: offerModalOpen, onClose: cancelOfferToggle, children: [_jsx(DialogTitle, { children: "Confirm Offer Toggle" }), _jsx(DialogContent, { children: _jsxs("p", { children: ["Are you sure you want to turn offers ", pendingOfferValue ? "ON" : "OFF", "?"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: cancelOfferToggle, sx: { color: "gray" }, children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: confirmOfferToggle, sx: { bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }, children: "Confirm" })] })] }), _jsxs(Dialog, { open: accountRatesModalOpen, onClose: () => setAccountRatesModalOpen(false), maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: "Edit Per-Account Rates" }), _jsx(DialogContent, { dividers: true, children: accounts.length === 0 ? (_jsx("p", { children: "No accounts found." })) : (_jsx(Paper, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Account Username" }), _jsx(TableCell, { children: "Markup 1" }), _jsx(TableCell, { children: "Markup 2" }), _jsx(TableCell, { children: "Cost Price" })] }) }), _jsx(TableBody, { children: accounts
                                            .filter((acc) => ["paxful", "noones"].includes(acc.platform.toLowerCase()))
                                            .map((acc) => {
                                            const accKey = acc.account_username;
                                            const currentMarkup2 = platformRates[accKey]?.markup2 || 0;
                                            const markup1 = acc.platform.toLowerCase() === "paxful"
                                                ? calculatedRates.paxfulMarkup1
                                                : calculatedRates.noonesMarkup1;
                                            const costPrice = calculatedRates.sellingPrice - markup1 - currentMarkup2;
                                            return (_jsxs(TableRow, { children: [_jsx(TableCell, { children: acc.account_username }), _jsx(TableCell, { children: markup1.toLocaleString() }), _jsx(TableCell, { children: _jsx(TextField, { type: "number", value: currentMarkup2, onChange: (e) => handleAccountRateChange(accKey, "markup2", (e.target.value)) }) }), _jsx(TableCell, { children: costPrice.toLocaleString() })] }, acc.id));
                                        }) })] }) })) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setAccountRatesModalOpen(false), sx: { color: "gray" }, children: "Cancel" }), _jsx(Button, { onClick: saveAccountRates, variant: "contained", sx: { bgcolor: "#F8BC08", "&:hover": { bgcolor: "#C6980C" } }, children: "Save Account Markup" })] })] })] }));
};
export default RaterDashboard;
