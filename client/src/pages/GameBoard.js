import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad, FaPlus, FaPlay, FaCog, FaCamera, FaImage, FaTrophy } from 'react-icons/fa';

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
  
  // New state for items management
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [tileContents, setTileContents] = useState([]);
  
  // State for tile selection popup
  const [selectedTile, setSelectedTile] = useState(null);
  const [tileNote, setTileNote] = useState('');
  const fileInputRef = useRef(null);
  
  // Add state to track claimed tiles and winners
  const [claimedTiles, setClaimedTiles] = useState([]);
  const [winner, setWinner] = useState(null);

  // Calculate minimum required items
  const calculateMinItems = (rows, columns) => {
    const totalTiles = rows * columns;
    return Math.ceil(totalTiles + (totalTiles * 0.3));
  };

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

  // Initialize claimedTiles array when game loads or changes
  useEffect(() => {
    if (game) {
      const totalTiles = game.rows * game.columns;
      setClaimedTiles(Array(totalTiles).fill(false));
    }
  }, [game]);

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

  // Handle item submission
  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (!itemInput.trim()) return;
    
    const newItem = {
      id: Date.now(),
      text: itemInput.trim()
    };
    
    setItems([...items, newItem]);
    setItemInput('');
  };

  // Generate dummy test items
  const generateDummyItems = () => {
    if (!game) return;
    
    const minItems = calculateMinItems(game.rows, game.columns);
    const dummyItems = [];
    
    // Create enough dummy items to meet the minimum requirement
    for (let i = 1; i <= minItems; i++) {
      dummyItems.push({
        id: Date.now() + i,
        text: `Test item ${i}`
      });
    }
    
    setItems(dummyItems);
  };

  // Handle game start
  const handleStartGame = () => {
    if (!game) return;
    
    const totalTiles = game.rows * game.columns;
    
    // Randomly select and shuffle items
    const shuffledItems = [...items]
      .sort(() => 0.5 - Math.random())
      .slice(0, totalTiles);
    
    // Assign items to tiles
    setTileContents(shuffledItems);
    setGameStarted(true);
    
    // Switch to board tab automatically
    setActiveTab('board');
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (gameStarted && tileContents[index] && !claimedTiles[index] && !winner) {
      setSelectedTile({
        index,
        item: tileContents[index]
      });
      setTileNote('');
    }
  };

  // Check for win condition
  const checkWinCondition = (newClaimedTiles) => {
    if (!game) return false;
    
    const { rows, columns } = game;
    
    // Check rows
    for (let row = 0; row < rows; row++) {
      let rowComplete = true;
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (!newClaimedTiles[index]) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) {
        setWinner("Row " + (row + 1));
        return true;
      }
    }
    
    // Check columns
    for (let col = 0; col < columns; col++) {
      let colComplete = true;
      for (let row = 0; row < rows; row++) {
        const index = row * columns + col;
        if (!newClaimedTiles[index]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        setWinner("Column " + (col + 1));
        return true;
      }
    }
    
    return false;
  };

  // Handle claim button click
  const handleClaimTile = () => {
    if (!selectedTile || winner) return;
    
    // Update claimed tiles array
    const newClaimedTiles = [...claimedTiles];
    newClaimedTiles[selectedTile.index] = true;
    setClaimedTiles(newClaimedTiles);
    
    // Check for win condition
    checkWinCondition(newClaimedTiles);
    
    // In a real app, you would save this data to a database
    console.log(`Claimed tile ${selectedTile.index + 1} with note: ${tileNote}`);
    
    // Close the popup
    setSelectedTile(null);
    
    // Add a system message about claiming
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `Tile ${selectedTile.index + 1} (${selectedTile.item.text}) has been claimed!`,
      timestamp: new Date().toISOString()
    };
    setChat([...chat, newMessage]);
  };

  // Handle photo selection
  const handlePhotoSelect = (type) => {
    if (type === 'camera') {
      // For mobile devices to capture photo directly from camera
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.setAttribute('accept', 'image/*');
        fileInputRef.current.click();
      }
    } else {
      // For selecting from gallery
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.setAttribute('accept', 'image/*');
        fileInputRef.current.click();
      }
    }
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

  // Calculate minimum items required
  const minItemsRequired = game ? calculateMinItems(game.rows, game.columns) : 0;
  const hasEnoughItems = items.length >= minItemsRequired;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          // Handle the file upload
          if (e.target.files && e.target.files[0]) {
            console.log('Selected file:', e.target.files[0]);
            // In a real app, you would upload this file to a server
            
            // If we have a selected tile, we can associate this photo with it
            if (selectedTile) {
              console.log(`Photo attached to tile ${selectedTile.index + 1}`);
            }
          }
        }}
      />

      {/* Header with tabs */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => navigate('/games')}
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              
              {winner && (
                <div className="ml-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                  <FaTrophy className="mr-1 text-yellow-600" /> 
                  Winner: {winner}
                </div>
              )}
            </div>
            
            {/* Admin button for generating dummy items */}
            {!gameStarted && (
              <button 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={generateDummyItems}
                title="Generate test items"
              >
                <FaCog />
              </button>
            )}
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
                {Array.from({ length: game.rows * game.columns }).map((_, index) => {
                  // Determine if this tile is claimed
                  const isClaimed = claimedTiles[index];
                  
                  return (
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
                      whileHover={{ scale: isClaimed ? 1 : 0.95 }}
                      whileTap={{ scale: isClaimed ? 1 : 0.9 }}
                      className={`rounded-lg shadow-md ${isClaimed 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 cursor-default' 
                        : 'bg-gradient-to-br from-primary-light to-secondary-light cursor-pointer'
                      } flex items-center justify-center font-bold text-white text-lg p-2 overflow-hidden`}
                      onClick={() => !isClaimed && handleTileClick(index)}
                    >
                      {gameStarted && tileContents[index] 
                        ? <span className="text-center">{tileContents[index].text}</span>
                        : index + 1}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Left column - Item input and list */}
                <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <h2 className="text-xl font-bold mb-4">Game Items</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Add items for the game. You need at least {minItemsRequired} items.
                    ({items.length} / {minItemsRequired})
                  </p>
                  
                  <form onSubmit={handleAddItem} className="flex mb-4">
                    <input
                      type="text"
                      className="input-field flex-grow mr-2"
                      placeholder="Add an item..."
                      value={itemInput}
                      onChange={(e) => setItemInput(e.target.value)}
                      disabled={gameStarted}
                    />
                    <motion.button
                      type="submit"
                      className="btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!itemInput.trim() || gameStarted}
                    >
                      <FaPlus />
                    </motion.button>
                  </form>
                  
                  {hasEnoughItems && !gameStarted && (
                    <motion.button
                      onClick={handleStartGame}
                      className="btn-success w-full mb-4 flex items-center justify-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaPlay className="mr-2" /> Start Game
                    </motion.button>
                  )}
                  
                  <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-2">
                    {items.length > 0 ? (
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li key={item.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                            <span className="font-medium">{index + 1}. {item.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No items added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Right column - Chat */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <h2 className="text-xl font-bold mb-4">Game Chat</h2>
                  <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tile popup dialog */}
      <AnimatePresence>
        {selectedTile && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTile(null)}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                {selectedTile.item.text}
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="tileNote">
                  Add a note:
                </label>
                <textarea
                  id="tileNote"
                  className="input-field min-h-[100px]"
                  placeholder="Write your note here..."
                  value={tileNote}
                  onChange={(e) => setTileNote(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col space-y-3">
                <motion.button
                  className="btn-success w-full flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClaimTile}
                >
                  Claim
                </motion.button>
                
                <div className="flex space-x-2">
                  <motion.button
                    className="btn-secondary flex-1 flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhotoSelect('camera')}
                  >
                    <FaCamera className="mr-2" /> Camera
                  </motion.button>
                  
                  <motion.button
                    className="btn-accent flex-1 flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhotoSelect('gallery')}
                  >
                    <FaImage className="mr-2" /> Gallery
                  </motion.button>
                </div>
              </div>

              {/* Show winning notification if there is a winner */}
              {winner && (
                <motion.div 
                  className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FaTrophy className="inline-block mr-2 text-yellow-600" />
                  Congratulations! {winner} completed!
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner notification */}
      <AnimatePresence>
        {winner && !selectedTile && (
          <motion.div
            className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-lg z-40"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex items-center">
              <FaTrophy className="text-2xl text-yellow-600 mr-3" />
              <div>
                <h3 className="font-bold text-lg">Winner!</h3>
                <p>{winner} has been completed!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard; 