import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
    sub: string;
    email: string;
    isAdmin?: boolean;
    exp: number;
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export async function getUser(): Promise<UserPayload | null> {
    const token = getToken();
    if (!token) return null;

    try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(baseUrl + 'me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
        return data as UserPayload;
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    const user: UserPayload = jwtDecode(token);
    if (!user || !user.exp) return false;
    return user.exp * 1000 > Date.now();
}

export function isAdmin(): boolean {
    const token = getToken();
    if (!token) return false;
    const user: UserPayload = jwtDecode(token);
    if (!user) return false;
    return user.isAdmin || false;
}
