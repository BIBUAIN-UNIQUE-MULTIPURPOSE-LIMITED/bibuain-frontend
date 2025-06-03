/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import {
  Timeline,
  Warning,
  AccessTime,
  TrendingUp,
  Gavel,
  Message,
  CheckCircle,
  Cancel,
  Group,
  InfoOutlined,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  getCCstats,
  getEscalatedTrades,
  getCompletedTrades,
} from "../../api/trade";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  secondary?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
  secondary,
}) => (
  <Card
    className="relative overflow-hidden"
    sx={{
      backgroundColor: "background.paper",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      height: "100%",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
      },
    }}
  >
    <CardContent className="p-6">
      <Box className="flex justify-between items-start">
        <Box className="flex flex-col">
          <Typography variant="subtitle2" color="textSecondary" className="mb-1">
            {title}
          </Typography>
          <Typography variant="h4" color="textPrimary" className="font-bold">
            {value}
          </Typography>
          {secondary && (
            <Typography variant="caption" color="textSecondary" className="mt-1">
              {secondary}
            </Typography>
          )}
        </Box>
        <Box className="rounded-full p-2" sx={{ backgroundColor: `${color}.lighter` }}>
          {icon}
        </Box>
      </Box>
      {trend !== undefined && (
        <Box className="mt-4 flex items-center">
          <Box
            component="span"
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              trend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </Box>
          <Typography variant="caption" className="ml-2 text-gray-500">
            vs last period
          </Typography>
        </Box>
      )}
    </CardContent>
    <Box className="absolute bottom-0 left-0 right-0 h-1" sx={{ backgroundColor: `${color}.main` }} />
  </Card>
);

// Replace mocks with dynamic chart data
interface ChartDataPoint {
  name: string;
  trades: number;
  complaints: number;
}
interface ResponseTimePoint {
  name: string;
  value: number;
}

const TransactionReports: React.FC = () => {
  const theme = useTheme();

  // Dashboard stats
  const [stats, setStats] = useState<{
    totalTrades: number;
    newTradesToday: number;
    avgResponseTimeHours: number;
    escalationRatePercent: number;
    resolutionRatePercent: number;
    activeVendors: number;
  } | null>(null);

  // Counts
  const [paidCount, setPaidCount] = useState<number>(0);
  const [disputedCount, setDisputedCount] = useState<number>(0);
  const [escalatedTrades, setEscalatedTrades] = useState<any[]>([]);

  // Chart data states
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimePoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Fetch core stats and escalations
        const [ccRes, escRes] = await Promise.all([
          getCCstats(),
          getEscalatedTrades(),
        ]);
        setStats(ccRes.data);
        setEscalatedTrades(escRes.data);

        // 2) Fetch all completed trades to derive paid/disputed counts
        const completed = await getCompletedTrades({ page: 1, limit: 1000 });
        const allTrades = completed.data.trades;
        const paid = allTrades.filter(
          (t: any) => t.status === "PAID" || t.tradeStatus?.toLowerCase() === "paid"
        );
        const disputed = allTrades.filter(
          (t: any) => t.status === "DISPUTED" || t.tradeStatus?.toLowerCase() === "disputed"
        );
        setPaidCount(paid.length);
        setDisputedCount(disputed.length);

        // 3) Build chart data: single-point overview
        setChartData([
          {
            name: "Overview",
            trades: ccRes.data.totalTrades,
            complaints: disputed.length,
          },
        ]);

        // 4) Build response-time data
        setResponseTimeData([
          {
            name: "Avg Response",
            value: ccRes.data.avgResponseTimeHours,
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!stats) return <Typography>Loading...</Typography>;

  return (
    <Box className="min-h-screen">
      {/* Header */}
      <Box className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Transaction Reports</h1>
        <Box className="flex items-center text-gray-500">
          <Timeline className="mr-2" />
          <Typography variant="subtitle1">
            Real-time monitoring of trades and complaints
          </Typography>
        </Box>
      </Box>

      {/* Main Stats Grid */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<TrendingUp />}
            color="primary"
            secondary={`${stats.newTradesToday} new today`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Response Time"
            value={`${Number(stats.avgResponseTimeHours)}h`}
            icon={<AccessTime />}
            color="warning"
            secondary="Target: 2h"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Escalation Rate"
            value={`${stats.escalationRatePercent.toFixed(1)}%`}
            icon={<Warning />}
            color="error"
            secondary={`${escalatedTrades.length} active cases`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolution Rate"
            value={`${stats.resolutionRatePercent.toFixed(1)}%`}
            icon={<CheckCircle />}
            color="success"
            secondary="Above target"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} lg={8}>
          <Paper className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold">
                Trade Activity Overview
              </Typography>
              <IconButton size="small">
                <InfoOutlined />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="trades" name="Total Trades" fill={theme.palette.primary.main} />
                <Bar dataKey="complaints" name="Complaints" fill={theme.palette.error.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper className="p-6">
            <Typography variant="h6" className="font-semibold mb-6">
              Response Time Trend
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Paid Trades"
            value={paidCount}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Disputed Trades"
            value={disputedCount}
            icon={<Gavel />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Moderator Messages"
            value="_"
            icon={<Message />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Released Complaints"
            value="_"
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Unreleased Complaints"
            value="_"
            icon={<Cancel />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Vendors"
            value={stats.activeVendors}
            icon={<Group />}
            secondary=""
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionReports;
