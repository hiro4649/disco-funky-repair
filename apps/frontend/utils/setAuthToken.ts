import axios from "axios";
import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";

/**
 * Sets the authentication token in axios headers
 * Returns true if token is valid, false otherwise
 */
const setAuthToken = (token: string): boolean => {
    try {
        if (token && token.trim() !== '') {
            // Basic validation - check if token has valid structure
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Check if token is expired
            if (decoded.exp && decoded.exp < currentTime) {
                // Token expired, clear headers
                delete apiClient.defaults.headers.common["Authorization"];
                delete axios.defaults.headers.common["Authorization"];
                return false;
            }
            
            // Apply to every request for both our apiClient and global axios
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            return true;
        } else {
            // Delete auth header if token is empty
            delete apiClient.defaults.headers.common["Authorization"];
            delete axios.defaults.headers.common["Authorization"];
            return false;
        }
    } catch (error) {
        console.error("Error setting auth token:", error);
        delete apiClient.defaults.headers.common["Authorization"];
        delete axios.defaults.headers.common["Authorization"];
        return false;
    }
};

export default setAuthToken;