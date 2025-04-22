import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { MdAccountBalanceWallet, MdSettings, } from "react-icons/md";
import { DashboardOutlined, MessageOutlined, PaymentOutlined, PeopleOutlined, RateReview, Support, } from "@mui/icons-material";
import { Coins, Landmark, LogsIcon, MessageCircleCodeIcon } from "lucide-react";
const Dashboard = ({ user }) => {
    const links = [
        {
            to: "/",
            label: "Dashboard",
            icon: (_jsx(DashboardOutlined, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "rater", "payer", "cc"],
        },
        {
            to: "/admin/message-templates",
            label: "Message Templates",
            icon: (_jsx(MessageCircleCodeIcon, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin"],
        },
        {
            to: "/admin/account/all",
            label: "Forex Accounts",
            icon: (_jsx(MdAccountBalanceWallet, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin"],
        },
        {
            to: "/admin/users",
            label: "Users",
            icon: (_jsx(PeopleOutlined, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "ceo"],
        },
        {
            to: "/exchange",
            label: "Coin Exchange",
            icon: (_jsx(Coins, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "ceo", "rater"],
        },
        {
            to: "/rater",
            label: "Rater",
            icon: (_jsx(RateReview, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin"],
        },
        {
            to: "/transaction/history",
            label: "Transaction History",
            icon: (_jsx(PaymentOutlined, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["payer"],
        },
        {
            to: "/cc",
            label: "Cusomter Care",
            icon: (_jsx(Coins, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin"],
        },
        {
            to: "/customer-support",
            label: "Customer Support",
            icon: (_jsx(Support, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["customer-support", "payer "],
        },
        {
            to: "/banks",
            label: "Bank Management",
            icon: (_jsx(Landmark, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "rater"],
        },
        {
            to: "/inbox",
            label: "Inbox",
            icon: (_jsx(MessageOutlined, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "payer", "rater", "ceo", "customer-support"],
        },
        {
            to: "/admin/activity-logs",
            label: "Activity Logs",
            icon: (_jsx(LogsIcon, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin"],
        },
        {
            to: "/settings",
            label: "Settings",
            icon: (_jsx(MdSettings, { className: "text-[22px] sm:text-[26px] md:text-[28px] w-[22px] sm:w-[26px] md:w-[28px] mr-[10px]" })),
            allowedUserTypes: ["admin", "payer", "rater", "ceo", "customer-support"],
        },
    ];
    const filteredLinks = links.filter((link) => link.allowedUserTypes.includes(user?.userType || "rater"));
    return (_jsxs("nav", { className: "w-full h-screen bg-gradient-to-b from-[#FFC107] to-[#C6980C] flex flex-col justify-start items-center overflow-hidden ", children: [_jsx("div", { className: "py-[20px] sm:py-[25px] md:py-[30px]", children: _jsxs(NavLink, { to: "/", className: "flex justify-center items-center flex-col", children: [_jsx("img", { src: "/logo.png", className: "w-[50px] sm:w-[70px] md:w-[90px] h-auto", alt: "Bibuain Logo" }), _jsx("h1", { className: "hidden font-primary uppercase sm:block font-bold text-black text-[16px] sm:text-[20px] md:text-[24px]", children: "Bibuain" })] }) }), _jsx("ul", { className: "w-full h-[80vh] overflow-x-hidden scroll-bar overflow-auto", id: "d-list", children: filteredLinks.map((link) => (_jsx("li", { className: "text-black font-secondary font-bold hover:bg-black/5 transition-all duration-200", children: _jsxs(NavLink, { to: link.to, className: ({ isActive }) => `flex justify-center sm:justify-start items-center py-[10px] px-[10px] sm:py-[15px] sm:px-[20px] md:py-[18px] md:px-[25px] ${isActive ? "bg-white rounded-lg shadow-md" : ""}`, children: [link.icon, _jsx("span", { className: "hidden sm:block text-[14px] sm:text-[16px] md:text-[18px] font-medium", children: link.label })] }) }, link.to))) })] }));
};
export default Dashboard;
