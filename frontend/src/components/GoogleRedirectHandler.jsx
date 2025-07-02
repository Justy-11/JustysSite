import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
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
            navigate("/login");
          });

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