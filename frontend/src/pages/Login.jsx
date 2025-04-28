import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import { showErrorToast, showInfoToast, showLoadingToast, updateToast } from '../utils/toastUtils';

function Login() {
    const [usernameOrEmail, setUsernameOrEmail] = useState(""); // Single input for username or email
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({}); // To store validation errors
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setErrors({}); // clear previous errors

        try {
            const res = await api.post("/api/login/", { username: usernameOrEmail, password });
            
            if (res.data.is_verified === false) {
                // if not verified, redirect to OTP verification page
                showErrorToast("Please verify your email first!")
                setTimeout(() => {
                    navigate("/verify-otp", { state: { username: usernameOrEmail } });
                }, 2000);
            } else {
                // if verified, store the tokens and navigate to the home/dashboard page
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            }

        } catch (error) {
            console.log(error.response);
            if (error.response) {
                showErrorToast(error.response?.data?.error || "Login Failed!");
            } else {
                showErrorToast("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Login</h1>
            {/* Display general errors (if any) */}
            {errors.general && <p className="error-message">{errors.general}</p>}

            {/* Single field for username or email */}
            <input
                className="form-input"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Username or Email"
                required
            />

            {/* Password field */}
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            {/* Show password error (if any) */}
            {errors.password && <p className="error-message">{errors.password}</p>}

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Login"}
            </button>
        </form>
    );
}

export default Login;
