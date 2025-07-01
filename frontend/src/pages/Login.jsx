import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";
import { showErrorToast, showInfoToast } from '../utils/toastUtils';
import { FcGoogle } from 'react-icons/fc';
import Navbar from "../components/NavBar";

function Login() {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const navLinks = [
        { href: "/landingpage", label: "Home" },
        { href: "/about", label: "About Us" },
        { href: "/support", label: "Support" },
    ];

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setErrors({});

        try {
            const res = await api.post("/api/login/", { username: usernameOrEmail, password, remember: rememberMe });
            if (res.data.is_verified === false) {
                showErrorToast("Please verify your email first!");
                setTimeout(() => {
                    navigate("/verify-otp", { state: { username: usernameOrEmail } });
                }, 2000);
            } else {
                showInfoToast('Logged in successfully!');
                navigate("/");
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            if (error.response) {
                showErrorToast(error.response?.data?.error || "Login Failed!");
            } else {
                showErrorToast("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = () => {
        const state = rememberMe ? 'remember:true' : 'remember:false';
        window.location.href = `http://localhost:8000/accounts/google/login/?state=${encodeURIComponent(state)}`;
    };

    return (
        <>
            <Navbar links={navLinks} />

            <form onSubmit={handleSubmit} className="form-container">
                <h1>Login</h1>

                <button
                    className="form-button google-button"
                    type="button"
                    onClick={googleLogin}
                    disabled={loading}
                >
                    <FcGoogle size={20} />
                    Sign in with Google
                </button>
                
                <div className="separator">
                    <span>OR</span>
                </div>

                {errors.general && <p className="error-message">{errors.general}</p>}

                <input
                    className="form-input"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or Email"
                    required
                />

                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />

                <div style={{ width: '90%', display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#4a3174', cursor: 'pointer' }}>
                        Remember Me
                    </label>
                </div>

                {errors.password && <p className="error-message">{errors.password}</p>}

                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Login"}
                </button>

                <div className="login-links">
                    <p onClick={() => navigate("/forgot-password")} className="resend-link-forgot-password">
                        Forgot password?
                    </p>

                    <div className="line-separator" />

                    <p onClick={() => navigate("/register")} className="resend-link">
                        Don't have an account? <strong>Sign up</strong>
                    </p>
                </div>
            </form>
        </>
    );
}

export default Login;