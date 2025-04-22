import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { deleteUser, getAllUsers } from "../../api/admin";
import { alpha, Avatar } from "@mui/material";
import theme from "../../Components/theme";
import { Person } from "@mui/icons-material";
import { createChat } from "../../api/chats";
import { useUserContext } from "../../Components/ContextProvider";
const UsersTable = () => {
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [filterText, setFilterText] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const navigate = useNavigate();
    const { user, loading } = useUserContext();
    const [users, setUsers] = useState([]);
    useEffect(() => {
        if (user === null && !loading) {
            navigate("/login");
            return;
        }
        const fetch = async () => {
            const data = await getAllUsers();
            if (data?.success) {
                setUsers(data.data);
            }
            else {
                setUsers([]);
            }
        };
        fetch();
        const handleClickOutside = (e) => {
            const target = e.target;
            if (!target.closest(".dropdown-menu") &&
                !target.closest(".menu-button")) {
                setDropdownOpen({});
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
    const handleCreateChat = async (participants) => {
        const data = await createChat(participants);
        if (data?.success) {
            navigate(`/inbox?chatId=${data.data.id}`);
        }
    };
    const filteredUsers = users.sort((a, b) => {
        let compareA, compareB;
        switch (sortBy) {
            case "name":
                compareA = `${a.fullName}`;
                compareB = `${b.fullName}`;
                break;
            case "email":
                compareA = a.email;
                compareB = b.email;
                break;
            default:
                return 0;
        }
        return sortOrder === "asc"
            ? compareA.localeCompare(compareB)
            : compareB.localeCompare(compareA);
    });
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }
        else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };
    const toggleDropdown = (id) => {
        setDropdownOpen({ [id]: !dropdownOpen[id] });
    };
    console.log(users);
    return (_jsx("div", { className: "min-h-screen to-card font-primary", children: _jsx("div", { className: "max-w-7xl h-full mx-auto", children: _jsx("div", { className: "bg-card h-full rounded-xl shadow-lg border border-border overflow-visible", children: _jsxs("div", { className: "p-8 min-h-[80vh]", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold font-secondary bg-gradient-to-r from-primary2 to-primary bg-clip-text text-transparent", children: "Users Management" }), _jsx("p", { className: "text-text2 mt-2 font-third", children: "Manage and monitor user accounts" })] }), _jsxs("div", { className: "flex flex-col h-full md:flex-row gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx("input", { type: "text", placeholder: "Search users...", value: filterText, onChange: (e) => setFilterText(e.target.value), className: "pl-12 pr-4 py-3 w-full md:w-72 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 font-third" })] }), _jsx("div", { className: "relative h-full flex justify-center items-center", children: _jsx(Link, { to: "/admin/users/create", className: " bg-button  flex justify-center items-center px-[1rem] rounded-full   font-primary  relative top-[5px] font-semibold h-[2.5rem]", children: "Create User" }) })] })] }), _jsx("div", { className: "relative h-full border border-border rounded-lg overflow-auto", children: _jsxs("table", { className: "w-full h-max mb-[10rem]", children: [_jsx("thead", { className: "bg-muted sticky top-0 z-10", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary", onClick: () => handleSort("name"), children: "Avatar" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary cursor-pointer hover:text-foreground", onClick: () => handleSort("name"), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Full Name", sortBy === "name" && (_jsx(ChevronDown, { className: `h-4 w-4 transform transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}` }))] }) }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary cursor-pointer hover:text-foreground", onClick: () => handleSort("email"), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Email", sortBy === "email" && (_jsx(ChevronDown, { className: `h-4 w-4 transform transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}` }))] }) }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary", children: "Contact No" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary", children: "User Type" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-muted-foreground font-secondary", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: filteredUsers.map((u) => (_jsxs("tr", { className: "hover:bg-muted/50 transition-colors duration-200", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx(Avatar, { sx: {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main,
                                                        }, className: "object-fit object-cover", src: u.avatar, children: !u.avatar && _jsx(Person, { sx: { fontSize: 40 } }) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: `${u.fullName}` }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: u.email }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: u.phone }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: u.userType }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap relative", children: [_jsx("button", { onClick: () => toggleDropdown(u.id), className: "p-2 rounded-full text-muted-foreground hover:bg-muted/50 focus:outline-none menu-button", children: _jsx(MoreVertical, { className: "h-5 w-5" }) }), dropdownOpen[u.id] && (_jsx("div", { className: "absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] dropdown-menu", children: _jsxs("ul", { className: "py-1 text-sm text-gray-700", children: [_jsx("li", { className: "px-4 py-2 hover:bg-gray-100 cursor-pointer", onClick: () => {
                                                                            return navigate(`/admin/users/${u.id}`);
                                                                        }, children: "User Details" }), _jsx("li", { className: "px-4 py-2 hover:bg-gray-100 cursor-pointer", onClick: () => {
                                                                            handleCreateChat([
                                                                                u.id.toString(),
                                                                                user?.id.toString() || "no_id",
                                                                            ]);
                                                                        }, children: "Inbox" }), _jsx("li", { className: "px-4 py-2 hover:bg-gray-100 cursor-pointer", onClick: async () => {
                                                                            const cfs = window.confirm("Do you want to delete this User ?");
                                                                            if (!cfs) {
                                                                                return;
                                                                            }
                                                                            const data = await deleteUser(u.id);
                                                                            if (data?.success) {
                                                                                const filtered = users.filter((us) => us.id !== u.id);
                                                                                setUsers(filtered);
                                                                            }
                                                                        }, children: "Delete User" }), _jsx("li", { className: "px-4 py-2 hover:bg-gray-100 cursor-pointer", onClick: () => console.log(`Edit u ${u.fullName}`), children: "Edit User" })] }) }))] })] }, u.id))) })] }) })] }) }) }) }));
};
export default UsersTable;
