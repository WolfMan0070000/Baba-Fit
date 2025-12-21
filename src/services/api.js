import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const getUserId = () => {
    try {
        const user = localStorage.getItem('gym_user');
        if (!user) return 1;
        const parsed = JSON.parse(user);
        return parsed.id || 1;
    } catch (e) {
        return 1;
    }
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
    },

    getExercises: async () => {
        try {
            const res = await fetch(`${API_URL}/exercises?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching exercises:', error);
            return [];
        }
    },

    getPRs: async () => {
        try {
            const res = await fetch(`${API_URL}/history/prs?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching PRs:', error);
            return [];
        }
    },

    getMetrics: async () => {
        try {
            const res = await fetch(`${API_URL}/metrics?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching metrics:', error);
            return [];
        }
    },

    saveMetrics: async (metricData) => {
        try {
            const res = await fetch(`${API_URL}/metrics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...metricData, userId: getUserId() }),
            });
            return await res.json();
        } catch (error) {
            console.error('Error saving metrics:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const res = await fetch(`${API_URL}/profile?userId=${getUserId()}`);
            const data = await res.json();
            return data.data || null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profileData, user_id: getUserId() }),
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
};
