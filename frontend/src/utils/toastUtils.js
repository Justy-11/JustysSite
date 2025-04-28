// src/utils/toastUtils.js
import { toast } from 'react-toastify';

// Common options for all toasts
const commonOptions = {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
};

export const showSuccessToast = (message) => {
    toast.success(message, {
        ...commonOptions,
        autoClose: 2000,
        icon: "✅",
    });
};

export const showErrorToast = (message) => {
    toast.error(message, {
        ...commonOptions,
        autoClose: 2500,
        icon: "⚠️",
    });
};

export const showInfoToast = (message) => {
    toast.info(message, {
        ...commonOptions,
        autoClose: 1800,
        icon: "📧",
        position: "top-center", // Info messages appear in top-center
    });
};

export const showLoadingToast = (message) => {
    return toast.loading(message, {
        ...commonOptions,
    });
};

export const updateToast = (toastId, { message, type = "success", autoClose = 2000 }) => {
    toast.update(toastId, {
        render: message,
        type: type,
        isLoading: false,
        autoClose: autoClose,
        theme: "colored",
    });
};
