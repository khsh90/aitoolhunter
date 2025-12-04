'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const [tapCount, setTapCount] = useState(0);
    const router = useRouter();

    // Reset tap count after 2 seconds of inactivity
    useEffect(() => {
        if (tapCount > 0) {
            const timer = setTimeout(() => setTapCount(0), 2000);
            return () => clearTimeout(timer);
        }
    }, [tapCount]);

    // Handle header taps (mobile) - 4 taps to access admin
    const handleHeaderTap = () => {
        const newCount = tapCount + 1;
        setTapCount(newCount);

        if (newCount === 4) {
            router.push('/admin/login');
            setTapCount(0);
        }
    };

    // Handle secret click zone (desktop) - right corner
    const handleSecretClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent header tap from firing
        router.push('/admin/login');
    };

    return (
        <header
            onClick={handleHeaderTap}
            className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/10 backdrop-blur-md"
        >
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 relative">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                        <Image
                            src="/logoks.png"
                            alt="AI Tool Hunter Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tight">AI Tool Hunter</span>
                </Link>

                {/* Secret admin access zone - invisible click area on right corner */}
                <div
                    onClick={handleSecretClick}
                    className="absolute top-0 right-0 w-20 h-16 cursor-default"
                    aria-hidden="true"
                    title=""
                />
            </div>
        </header>
    );
}
