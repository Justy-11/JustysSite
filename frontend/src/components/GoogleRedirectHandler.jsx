import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { GOOGLE_ACCESS_TOKEN, ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { showErrorToast, showInfoToast } from "../utils/toastUtils";

function RedirectGoogleAuth() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return; // Prevent running twice in Strict Mode
        hasRun.current = true;
        console.log("RedirectHandler mounted successfully");

        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = queryParams.get('access_token');
        const refreshToken = queryParams.get('refresh_token');
        const error = queryParams.get("error");

        console.log("QueryParams: ", window.location.search);

        if (accessToken) {
          console.log("AccessToken found:", accessToken);
          localStorage.setItem(GOOGLE_ACCESS_TOKEN, accessToken);
          localStorage.setItem(ACCESS_TOKEN, accessToken);
          if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN, refreshToken);
            console.log("RefreshToken found:", refreshToken);
          }
          console.log("Stored tokens from Google login:", {
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Verify the token by fetching user data
          api
            .get("/api/auth/user/")
            .then((response) => {
              console.log("User data:", response.data);
              showInfoToast("Logged in successfully with Google!");
              navigate("/");
            })
            .catch((error) => {
              console.error("Error verifying token:", error.response?.data || error.message);
              showErrorToast("Failed to verify token. Please log in again.");
              localStorage.removeItem(ACCESS_TOKEN);
              localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
              localStorage.removeItem(REFRESH_TOKEN);
              navigate("/login");
            });
        } else if (error) {
          console.error("Google login error:", error);
          showErrorToast("Google login failed: " + error);
          navigate("/login");
        } else {
          console.log("No token found in URL");
          showErrorToast("Google login failed: No access token provided");
          navigate("/login");
        }
        
        return () => {
          hasRun.current = false;
        };
    }, [navigate])

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

export default RedirectGoogleAuth;