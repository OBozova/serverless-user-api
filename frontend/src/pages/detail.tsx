import { useCallback, useEffect, useState } from 'react';
import { getUser, isAdmin, type UserPayload } from '../utils/auth';

export default function Detail() {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [stats, setStats] = useState<any>(null);

    const fetchUser = useCallback(async () => {
        try {
            const response = await getUser();
            setUser(response);
            if (!user) {
                // Handle case where user is not found
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }, [])

    const fetchStats = useCallback(async () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const apiKey = import.meta.env.VITE_API_KEY;
        try {
            const response = await fetch(baseUrl + 'stats', {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);
    
    useEffect(() => {
        fetchUser();
        const userIsAdmin = isAdmin();
        console.log('User is admin:', userIsAdmin);
        if(userIsAdmin) {
            console.log('Fetching stats for admin user...');
            fetchStats()
        }
    }, []);

    return (
        <div>
            <h2>User Detail</h2>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            {stats && (
                <div>
                    <h3>Statistics</h3>
                    <pre>{JSON.stringify(stats, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
