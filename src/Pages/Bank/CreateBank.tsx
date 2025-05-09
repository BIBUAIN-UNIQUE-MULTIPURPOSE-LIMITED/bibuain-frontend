import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  Button,
  InputAdornment,
  Card,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  AccountBalance as BankIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import {
  addBank,
  getSingleBank,
  updateBank,
} from "../../api/bank";
import toast from "react-hot-toast";
import { errorStyles } from "../../lib/constants";
import ClockedAlt from "../../Components/ClockedAlt";
import { useUserContext } from "../../Components/ContextProvider";

// client-side BankTag enum
enum BankTag {
  FRESH = "fresh",
  UNFUNDED = "unfunded",
  FUNDED = "funded",
  USED = "used",
  ROLLOVER = "rollover",
}

type FormData = {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  funds: number;
  additionalNotes: string;
  tag: BankTag;
};

const CreateBank: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bankId = searchParams.get("bankId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [formData, setFormData] = useState<FormData>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    funds: 0,
    additionalNotes: "",
    tag: BankTag.UNFUNDED,
  });

  useEffect(() => {
    if (!bankId) return;
    setLoading(true);
    getSingleBank(bankId)
      .then(res => {
        if (res?.success) {
          const b = res.data;
          setFormData({
            id: b.id,
            bankName: b.bankName,
            accountName: b.accountName,
            accountNumber: b.accountNumber,
            funds: b.funds,
            additionalNotes: b.additionalNotes || "",
            tag: b.tag as BankTag,
          });
        }
      })
      .catch(err => setError(`Failed to fetch bank: ${err}`))
      .finally(() => setLoading(false));
  }, [bankId]);

  const handleFieldChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "funds" ? Number(e.target.value) : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
    };

  const handleTagChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, tag: e.target.value as BankTag }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
        toast.error("Please fill required fields", errorStyles);
      } else {
        let res;
        if (bankId && formData.id) {
          res = await updateBank(formData.id, formData);
        } else {
          res = await addBank(formData);
        }
        if (res?.success) navigate("/banks");
      }
    } catch (err) {
      setError(`Failed to save bank: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.clockedIn && user?.userType !== "admin") return <ClockedAlt />;

  return (
    <div className="h-[80vh] w-full flex justify-center items-center font-primary">
      <div className="w-full max-w-xl">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          className="text-text2 normal-case mb-4"
        >
          Back
        </Button>
        <Card className="p-6 shadow-md">
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Bank Name"
                required
                fullWidth
                value={formData.bankName}
                onChange={handleFieldChange("bankName")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BankIcon /></InputAdornment>,
                }}
              />
              <TextField
                label="Account Name"
                required
                fullWidth
                value={formData.accountName}
                onChange={handleFieldChange("accountName")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                }}
              />
              <TextField
                label="Account Number"
                required
                fullWidth
                value={formData.accountNumber}
                onChange={handleFieldChange("accountNumber")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><NumbersIcon /></InputAdornment>,
                }}
              />
              <TextField
                label="Funds"
                type="number"
                required
                fullWidth
                value={formData.funds}
                onChange={handleFieldChange("funds")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MoneyIcon /></InputAdornment>,
                }}
              />
            </div>
            <FormControl fullWidth>
              <InputLabel id="tag-label">Tag</InputLabel>
              <Select
                labelId="tag-label"
                value={formData.tag}
                label="Tag"
                onChange={handleTagChange}
              >
                {Object.values(BankTag).map(val => (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Additional Notes"
              multiline rows={3}
              fullWidth
              value={formData.additionalNotes}
              onChange={handleFieldChange("additionalNotes")}
              InputProps={{
                startAdornment: <InputAdornment position="start"><NotesIcon /></InputAdornment>,
              }}
            />
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? "Saving..." : bankId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateBank;
