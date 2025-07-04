import { useState } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Form.css"
import { showErrorToast, showInfoToast, showLoadingToast, updateToast } from '../utils/toastUtils';
import Navbar from "../components/NavBar";

function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const username = location.state?.username; // retrieve username from state

    const navLinks = [
        { href: "/landingpage", label: "Home" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = showLoadingToast("Verifying OTP...");
        try {
            await api.post("/api/user/verify-otp/", { username, otp });
            updateToast(toastId, { message: "OTP verified successfully!", type: "success" });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.response) {
                updateToast(toastId, { message: error.response?.data?.error || "Verification failed!", type: "error" });
            } else {
                showErrorToast("Something went wrong!");
            }
        }
    };

    const resendOTP = async () => {
        setLoading(true);
        try {
            await api.post("/api/user/resend-otp/", { username });
            setError("");
            showInfoToast("OTP has been resent to your email!");
            
        } catch (error) {
            if (error.response) {
                showErrorToast(error.response?.data?.error || "Failed to resend OTP!");
            } else {
                showErrorToast("Something went wrong while resending OTP.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar links={navLinks} />
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="form-title">Verify OTP</h2>

                {error && <p className="error-message">{error}</p>}

                <input
                    className="form-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                />

                <p 
                    onClick={resendOTP}
                    className="resend-link"
                >
                    Resend OTP
                </p>
                
                <button className="form-button" type="submit">
                    Verify
                </button>
            </form>
        </>
    );
}

export default VerifyOtp;
