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
import AboutUs from './pages/AboutUs';
import CreatePage from "./pages/CreatePage";
import AddProducts from './pages/AddProducts';
import Layout from './components/Layout';
import RedirectGoogleAuth from "./components/GoogleRedirectHandler"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import Publish from './pages/Publish';
import PublicProductPage from './pages/PublicProductPage';
import Help from './pages/Help';


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
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/create" element={<CreatePage />} />
                        <Route path="/add-products" element={<AddProducts/>} />
                        <Route path="/publish" element={<Publish/>} />
                        <Route path="/help" element={<Help/>} />
                    </Route>
                    <Route path="/about" element={<AboutUs />} />
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
                <Route path="/landingpage" element={<LandingPage />} />
                <Route path="/landingpage/:pageId" element={<PublicProductPage />} />
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