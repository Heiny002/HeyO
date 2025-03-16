import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaTrophy } from 'react-icons/fa';

const BoardBuilder = () => {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState('My Board');
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  
  // Win condition states
  const [winByRow, setWinByRow] = useState(true);
  const [winByColumn, setWinByColumn] = useState(true);
  const [winByAll, setWinByAll] = useState(false);

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
      createdAt: new Date().toISOString(),
      // Include win conditions
      winConditions: {
        byRow: winByRow,
        byColumn: winByColumn,
        byAll: winByAll
      }
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
        className="max-w-5xl mx-auto"
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

            {/* Combined Preview and Win Conditions Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Grid Preview - Now on the left */}
              <div>
                <h3 className="block text-gray-700 font-bold mb-4">Preview</h3>
                <div className="flex justify-center">
                  <div 
                    className="bg-gray-100 p-4 rounded-lg" 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                      gap: '4px',
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

              {/* Win Conditions - New section on the right */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg h-full">
                  <div className="flex items-center mb-4">
                    <FaTrophy className="text-yellow-500 mr-2" />
                    <h3 className="text-gray-700 font-bold">To win, a player must claim:</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="winByRow"
                        className="h-5 w-5 text-primary rounded mr-3"
                        checked={winByRow}
                        onChange={(e) => setWinByRow(e.target.checked)}
                      />
                      <label htmlFor="winByRow" className="text-gray-700">
                        All Tiles in a Row
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="winByColumn"
                        className="h-5 w-5 text-primary rounded mr-3"
                        checked={winByColumn}
                        onChange={(e) => setWinByColumn(e.target.checked)}
                      />
                      <label htmlFor="winByColumn" className="text-gray-700">
                        All Tiles in a Column
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="winByAll"
                        className="h-5 w-5 text-primary rounded mr-3"
                        checked={winByAll}
                        onChange={(e) => setWinByAll(e.target.checked)}
                      />
                      <label htmlFor="winByAll" className="text-gray-700">
                        All Tiles on a Board
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p>Each claimed tile must be approved by at least 50% of other players.</p>
                  </div>
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