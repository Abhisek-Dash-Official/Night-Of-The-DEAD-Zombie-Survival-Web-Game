'use client';

import { useState, useEffect } from 'react';

export default function DesktopOnlyWrapper({ children }) {
    const [isDesktop, setIsDesktop] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkScreenSize = () => {
            // Consider desktop as width >= 1024px
            setIsDesktop(window.innerWidth >= 1024);
            setTimeout(() => {
                setIsLoading(false);
            }, 2500);
        };

        // Check on mount
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen  bg-[url('/assets/images/bg.png')] bg-no-repeat bg-cover">
                <div className="relative p-8 border border-red-900/30 bg-black shadow-[0_0_20px_rgba(153,27,27,0.2)] -rotate-3 scale-125">

                    <div className="glitch-breach uppercase text-5xl">
                        SYSTEM BREACHED
                    </div>

                    <div className="mt-4 flex justify-between font-mono text-md text-red-500/60 uppercase">
                        <span>Sector: 7-G</span>
                        <span className="animate-bounce [animation-duration:0.6s] translate-y-6 text-lg">SQUAD_STATUS: INFECTED</span>
                        <div className="loader ..."></div>
                    </div>


                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]"></div>
                </div>
            </div>
        );
    }

    // Show desktop-only message if not desktop
    if (!isDesktop) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-purple-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Desktop Only
                        </h1>
                        <p className="text-purple-200 mb-6">
                            This application is optimized for desktop screens. Please visit on a desktop or laptop computer for the best experience.
                        </p>
                        <div className="text-sm text-purple-300">
                            Minimum width required: 1024px
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render children if desktop
    return <>{children}</>;
}