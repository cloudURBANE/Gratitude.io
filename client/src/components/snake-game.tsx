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
const COLS = 14;
const ROWS = 16;
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
  const [gameActive, setGameActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number>();

  // Initialize snake and food
  const [snake, setSnake] = useState<Cell[]>(() => [
    { x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }
  ]);
  const [food, setFood] = useState<Cell>(() => ({ x: 8, y: 10 }));

  // Responsive canvas sizing
  const [tile, dims] = useMemo(() => {
    const maxWidth = 280;
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
      let newX = head.x;
      let newY = head.y;

      // Update position based on direction
      switch (dir) {
        case "right":
          newX = head.x + 1;
          break;
        case "left":
          newX = head.x - 1;
          break;
        case "down":
          newY = head.y + 1;
          break;
        case "up":
          newY = head.y - 1;
          break;
      }

      // Check boundary collision (game ends when hitting walls)
      if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) {
        setAlive(false);
        setPaused(true);
        return prevSnake;
      }

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

  // Screen wake lock and body class during gameplay
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if (gameActive && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          // Wake lock not supported or denied
        }
      }
    };

    if (gameActive && !paused && alive) {
      // Prevent screen scrolling during gameplay
      document.body.classList.add('game-active');
      requestWakeLock();
    } else {
      // Remove scroll prevention when game is inactive
      document.body.classList.remove('game-active');
    }

    return () => {
      document.body.classList.remove('game-active');
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [gameActive, paused, alive]);

  // Game loop
  useEffect(() => {
    if (!alive || paused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      setGameActive(false);
      return;
    }

    setGameActive(true);
    let lastTime = performance.now();
    // Speed increases subtly after $5 earned, then accelerates further
    const speedBoost = score >= 5 ? Math.floor((score - 5) / 3) * 8 : 0;
    const tickInterval = Math.max(70, TICK_MS_BASE - score * 1.5 - speedBoost);

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

    // Clear canvas with gradient background
    const gradient = ctx.createRadialGradient(dims.cssW/2, dims.cssH/2, 0, dims.cssW/2, dims.cssH/2, Math.max(dims.cssW, dims.cssH)/2);
    gradient.addColorStop(0, "rgba(139, 69, 255, 0.05)");
    gradient.addColorStop(1, "rgba(6, 182, 212, 0.02)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dims.cssW, dims.cssH);

    // Draw animated border with pulsing effect
    const time = Date.now() * 0.001;
    const borderPulse = 0.3 + Math.sin(time) * 0.1;
    
    // Outer border with glow
    ctx.save();
    ctx.strokeStyle = `rgba(139, 69, 255, ${borderPulse})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(139, 69, 255, 0.5)";
    ctx.shadowBlur = 10;
    ctx.strokeRect(2, 2, dims.cssW - 4, dims.cssH - 4);
    ctx.restore();

    // Inner decorative corners
    const cornerSize = tile * 0.8;
    ctx.strokeStyle = `rgba(6, 182, 212, ${borderPulse * 0.7})`;
    ctx.lineWidth = 2;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(8, 8 + cornerSize);
    ctx.lineTo(8, 8);
    ctx.lineTo(8 + cornerSize, 8);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(dims.cssW - 8 - cornerSize, 8);
    ctx.lineTo(dims.cssW - 8, 8);
    ctx.lineTo(dims.cssW - 8, 8 + cornerSize);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(8, dims.cssH - 8 - cornerSize);
    ctx.lineTo(8, dims.cssH - 8);
    ctx.lineTo(8 + cornerSize, dims.cssH - 8);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(dims.cssW - 8 - cornerSize, dims.cssH - 8);
    ctx.lineTo(dims.cssW - 8, dims.cssH - 8);
    ctx.lineTo(dims.cssW - 8, dims.cssH - 8 - cornerSize);
    ctx.stroke();

    // Draw subtle grid with fading effect
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tile, 6);
      ctx.lineTo(x * tile, dims.cssH - 6);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(6, y * tile);
      ctx.lineTo(dims.cssW - 6, y * tile);
      ctx.stroke();
    }

    // Draw animated food (glowing dollar sign with sparkles)
    const foodX = food.x * tile + tile / 2;
    const foodY = food.y * tile + tile / 2;
    const foodTime = Date.now() * 0.003;
    const foodPulse = 0.8 + Math.sin(foodTime * 2) * 0.2;
    
    ctx.save();
    
    // Outer glow ring
    ctx.beginPath();
    ctx.arc(foodX, foodY, tile * 0.4 * foodPulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16, 185, 129, ${0.2 * foodPulse})`;
    ctx.fill();
    
    // Inner dollar sign with glow
    ctx.shadowColor = "#10B981";
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(16, 185, 129, ${foodPulse})`;
    ctx.font = `bold ${tile * 0.7}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", foodX, foodY);
    
    // Sparkle effects around food
    for (let i = 0; i < 4; i++) {
      const sparkleAngle = foodTime + (i * Math.PI / 2);
      const sparkleDistance = tile * 0.6;
      const sparkleX = foodX + Math.cos(sparkleAngle) * sparkleDistance;
      const sparkleY = foodY + Math.sin(sparkleAngle) * sparkleDistance;
      const sparkleSize = 2 + Math.sin(foodTime * 3 + i) * 1;
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + Math.sin(foodTime * 2 + i) * 0.3})`;
      ctx.fill();
    }
    
    ctx.restore();

    // Draw beautiful snake with gradient and animation
    const snakeTime = Date.now() * 0.002;
    
    snake.forEach((segment, index) => {
      const x = segment.x * tile + 2;
      const y = segment.y * tile + 2;
      const size = tile - 4;
      const isHead = index === 0;
      const isTail = index === snake.length - 1;

      ctx.save();
      
      if (isHead) {
        // Animated head with breathing effect
        const headPulse = 1 + Math.sin(snakeTime * 4) * 0.05;
        const headSize = size * headPulse;
        const headOffset = (size - headSize) / 2;
        
        // Head glow
        ctx.shadowColor = "#8B45FF";
        ctx.shadowBlur = 15;
        
        // Head gradient
        const headGradient = ctx.createRadialGradient(
          x + size/2, y + size/2, 0,
          x + size/2, y + size/2, size/2
        );
        headGradient.addColorStop(0, "#A855F7");
        headGradient.addColorStop(1, "#8B45FF");
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.roundRect(x + headOffset, y + headOffset, headSize, headSize, 4);
        ctx.fill();
        
        // Animated eyes with direction
        ctx.fillStyle = "#FFFFFF";
        const eyeSize = size * 0.2;
        const eyePulse = 0.8 + Math.sin(snakeTime * 6) * 0.2;
        const eyeActualSize = eyeSize * eyePulse;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (dir === "up") {
          eye1X = x + size * 0.25; eye1Y = y + size * 0.3;
          eye2X = x + size * 0.55; eye2Y = y + size * 0.3;
        } else if (dir === "down") {
          eye1X = x + size * 0.25; eye1Y = y + size * 0.5;
          eye2X = x + size * 0.55; eye2Y = y + size * 0.5;
        } else if (dir === "left") {
          eye1X = x + size * 0.2; eye1Y = y + size * 0.25;
          eye2X = x + size * 0.2; eye2Y = y + size * 0.55;
        } else {
          eye1X = x + size * 0.6; eye1Y = y + size * 0.25;
          eye2X = x + size * 0.6; eye2Y = y + size * 0.55;
        }
        
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeActualSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeActualSize, 0, Math.PI * 2);
        ctx.fill();
        
      } else {
        // Body segments with flowing gradient
        const segmentProgress = index / snake.length;
        const flowOffset = snakeTime + index * 0.5;
        const bodyPulse = 0.95 + Math.sin(flowOffset) * 0.05;
        const bodySize = size * bodyPulse;
        const bodyOffset = (size - bodySize) / 2;
        
        // Body gradient that flows along the snake
        const bodyGradient = ctx.createLinearGradient(x, y, x + size, y + size);
        const hue1 = (270 + Math.sin(flowOffset) * 30) % 360; // Purple to blue range
        const hue2 = (200 + Math.sin(flowOffset + 1) * 30) % 360;
        
        bodyGradient.addColorStop(0, `hsl(${hue1}, 70%, ${60 + segmentProgress * 10}%)`);
        bodyGradient.addColorStop(1, `hsl(${hue2}, 80%, ${50 + segmentProgress * 15}%)`);
        
        ctx.shadowColor = `hsla(${hue1}, 70%, 60%, 0.4)`;
        ctx.shadowBlur = 6 + Math.sin(flowOffset) * 2;
        ctx.fillStyle = bodyGradient;
        
        if (isTail) {
          // Tapered tail
          ctx.beginPath();
          ctx.roundRect(x + bodyOffset, y + bodyOffset, bodySize, bodySize, bodySize * 0.4);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(x + bodyOffset, y + bodyOffset, bodySize, bodySize, 3);
          ctx.fill();
        }
      }
      
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
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isActive = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
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

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      isActive = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

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
    <motion.div 
      className={`bg-glass backdrop-blur-md border border-glass-border rounded-2xl p-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
    >
      {/* Header with game explanation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Play to Tip</h3>
            <p className="text-sm text-text-secondary">Guide snake to collect $</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-start">${tipAmount}</div>
            <div className="text-xs text-text-secondary flex items-center gap-1 justify-end">
              {score >= 5 && <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>}
              {score >= 5 ? "Speed Boost!" : `${5 - score} more to boost`}
            </div>
          </div>
        </div>
        
        {/* Game explanation */}
        <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-lg p-3 mb-4">
          <p className="text-sm text-text-secondary text-center">
            🐍 Each <span className="text-green-400 font-semibold">$</span> collected = $1 tip • 
            Speed increases after $5 • Use arrows or swipe to control
          </p>
        </div>
      </div>

      {/* Game Canvas */}
      <motion.div 
        className="relative mb-4"
        initial={{ scale: 0.85, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.1,
          ease: [0.4, 0.0, 0.2, 1]
        }}
      >
        <motion.canvas
          ref={canvasRef}
          className="border border-glass-border rounded-lg mx-auto block touch-none shadow-lg"
          width={dims.cssW}
          height={dims.cssH}
          style={{ width: dims.cssW, height: dims.cssH, touchAction: 'none' }}
          animate={gameActive ? {
            boxShadow: [
              "0 4px 20px rgba(139, 69, 255, 0.2)",
              "0 4px 30px rgba(139, 69, 255, 0.4)",
              "0 4px 20px rgba(139, 69, 255, 0.2)"
            ]
          } : {}}
          transition={{
            boxShadow: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      </motion.div>
        
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
                      {score === 0 ? "Ready to Earn Tips?" : "Game Paused"}
                    </div>
                    <div className="text-sm text-white/80 mb-4">
                      {score === 0 ? "Swipe or use arrow keys to start" : ""}
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
                      {score === 0 ? "Start Earning" : "Resume"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="text-sm text-text-secondary mb-2">Send with:</div>
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
          <motion.button
            onClick={handlePayNow}
            disabled={tipAmount === 0}
            className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            animate={tipAmount > 0 ? {
              boxShadow: [
                "0 4px 20px rgba(139, 69, 255, 0.3)",
                "0 8px 35px rgba(139, 69, 255, 0.5)",
                "0 4px 20px rgba(139, 69, 255, 0.3)"
              ]
            } : {}}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Send ${tipAmount}
          </motion.button>
        </>
      )}

      {/* Game Status */}
      <div className="mt-4 text-center">
        {score >= 5 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full mb-2">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-300 font-medium">SPEED BOOST ACTIVE</span>
          </div>
        )}
        <div className="text-xs text-text-secondary">
          Swipe or arrow keys to move • Space to pause • R to restart
        </div>
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
    </motion.div>
  );
}