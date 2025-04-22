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
import { getCCstats, getDashboardStats, getEscalatedTrades } from "../../api/trade";

// Mock data
const chartData = [
  { month: "Jan", trades: 120, complaints: 20 },
  { month: "Feb", trades: 150, complaints: 25 },
  { month: "Mar", trades: 180, complaints: 30 },
  { month: "Apr", trades: 220, complaints: 28 },
];

const responseTimeData = [
  { time: "00:00", value: 2.5 },
  { time: "06:00", value: 3.1 },
  { time: "12:00", value: 2.8 },
  { time: "18:00", value: 2.2 },
];

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
}) => {

  return (
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
            <Typography
              variant="subtitle2"
              color="textSecondary"
              className="mb-1"
            >
              {title}
            </Typography>
            <Typography variant="h4" color="textPrimary" className="font-bold">
              {value}
            </Typography>
            {secondary && (
              <Typography
                variant="caption"
                color="textSecondary"
                className="mt-1"
              >
                {secondary}
              </Typography>
            )}
          </Box>
          <Box
            className="rounded-full p-2"
            sx={{ backgroundColor: `${color}.lighter` }}
          >
            {icon}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box className="mt-4 flex items-center">
            <Box
              component="span"
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                trend >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
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
      <Box
        className="absolute bottom-0 left-0 right-0 h-1"
        sx={{ backgroundColor: `${color}.main` }}
      />
    </Card>
  );
};

const TransactionReports: React.FC = () => {
  const theme = useTheme();

  const [stats, setStats] = useState<{
    totalTrades: number;
    newTradesToday: number;
    avgResponseTimeHours: number;
    escalationRatePercent: number;
    resolutionRatePercent: number;
    activeVendors: number;
  } | null>(null);

  const [dashboardStats, setDashboardStats] = useState<{
    currentlyAssigned: number;
    notYetAssigned: number;
    escalated: number;
    paidButNotMarked: number;
    activeFunded: number;
    totalTradesNGN: number;
    totalTradesBTC: number;
    averageResponseTime: number;
  } | null>(null);

  const [escalatedTrades, setEscalatedTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ccRes, dashRes, escRes] = await Promise.all([
          getCCstats(),             
          getDashboardStats(),      
          getEscalatedTrades(),    
        ]);
  
        if (ccRes && ccRes.data) {
          setStats(ccRes.data);
        }
        if (dashRes && dashRes.data) {
          setDashboardStats(dashRes.data);
        }
        if (escRes && Array.isArray(escRes.data)) {
          setEscalatedTrades(escRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  


  // if (!stats) return <Typography>Loading...</Typography>;

  return (
    <Box className=" min-h-screen">
      {/* Header Section */}
      <Box className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Transaction Reports
        </h1>
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
            value={Number(stats?.totalTrades)}
            icon={<TrendingUp />}
            color="primary"
            secondary={`${stats?.newTradesToday} new today`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Response Time"
            value={`${stats?.avgResponseTimeHours.toFixed(1)}h`}
            icon={<AccessTime />}
            // trend={-8}
            color="warning"
            secondary="Target: 2h"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Escalation Rate"
            value={`${(stats?.escalationRatePercent || 0).toFixed(1)}%`}
            icon={<Warning />}
            // trend={-2.1}
            color="error"
            secondary={`${escalatedTrades.length} active cases`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolution Rate"
            value={`${(stats?.resolutionRatePercent || 0).toFixed(1)}%`}
            icon={<CheckCircle />}
            // trend={5.3}
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="trades"
                  fill={theme.palette.primary.main}
                  name="Total Trades"
                />
                <Bar
                  dataKey="complaints"
                  fill={theme.palette.secondary.main}
                  name="Complaints"
                />
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
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Paid Trade"
            value="45"
            icon={dashboardStats?.paidButNotMarked || 0}
            trend={-2.5}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Dispute Trade"
            value="28"
            icon={<Gavel />}
            trend={5.8}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Moderator Messages"
            value="156"
            icon={<Message />}
            trend={12.3}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Released Complaints"
            value="72"
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Unreleased Complaints"
            value="13"
            icon={<Cancel />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Vendors"
            value={Number(stats?.activeVendors) || 0}
            icon={<Group />}
            secondary="45 before / 52 after shift"
            color="secondary"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionReports;
