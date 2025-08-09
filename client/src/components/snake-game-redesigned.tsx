import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onGameComplete: (score: number, suggestedTip: number) => void;
  workerName?: string;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

// Tip suggestions based on score ranges
const getTipSuggestion = (score: number): number => {
  if (score >= 15) return 25; // Excellent performance
  if (score >= 10) return 20; // Good performance  
  if (score >= 5) return 15;  // Decent performance
  if (score >= 3) return 10;  // Trying
  return 5; // Everyone deserves something
};

const getPerformanceMessage = (score: number): string => {
  if (score >= 15) return "🔥 AMAZING! You're a natural!";
  if (score >= 10) return "⭐ Great job! Impressive skills!";
  if (score >= 5) return "👍 Nice work! Getting the hang of it!";
  if (score >= 3) return "💪 Good effort! Keep practicing!";
  return "🎯 Everyone starts somewhere!";
};

export default function SnakeGameRedesigned({ onGameComplete, workerName = "your server" }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'paused' | 'ended'>('waiting');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef(direction);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snake-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;
      
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('ended');
        return prevSnake;
      }
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('ended');
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [food, generateFood]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState, gameLoop]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const { x, y } = directionRef.current;
      
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (y !== 1) {
            directionRef.current = { x: 0, y: -1 };
            setDirection({ x: 0, y: -1 });
          }
          break;
        case 'arrowdown':
        case 's':
          if (y !== -1) {
            directionRef.current = { x: 0, y: 1 };
            setDirection({ x: 0, y: 1 });
          }
          break;
        case 'arrowleft':
        case 'a':
          if (x !== 1) {
            directionRef.current = { x: -1, y: 0 };
            setDirection({ x: -1, y: 0 });
          }
          break;
        case 'arrowright':
        case 'd':
          if (x !== -1) {
            directionRef.current = { x: 1, y: 0 };
            setDirection({ x: 1, y: 0 });
          }
          break;
        case ' ':
          e.preventDefault();
          setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Game end effect
  useEffect(() => {
    if (gameState === 'ended') {
      const newHighScore = Math.max(score, highScore);
      if (newHighScore > highScore) {
        setHighScore(newHighScore);
        localStorage.setItem('snake-high-score', newHighScore.toString());
      }
      
      // Show game over for a moment, then trigger payment funnel
      setTimeout(() => {
        const suggestedTip = getTipSuggestion(score);
        onGameComplete(score, suggestedTip);
      }, 2000);
    }
  }, [gameState, score, highScore, onGameComplete]);

  // Start game
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameState('playing');
    setGameStarted(true);
  };

  // Reset game
  const resetGame = () => {
    setGameState('waiting');
    setGameStarted(false);
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
  };

  // Render game canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 16; // 320px / 20 cells
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#22c55e'; // Head darker, body lighter
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * cellSize + 1,
      food.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  }, [snake, food]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Snake Challenge</h3>
              <p className="text-sm text-gray-600">Play to unlock tip bonuses!</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Score: <span className="font-semibold text-gray-900">{score}</span></div>
            <div className="text-xs text-gray-500">Best: {highScore}</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="border-2 border-gray-200 rounded-lg mx-auto block bg-white"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Game overlays */}
          <AnimatePresence>
            {gameState === 'waiting' && !gameStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <div className="text-4xl">🐍</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ready to Play?</h4>
                    <p className="text-sm text-gray-600 max-w-48 mx-auto">
                      Higher scores unlock bigger tip suggestions for {workerName}!
                    </p>
                  </div>
                  <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white">
                    <Play size={16} className="mr-2" />
                    Start Game
                  </Button>
                </div>
              </motion.div>
            )}
            
            {gameState === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <div className="text-2xl">⏸️</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Paused</h4>
                    <p className="text-sm text-gray-600">Press SPACE to continue</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {gameState === 'ended' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-3xl">🏆</div>
                    <h4 className="font-semibold text-gray-900">Game Over!</h4>
                    <div className="text-2xl font-bold text-green-600">{score} points</div>
                    <p className="text-sm text-gray-600">{getPerformanceMessage(score)}</p>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Sparkles size={16} />
                      <span className="font-semibold">Unlocked ${getTipSuggestion(score)} tip bonus!</span>
                    </div>
                  </motion.div>
                  
                  <div className="text-xs text-gray-500">
                    Redirecting to payment in 2 seconds...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        {gameState === 'playing' && (
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Use WASD or arrow keys to move • SPACE to pause
            </p>
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw size={14} className="mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}