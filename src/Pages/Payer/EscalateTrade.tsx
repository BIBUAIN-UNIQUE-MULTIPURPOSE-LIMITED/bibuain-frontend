/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import { Formik, Form } from "formik";
import { escalateTrade } from "../../api/trade";
import toast from "react-hot-toast";

interface EscalationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  escalateData: {
    tradeId: string;
    assignedPayerId: string;
    escalatedById: string;
  };
}


const EscalateTrade: React.FC<EscalationModalProps> = ({
  open,
  onClose,
  onSuccess,
  escalateData,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const escalationReasons = [
    { value: "bank not going", label: "Bank Not Going" },
    { value: "account not complete", label: "Account not complete" },
    { value: "account namenot_correlated", label: "Account Name not Correlated" },
    { value: "other", label: "Other (please specify)" },
  ];
  const handleSubmit = async (values: { additionalDetails?: string }) => {
    if (!selectedReason) return;
    
    setLoading(true);
    try {
      const payload = {
        reason: selectedReason === "other" ? values.additionalDetails || "" : selectedReason,
        escalatedById: escalateData.escalatedById,
        assignedPayerId: escalateData.assignedPayerId
      };
  
      console.log("Sending payload:", payload); // Debug log
  
      const response = await escalateTrade(escalateData.tradeId, payload);
  
      if (response?.success) {
        // Show toast after successful API call
        toast.success("Trade escalated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || "Failed to escalate trade");
      }
    } catch (error: any) {
      console.error("Escalation error:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Error escalating trade"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Escalate Trade</DialogTitle>
      <Formik
        initialValues={{
          additionalDetails: "",
        }}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, touched }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {loading ? (
                  <CircularProgress sx={{ display: "block", margin: "auto", my: 3 }} />
                ) : (
                  <>
                    <FormControl fullWidth sx={{ mb: 3 }} required>
                      <InputLabel>Escalation Reason *</InputLabel>
                      <Select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        label="Escalation Reason *"
                        required
                      >
                        <MenuItem value="">
                          <em>Select a reason</em>
                        </MenuItem>
                        {escalationReasons.map((reason) => (
                          <MenuItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedReason === "other" && (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Additional Details *"
                        name="additionalDetails"
                        value={values.additionalDetails}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.additionalDetails && !values.additionalDetails}
                        helperText={touched.additionalDetails && !values.additionalDetails ? "Please provide details" : ""}
                        placeholder="Please provide detailed explanation..."
                        disabled={loading}
                        inputProps={{ maxLength: 500 }}
                        required
                      />
                    )}
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={onClose} 
                disabled={loading}
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !selectedReason || (selectedReason === "other" && !values.additionalDetails)}
                color="primary"
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Escalating...
                  </>
                ) : "Escalate Trade"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EscalateTrade;