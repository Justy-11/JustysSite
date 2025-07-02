import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";
import { showErrorToast, showInfoToast } from '../utils/toastUtils';
import { FcGoogle } from 'react-icons/fc';
import Navbar from "../components/NavBar";
import Cookies from 'js-cookie';

function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
        e.preventDefault();
        setErrors({});
        setLoading(true);

        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            setLoading(false);
            return;
        }

        try {
            const res = await api.post("/api/user/register/", {
                email,
                username,
                password,
            });
            console.log('Register response:', res.data);
            showInfoToast("Registration successful! Please verify your email.");
            navigate("/verify-otp", { state: { username } });
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);
            if (error.response) {
                showErrorToast(error.response.data.error || "Registration failed!");
            } else {
                showErrorToast("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const googleRegister = () => {
        console.log('Initiating Google registration with rememberMe:', rememberMe);
        const state = rememberMe ? 'remember:true' : 'remember:false';
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        window.location.href = `${backendUrl}/accounts/google/login/?state=${encodeURIComponent(state)}`;
    };

    return (
        <>
            <Navbar links={navLinks} />

            <form onSubmit={handleSubmit} className="form-container">
                <h1>Register</h1>

                <button
                    className="form-button google-button"
                    type="button"
                    onClick={googleRegister}
                    disabled={loading}
                >
                    <FcGoogle size={20} />
                    Sign up with Google
                </button>

                <div className="separator">
                    <span>OR</span>
                </div>

                {errors.general && <p className="error-message">{errors.general}</p>}

                <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                {errors.email && <p className="error-message">{errors.email}</p>}

                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                {errors.username && <p className="error-message">{errors.username}</p>}

                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                {errors.password && <p className="error-message">{errors.password}</p>}

                <input
                    className="form-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}

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

                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Register"}
                </button>

                <div className="login-links">
                    <p onClick={() => navigate("/login")} className="resend-link">
                        Already have an account? <strong>Login</strong>
                    </p>
                </div>
            </form>
        </>
    );
}

export default Register;