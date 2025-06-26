import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN, GOOGLE_ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { showInfoToast } from '../utils/toastUtils';

function AnonymousRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Refresh token error:", error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const googleAccessToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN);

        console.log("ACCESS_TOKEN", token);
        console.log("GOOGLE_ACCESS_TOKEN", googleAccessToken);

        if (token) {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthorized(true);
              }
            } else {
              setIsAuthorized(false);
            }
    };

    // const validateGoogleToken = async (googleAccessToken) => {
    //     try {
    //         const res = await api.post("/api/google/validate_token/", {
    //             access_token: googleAccessToken,
    //         }, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //         console.log("Validated response: ", res.data);
    //         return res.data.valid;
    //     } catch (error) {
    //         console.error("Google token validation failed:", error);
    //         return false;
    //     }
    // };

    if (isAuthorized === null) {
        return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <CircularProgress />
            </Box>
          );
    }

    if (isAuthorized) {
        showInfoToast("You are already logged in!");
        return <Navigate to="/" />;
    }

    return children;
}

export default AnonymousRoute;