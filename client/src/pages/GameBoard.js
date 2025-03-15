import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad } from 'react-icons/fa';

const GameBoard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [chat, setChat] = useState([
    { id: 1, sender: 'System', message: 'Welcome to the game chat!', timestamp: new Date().toISOString() },
    { id: 2, sender: 'JHarvey', message: 'Hello everyone!', timestamp: new Date().toISOString() }
  ]);
  const [message, setMessage] = useState('');

  // On component mount, get game data
  useEffect(() => {
    if (location.state?.game) {
      // If we have game data from navigation state, use it
      setGame(location.state.game);
      setLoading(false);
    } else {
      // In a real app, you would fetch the game data from an API
      // For now, we'll just simulate a loading state
      setTimeout(() => {
        // Example fallback game data
        setGame({
          id,
          name: 'Example Board',
          rows: 4,
          columns: 3,
          createdAt: new Date().toISOString(),
          createdBy: 'JHarvey'
        });
        setLoading(false);
      }, 1000);
    }
  }, [id, location.state]);

  // Handle chat message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const newMessage = {
      id: chat.length + 1,
      sender: 'You', // In a real app, this would be the current user's name
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChat([...chat, newMessage]);
    setMessage('');
  };

  // Format date to be more readable
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-primary">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with tabs */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <button 
              className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => navigate('/games')}
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">{game.name}</h1>
          </div>
          
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === 'board' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              onClick={() => setActiveTab('board')}
            >
              <FaGamepad className="mr-2" /> Board
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === 'chat' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <FaComments className="mr-2" /> Chat
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex">
        <AnimatePresence mode="wait">
          {activeTab === 'board' ? (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-4 flex items-center justify-center"
            >
              <div 
                className="bg-white rounded-lg shadow-lg p-4 w-full max-w-4xl aspect-auto"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: `repeat(${game.columns}, 1fr)`,
                  gridTemplateRows: `repeat(${game.rows}, 1fr)`,
                  gap: '8px',
                  width: '100%',
                  height: `calc(100vh - 200px)`
                }}
              >
                {Array.from({ length: game.rows * game.columns }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.02, 
                      type: 'spring',
                      stiffness: 260,
                      damping: 20 
                    }}
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-gradient-to-br from-primary-light to-secondary-light rounded-lg shadow-md cursor-pointer flex items-center justify-center font-bold text-white text-xl"
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-4 flex flex-col"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 flex-grow flex flex-col max-w-4xl mx-auto w-full">
                <div className="flex-grow overflow-y-auto mb-4 p-2">
                  {chat.map((msg) => (
                    <div key={msg.id} className={`mb-3 ${msg.sender === 'You' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-4 py-2 rounded-lg ${
                        msg.sender === 'System' 
                          ? 'bg-gray-200 text-gray-800' 
                          : msg.sender === 'You'
                            ? 'bg-primary-light text-gray-800'
                            : 'bg-secondary-light text-gray-800'
                      }`}>
                        {msg.sender !== 'You' && (
                          <div className="font-bold text-sm">{msg.sender}</div>
                        )}
                        <p>{msg.message}</p>
                        <div className="text-xs text-gray-600 mt-1">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    className="input-field flex-grow mr-2"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!message.trim()}
                  >
                    Send
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GameBoard; 