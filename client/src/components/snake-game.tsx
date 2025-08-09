import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildPayUrl, defaultPayMethod, type PayMethod } from "@/lib/snake-pay";
import { useToast } from "@/hooks/use-toast";

type Cell = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

interface SnakeGameProps {
  worker: any;
  onTipEarned: (amount: number, method: PayMethod) => void;
  className?: string;
}

// Game config
const COLS = 16;
const ROWS = 20;
const TICK_MS_BASE = 160;
const DOLLARS_PER_FOOD = 1;

export default function SnakeGame({ worker, onTipEarned, className = "" }: SnakeGameProps) {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [dir, setDir] = useState<Dir>("right");
  const [alive, setAlive] = useState(true);
  const [paused, setPaused] = useState(true); // Start paused
  const [method, setMethod] = useState<PayMethod>(defaultPayMethod());
  const [showZelle, setShowZelle] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number>();

  // Initialize snake and food
  const [snake, setSnake] = useState<Cell[]>(() => [
    { x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }
  ]);
  const [food, setFood] = useState<Cell>(() => ({ x: 8, y: 10 }));

  // Responsive canvas sizing
  const [tile, dims] = useMemo(() => {
    const maxWidth = 320;
    const size = Math.floor(maxWidth / COLS);
    return [size, { cssW: size * COLS, cssH: size * ROWS }];
  }, []);

  // Random food placement
  const generateFood = useCallback((currentSnake: Cell[]): Cell => {
    let newFood: Cell;
    do {
      newFood = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Game step logic
  const step = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newX = (head.x + (dir === "right" ? 1 : dir === "left" ? -1 : 0) + COLS) % COLS;
      const newY = (head.y + (dir === "down" ? 1 : dir === "up" ? -1 : 0) + ROWS) % ROWS;
      const newHead = { x: newX, y: newY };

      // Check self collision
      if (prevSnake.some(segment => segment.x === newX && segment.y === newY)) {
        setAlive(false);
        setPaused(true);
        return prevSnake;
      }

      // Check food collision
      if (newX === food.x && newY === food.y) {
        setScore(s => s + 1);
        const grownSnake = [newHead, ...prevSnake];
        setFood(generateFood(grownSnake));
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        return grownSnake;
      }

      // Normal move
      return [newHead, ...prevSnake.slice(0, -1)];
    });
  }, [dir, food, generateFood]);

  // Game loop
  useEffect(() => {
    if (!alive || paused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    const tickInterval = Math.max(80, TICK_MS_BASE - score * 2);

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime >= tickInterval) {
        step();
        lastTime = currentTime;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [alive, paused, step, score]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = dims.cssW * dpr;
    canvas.height = dims.cssH * dpr;
    canvas.style.width = `${dims.cssW}px`;
    canvas.style.height = `${dims.cssH}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, dims.cssW, dims.cssH);

    // Draw subtle grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tile, 0);
      ctx.lineTo(x * tile, dims.cssH);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tile);
      ctx.lineTo(dims.cssW, y * tile);
      ctx.stroke();
    }

    // Draw food (dollar sign)
    const foodX = food.x * tile + tile / 2;
    const foodY = food.y * tile + tile / 2;
    
    ctx.save();
    ctx.shadowColor = "#10B981";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#10B981";
    ctx.font = `bold ${tile * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", foodX, foodY);
    ctx.restore();

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * tile + 2;
      const y = segment.y * tile + 2;
      const size = tile - 4;
      const isHead = index === 0;

      ctx.save();
      
      if (isHead) {
        ctx.shadowColor = "#8B45FF";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#FFFFFF";
      } else {
        ctx.shadowColor = "#06B6D4";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      }

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 4);
      ctx.fill();
      ctx.restore();
    });
  }, [snake, food, tile, dims]);

  // Controls
  const turn = useCallback((newDir: Dir) => {
    setDir(currentDir => {
      // Prevent 180-degree turns
      if ((currentDir === "left" && newDir === "right") || 
          (currentDir === "right" && newDir === "left") ||
          (currentDir === "up" && newDir === "down") || 
          (currentDir === "down" && newDir === "up")) {
        return currentDir;
      }
      return newDir;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          turn("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          turn("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          turn("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          turn("right");
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          setPaused(p => !p);
          break;
        case "r":
        case "R":
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [turn]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX = 0;
    let startY = 0;
    let isActive = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isActive = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isActive) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const threshold = 30;

      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          turn(deltaX > 0 ? "right" : "left");
        } else {
          turn(deltaY > 0 ? "down" : "up");
        }
        isActive = false;
      }
    };

    const handleTouchEnd = () => {
      isActive = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [turn]);

  const reset = () => {
    setSnake([{ x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }]);
    setFood({ x: 8, y: 10 });
    setDir("right");
    setScore(0);
    setAlive(true);
    setPaused(true);
  };

  const tipAmount = score * DOLLARS_PER_FOOD;

  const handlePayNow = () => {
    if (tipAmount === 0) {
      toast({
        title: "Play to earn tips!",
        description: "Eat some food in the game first.",
        variant: "destructive"
      });
      return;
    }

    if (method === "zelle") {
      setShowZelle(true);
      return;
    }

    const payUrl = buildPayUrl({
      method,
      handles: {
        cashAppHandle: worker.cashappHandle,
        venmoHandle: worker.venmoHandle,
        zelleHandle: worker.zelleHandle,
        stripeLink: "/api/create-payment-intent"
      },
      amount: tipAmount,
      note: `Snake tip game - ${score} points`
    });

    if (method === "stripe") {
      // Use existing Stripe flow
      onTipEarned(tipAmount, method);
      return;
    }

    if (payUrl) {
      // Save for memory system
      try {
        localStorage.setItem(`tiplink-snake:last`, JSON.stringify({ 
          amount: tipAmount, 
          method, 
          score 
        }));
      } catch (e) {
        console.warn('Failed to save snake game data:', e);
      }

      window.location.href = payUrl;
    } else {
      toast({
        title: "Payment method unavailable",
        description: "Please try a different payment method.",
        variant: "destructive"
      });
    }
  };

  const paymentMethods = [
    { id: "stripe", name: "Card", icon: "💳", available: true },
    { id: "cashapp", name: "Cash App", icon: "💵", available: !!worker.cashappHandle },
    { id: "venmo", name: "Venmo", icon: "💜", available: !!worker.venmoHandle },
    { id: "zelle", name: "Zelle", icon: "🏦", available: !!worker.zelleHandle }
  ].filter(m => m.available);

  return (
    <div className={`bg-glass backdrop-blur-md border border-glass-border rounded-2xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Snake Tip Game</h3>
          <p className="text-sm text-text-secondary">Each $ = $1 tip</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent-start">${tipAmount}</div>
          <div className="text-xs text-text-secondary">Score: {score}</div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          className="border border-glass-border rounded-lg mx-auto block"
          width={dims.cssW}
          height={dims.cssH}
          style={{ width: dims.cssW, height: dims.cssH }}
        />
        
        {/* Game overlay */}
        <AnimatePresence>
          {(paused || !alive) && (
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                {!alive ? (
                  <>
                    <div className="text-xl font-bold text-white mb-2">Game Over!</div>
                    <div className="text-sm text-white/80 mb-4">Final Score: {score}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-white mb-2">
                      {score === 0 ? "Ready to Play?" : "Paused"}
                    </div>
                    <div className="text-sm text-white/80 mb-4">
                      {score === 0 ? "Swipe or use arrow keys" : ""}
                    </div>
                  </>
                )}
                <div className="flex gap-2 justify-center">
                  {!alive ? (
                    <button
                      onClick={reset}
                      className="px-4 py-2 bg-accent-start hover:bg-accent-end rounded-lg text-white font-medium transition-colors"
                    >
                      Play Again
                    </button>
                  ) : (
                    <button
                      onClick={() => setPaused(false)}
                      className="px-4 py-2 bg-accent-start hover:bg-accent-end rounded-lg text-white font-medium transition-colors"
                    >
                      {score === 0 ? "Start Game" : "Resume"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPaused(!paused)}
          disabled={!alive}
          className="flex-1 py-2 px-4 bg-glass hover:bg-glass-border border border-glass-border rounded-lg text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={reset}
          className="flex-1 py-2 px-4 bg-glass hover:bg-glass-border border border-glass-border rounded-lg text-sm font-medium text-text-primary transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Payment methods */}
      {tipAmount > 0 && (
        <>
          <div className="text-sm text-text-secondary mb-2">Pay with:</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {paymentMethods.map(payMethod => (
              <button
                key={payMethod.id}
                onClick={() => setMethod(payMethod.id as PayMethod)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  method === payMethod.id
                    ? 'bg-accent-start text-white'
                    : 'bg-glass hover:bg-glass-border border border-glass-border text-text-primary'
                }`}
              >
                <span>{payMethod.icon}</span>
                <span>{payMethod.name}</span>
              </button>
            ))}
          </div>

          {/* Pay button */}
          <button
            onClick={handlePayNow}
            disabled={tipAmount === 0}
            className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send ${tipAmount} Tip
          </button>
        </>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-text-secondary text-center">
        Swipe or use arrow keys • Space to pause • R to reset
      </div>

      {/* Zelle modal */}
      <AnimatePresence>
        {showZelle && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZelle(false)}
          >
            <motion.div
              className="bg-glass backdrop-blur-md border border-glass-border rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Send via Zelle</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary">Send to:</label>
                  <div className="text-text-primary font-medium">{worker.zelleHandle}</div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Amount:</label>
                  <div className="text-text-primary font-medium">${tipAmount}</div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Note:</label>
                  <div className="text-text-primary">Snake tip game - {score} points</div>
                </div>
              </div>
              <button
                onClick={() => setShowZelle(false)}
                className="w-full mt-4 py-2 bg-accent-start hover:bg-accent-end rounded-lg text-white font-medium transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}