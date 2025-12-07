'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize animations
    useScrollAnimation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await account.createEmailPasswordSession(email, password);
            router.push('/admin');
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="absolute top-4 left-4 animate-on-load animate-slide-right">
                <Link href="/" className="flex items-center text-violet-400 hover:text-violet-300 transition-colors font-semibold">
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
                </Link>
            </div>
            <div className="glass p-8 rounded-xl w-full max-w-md space-y-6 shadow-2xl animate-on-load animate-scale">
                <h1 className="text-2xl font-bold text-center text-white animate-on-load">Admin Login</h1>
                {error && <div className="text-red-400 text-sm text-center animate-fade">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white text-black placeholder:text-gray-500 border-gray-300"
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white text-black placeholder:text-gray-500 border-gray-300"
                        required
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
