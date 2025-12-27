const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && (window.location.hostname.includes('koyeb.app') || window.location.hostname.includes('onrender.com') || !!window.Capacitor));

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? 'https://baba-fit.koyeb.app/api' : 'http://localhost:3001/api');
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || (isProduction ? 'https://baba-fit.koyeb.app/uploads' : 'http://localhost:3001/uploads');
