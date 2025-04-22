import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { handleApiError } from "../api/user";
import { useUserContext } from "../Components/ContextProvider";
import { BASE_URL, loadingStyles, successStyles } from "../lib/constants";
import axios from "axios";
const TwoFactorAuth = () => {
    const [code, setCode] = useState(Array(6).fill(""));
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { setUser, user } = useUserContext();
    const handleChange = (e, index) => {
        const value = e.target.value;
        const newCode = [...code];
        if (/^\d$/.test(value) || value === "") {
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                document.getElementById(`code-${index + 1}`)?.focus();
            }
        }
    };
    const handleKeyDown = (e, index) => {
        const newCode = [...code];
        if (e.key === "Backspace" && index > 0 && !code[index]) {
            newCode[index - 1] = "";
            setCode(newCode);
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };
    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").trim();
        if (pasteData.length === 6 && /^\d{6}$/.test(pasteData)) {
            setCode(pasteData.split(""));
            document.getElementById(`code-5`)?.focus();
        }
        e.preventDefault();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.join("").length < 6) {
            return toast.error("Incomplete Code!");
        }
        setLoading(true);
        try {
            toast.loading("Verify 2FA...", loadingStyles);
            const res = await axios.post(`${BASE_URL}/user/verify-2fa`, { twoFaCode: code.join(""), email }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            toast.dismiss();
            toast.success(res.data.message, successStyles);
            setUser(res.data.data);
            navigate("/");
        }
        catch (error) {
            toast.dismiss();
            handleApiError(error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (user !== null) {
            navigate("/");
            return;
        }
        const email = searchParams.get("email");
        if (!email) {
            navigate("/login");
            return;
        }
        else {
            setEmail(email);
        }
    }, []);
    return (_jsxs("div", { className: "w-[100vw] min-h-[100vh] flex flex-col md:flex-row justify-between items-center bg-white", children: [_jsx("div", { className: "w-full md:w-[40%] h-max md:h-[100vh] gradient-background flex flex-col justify-between items-center", style: {
                    borderRadius: "30px",
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                }, children: _jsx("div", { className: "w-max h-full flex justify-center items-center", children: _jsx("img", { src: "/logo.png", alt: "Bibuain Logo", className: "h-[200px] sm:h-[300px] object-cover object-center z-[1000]" }) }) }), _jsx("div", { className: "w-[60%] h-full flex justify-center items-center p-[20px]", children: _jsxs("div", { className: "flex flex-col items-center gap-[30px]", children: [_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(MdLockOutline, { className: "text-[50px] text-primary2 bg-[#F5F5F54D] border border-gray-700/10 rounded-full p-1" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "bg-primary w-[10px] h-[10px] cursor-pointer rounded-full", onClick: () => navigate("/login") }), _jsx("div", { className: "bg-primary2 w-[10px] h-[10px] rounded-full" })] })] }), _jsxs("div", { className: "w-[22rem] h-max flex justify-center items-center flex-col", children: [_jsx("div", { className: "font-bold uppercase text-[30px] text-center w-[20rem]", children: "Two Factor Authentication" }), _jsx("div", { className: "text-text2 font-primary ", children: "Enter the code sent on your mail" })] })] }), _jsxs("form", { className: "flex flex-col items-center w-[20rem] gap-[20px]", onSubmit: handleSubmit, children: [_jsx("div", { className: "flex justify-center mb-6", children: code.map((digit, index) => (_jsx("input", { id: `code-${index}`, type: "text", maxLength: 1, value: digit, onChange: (e) => handleChange(e, index), onKeyDown: (e) => handleKeyDown(e, index), onPaste: index === 0 ? handlePaste : undefined, className: "w-12 h-12 mx-2 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:border-primary" }, index))) }), _jsx("button", { disabled: loading, type: "submit", className: "button-gradient w-full h-[3rem] rounded-md text-white font-semibold text-[20px] disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? "Loading..." : "Next" })] })] }) })] }));
};
export default TwoFactorAuth;
