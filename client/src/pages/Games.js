import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaDice, FaChess, FaPuzzlePiece, FaQuestion, FaPlus } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Games = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentGames, setCurrentGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  // Placeholder for fetching current games - in a real app, this would call an API
  useEffect(() => {
    // Simulating API call with timeout
    const timer = setTimeout(() => {
      // Example games data
      const exampleGames = [
        {
          id: 'game1',
          name: 'My First Board',
          createdAt: new Date().toISOString(),
          rows: 4,
          columns: 3,
          createdBy: user?.username || 'Anonymous'
        },
        {
          id: 'game2',
          name: 'Challenge Board',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          rows: 5,
          columns: 4,
          createdBy: 'JHarvey'
        }
      ];
      
      setCurrentGames(exampleGames);
      setGamesLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  // List of games (placeholders for now)
  const gamesList = [
    {
      id: 1,
      name: 'Quick Play',
      description: 'Jump straight into a random game',
      icon: <FaGamepad className="text-6xl text-primary" />,
      bgColor: 'bg-primary-light',
      comingSoon: false
    },
    {
      id: 2,
      name: 'Dice Roll',
      description: 'Test your luck with dice games',
      icon: <FaDice className="text-6xl text-secondary" />,
      bgColor: 'bg-secondary-light',
      comingSoon: true
    },
    {
      id: 3,
      name: 'Strategy',
      description: 'Use your brain to win challenges',
      icon: <FaChess className="text-6xl text-accent" />,
      bgColor: 'bg-accent-light',
      comingSoon: true
    },
    {
      id: 4,
      name: 'Puzzle',
      description: 'Solve fun and engaging puzzles',
      icon: <FaPuzzlePiece className="text-6xl text-primary" />,
      bgColor: 'bg-primary-light',
      comingSoon: true
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Handler for game selection
  const handleGameSelect = (game) => {
    if (game.comingSoon) {
      alert(`${game.name} is coming soon! Stay tuned!`);
    } else {
      alert(`Starting ${game.name}! Game functionality will be implemented in future updates.`);
      // We would navigate to the game page here in a full implementation
    }
  };

  // Navigate to board builder
  const handleStartNewGame = () => {
    navigate('/board-builder');
  };

  // Navigate to an existing game
  const handleJoinGame = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Game <span className="logo-text">Lobby</span>
        </h1>
        <p className="text-xl text-gray-600 mb-6">Ready to play Hey-O!</p>
        
        <motion.button
          className="btn-primary inline-flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartNewGame}
        >
          <FaPlus className="mr-2" /> Start New Game
        </motion.button>
      </motion.div>

      {/* Current Games Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Games</h2>
        
        {gamesLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : currentGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGames.map(game => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
                onClick={() => handleJoinGame(game.id)}
              >
                <h3 className="text-xl font-bold text-primary">{game.name}</h3>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Created by: {game.createdBy}</span>
                  <span>Date: {formatDate(game.createdAt)}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span>Grid: {game.rows} x {game.columns}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">You don't have any active games. Start a new game to begin playing!</p>
          </div>
        )}
      </motion.div>

      {/* Game Categories Section (existing code) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Categories</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {gamesList.map((game) => (
          <motion.div
            key={game.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            className={`game-card ${game.bgColor} relative overflow-hidden cursor-pointer`}
            onClick={() => handleGameSelect(game)}
          >
            <div className="animate-float mb-4">{game.icon}</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{game.name}</h3>
            <p className="text-gray-600 text-center">{game.description}</p>
            
            {game.comingSoon && (
              <div className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse-slow">
                Coming Soon
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white opacity-10"></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">More games coming soon!</h2>
        <p className="text-gray-600 mb-8">We're constantly working on adding new games to the platform.</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <FaQuestion className="text-3xl text-secondary mr-3" />
            <h3 className="text-xl font-bold">Want to suggest a game?</h3>
          </div>
          <p className="text-gray-600">
            We'd love to hear your ideas! Got a game you'd like to see on Hey-O!? 
            Let us know by sending an email to suggestions@hey-o-game.com
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Games; 