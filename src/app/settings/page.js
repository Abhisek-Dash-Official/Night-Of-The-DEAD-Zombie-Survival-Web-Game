"use client";
import { useState, useEffect } from "react";
import { Skull, Target, Trophy, RotateCcw, Undo2, Upload, Crosshair, AlertTriangle, X } from "lucide-react";

export default function Settings() {
    const [crosshair, setCrosshair] = useState(null);
    const [bestScore, setBestScore] = useState(0);
    const [tempScore, setTempScore] = useState(null);
    const [undoTimer, setUndoTimer] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [cursor, setCursor] = useState(null);

    // Set Crosshair of game
    useEffect(() => {
        const savedCrosshair = localStorage.getItem("crosshair");
        if (savedCrosshair) {
            setCursor(savedCrosshair);
        } else {
            setCursor("/assets/images/crosshair.png")
        }
    }, []);
    useEffect(() => {
        function updateCursor() {
            const saved = localStorage.getItem("crosshair");
            setCursor(saved);
        }

        window.addEventListener("storage", updateCursor);
        return () => window.removeEventListener("storage", updateCursor);
    }, []);

    // Load settings from localStorage
    useEffect(() => {
        const savedCrosshair = localStorage.getItem("crosshair");
        const savedScore = localStorage.getItem("bestScore");

        if (savedCrosshair) setCrosshair(savedCrosshair);
        if (savedScore) setBestScore(parseInt(savedScore));
    }, []);

    // Crosshair upload
    const handleCrosshairUpload = (e) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setCrosshair(dataUrl);
            localStorage.setItem("crosshair", dataUrl);
        };
        reader.readAsDataURL(file);
    };
    const removeCrosshair = () => {
        setCrosshair(null);
        setCursor("/assets/images/crosshair.png");
        localStorage.removeItem("crosshair");
    };

    // Reset best score
    const resetBestScore = () => {
        setShowAlert(true);
    };

    const confirmReset = () => {
        setTempScore(bestScore);
        setBestScore(0);
        localStorage.setItem("bestScore", "0");

        const timer = setTimeout(() => setTempScore(null), 5000);
        setUndoTimer(timer);
        setShowAlert(false);
    };

    const cancelReset = () => {
        setShowAlert(false);
    };

    const undoReset = () => {
        if (tempScore !== null) {
            setBestScore(tempScore);
            localStorage.setItem("bestScore", tempScore.toString());
            setTempScore(null);
            if (undoTimer) clearTimeout(undoTimer);
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center relative overflow-hidden"
            style={{
                backgroundImage: "url('/assets/images/bg.png')",
                cursor: cursor ? `url(${cursor}) 16 16, auto` : "auto",
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-red-950/40"></div>

            {/* Animated blood drips effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-red-900/30 to-transparent pointer-events-none"></div>

            {/* Custom Alert Modal */}
            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={cancelReset}
                    ></div>

                    {/* Alert Box */}
                    <div className="relative bg-linear-to-br from-zinc-900 via-red-950/50 to-zinc-900 p-8 rounded-2xl shadow-2xl border-4 border-red-600/70 max-w-md w-full animate-in zoom-in duration-300">
                        {/* Close button */}
                        <button
                            onClick={cancelReset}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-600/20 rounded-full border-4 border-red-600/50 animate-pulse">
                                <AlertTriangle className="w-16 h-16 text-red-500" />
                            </div>
                        </div>

                        {/* Alert Content */}
                        <h3 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
                            ⚠️ Warning!
                        </h3>
                        <p className="text-gray-300 text-center text-lg mb-2">
                            Are you sure you want to reset your best score?
                        </p>
                        <p className="text-red-400 text-center text-sm mb-8 font-semibold">
                            You have 5 seconds to undo this action.
                        </p>

                        {/* Current Score Display */}
                        <div className="bg-black/50 p-4 rounded-lg border-2 border-red-600/30 mb-6 text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Score</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-500 to-orange-500">
                                {bestScore.toLocaleString()}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={cancelReset}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 border-zinc-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                className="flex-1 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/50 border-2 border-red-500"
                            >
                                Reset Score
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 p-8">
                {/* Header with skull icons */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <Skull className="w-10 h-10 text-red-600 animate-pulse" />
                    <h1 className="text-5xl font-bold text-white text-center drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] tracking-wider uppercase">
                        <span className="text-red-500">Game</span> Settings
                    </h1>
                    <Skull className="w-10 h-10 text-red-600 animate-pulse" />
                </div>

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Crosshair Settings Card */}
                    <div className="bg-linear-to-br from-zinc-900/90 via-zinc-800/90 to-red-950/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-red-900/50 hover:border-red-600/70 transition-all duration-300 transform hover:scale-[1.02] relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-600/20 rounded-lg border border-red-600/50">
                                <Crosshair className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white drop-shadow-lg tracking-wide">
                                Crosshair Customization
                            </h2>
                        </div>

                        <p className="text-gray-300 mb-6 text-lg">
                            Upload your own crosshair image to personalize your aim
                        </p>

                        <div className="space-y-4">
                            <label className="relative cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCrosshairUpload}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3 bg-red-600 hover:bg-red-700 px-6 py-4 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-red-600/50">
                                    <Upload className="w-6 h-6 text-white" />
                                    <span className="text-white font-semibold text-lg">
                                        Upload Crosshair Image
                                    </span>
                                </div>
                            </label>

                            {crosshair && (
                                <div className="bg-black/40 p-6 rounded-xl border-2 border-red-600/30 flex items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <Target className="w-6 h-6 text-red-500" />
                                        <p className="text-white font-medium text-lg">Current Crosshair:</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-4 rounded-lg border-2 border-red-600/50">
                                        <img
                                            src={crosshair}
                                            alt="Crosshair Preview"
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                </div>

                            )}
                            <button
                                onClick={removeCrosshair}
                                className="flex items-center gap-2 border-red-600 bg-zinc-800 hover:bg-red-900/40 text-gray-300 hover:text-white px-4 py-2 rounded-lg border hover:border-red-500 transition-all duration-300 group absolute top-5 right-5"
                            >
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">Remove Custom</span>
                            </button>
                        </div>
                    </div>

                    {/* Best Score Card */}
                    <div className="bg-linear-to-br from-zinc-900/90 via-zinc-800/90 to-amber-950/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-amber-900/50 hover:border-amber-600/70 transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-600/50">
                                <Trophy className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white drop-shadow-lg tracking-wide">
                                High Score Management
                            </h2>
                        </div>

                        {/* Score Display */}
                        <div className="bg-black/50 p-8 rounded-xl border-2 border-amber-600/40 mb-6 text-center">
                            <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">
                                Your Best Score
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                                    {bestScore.toLocaleString()}
                                </div>
                                <Skull className="w-12 h-12 text-amber-500" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={resetBestScore}
                                className="flex-1 min-w-50 flex items-center justify-center gap-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-600/50 group"
                            >
                                <RotateCcw className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-white font-bold text-lg">Reset Score</span>
                            </button>

                            {tempScore !== null && (
                                <button
                                    onClick={undoReset}
                                    className="flex-1 min-w-50 flex items-center justify-center gap-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-600/50 animate-pulse"
                                >
                                    <Undo2 className="w-6 h-6 text-white" />
                                    <span className="text-white font-bold text-lg">Undo Reset</span>
                                </button>
                            )}
                        </div>

                        {tempScore !== null && (
                            <div className="mt-4 bg-yellow-900/30 border-2 border-yellow-600/50 p-4 rounded-lg">
                                <p className="text-yellow-300 text-center font-medium">
                                    ⚠️ Previous score: <span className="font-bold">{tempScore}</span> - You have 5 seconds to undo!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer warning */}
                <div className="text-center mt-12 text-gray-500 text-sm flex items-center justify-center gap-2">
                    <Skull className="w-4 h-4" />
                    <p>Settings are saved locally on your device</p>
                    <Skull className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}