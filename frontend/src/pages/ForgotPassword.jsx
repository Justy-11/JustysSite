import { useState } from "react";
import api from "../api";
import "../styles/Form.css";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/forgot-password/", { email });
            showSuccessToast("Password reset link sent to your email.");
        } catch (error) {
            showErrorToast(error.response?.data?.error || "Error sending reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Forgot Password</h1>
            <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
            </button>
        </form>
    );
}

export default ForgotPassword;
