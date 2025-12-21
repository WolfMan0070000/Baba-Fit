import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const getUserId = () => {
    const user = localStorage.getItem('gym_user');
    return user ? JSON.parse(user).id : 1;
};

export const api = {
    // --- Logs ---
    getLogs: async (date, exerciseId = null) => {
        try {
            let url = `${API_URL}/logs?userId=${getUserId()}`;
            if (date) url += `&date=${date}`;
            if (exerciseId) url += `&exercise_id=${exerciseId}`;

            const res = await fetch(url);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching logs:', error);
            return [];
        }
    },

    saveLog: async (logData) => {
        try {
            const res = await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...logData, userId: getUserId() }),
            });
            return await res.json();
        } catch (error) {
            console.error('Error saving log:', error);
            throw error;
        }
    },

    // --- Sessions ---
    async getSessions() {
        try {
            const res = await fetch(`${API_URL}/sessions?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    },

    async getSessionDetails(id) {
        try {
            const res = await fetch(`${API_URL}/sessions/${id}`);
            const data = await res.json();
            return data.data || null;
        } catch (error) {
            console.error('Error fetching session details:', error);
            return null;
        }
    },

    saveSession: async (sessionData) => {
        try {
            const res = await fetch(`${API_URL}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...sessionData, userId: getUserId() }),
            });
            return await res.json();
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    },

    // --- Analytics ---
    getHeatmapData: async () => {
        try {
            const res = await fetch(`${API_URL}/history/heatmap?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching heatmap:', error);
            return [];
        }
    },

    getVolumeData: async (exerciseId) => {
        try {
            const res = await fetch(`${API_URL}/history/volume/${exerciseId}?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching volume:', error);
            return [];
        }
    }
};
