import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AnonymousRoute from './components/AnonymousRoute';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RedirectGoogleAuth from "./components/GoogleRedirectHandler"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                /> */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    {/* Protected routes here */}
                </Route>

                {/* Public Routes here*/}
                <Route path="/login/callback" element={<RedirectGoogleAuth />} />
                <Route
                    path="/login"
                    element={
                        <AnonymousRoute>
                            <Login />
                        </AnonymousRoute>
                    }
                />
                <Route path="/logout" element={<Logout />} />
                <Route
                    path="/register"
                    element={
                        <AnonymousRoute>
                            <RegisterAndLogout />
                        </AnonymousRoute>
                    }
                />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;