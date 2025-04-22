import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { getFeedbackStats } from "../../api/trade"; // adjust the path as needed

interface FeedbackStat {
  accountId: number;
  accountUsername: string;
  platform: string;
  positiveFeedback: number;
  negativeFeedback: number;
  positivePercentage: number;
  negativePercentage: number;
}

const FeedbackStats = () => {
  const [stats, setStats] = useState<FeedbackStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getFeedbackStats({ username: "", platform: "" });
        if (res?.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Error fetching feedback stats", error);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={4} mx={2}>
      <Typography variant="h6" gutterBottom>
        Feedback Statistics
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={1}
        justifyContent="flex-start"
        mt={2}
      >
        {stats.map((stat) => (
          <Paper
            key={stat.accountId}
            elevation={1}
            sx={{
              p: 1,
              flex: "1 1 10px",
              border: "0.5px solid",
              borderColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography color="primary">
              {stat.accountUsername}
            </Typography>
            <Box mt={1}>
              <Typography color="success.main">
                <strong>+ve:</strong> {stat.positiveFeedback} ({
                  stat.positivePercentage
                }%)
              </Typography>
              <Typography color="error.main">
                <strong>-ve:</strong> {stat.negativeFeedback} ({
                  stat.negativePercentage
                }%)
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FeedbackStats;
