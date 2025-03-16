import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaDice, FaChess, FaPuzzlePiece, FaQuestion, FaPlus, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Games = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentGames, setCurrentGames] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [unreadMessages, setUnreadMessages] = useState(2); // For demonstration
  const [unviewedInvites, setUnviewedInvites] = useState(3); // For demonstration

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
          createdBy: user?.username || 'Anonymous',
          hasUnreadMessages: true
        },
        {
          id: 'game2',
          name: 'Challenge Board',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          rows: 5,
          columns: 4,
          createdBy: 'JHarvey',
          hasUnreadMessages: true
        }
      ];
      
      setCurrentGames(exampleGames);
      setGamesLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Placeholder for fetching pending invites - in a real app, this would call an API
  useEffect(() => {
    // Simulating API call with timeout
    const timer = setTimeout(() => {
      // Example pending invites data
      const exampleInvites = [
        {
          id: 'invite1',
          gameId: 'game3',
          name: 'Friday Fun Board',
          createdAt: new Date().toISOString(),
          rows: 5,
          columns: 5,
          createdBy: 'JHarvey',
          players: ['JHarvey', 'User2', 'User3'],
          viewed: false
        },
        {
          id: 'invite2',
          gameId: 'game4',
          name: 'Weekend Challenge',
          createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          rows: 3,
          columns: 3,
          createdBy: 'User2',
          players: ['User2', 'User3'],
          viewed: false
        },
        {
          id: 'invite3',
          gameId: 'game5',
          name: 'Family Game Night',
          createdAt: new Date(Date.now() - 129600000).toISOString(), // 36 hours ago
          rows: 4,
          columns: 4,
          createdBy: 'User3',
          players: ['User3', 'User4', 'JHarvey'],
          viewed: true
        }
      ];
      
      setPendingInvites(exampleInvites);
      setInvitesLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Handle accepting a game invite
  const handleAcceptInvite = (e, invite) => {
    e.stopPropagation(); // Prevent the click from bubbling to the parent
    
    // In a real app, you would call an API to accept the invite
    // For demonstration, we'll just remove it from pending invites and add to current games
    setPendingInvites(pendingInvites.filter(item => item.id !== invite.id));
    
    // After accepting, navigate to the game
    navigate(`/game/${invite.gameId}`, { 
      state: { 
        activeTab: 'chat',
        joinedViaInvite: true
      } 
    });
  };

  // Handle declining a game invite
  const handleDeclineInvite = (e, inviteId) => {
    e.stopPropagation(); // Prevent the click from bubbling to the parent
    
    // In a real app, you would call an API to decline the invite
    // For demonstration, we'll just remove it from pending invites
    setPendingInvites(pendingInvites.filter(item => item.id !== inviteId));
    
    // Update unviewed count if needed
    const declinedInvite = pendingInvites.find(invite => invite.id === inviteId);
    if (declinedInvite && !declinedInvite.viewed) {
      setUnviewedInvites(prev => Math.max(0, prev - 1));
    }
  };

  // Mark invite as viewed when the user views it
  const handleViewInvite = (invite) => {
    if (!invite.viewed) {
      // Mark as viewed in local state
      const updatedInvites = pendingInvites.map(item => 
        item.id === invite.id ? { ...item, viewed: true } : item
      );
      setPendingInvites(updatedInvites);
      
      // Update unviewed count
      setUnviewedInvites(prev => Math.max(0, prev - 1));
    }
    
    // Show details or preview of the game (for demonstration, we'll just expand the card)
    // In a real app, you might show more info or a preview of the board
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

      {/* Tabs for Current and Pending Games */}
      <div className="mb-4 flex border-b">
        <button 
          className={`mr-4 py-2 px-4 font-medium text-lg flex items-center relative ${
            activeTab === 'current' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('current')}
        >
          Current Games
          {unreadMessages > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </button>
        <button 
          className={`py-2 px-4 font-medium text-lg flex items-center relative ${
            activeTab === 'pending' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Games
          {unviewedInvites > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unviewedInvites}
            </span>
          )}
        </button>
      </div>

      {/* Current Games Section */}
      {activeTab === 'current' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
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
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer relative"
                  onClick={() => handleJoinGame(game.id)}
                >
                  {game.hasUnreadMessages && (
                    <span className="absolute top-3 right-3 bg-red-500 h-3 w-3 rounded-full"></span>
                  )}
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
      )}

      {/* Pending Games Section */}
      {activeTab === 'pending' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          {invitesLoading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : pendingInvites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvites.map(invite => (
                <motion.div
                  key={invite.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer relative ${
                    !invite.viewed ? 'border-2 border-primary' : ''
                  }`}
                  onClick={() => handleViewInvite(invite)}
                >
                  {!invite.viewed && (
                    <span className="absolute top-3 right-3 bg-primary h-3 w-3 rounded-full"></span>
                  )}
                  <h3 className="text-xl font-bold text-primary pr-8">{invite.name}</h3>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Created by: {invite.createdBy}</span>
                    <span>Date: {formatDate(invite.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>Grid: {invite.rows} x {invite.columns}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>Players: {invite.players.join(', ')}</span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm flex items-center"
                      onClick={(e) => handleAcceptInvite(e, invite)}
                    >
                      <FaCheck className="mr-1" /> Accept
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm flex items-center"
                      onClick={(e) => handleDeclineInvite(e, invite.id)}
                    >
                      <FaTimes className="mr-1" /> Decline
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">You don't have any pending game invites.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Game Categories Section (existing code) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Boards</h2>
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