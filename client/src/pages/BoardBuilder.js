import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const BoardBuilder = () => {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState('My Board');
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);

  // Min and max values for sliders
  const MIN_COLUMNS = 2;
  const MAX_COLUMNS = 6;
  const MIN_ROWS = 3;
  const MAX_ROWS = 10;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new game with the specified settings
    const newGame = {
      id: `game-${Date.now()}`, // Generate a unique ID
      name: boardName,
      columns,
      rows,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, you would save this to a database
    // Navigate to the game page with the settings and set activeTab to 'chat'
    navigate(`/game/${newGame.id}`, { 
      state: { 
        game: newGame,
        activeTab: 'chat'
      } 
    });
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center mb-8">
          <button 
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => navigate('/games')}
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold">Board Builder</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Board Name Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="boardName">
                Board Name
              </label>
              <input
                type="text"
                id="boardName"
                className="input-field"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                required
                maxLength={30}
              />
            </div>

            {/* Columns Slider */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="columns">
                Columns: {columns}
              </label>
              <input
                type="range"
                id="columns"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min={MIN_COLUMNS}
                max={MAX_COLUMNS}
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{MIN_COLUMNS}</span>
                {Array.from({ length: MAX_COLUMNS - MIN_COLUMNS - 1 }).map((_, i) => (
                  <span key={i}>{MIN_COLUMNS + i + 1}</span>
                ))}
                <span>{MAX_COLUMNS}</span>
              </div>
            </div>

            {/* Rows Slider */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="rows">
                Rows: {rows}
              </label>
              <input
                type="range"
                id="rows"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min={MIN_ROWS}
                max={MAX_ROWS}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{MIN_ROWS}</span>
                {Array.from({ length: MAX_ROWS - MIN_ROWS - 1 }).map((_, i) => (
                  <span key={i}>{MIN_ROWS + i + 1}</span>
                ))}
                <span>{MAX_ROWS}</span>
              </div>
            </div>

            {/* Grid Preview */}
            <div className="mb-8">
              <h3 className="block text-gray-700 font-bold mb-4">Preview</h3>
              <div className="flex justify-center">
                <div 
                  className="bg-gray-100 p-4 rounded-lg" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '4px',
                    maxWidth: '300px',
                    width: '100%'
                  }}
                >
                  {Array.from({ length: rows * columns }).map((_, index) => (
                    <div 
                      key={index} 
                      className="bg-secondary-light rounded-md aspect-square"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="btn-primary w-full flex items-center justify-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCheck className="mr-2" /> Set Tiles
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BoardBuilder; 