"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Heart, RotateCcw, Settings, Skull, Trophy, XCircle, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const MAX_BULLETS = 40;
  const PLAYER_MAX_HP = 30;

  const ZOMBIE_TYPES = {
    fast: { speed: 3.0, hp: 3, maxHp: 3, points: 10, img: "/assets/images/kidZombie.png", baseSize: 350 },
    normal: { speed: 1.8, hp: 6, maxHp: 6, points: 5, img: "/assets/images/normalZombie.png", baseSize: 450 },
    tank: { speed: 1.0, hp: 15, maxHp: 15, points: 20, img: "/assets/images/fatZombie.png", baseSize: 600 },
  };

  /* ================= STATE ================= */
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState("menu");
  const [bullets, setBullets] = useState(MAX_BULLETS);
  const [isReloading, setIsReloading] = useState(false);
  const [zombies, setZombies] = useState([]);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [isFlashing, setIsFlashing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gameStartTime, setGameStartTime] = useState(null);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  /* ================= REFS ================= */
  const handleReloadRef = useRef(null);
  const fireInterval = useRef(null);
  const flashInterval = useRef(null);
  const sounds = useRef(null);
  const isMouseDown = useRef(false);
  const gameStateRef = useRef(gameState);
  const bulletsRef = useRef(bullets);
  const reloadRef = useRef(isReloading);
  const mousePosRef = useRef(mousePos);
  const lastDamageTimes = useRef({});

  useEffect(() => {
    gameStateRef.current = gameState;
    bulletsRef.current = bullets;
    reloadRef.current = isReloading;
    mousePosRef.current = mousePos;
  }, [gameState, bullets, isReloading, mousePos]);

  /* ================= TIME TRACKING ================= */
  useEffect(() => {
    if (gameState === "running" && gameStartTime) {
      const timer = setInterval(() => {
        setTimeSurvived(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, gameStartTime]);

  /* ================= BEST SCORE (SAFE VERSION) ================= */

  // Load once
  useEffect(() => {
    const saved = localStorage.getItem("bestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  // Update when score changes
  useEffect(() => {
    setBestScore(prev => {
      if (score > prev) {
        localStorage.setItem("bestScore", score.toString());
        return score;
      }
      return prev;
    });
  }, [score]);

  /* ================= AUDIO INIT ================= */
  useEffect(() => {
    if (!sounds.current) {
      sounds.current = {
        wind: new Audio("/assets/sounds/wind.mp3"),
        night: new Audio("/assets/sounds/silentNight.mp3"),
        zombies: new Audio("/assets/sounds/zombiesSound.mp3"),
        gun: new Audio("/assets/sounds/gunFiring.mp3"),
        reload: new Audio("/assets/sounds/gunReload.mp3"),
        bite: new Audio("/assets/sounds/zombeiBite.mp3"),
        gameOver: new Audio("/assets/sounds/gameOver.m4a"),
      };
      sounds.current.wind.loop = true;
      sounds.current.night.loop = true;
      sounds.current.zombies.loop = true;

      // VOLUME CONTROL
      sounds.current.wind.volume = 0.04;
      sounds.current.night.volume = 0.04;
      sounds.current.zombies.volume = 0.04;

      sounds.current.gun.volume = 0.05;
      sounds.current.reload.volume = 0.05;
      sounds.current.bite.volume = 0.05;

      sounds.current.gameOver.volume = 0.075;
    }
  }, []);

  /* ================= SHOOTING ================= */
  const checkHit = () => {
    setZombies(prev =>
      prev
        .map(z => {
          const scale = 0.2 + (z.y / window.innerHeight) * 0.8;
          const curW = z.baseSize * scale;

          const dx = Math.abs(z.x - mousePosRef.current.x);
          const dy = Math.abs(z.y - mousePosRef.current.y);

          if (dx < curW / 3 && dy < (curW * 1.3) / 2) {
            const newHp = z.hp - 1;

            if (newHp <= 0) {
              setScore(s => s + z.points);
              setEnemiesDefeated(count => count + 1);
              delete lastDamageTimes.current[z.id];
              return null;
            }

            return { ...z, hp: newHp };
          }

          return z;
        })
        .filter(Boolean)
    );
  };

  const startFiring = () => {
    if (fireInterval.current || gameStateRef.current !== "running" || reloadRef.current || bulletsRef.current <= 0) return;

    sounds.current?.gun?.play().catch(() => { });

    fireInterval.current = setInterval(() => {
      checkHit();
      setBullets(prev => {
        if (prev <= 1) {
          stopFiring();
          handleReloadRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 100);

    flashInterval.current = setInterval(() => setIsFlashing(p => !p), 50);
  };

  const stopFiring = () => {
    clearInterval(fireInterval.current);
    clearInterval(flashInterval.current);
    fireInterval.current = null;
    flashInterval.current = null;
    setIsFlashing(false);

    if (sounds.current?.gun) {
      sounds.current.gun.pause();
      sounds.current.gun.currentTime = 0;
    }
  };

  const handleReload = () => {
    if (bulletsRef.current === MAX_BULLETS) return;
    if (reloadRef.current) return;
    setIsReloading(true);
    sounds.current?.reload?.play().catch(() => { });

    setTimeout(() => {
      setBullets(MAX_BULLETS);
      setIsReloading(false);
      if (isMouseDown.current) startFiring();
    }, 2000);
  };

  useEffect(() => {
    handleReloadRef.current = handleReload;
  }, [isReloading, bullets]);

  /* ================= GAME LOOP ================= */

  useEffect(() => {
    if (gameState !== "running") return;

    const spawnTimer = setInterval(() => {
      const type = Object.values(ZOMBIE_TYPES)[Math.floor(Math.random() * 3)];
      setZombies(prev => [
        ...prev,
        {
          ...type,
          id: Math.random(),
          x: Math.random() * (window.innerWidth - 400) + 200,
          y: -150,
          isBiting: false
        }
      ]);
    }, 2000);

    const gameTimer = setInterval(() => {
      const now = Date.now();
      const biteZone = window.innerHeight * 0.65;

      setZombies(prev => {
        let damageThisFrame = 0;

        const updated = prev.map(z => {
          if (z.y >= biteZone) {
            const lastHit = lastDamageTimes.current[z.id] || 0;

            if (now - lastHit >= 1000) {
              damageThisFrame++;
              lastDamageTimes.current[z.id] = now;

              const biteSound = sounds.current?.bite;
              if (biteSound) {
                biteSound.currentTime = 0;
                biteSound.volume = 0.07;
                biteSound.play().catch(() => { });
              }
            }

            return { ...z, y: biteZone, isBiting: true };
          }

          return { ...z, y: z.y + z.speed, isBiting: false };
        });

        if (damageThisFrame > 0) {
          setPlayerHp(prevHp => {
            const nextHp = prevHp - damageThisFrame;

            if (nextHp <= 0) {
              setGameState("gameover");
              return 0;
            }

            return nextHp;
          });
        }

        return updated;
      });

    }, 20);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(gameTimer);
    };
  }, [gameState]);

  /* ================= SOUND CONTROL ================= */
  useEffect(() => {
    const s = sounds.current;
    if (!s) return;

    if (gameState === "running") {
      s.wind.play();
      s.night.play();
      s.zombies.play();
    } else {
      Object.entries(s).forEach(([key, audio]) => {
        if (!audio) return;

        if (key !== "gameOver") {
          audio.pause();
          if (audio !== s.reload) audio.currentTime = 0;
        }
      });
      stopFiring();
    }

    if (gameState === "gameover" && s.gameOver) {
      s.gameOver.currentTime = 0;
      s.gameOver.play().catch(() => { });
    }
  }, [gameState]);

  /* ================= INPUT ================= */
  useEffect(() => {
    const move = e => setMousePos({ x: e.clientX, y: e.clientY });
    const down = e => { if (e.button === 0) { isMouseDown.current = true; startFiring(); } };
    const up = () => { isMouseDown.current = false; stopFiring(); };
    const handleKeyDown = e => {
      if (e.key === "Escape") setGameState(p => p === "running" ? "paused" : p === "paused" ? "running" : p);
      if ((e.key === "r" || e.key === "R") && gameStateRef.current === "running") handleReloadRef.current();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setScore(0);
    setPlayerHp(PLAYER_MAX_HP);
    setZombies([]);
    setBullets(MAX_BULLETS);
    setIsReloading(false);
    lastDamageTimes.current = {};

    setGameStartTime(Date.now());
    setTimeSurvived(0);
    setEnemiesDefeated(0);

    setGameState("running");
  };

  return (
    <div className={`relative min-h-screen bg-[url('/assets/images/bgGame.png')] bg-cover bg-center overflow-hidden select-none ${gameState === "running" ? "cursor-none" : ""}`}>

      {/* ZOMBIES */}
      <div className={`absolute inset-0 z-10 ${gameState !== "running" ? "opacity-30 pointer-events-none" : ""}`}>
        {zombies.map((z) => {
          const scale = 0.2 + (z.y / window.innerHeight) * 0.8;
          return (
            <div key={z.id} className="absolute transition-transform duration-75"
              style={{ left: z.x, top: z.y, width: z.baseSize, transform: `translate(-50%, -50%) scale(${z.isBiting ? scale * 1.1 : scale})`, zIndex: Math.floor(z.y) }}>
              <img src={z.img} draggable="false" alt="z" className="w-full h-auto drop-shadow-2xl" />
              <div className="w-full h-2.5 bg-black/50 mt-2 rounded-full border border-white/20 overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(z.hp / z.maxHp) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* HEARTS */}
      {gameState === "running" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-100 drop-shadow-[0_2px_2px_black]">
          {[...Array(PLAYER_MAX_HP / 2)].map((_, i) => {
            const v = (i + 1) * 2;
            const half = playerHp === v - 1;
            const full = playerHp >= v;
            return (
              <div key={i} className="relative w-8 h-8">
                <Heart size={32} className="absolute text-black fill-black/40" strokeWidth={3} />
                {(full || half) && (
                  <div className="absolute overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                    <Heart size={32} className="text-red-600 fill-red-600" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FLASH & TRACER */}
      {isFlashing && gameState === "running" && (
        <>
          <div className="fixed inset-0 bg-orange-500/10 pointer-events-none z-30" />
          <div style={{
            position: "fixed", left: "50%", top: "100%",
            width: `${Math.sqrt(Math.pow(mousePos.x - window.innerWidth / 2, 2) + Math.pow(mousePos.y - window.innerHeight, 2))}px`,
            height: "3px", background: "linear-gradient(to right, transparent, #ffcc00, #ffffff)",
            transformOrigin: "0% 50%", transform: `rotate(${Math.atan2(mousePos.y - window.innerHeight, mousePos.x - window.innerWidth / 2) * (180 / Math.PI)}deg)`,
            pointerEvents: "none", zIndex: 40, boxShadow: "0 0 15px #ffaa00",
          }}
          />
        </>
      )}

      {/* HUD & MENU */}
      {gameState === "running" ? (
        <>
          <div className="absolute bottom-10 left-10 z-50 bg-black/60 p-5 rounded-xl border-t-2 border-amber-500 text-white shadow-2xl">
            <p className="text-[20px] text-amber-500 font-bold mb-1">SCORE: {score}</p>
            <p className="text-[15px] text-zinc-400">BEST: {bestScore}</p>
          </div>

          <div className="absolute bottom-10 right-10 z-50 bg-black/60 p-5 rounded-xl border-t-2 border-red-600 text-white text-right shadow-2xl min-w-60">
            <p className="text-xs text-red-500 font-bold mb-1">AMMO</p>

            {isReloading ? (
              <div className="space-y-2">
                <div className="text-2xl font-mono text-yellow-400 animate-pulse flex items-center justify-end gap-2">
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  RELOADING
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div
                    className="h-full bg-linear-to-r from-yellow-500 via-orange-500 to-red-500"
                    style={{
                      animation: 'loading 2s linear forwards'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-4xl font-mono block">{bullets} / {MAX_BULLETS}</span>
                {/* Bullet Indicator - 2 rows of 20 bullets */}
                <div className="flex flex-col gap-1 items-end">
                  {[0, 1].map((row) => (
                    <div key={row} className="flex gap-0.5">
                      {[...Array(20)].map((_, col) => {
                        const bulletIndex = row * 20 + col;
                        return (
                          <div
                            key={bulletIndex}
                            className={`w-2 h-4 rounded-sm transition-all duration-200 ${bulletIndex < bullets
                              ? 'bg-yellow-500 shadow-[0_0_4px_#eab308]'
                              : 'bg-gray-700/50'
                              }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-[10px] text-right mt-1 tracking-widest">
                  PRESS <kbd className="bg-gray-600 text-yellow-400 px-1 py-0.5 rounded text-[10px] font-mono border border-gray-500">R</kbd> <span className="text-gray-400">TO RELOAD</span>
                </p>
              </div>
            )}
          </div>

          <button onClick={() => setGameState("paused")} className="absolute top-6 left-6 bg-white/10 hover:bg-red-600 p-3 rounded-full text-white z-110 border border-white/10">
            <Menu size={24} />
          </button>

          <div className="fixed w-16 h-16 pointer-events-none z-150 -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePos.x, top: mousePos.y }}>
            <img src="/assets/images/crosshair.png" className="w-full h-full" alt="target" />
          </div>

          <style jsx>{`
    @keyframes loading {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }
  `}</style>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-200">
          <div className="text-center space-y-8">
            <h1 className="text-7xl font-black text-red-700 italic uppercase">Night of the Dead</h1>
            <div className="flex flex-col gap-4 w-72 mx-auto">
              <button onClick={startGame} className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-sm transition-all active:scale-95">
                {gameState === "paused" ? "RESUME MISSION" : "START NEW SURVIVAL"}
              </button>

              {/* RESTART OPTION */}
              {gameState === "paused" && (
                <button onClick={startGame} className="bg-zinc-800 text-white font-bold py-4 rounded-sm flex items-center justify-center gap-2">
                  <RotateCcw size={18} /> RESTART MISSION
                </button>
              )}

              {/* OPTIONS BUTTON */}
              <button onClick={() => router.push("/settings")} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-4 rounded-sm flex items-center justify-center gap-2">
                <Settings size={18} /> OPTIONS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER POPUP */}
      {gameState === "gameover" && playerHp === 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-201 animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-500/20 animate-in zoom-in duration-300">
            {/* Skull Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500 animate-pulse">
                <Skull className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Game Over Text */}
            <h2 className="text-4xl font-bold text-center mb-2 bg-linear-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Game Over
            </h2>

            <p className="text-gray-400 text-center mb-8">
              You have been defeated
            </p>

            {/* Score Display */}
            <div className="bg-black/30 rounded-xl p-6 mb-8 border border-gray-700">
              {/* Current Score */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <p className="text-gray-400 text-sm">Final Score</p>
              </div>
              <p className="text-5xl font-bold text-center bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                {score.toLocaleString()}
              </p>

              {/* Best Score Divider */}
              <div className="border-t border-gray-700/50 pt-4 mt-2">
                <div className="flex justify-between items-center px-4">
                  <span className="text-gray-500 text-xs uppercase tracking-widest">Best Score</span>
                  <span className="text-white font-mono font-medium">
                    {bestScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={startGame}
              className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-700 flex justify-around text-center">
              <div className="flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 text-xs">Time Survived</p>
                <p className="text-white font-semibold">{formatTime(timeSurvived)}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Target className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500 text-xs">Enemies Defeated</p>
                <p className="text-white font-semibold">{enemiesDefeated}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}