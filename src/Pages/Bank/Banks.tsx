import React, { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  deleteBank,
  getAllBanks,
  getFreeBanks,
  getFundedBanks,
  getUsedBanks,
  getRolloverBanks,
  getFreshBanks,
  useBank as spendBank,
} from "../../api/bank";
import { getCurrentShift } from "../../api/shift";
import Loading from "../../Components/Loading";
import { formatDate } from "../../lib/constants";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../Components/ContextProvider";
import ClockedAlt from "../../Components/ClockedAlt";

enum BankTag {
  FRESH = "fresh",
  UNFUNDED = "unfunded",
  FUNDED = "funded",
  USED = "used",
  ROLLOVER = "rollover",
}

interface Bank {
  id: string;
  accountNumber: string;
  createdAt: Date;
  bankName: string;
  accountName: string;
  funds: number;
  tag: BankTag;
}

type TabOption = "all" | "funded" | "free" | "used" | "rollover" | "fresh";

const Banks = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<TabOption>("funded");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const { user } = useUserContext();
  const navigate = useNavigate();

  // Fetch current shift ID for payer transactions
  useEffect(() => {
    if (user?.userType === "payer") {
      getCurrentShift().then(res => {
        if (res?.success && res.data) {
          setShiftId(res.data.id);
        }
      }).catch(console.error);
    }
  }, [user]);

  const tabOptions: { label: string; value: TabOption }[] =
    user?.userType === "payer"
      ? [
          { label: "Funded Banks", value: "funded" },
          { label: "Used Banks", value: "used" },
        ]
      : [
          { label: "All Banks", value: "all" },
          { label: "Funded Banks", value: "funded" },
          { label: "Unfunded", value: "free" },
          { label: "Fresh Banks", value: "fresh" },
          { label: "Used Banks", value: "used" },
          { label: "Rollover Banks", value: "rollover" },
        ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bank: Bank) => {
    setAnchorEl(event.currentTarget);
    setSelectedBank(bank);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBank(null);
  };

  const handleBankDelete = async (id: string) => {
    const data = await deleteBank(id);
    if (data?.success) setBanks(prev => prev.filter(b => b.id !== id));
  };

  const handleEditBank = (id: string) =>
    navigate(`/banks/create?bankId=${id}`);

  const openUseDialog = () => setDialogOpen(true);
  const closeUseDialog = () => {
    setDialogOpen(false);
    setAmount(0);
    handleMenuClose();
  };

  const handleUseBank = async () => {
    if (!selectedBank || !shiftId) return;
    await spendBank(selectedBank.id, { amountUsed: amount, shiftId });
    closeUseDialog();
    loadBanks();
  };

  const loadBanks = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "funded":
          res = await getFundedBanks();
          break;
        case "free":
          res = await getFreeBanks();
          break;
        case "used":
          res = await getUsedBanks();
          break;
        case "rollover":
          res = await getRolloverBanks();
          break;
        case "fresh":
          res = await getFreshBanks();
          break;
        default:
          res = await getAllBanks();
      }
      if (res?.success) setBanks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const getTagColor = (tag: BankTag) => {
    switch (tag) {
      case BankTag.FRESH:
        return "primary";
      case BankTag.FUNDED:
        return "success";
      case BankTag.UNFUNDED:
        return "warning";
      case BankTag.USED:
        return "info";
      case BankTag.ROLLOVER:
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) return <Loading />;
  if (!user?.clockedIn && user?.userType !== "admin")
    return <ClockedAlt />;

  return (
    <div className="space-y-6 min-h-screen font-primary">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bank Management
          </h1>
          <p className="text-text2 mt-1">
            Manage your bank accounts and transactions
          </p>
        </div>
        {user.userType !== "payer" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/banks/create")}
            className="bg-button hover:bg-primary2 text-white shadow-lg normal-case"
            sx={{
              backgroundColor: "#F8BC08",
              "&:hover": { backgroundColor: "#C6980C" },
            }}
          >
            Add New Bank
          </Button>
        )}
      </div>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as TabOption)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabOptions.map(opt => (
          <Tab key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Tabs>

      <TableContainer component={Paper} className="shadow-lg">
        <Table>
          <TableHead className="bg-muted/50">
            <TableRow>
              <TableCell className="font-semibold">Bank Name</TableCell>
              <TableCell className="font-semibold">Account Name</TableCell>
              <TableCell className="font-semibold">Account Number</TableCell>
              <TableCell className="font-semibold">Funds</TableCell>
              <TableCell className="font-semibold">Status</TableCell>
              <TableCell className="font-semibold">Created Date</TableCell>
              <TableCell
                align="center"
                className="font-semibold"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No Banks Found
                </TableCell>
              </TableRow>
            ) : (
              banks.map(bank => (
                <TableRow
                  key={bank.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>{bank.bankName}</TableCell>
                  <TableCell>{bank.accountName}</TableCell>
                  <TableCell className="font-mono">
                    {bank.accountNumber}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${bank.funds.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={bank.tag} 
                      color={getTagColor(bank.tag)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="text-text2">
                    {formatDate(new Date(bank.createdAt))}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={e =>
                        handleMenuOpen(e, bank)
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {user.userType === "payer" ? (
          <MenuItem onClick={openUseDialog}>
            <EditIcon fontSize="small" /> Use Bank
          </MenuItem>
        ) : (
          <>
            <MenuItem
              onClick={() =>
                selectedBank && handleEditBank(selectedBank.id)
              }
            >
              <EditIcon fontSize="small" /> Edit
            </MenuItem>
            <MenuItem
              onClick={() =>
                selectedBank && handleBankDelete(selectedBank.id)
              }
              className="text-destructive"
            >
              <DeleteIcon fontSize="small" /> Delete
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Use Bank Dialog */}
      <Dialog open={dialogOpen} onClose={closeUseDialog}>
        <DialogTitle>Use Bank Funds</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount to Use"
            type="number"
            fullWidth
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUseDialog}>Cancel</Button>
          <Button
            onClick={handleUseBank}
            disabled={amount <= 0}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Banks;