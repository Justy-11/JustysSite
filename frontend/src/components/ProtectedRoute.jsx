import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function ProtectedRoute() {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        api.get("/api/auth/user/")
            .then(() => setIsAuthorized(true))
            .catch(() => setIsAuthorized(false));
    }, []);

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