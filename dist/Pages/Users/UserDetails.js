import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Typography, Button, Tabs, Tab, Box, Chip, Avatar, Grid, Paper, Stack, useTheme, alpha, } from "@mui/material";
import { Person as UserIcon, Edit as EditIcon, Delete as DeleteIcon, Shield as ShieldIcon, Phone as PhoneIcon, Email as EmailIcon, AccessTime as ClockIcon, VerifiedUser as ShieldCheckIcon, } from "@mui/icons-material";
import { getSingleUser } from "../../api/user";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../Components/Loading";
import { deleteUser } from "../../api/admin";
import TimeAttendancePanel from "../../Components/TimeAttendancePanel";
const sampleShiftReports = [
    {
        id: "1",
        userName: "John Doe",
        userRole: "Payer",
        shiftType: "Morning (8 AM–3 PM)",
        scheduledStart: "08:00",
        scheduledEnd: "15:00",
        clockIn: "08:15",
        clockOut: "15:00",
        breaks: [{ start: "11:30", end: "12:00" }],
        lateDuration: 15,
        overtimeDuration: 0,
        status: "pending_approval",
        totalHours: 6.5,
        notes: "Traffic delay",
    },
    {
        id: "2",
        userName: "Jane Smith",
        userRole: "Rater",
        shiftType: "Night (9 PM–8 AM)",
        scheduledStart: "21:00",
        scheduledEnd: "08:00",
        clockIn: "21:00",
        clockOut: "08:30",
        breaks: [{ start: "01:00", end: "02:00" }],
        lateDuration: 0,
        overtimeDuration: 30,
        status: "approved",
        totalHours: 10.5,
    },
    {
        id: "3",
        userName: "Mike Wilson",
        userRole: "Rater",
        shiftType: "Morning (8 AM–3 PM)",
        scheduledStart: "08:00",
        scheduledEnd: "15:00",
        clockIn: "08:00",
        clockOut: null,
        breaks: [],
        lateDuration: 0,
        overtimeDuration: 0,
        status: "active",
        totalHours: 0,
    },
];
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (_jsx("div", { role: "tabpanel", hidden: value !== index, id: `tabpanel-${index}`, "aria-labelledby": `tab-${index}`, ...other, children: value === index && _jsx(Box, { children: children }) }));
};
// const TimeAttendancePanel: React.FC = () => {
//   const theme = useTheme();
//   const [selectedReport, setSelectedReport] = useState<ShiftReport | null>(
//     null
//   );
//   const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
//     null
//   );
//   const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
//   const getStatusColor = (status: string) => {
//     const colors = {
//       active: theme.palette.info.main,
//       pending_approval: theme.palette.warning.main,
//       approved: theme.palette.success.main,
//       rejected: theme.palette.error.main,
//     };
//     return colors[status as keyof typeof colors];
//   };
//   const getStatusBg = (status: string) => {
//     const colors = {
//       active: alpha(theme.palette.info.main, 0.1),
//       pending_approval: alpha(theme.palette.warning.main, 0.1),
//       approved: alpha(theme.palette.success.main, 0.1),
//       rejected: alpha(theme.palette.error.main, 0.1),
//     };
//     return colors[status as keyof typeof colors];
//   };
//   const getStatusLabel = (status: string) => {
//     const labels = {
//       active: "Active Shift",
//       pending_approval: "Pending Approval",
//       approved: "Approved",
//       rejected: "Rejected",
//     };
//     return labels[status as keyof typeof labels];
//   };
//   const handleActionClick = (
//     event: React.MouseEvent<HTMLElement>,
//     report: ShiftReport
//   ) => {
//     setSelectedReport(report);
//     setActionMenuAnchor(event.currentTarget);
//   };
//   const handleActionClose = () => {
//     setActionMenuAnchor(null);
//   };
//   const handleApprovalDialogOpen = () => {
//     setApprovalDialogOpen(true);
//     handleActionClose();
//   };
//   return (
//     <Box>
//       {/* Summary Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {[
//           {
//             title: "Active Shifts",
//             value: "3",
//             icon: <ClockIcon />,
//             color: theme.palette.primary.main,
//           },
//           {
//             title: "Pending Approvals",
//             value: "2",
//             icon: <TimerIcon />,
//             color: theme.palette.warning.main,
//           },
//           {
//             title: "Late Today",
//             value: "1",
//             icon: <WarningIcon />,
//             color: theme.palette.error.main,
//           },
//           {
//             title: "On-Time Rate",
//             value: "85%",
//             icon: <CheckIcon />,
//             color: theme.palette.success.main,
//           },
//         ].map((item, index) => (
//           <Grid item xs={12} sm={6} md={3} key={index}>
//             <Paper
//               sx={{
//                 p: 3,
//                 height: "100%",
//                 bgcolor: alpha(item.color, 0.04),
//                 transition:
//                   "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
//                 "&:hover": {
//                   transform: "translateY(-4px)",
//                   boxShadow: theme.shadows[4],
//                   bgcolor: alpha(item.color, 0.08),
//                 },
//               }}
//             >
//               <Stack direction="row" alignItems="center" spacing={2}>
//                 <Box
//                   sx={{
//                     width: 48,
//                     height: 48,
//                     borderRadius: 2,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     bgcolor: alpha(item.color, 0.12),
//                     color: item.color,
//                   }}
//                 >
//                   {item.icon}
//                 </Box>
//                 <Box>
//                   <Typography color="text.secondary" variant="body2">
//                     {item.title}
//                   </Typography>
//                   <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.5 }}>
//                     {item.value}
//                   </Typography>
//                 </Box>
//               </Stack>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>
//       {/* Shift Reports Table */}
//       <Paper sx={{ p: 3 }}>
//         <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
//           Current Shift Reports
//         </Typography>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: 600 }}>User/Role</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Shift</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Clock In/Out</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Break Duration</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Late/Overtime</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
//                 <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {sampleShiftReports.map((report) => (
//                 <TableRow
//                   key={report.id}
//                   sx={{
//                     "&:hover": {
//                       bgcolor: alpha(theme.palette.primary.main, 0.04),
//                     },
//                   }}
//                 >
//                   <TableCell>
//                     <Stack spacing={0.5}>
//                       <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                         {report.userName}
//                       </Typography>
//                       <Chip
//                         label={report.userRole}
//                         size="small"
//                         sx={{
//                           bgcolor: alpha(theme.palette.primary.main, 0.1),
//                           color: theme.palette.primary.main,
//                           fontWeight: 500,
//                         }}
//                       />
//                     </Stack>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">{report.shiftType}</Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {report.scheduledStart} - {report.scheduledEnd}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Stack spacing={0.5}>
//                       <Stack direction="row" spacing={1} alignItems="center">
//                         <StartIcon
//                           sx={{
//                             fontSize: 16,
//                             color: theme.palette.success.main,
//                           }}
//                         />
//                         <Typography variant="body2">
//                           {report.clockIn}
//                         </Typography>
//                       </Stack>
//                       {report.clockOut && (
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <StopIcon
//                             sx={{
//                               fontSize: 16,
//                               color: theme.palette.error.main,
//                             }}
//                           />
//                           <Typography variant="body2">
//                             {report.clockOut}
//                           </Typography>
//                         </Stack>
//                       )}
//                     </Stack>
//                   </TableCell>
//                   <TableCell>
//                     {report.breaks.length > 0 ? (
//                       <Stack spacing={0.5}>
//                         {report.breaks.map((break_, idx) => (
//                           <Typography key={idx} variant="body2">
//                             {break_.start} - {break_.end}
//                           </Typography>
//                         ))}
//                       </Stack>
//                     ) : (
//                       <Typography variant="body2" color="text.secondary">
//                         No breaks
//                       </Typography>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <Stack spacing={0.5}>
//                       {report.lateDuration > 0 && (
//                         <Chip
//                           label={`Late: ${report.lateDuration}m`}
//                           size="small"
//                           sx={{
//                             bgcolor: alpha(theme.palette.error.main, 0.1),
//                             color: theme.palette.error.main,
//                           }}
//                         />
//                       )}
//                       {report.overtimeDuration > 0 && (
//                         <Chip
//                           label={`OT: ${report.overtimeDuration}m`}
//                           size="small"
//                           sx={{
//                             bgcolor: alpha(theme.palette.warning.main, 0.1),
//                             color: theme.palette.warning.main,
//                           }}
//                         />
//                       )}
//                     </Stack>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={getStatusLabel(report.status)}
//                       size="small"
//                       sx={{
//                         bgcolor: getStatusBg(report.status),
//                         color: getStatusColor(report.status),
//                         fontWeight: 500,
//                       }}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <IconButton
//                       size="small"
//                       onClick={(e) => handleActionClick(e, report)}
//                     >
//                       <MoreVertIcon fontSize="small" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//       {/* Action Menu */}
//       <Menu
//         anchorEl={actionMenuAnchor}
//         open={Boolean(actionMenuAnchor)}
//         onClose={handleActionClose}
//       >
//         <MenuItem onClick={handleApprovalDialogOpen}>
//           <ApproveIcon sx={{ mr: 1 }} fontSize="small" />
//           Approve Shift
//         </MenuItem>
//         <MenuItem onClick={handleActionClose}>
//           <RejectIcon sx={{ mr: 1 }} fontSize="small" />
//           Reject Shift
//         </MenuItem>
//         <MenuItem onClick={handleActionClose}>
//           <EditIcon sx={{ mr: 1 }} fontSize="small" />
//           Edit Details
//         </MenuItem>
//       </Menu>
//       {/* Approval Dialog */}
//       <Dialog
//         open={approvalDialogOpen}
//         onClose={() => setApprovalDialogOpen(false)}
//       >
//         <DialogTitle>Approve Shift Report</DialogTitle>
//         <DialogContent>
//           {selectedReport && (
//             <Stack spacing={2} sx={{ mt: 2 }}>
//               <Typography variant="body1">
//                 Are you sure you want to approve the shift report for{" "}
//                 {selectedReport.userName}?
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Shift: {selectedReport.shiftType}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Total Hours: {selectedReport.totalHours}
//               </Typography>
//             </Stack>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={() => setApprovalDialogOpen(false)}
//             color="primary"
//           >
//             Approve
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };
const UserDetails = () => {
    const [tabValue, setTabValue] = React.useState(0);
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const handleTabChange = (_event, newValue) => {
        setTabValue(newValue);
    };
    const statusColors = {
        active: "success",
        inactive: "default",
        suspended: "error",
    };
    const tabs = [
        // {
        //   icon: <ActivityIcon />,
        //   label: "Trades",
        //   content: "Trading history will be displayed here",
        // },
        {
            icon: _jsx(ClockIcon, {}),
            label: "Shift Reports",
            content: user !== null && _jsx(TimeAttendancePanel, { userId: user.id }),
        },
    ];
    const statusBackgrounds = {
        active: alpha(theme.palette.success.main, 0.1),
        inactive: alpha(theme.palette.grey[500], 0.1),
        suspended: alpha(theme.palette.error.main, 0.1),
    };
    useEffect(() => {
        const fetch = async () => {
            const data = await getSingleUser(id);
            if (data?.success) {
                setUser(data.data);
                setLoading(false);
            }
            else {
                navigate("/admin/users");
                return;
            }
        };
        fetch();
    }, []);
    if (loading) {
        return _jsx(Loading, {});
    }
    return (_jsxs(Box, { sx: {
            p: { xs: 2, sm: 3 },
            maxWidth: "lg",
            mx: "auto",
        }, children: [_jsxs(Card, { sx: {
                    mb: 3,
                    py: 3,
                    boxShadow: theme.shadows[3],
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                        boxShadow: theme.shadows[6],
                    },
                }, children: [_jsx(CardHeader, { sx: {
                            p: { xs: 2, sm: 3 },
                            "& .MuiCardHeader-content": { overflow: "hidden" },
                        }, avatar: _jsx(Avatar, { src: user?.avatar, sx: {
                                width: { xs: 100, sm: 100 },
                                height: { xs: 100, sm: 100 },
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                transition: "transform 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                },
                            }, children: _jsx(UserIcon, { sx: {
                                    width: { xs: 28, sm: 32 },
                                    height: { xs: 28, sm: 32 },
                                    color: theme.palette.primary.main,
                                } }) }), action: _jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 1, sx: { mt: { xs: 2, sm: 0 } }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(EditIcon, {}), size: "large", sx: {
                                        borderRadius: 2,
                                        textTransform: "none",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: theme.shadows[2],
                                        },
                                    }, children: "Edit User" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(DeleteIcon, {}), size: "large", sx: {
                                        borderRadius: 2,
                                        textTransform: "none",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: theme.shadows[2],
                                        },
                                    }, onClick: async () => {
                                        const cfs = window.confirm("Do you want to delte this User?");
                                        if (!cfs) {
                                            return;
                                        }
                                        const data = await deleteUser(id);
                                        if (data?.success) {
                                            navigate("/admin/users");
                                            return;
                                        }
                                    }, children: "Delete User" })] }), title: _jsx(Typography, { variant: "h5", sx: {
                                mb: 1,
                                fontWeight: 600,
                                color: "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }, children: user?.fullName || "Unknown User" }), subheader: _jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", gap: 1, children: [user?.userType && (_jsx(Chip, { label: user.userType, variant: "outlined", size: "small", sx: {
                                        textTransform: "capitalize",
                                        borderRadius: 1.5,
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                    } })), user?.status && (_jsx(Chip, { label: user.status, color: statusColors[user.status], size: "small", sx: {
                                        borderRadius: 1.5,
                                        bgcolor: statusBackgrounds[user.status],
                                        fontWeight: 500,
                                    } }))] }) }), _jsx(CardContent, { sx: { p: { xs: 2, sm: 3 } }, children: _jsx(Grid, { container: true, spacing: 3, children: [
                                {
                                    icon: _jsx(EmailIcon, {}),
                                    label: "Email",
                                    value: user?.email,
                                },
                                {
                                    icon: _jsx(PhoneIcon, {}),
                                    label: "Phone",
                                    value: user?.phone || "Not provided",
                                },
                                {
                                    icon: _jsx(ShieldIcon, {}),
                                    label: "Role",
                                    value: user?.userType || "Not assigned",
                                },
                                {
                                    icon: _jsx(ShieldCheckIcon, {}),
                                    label: "2FA Status",
                                    value: user?.twoFaEnabled ? "Enabled" : "Disabled",
                                },
                                {
                                    icon: _jsx(ClockIcon, {}),
                                    label: "Created At",
                                    value: user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "N/A",
                                },
                            ].map((item, index) => (_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: {
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha("#F8BC08", 0.04),
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            bgcolor: alpha("#F8BC08", 0.08),
                                            transform: "translateY(-2px)",
                                        },
                                    }, children: [_jsx(Box, { sx: {
                                                color: "#F8BC08",
                                                display: "flex",
                                                alignItems: "center",
                                            }, children: item.icon }), _jsxs(Box, { sx: { minWidth: 0 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 500 }, children: item.label }), _jsx(Typography, { sx: {
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }, children: item.value })] })] }) }, index))) }) })] }), _jsxs(Paper, { sx: {
                    width: "100%",
                    boxShadow: theme.shadows[3],
                    borderRadius: 2,
                    overflow: "hidden",
                }, children: [_jsx(Tabs, { value: tabValue, onChange: handleTabChange, sx: {
                            borderBottom: 1,
                            borderColor: "divider",
                            "& .MuiTab-root": {
                                textTransform: "none",
                                minHeight: 56,
                                fontSize: "1rem",
                                fontWeight: 500,
                            },
                        }, children: tabs.map((tab, index) => (_jsx(Tab, { icon: tab.icon, iconPosition: "start", label: tab.label, sx: { px: 3 } }, index))) }), tabs.map((tab, index) => (_jsx(TabPanel, { value: tabValue, index: index, children: _jsxs(Card, { sx: { boxShadow: "none" }, children: [_jsx(CardHeader, { title: _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: tab.label }) }), _jsx(CardContent, { children: typeof tab.content === "string" ? (_jsx(Typography, { color: "text.secondary", children: tab.content })) : (tab.content) })] }) }, index)))] })] }));
};
export default UserDetails;
