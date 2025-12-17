import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { IUserEntry } from '../../types';

interface WinnerSelectorProps {
  users: IUserEntry[];
  isSelecting: boolean;
  onComplete: (winner: IUserEntry) => void;
}

export const WinnerSelector: React.FC<WinnerSelectorProps> = ({
  users,
  isSelecting,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'initial' | 'fast' | 'slowing' | 'final'>('initial');
  const [cycles, setCycles] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<IUserEntry | null>(null);
  useEffect(() => {
    if (!isSelecting) {
      setPhase('initial');
      setCycles(0);
      setSelectedWinner(null);
      return;
    }
  
    // Initial phase - normal speed
    let speed = 200;
    let spinCount = 0;
    let spinInterval: NodeJS.Timeout;
  
    const spin = () => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % users.length;
        return nextIndex;
      });
  
      spinCount++;
  
      if (spinCount < 20) {
        // Slightly randomize speed in initial phase
        speed = Math.max(50, speed - Math.random() * 30);
      } else if (spinCount < 40) {
        // Increase speed drastically
        speed = Math.max(30, speed - Math.random() * 20);
        setPhase('fast');
      } else if (spinCount < 60) {
        // Slow down slightly but with small random spikes
        speed = speed + Math.random() * 80;
        setPhase('slowing');
      } else if (spinCount < 80) {
        // Random speed jumps to make the ending unpredictable
        speed = speed + (Math.random() * 200 - 100);
      } else {
        clearInterval(spinInterval);
        setPhase('final');
  
        // Select a final winner randomly
        const winnerIndex = Math.floor(Math.random() * users.length);
        setCurrentIndex(winnerIndex);
        setSelectedWinner(users[winnerIndex]);
  
        setTimeout(() => {
          onComplete(users[winnerIndex]);
        }, 500);
      }
  
      spinInterval = setTimeout(spin, speed);
    };
  
    spin();
  
    return () => clearTimeout(spinInterval);
  }, [isSelecting, users.length]);
  

  const getAnimationVariants = () => {
    switch (phase) {
      case 'initial':
        return {
          initial: { y: 100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 },
          transition: { duration: 0.3 }
        };
      case 'fast':
        return {
          initial: { y: 100, opacity: 0.5 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 },
          transition: { duration: 0.2 }
        };
      case 'slowing':
        return {
          initial: { y: 100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 },
          transition: { duration: 0.4 }
        };
      case 'final':
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { 
            scale: 1.1, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 0.8
            }
          },
          exit: { scale: 0.9, opacity: 0 }
        };
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-gray-900 rounded-xl overflow-hidden animate-border-glow">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 opacity-50" />
      <div className="relative">
        <div className="flex items-center justify-center mt-2 mb-2">
          <Trophy className="w-20 h-20 text-yellow-400 animate-glow" />
        </div>
        <div className="h-96 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50" />
          <div className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-gray-900 to-transparent z-10" />
          <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-900 to-transparent z-10" />
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              {...getAnimationVariants()}
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="relative">
                <img
                  src={'https://staging.gtoarcade.com/assets/logo-CvSsoyu4.png'}
                  alt={users[currentIndex].name.toString()}
                  className={`w-48 h-48 rounded-full mb-6 border-4 ${
                    phase === 'final' 
                      ? 'border-yellow-500 animate-border-glow' 
                      : phase === 'fast'
                      ? 'border-purple-600'
                      : 'border-purple-500'
                  }`}
                />
                {phase === 'final' && (
                  <>
                    <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-yellow-400 animate-glow" />
                    <Sparkles className="absolute -bottom-4 -left-4 w-10 h-10 text-yellow-400 animate-glow" />
                    <Sparkles className="absolute -top-4 -left-4 w-10 h-10 text-yellow-400 animate-glow" />
                    <Sparkles className="absolute -bottom-4 -right-4 w-10 h-10 text-yellow-400 animate-glow" />
                  </>
                )}
              </div>
              <motion.p 
                className={`text-5xl font-bold capitalize mb-3 ${
                  phase === 'final' ? 'text-yellow-400 animate-glow' : 'text-white'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {users[currentIndex].name}
              </motion.p>
              <motion.p 
                className="text-2xl text-purple-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {users[currentIndex].email}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};