import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css"
// import LoadingIndicator from "./LoadingIndicator";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({}); // To store validation errors
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = "Register";

    // Username validation
    const validateUsername = () => {
        // if (!username.trim()) {
        //     setErrors({ ...errors, username: "Username is required." });
        //     return false;
        // }
        if (username.length < 3) {
            setErrors({ ...errors, username: "Username must be at least 3 characters long." });
            return false;
        }
        if (username.length > 30) {
            setErrors({ ...errors, username: "Username cannot be longer than 30 characters." });
            return false;
        }
        return true;
    };

    // Password validation
    const validatePassword = () => {
        // if (!password.trim()) {
        //     setErrors({ ...errors, password: "Password is required." });
        //     return false;
        // }
        if (password.length < 8) {
            setErrors({ ...errors, password: "Password must be at 2 least 8 characters long." });
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one uppercase letter." });
            return false;
        }
        if (!/[a-z]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one lowercase letter." });
            return false;
        }
        if (!/\d/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one number." });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setErrors({}); // Clear previous errors

        // const isUsernameValid = validateUsername();
        // const isPasswordValid = validatePassword();

        // If validation fails, stop the form submission
        // if (!isUsernameValid || !isPasswordValid) return;
        //setLoading(true);

        try {
            const res = await api.post("/api/user/register/", { username, email, password })
            showSuccessToast("Successfully registered! Check your email.");
            setTimeout(() => {
                navigate("/verify-otp", { state: { username } })
            }, 2000);
            
        } catch (error) {
            // alert(error)
            if (error.response) {
                // Handle backend validation errors
                showErrorToast(error.response?.data?.error || "Registration failed!");
            } else {
                showErrorToast("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            {/* Display general errors (if any) */}
            {errors.general && <p className="error-message">{errors.general}</p>}

            {/* Username field */}
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            {/* Show username error (if any) */}
            {errors.username && <p className="error-message">{errors.username}</p>}

            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
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
                {loading ? "Processing..." : name}
            </button>
        </form>
    );
}

export default Register