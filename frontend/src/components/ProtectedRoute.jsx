import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";


function ProtectedRoute() {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return; // Prevent running twice in Strict Mode
        hasRun.current = true;

        auth().catch(() => setIsAuthorized(false))

        return () => {
          hasRun.current = false;
        };
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
    
        console.log("ACCESS_TOKEN", token);
    
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
    //         const res = await api.post('/api/google/validate_token/', {
    //             access_token: googleAccessToken,
    //         }, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         console.log("Validated response: ", res.data);
    //         return {
    //             valid: res.data.valid,
    //             access_token: res.data.access_token, // Expect the backend to return the JWT access_token
    //             refresh_token: res.data.refresh_token, // Expect the backend to return the refresh_token
    //           };
    //     } catch (error) {
    //         console.error('Google token validation failed:', error.response ? error.response.data : error.message);
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

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;