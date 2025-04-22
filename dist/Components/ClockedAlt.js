import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock } from "lucide-react";
const ClockedAlt = () => {
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center bg-background p-4", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx(Clock, { className: "h-16 w-16 mx-auto text-button animate-pulse" }), _jsx("h1", { className: "text-3xl font-primary font-semibold bg-gradient-to-r from-button to-primary2 bg-clip-text text-transparent", children: "You're Not Clocked In" }), _jsx("p", { className: "text-text2 font-secondary text-lg", children: "Please clock in to start your shift" })] }) }));
};
export default ClockedAlt;
