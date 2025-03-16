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
  const MIN_ROWS = 2;
  const MAX_ROWS = 10;

  // Handle win condition changes with mutual exclusivity
  const handleWinConditionChange = (condition, isChecked) => {
    if (condition === 'row') {
      setWinByRow(isChecked);
      // If enabling row or column, disable "all board"
      if (isChecked) {
        setWinByAll(false);
      }
      // Ensure at least one option is selected
      if (!isChecked && !winByColumn && !winByAll) {
        setWinByColumn(true);
      }
    } else if (condition === 'column') {
      setWinByColumn(isChecked);
      // If enabling row or column, disable "all board"
      if (isChecked) {
        setWinByAll(false);
      }
      // Ensure at least one option is selected
      if (!isChecked && !winByRow && !winByAll) {
        setWinByRow(true);
      }
    } else if (condition === 'all') {
      setWinByAll(isChecked);
      // If enabling "all board", disable row and column
      if (isChecked) {
        setWinByRow(false);
        setWinByColumn(false);
      } else {
        // If disabling "all board", enable at least one other option
        setWinByRow(true);
      }
    }
  };

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

  // Calculate the grid dimensions to maintain uniform square tiles
  const getGridDimensions = () => {
    // Calculate the aspect ratio of the grid
    const gridRatio = columns / rows;
    
    // Start with max dimensions that could fit in the container
    const maxWidth = 180;
    const maxHeight = 180;
    
    // Determine limiting dimension (width or height)
    let actualWidth, actualHeight;
    
    if (gridRatio >= 1) {
      // Width-constrained (more columns than rows or equal)
      actualWidth = maxWidth;
      actualHeight = actualWidth / gridRatio;
    } else {
      // Height-constrained (more rows than columns)
      actualHeight = maxHeight;
      actualWidth = actualHeight * gridRatio;
    }
    
    return {
      width: Math.min(actualWidth, maxWidth),
      height: Math.min(actualHeight, maxHeight)
    };
  };
  
  // Calculate dynamic gap size based on number of rows and columns
  const getGapSize = () => {
    const totalTiles = rows * columns;
    
    // Scaling factor - larger gap for fewer tiles, smaller for more tiles
    if (totalTiles <= 6) return 6; // Large gap for very few tiles
    if (totalTiles <= 12) return 5; // Medium gap
    if (totalTiles <= 20) return 4; // Standard gap
    if (totalTiles <= 30) return 3; // Small gap
    return 2; // Minimal gap for many tiles
  };
  
  // Calculate dynamic border radius based on number of rows and columns
  const getBorderRadius = () => {
    const totalTiles = rows * columns;
    
    // Scaling factor - larger radius for fewer tiles, smaller for more tiles
    if (totalTiles <= 6) return 6; // Very rounded corners
    if (totalTiles <= 12) return 5; // Rounded corners
    if (totalTiles <= 20) return 4; // Medium corners
    if (totalTiles <= 30) return 3; // Slightly rounded corners
    return 2; // Almost square corners for many tiles
  };
  
  const gridDimensions = getGridDimensions();
  const gapSize = getGapSize();
  const borderRadius = getBorderRadius();

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

            {/* Combined Preview and Win Conditions Section - Fixed height containers */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Grid Preview - Now on the left */}
              <div className="bg-gray-100 p-6 rounded-lg" style={{ height: '250px' }}>
              <h3 className="block text-gray-700 font-bold mb-4">Preview</h3>
                <div className="flex justify-center items-center h-[180px]">
                <div 
                  style={{ 
                      width: `${gridDimensions.width}px`,
                      height: `${gridDimensions.height}px`,
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                      gap: `${gapSize}px`
                  }}
                >
                  {Array.from({ length: rows * columns }).map((_, index) => (
                    <div 
                      key={index} 
                        className="bg-secondary-light"
                        style={{ 
                          aspectRatio: '1/1',
                          borderRadius: `${borderRadius}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Win Conditions - Same height as preview */}
              <div className="bg-gray-50 p-6 rounded-lg" style={{ height: '250px' }}>
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
                      onChange={(e) => handleWinConditionChange('row', e.target.checked)}
                      disabled={winByAll}
                    />
                    <label 
                      htmlFor="winByRow" 
                      className={`${winByAll ? 'text-gray-400' : 'text-gray-700'}`}
                    >
                      All Tiles in a Row
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="winByColumn"
                      className="h-5 w-5 text-primary rounded mr-3"
                      checked={winByColumn}
                      onChange={(e) => handleWinConditionChange('column', e.target.checked)}
                      disabled={winByAll}
                    />
                    <label 
                      htmlFor="winByColumn" 
                      className={`${winByAll ? 'text-gray-400' : 'text-gray-700'}`}
                    >
                      All Tiles in a Column
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="winByAll"
                      className="h-5 w-5 text-primary rounded mr-3"
                      checked={winByAll}
                      onChange={(e) => handleWinConditionChange('all', e.target.checked)}
                      disabled={false}
                    />
                    <label htmlFor="winByAll" className="text-gray-700 font-medium">
                      All Tiles on a Board
                    </label>
                    {winByAll && (
                      <span className="ml-2 text-xs text-orange-500">(exclusive)</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Each claimed tile must be approved by at least 50% of other players.</p>
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