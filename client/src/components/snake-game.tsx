import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onFoodEaten: (tipAmount: number) => void;
  onGameComplete: (totalTips: number) => void;
  className?: string;
}

const GRID_SIZE = 12;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 6, y: 6 }];
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// Quick tip amounts that appear as food
const TIP_AMOUNTS = [1, 2, 3, 5, 10, 15, 20];

export default function SnakeGame({ onFoodEaten, onGameComplete, className }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position & { amount: number }>({ x: 3, y: 3, amount: 5 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [totalTips, setTotalTips] = useState(0);
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback(() => {
    let newFood: Position & { amount: number };
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        amount: TIP_AMOUNTS[Math.floor(Math.random() * TIP_AMOUNTS.length)]
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 3, y: 3, amount: 5 });
    setDirection(DIRECTIONS.RIGHT);
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setTotalTips(0);
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      if (currentSnake.length === 0) return currentSnake;

      const head = currentSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Check walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        onGameComplete(totalTips);
        return currentSnake;
      }

      // Check self collision
      if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        onGameComplete(totalTips);
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + food.amount);
        setTotalTips(prev => prev + food.amount);
        onFoodEaten(food.amount);
        setFood(generateFood());
        return newSnake; // Don't remove tail when eating
      }

      return newSnake.slice(0, -1); // Remove tail
    });
  }, [direction, food, generateFood, onFoodEaten, onGameComplete, totalTips]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 200);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [isPlaying, gameOver, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          setDirection(prev => prev !== DIRECTIONS.DOWN ? DIRECTIONS.UP : prev);
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          setDirection(prev => prev !== DIRECTIONS.UP ? DIRECTIONS.DOWN : prev);
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          setDirection(prev => prev !== DIRECTIONS.RIGHT ? DIRECTIONS.LEFT : prev);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          setDirection(prev => prev !== DIRECTIONS.LEFT ? DIRECTIONS.RIGHT : prev);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <GlassCard className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Snake Tip Game</h3>
            <p className="text-sm text-gray-300">Collect tip amounts to add to your total!</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-lg font-bold text-green-400">${totalTips}</div>
            <div className="text-xs text-gray-400">Total Tips</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative mx-auto mb-4" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
          <div 
            className="relative border-2 border-white/20 rounded-lg overflow-hidden bg-black/20"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
          >
            {/* Snake */}
            <AnimatePresence>
              {snake.map((segment, index) => (
                <motion.div
                  key={`snake-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute rounded-sm ${
                    index === 0 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-br from-green-500 to-green-600'
                  }`}
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE - 1,
                    height: CELL_SIZE - 1,
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Food */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
              }}
            >
              ${food.amount}
            </motion.div>
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center text-white"
              >
                <Trophy size={32} className="text-yellow-400 mb-2" />
                <h4 className="text-lg font-bold mb-1">Game Over!</h4>
                <p className="text-sm mb-3">You collected ${totalTips} in tips!</p>
                <Button size="sm" onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                  <RotateCcw size={16} className="mr-1" />
                  Play Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            size="sm"
            variant={isPlaying ? "destructive" : "default"}
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={gameOver}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button size="sm" variant="outline" onClick={resetGame} className="border-white/20 text-white hover:bg-white/10">
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Use arrow keys or WASD to move • Space to pause • Collect $ amounts to add to your tip!
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}