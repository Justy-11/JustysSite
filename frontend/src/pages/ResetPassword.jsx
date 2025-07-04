import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import Navbar from "../components/NavBar";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { search } = useLocation();
    const token = new URLSearchParams(search).get("token");
    const uid = new URLSearchParams(search).get("uid");

    const navLinks = [
        { href: "/landingpage", label: "Home" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
    ];
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showErrorToast("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);
            await api.post("/api/reset-password/", {
                uid,
                token,
                password,
            });
            showSuccessToast("Password reset successful!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            showErrorToast(error.response?.data?.error || "Reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar links={navLinks} />
            
            <form onSubmit={handleSubmit} className="form-container">
                <h1>Reset Password</h1>
                <input
                    className="form-input"
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    className="form-input"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </>
    );
}

export default ResetPassword;
