import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import { showInfoToast } from '../utils/toastUtils';

function AnonymousRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        api.get("/api/auth/user/")
            .then(() => setIsAuthorized(true))
            .catch(() => setIsAuthorized(false));
    }, []);

    if (isAuthorized === null) {
        return null; // or a loading spinner
    }

    if (isAuthorized) {
        showInfoToast("You are already logged in!");
        return <Navigate to="/" />;
    }

    return children;
}

export default AnonymousRoute;