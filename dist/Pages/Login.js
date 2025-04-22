import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { handleApiError } from "../api/user";
import { BASE_URL, loadingStyles, successStyles } from "../lib/constants";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../Components/ContextProvider";
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading("Logging in...", loadingStyles);
            setLoading(true);
            const res = await axios.post(`${BASE_URL}/user/login`, {
                email,
                password,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            setLoading(false);
            toast.dismiss();
            toast.success(res.data.message, successStyles);
            navigate(`/2fa?email=${email}`);
            return res.data;
        }
        catch (error) {
            setLoading(false);
            toast.dismiss();
            handleApiError(error);
            return null;
        }
    };
    useEffect(() => {
        if (user !== null) {
            navigate("/");
        }
    }, [navigate, user]);
    return (_jsxs("div", { className: "w-[100vw] h-max min-h-[100vh] flex gap-[30px] md:gap-0\n         justify-between items-center flex-col md:flex-row relative bg-white", children: [_jsx("div", { className: "w-full md:w-[40%] h-max md:h-[100vh] max-h-[100vh] gap-[10px] md:gap-0 gradient-background flex justify-between items-center flex-col relative ", style: {
                    borderRadius: "30px",
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                }, children: _jsx("div", { className: "w-max h-full flex justify-center items-center", children: _jsx("img", { src: "/logo.png", alt: "Bibuain Logo", className: "w-max h-[200px] sm:h-[300px] object-cover object-center z-[1000]" }) }) }), _jsx("div", { className: "w-[60%] h-full flex justify-center items-center p-[20px]", children: _jsxs("div", { className: "flex justify-between items-center flex-col h-[max] gap-[10px] md:gap-[30px]", children: [_jsxs("div", { className: "font-[700] font-primary uppercase text-[39px] text-center", children: ["Login \u270C\uFE0F", _jsxs("div", { className: "flex justify-center items-center gap-1", children: [_jsx("div", { className: "bg-primary2 w-[10px] h-[10px] rounded-full" }), _jsx("div", { className: "bg-primary w-[10px] h-[10px] rounded-full" })] })] }), _jsxs("form", { className: "flex justify-center items-center w-[20rem] h-full flex-col gap-[20px]", onSubmit: handleSubmit, children: [_jsxs("div", { className: "flex justify-start items-center bg-[#e3e1e1] gap-[5px] w-[20rem] h-[3rem] rounded-full p-[10px] px-[15px]", children: [_jsx(MdEmail, { className: "text-[25px]" }), _jsx("input", { required: true, value: email, onChange: (e) => setEmail(e.target.value), type: "email", name: "email", id: "email", placeholder: "Email", className: "w-full h-[3rem] bg-transparent border-none outline-none text-[18px]" })] }), _jsxs("div", { className: "flex justify-start items-center bg-[#e3e1e1] gap-[5px] w-[20rem] h-[3rem] rounded-full p-[10px] px-[15px]", children: [_jsx(MdLock, { className: "text-[25px]" }), _jsx("input", { required: true, name: "password", value: password, onChange: (e) => setPassword(e.target.value), type: showPassword ? "text" : "password", placeholder: "Password", className: "w-full h-[3rem] bg-transparent border-none outline-none text-[18px]" }), _jsx("button", { type: "button", onClick: () => setShowPassword((prev) => !prev), children: showPassword ? (_jsx(MdVisibilityOff, { className: "text-[20px]" })) : (_jsx(MdVisibility, { className: "text-[20px]" })) })] }), _jsxs("div", { className: "w-[20rem] flex justify-between items-center", children: [_jsxs("div", { className: "flex justify-start items-center gap-2", children: [_jsx("input", { type: "checkbox", name: "remember", id: "remember" }), _jsx("label", { htmlFor: "remember text-[14px]", children: "Remember me" })] }), _jsx(Link, { to: "/forget-password", className: "border-b border-[#818181] text-[14px] text-[#818181]", children: "Forgot Password" })] }), _jsx("button", { disabled: loading, type: "submit", className: "button-gradient w-full h-[3rem] rounded-md text-white font-[600] text-[20px] disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? "Loading..." : "Next" })] })] }) })] }));
};
export default Login;
