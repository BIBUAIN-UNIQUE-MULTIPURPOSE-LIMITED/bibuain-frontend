import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ThreeDots, CirclesWithBar } from "react-loader-spinner";
const Loading = () => {
    return (_jsxs("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center font-primary", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "relative z-10", children: _jsx(CirclesWithBar, { height: "120", width: "120", color: "#F8BC08", barColor: "#C6980C", wrapperClass: "justify-center", visible: true, outerCircleColor: "#F8BC08", innerCircleColor: "#C6980C" }) }), _jsx("div", { className: "absolute inset-0 bg-button/20 blur-3xl rounded-full scale-150 animate-pulse" })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("h2", { className: "text-2xl font-semibold text-foreground mb-2", children: "Loading" }), _jsx("div", { className: "flex items-center justify-center gap-1", children: _jsx(ThreeDots, { height: "30", width: "45", color: "#F8BC08", visible: true, wrapperClass: "justify-center" }) }), _jsx("p", { className: "text-text2 mt-4 text-sm animate-pulse", children: "Please wait while the resource is being loaded" })] }), _jsx("div", { className: "w-48 h-1 bg-gray-200 rounded-full mt-8 overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-button to-primary2 rounded-full animate-pulse", style: {
                        width: "98%",
                        transition: "width 2s ease-in-out",
                    } }) })] }));
};
export default Loading;
