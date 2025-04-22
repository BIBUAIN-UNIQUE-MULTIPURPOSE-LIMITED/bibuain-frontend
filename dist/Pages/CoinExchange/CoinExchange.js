import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Card, CardContent, Button, Select, MenuItem, FormControl, InputLabel, TextField, Grid, CircularProgress, } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CopyAll } from "@mui/icons-material";
import { api, createNotification } from "../../api/user";
import Loading from "../../Components/Loading";
import { getCapRates, updateCapRates, getVendorCoin } from "../../api/trade";
import toast from "react-hot-toast";
var UserType;
(function (UserType) {
    UserType["ADMIN"] = "admin";
    UserType["PAYER"] = "payer";
    UserType["RATER"] = "rater";
    UserType["CEO"] = "ceo";
    UserType["CC"] = "customer-support";
})(UserType || (UserType = {}));
const getBalance = (balances, currency) => {
    const found = balances.find((b) => b.currency.toUpperCase() === currency.toUpperCase());
    if (!found)
        return 0;
    const raw = typeof found.balance === 'string' ?
        parseFloat(found.balance) :
        found.balance;
    return raw;
};
const BalanceCheckUI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [balances, setBalances] = useState({});
    const [activeFundedCoin, setActiveFundedCoin] = useState({
        btc: 0,
        usdt: 0
    });
    const [capitalLimit, setCapitalLimit] = useState(100);
    // New loading state for the cap
    const [capLoading, setCapLoading] = useState(false);
    const [vendorCoin, setVendorCoin] = useState({
        btc: 0,
        usdt: 0
    });
    const [hasNotifiedExcess, setHasNotifiedExcess] = useState(false);
    // Separate Computations for Paxful/Noones vs Binance
    const totalWalletBTCNoonesPaxful = Object.values(balances).reduce((acc, account) => {
        if (["noones", "paxful"].includes(account.platform) &&
            Array.isArray(account.balances)) {
            return acc + getBalance(account.balances, "BTC");
        }
        return acc;
    }, 0);
    const totalWalletUSDTNoonesPaxful = Object.values(balances).reduce((acc, account) => {
        if (["noones", "paxful"].includes(account.platform) &&
            Array.isArray(account.balances)) {
            return acc + getBalance(account.balances, "USDT");
        }
        return acc;
    }, 0);
    const totalWalletBTCBinance = Object.values(balances).reduce((acc, account) => {
        if (account.platform === "binance" && Array.isArray(account.balances)) {
            return acc + getBalance(account.balances, "BTC");
        }
        return acc;
    }, 0);
    const totalWalletUSDTBinance = Object.values(balances).reduce((acc, account) => {
        if (account.platform === "binance" && Array.isArray(account.balances)) {
            return acc + getBalance(account.balances, "USDT");
        }
        return acc;
    }, 0);
    // Helper function to format crypto amounts (for example, if amounts are in satoshis)
    const formatCryptoAmount = (amount) => {
        return amount.toFixed(8) + " BTC";
    };
    // API call to fetch wallet balances.
    const fetchWalletBalances = async (showLoading = true) => {
        if (showLoading)
            setIsLoading(true);
        try {
            const response = await api.get("/trade/wallet-balances");
            if (response?.success) {
                setBalances(response.data);
            }
        }
        catch (err) {
            console.error("Error fetching wallet balances:", err);
        }
        finally {
            setIsLoading(false);
        }
    };
    // API call to fetch the live total active funded coin.
    const fetchActiveFundedCoin = async () => {
        try {
            const response = await api.get("/trade/active-funded-coin");
            if (response?.success) {
                const rawUSDT = response.data.usdt;
                const realUSDT = rawUSDT / 10 ** 6;
                setActiveFundedCoin({
                    btc: response.data.btc,
                    usdt: realUSDT
                });
            }
        }
        catch (err) {
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
        }
        catch (err) {
            console.error("Error fetching capital limit:", err);
        }
        finally {
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
        }
        catch (err) {
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
        }
        catch (error) {
            console.error("Error fetching vendor coin:", error);
        }
    };
    // Total Coin is the sum of wallet BTC, active funded coin, and vendor coin.
    // Default to 0 if undefined or null
    const totalCoin = (totalWalletBTCNoonesPaxful || 0) + (totalWalletBTCBinance || 0) + (vendorCoin.btc || 0);
    const totalCoinUSDT = (totalWalletUSDTNoonesPaxful || 0) + (totalWalletUSDTBinance || 0) - (vendorCoin.usdt || 0);
    // Default to 0 if undefined or null
    const excessCoins = totalCoin - capitalLimit;
    const [currentUser, setCurrentUser] = useState(null);
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
    const formatUSDT = (amount) => (amount || 0).toFixed(2) + " USDT";
    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };
    // Copy helper.
    const handleCopy = (value) => {
        navigator.clipboard.writeText(value);
    };
    if (isLoading)
        return _jsx(Loading, {});
    return (_jsxs(Box, { className: "min-h-screen bg-white font-primary p-6 rounded-md px-8", children: [_jsxs(Box, { className: "flex justify-between items-center mb-6", children: [_jsx(Typography, { variant: "h4", className: "font-semibold text-gray-800", children: "Coin Exchange Page" }), _jsxs(Box, { className: "flex items-center gap-4", children: [_jsxs(FormControl, { size: "small", className: "w-40", children: [_jsx(InputLabel, { children: "Filter" }), _jsxs(Select, { value: filter, onChange: handleFilterChange, label: "Filter", children: [_jsx(MenuItem, { value: "all", children: "All" }), _jsx(MenuItem, { value: "usdt", children: "USDT Only" }), _jsx(MenuItem, { value: "btc", children: "BTC Only" })] })] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: () => {
                                    fetchWalletBalances(true);
                                    fetchActiveFundedCoin();
                                    fetchCap();
                                }, disabled: isLoading, children: "Refresh" })] })] }), _jsxs(Grid, { container: true, spacing: 4, children: [_jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Total Coin" }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: [totalCoin.toFixed(8) || 0, " "] }), _jsxs(Typography, { children: [formatUSDT(totalCoinUSDT) || 0, " "] }), _jsx(IconButton, { onClick: () => handleCopy(totalCoin.toFixed(3)), children: _jsx(CopyAll, {}) })] })] }) }), _jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                    mt: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Excess Coin" }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: [excessCoins.toFixed(8), " "] }), _jsx(IconButton, { onClick: () => handleCopy(excessCoins.toFixed(8)), children: _jsx(CopyAll, {}) })] })] }) }), _jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                    mt: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Cap" }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [capLoading ? (_jsx(CircularProgress, { size: 20 })) : (_jsxs(Typography, { children: [capitalLimit.toFixed(8), " BTC"] })), _jsx(IconButton, { onClick: () => handleCopy(capitalLimit.toFixed(8)), children: _jsx(CopyAll, {}) })] }), _jsxs(Box, { mt: 2, display: "flex", gap: 1, children: [_jsx(TextField, { label: "Set New Cap (BTC)", type: "number", value: capitalLimit, onChange: (e) => setCapitalLimit(parseFloat(e.target.value) || 0), variant: "outlined", size: "small", fullWidth: true, inputProps: { step: "0.0001" } }), _jsx(Button, { variant: "contained", onClick: handleSetCap, children: "Set" })] })] }) })] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Wallet Balances Coin" }), _jsxs(Box, { display: "flex", flexDirection: "column", gap: 2, children: [_jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: ["(Paxful and Noones)", _jsx("br", {}), "BTC: ", (totalWalletBTCNoonesPaxful.toFixed(8)), ",", _jsx("br", {}), " USDT: ", totalWalletUSDTNoonesPaxful.toFixed(2)] }), _jsx(IconButton, { onClick: () => handleCopy(`Paxful/Noones: BTC ${totalWalletBTCNoonesPaxful.toFixed(8)}, USDT ${totalWalletUSDTNoonesPaxful.toFixed(2)}`), children: _jsx(CopyAll, {}) })] }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: ["Binance", _jsx("br", {}), "BTC: ", totalWalletBTCBinance.toFixed(8), ",", _jsx("br", {}), " USDT: ", totalWalletUSDTBinance.toFixed(2)] }), _jsx(IconButton, { onClick: () => handleCopy(`Binance: BTC ${totalWalletBTCBinance.toFixed(8)}, USDT ${totalWalletUSDTBinance.toFixed(2)}`), children: _jsx(CopyAll, {}) })] })] })] }) }), _jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                    mt: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Active Funded Coin" }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: [activeFundedCoin
                                                            ? formatCryptoAmount(activeFundedCoin.btc || 0)
                                                            : "0", " "] }), _jsxs(Typography, { children: [activeFundedCoin
                                                            ? formatUSDT(activeFundedCoin.usdt || 0)
                                                            : "0", " "] }), _jsx(IconButton, { onClick: () => handleCopy(`${activeFundedCoin.btc.toFixed(3)} BTC, ${activeFundedCoin.usdt.toFixed(2)} USDT`), children: _jsx(CopyAll, {}) })] })] }) }), _jsx(Card, { sx: {
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    p: 2,
                                    mt: 2,
                                }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", className: "mb-2", children: "Vendor Coin" }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Typography, { children: [formatCryptoAmount(vendorCoin.btc || 0), " "] }), _jsx(Typography, { children: formatUSDT(vendorCoin.usdt || 0) }), _jsx(IconButton, { onClick: () => handleCopy(`${vendorCoin.btc.toFixed(3)} BTC, ${vendorCoin.usdt.toFixed(2)} USDT`), children: _jsx(CopyAll, {}) })] })] }) })] })] })] }));
};
export default BalanceCheckUI;
