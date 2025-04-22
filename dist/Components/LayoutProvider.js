import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Dashboard from "./Dashboards";
import Header from "./Header";
import { useUserContext } from "./ContextProvider";
import AuthProvider from "./AuthProvider";
import Loading from "./Loading";
const LayoutProvider = React.memo(({ children }) => {
    const location = useLocation();
    const { loading, user } = useUserContext();
    const excludeDashboard = useMemo(() => [
        "/login",
        "/2fa",
        "/verify-account",
        "/forget-password",
        "/reset-password",
    ].includes(location.pathname), [location.pathname]);
    if (loading) {
        return _jsx(Loading, {});
    }
    if (excludeDashboard)
        return _jsx("main", { children: children });
    return (_jsx(AuthProvider, { children: _jsxs("div", { className: "flex w-full min-h-screen", children: [_jsx("div", { className: "sticky top-0 h-screen w-[17%] md:w-1/5", children: _jsx(Dashboard, { user: user }) }), _jsxs("div", { className: "w-[83%] md:w-[80%] py-[15px] pt-0 flex flex-col gap-[20px] h-screen overflow-y-scroll overflow-x-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-grow p-[20px] md:px-[30px] md:py-[20px]", children: children })] })] }) }));
});
export default LayoutProvider;
