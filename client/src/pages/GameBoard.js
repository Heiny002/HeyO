/**
 * GameBoard Component
 * The main game interface where players interact with the game board.
 * Handles game state, player interactions, and real-time updates.
 * 
 * Key Features:
 * - Game board display and interaction
 * - Chat system for player communication
 * - Photo upload and tile claiming
 * - Approval/denial system for claimed tiles
 * - Win condition checking
 * - Player permissions management
 */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad, FaPlus, FaPlay, FaCog, FaCamera, FaImage, FaTrophy, FaCheck, FaTimes, FaComment, FaEnvelope, FaCopy, FaShareAlt, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

/**
 * GameBoard Component
 * The main game interface where players interact with the game board
 * Handles game state, player interactions, and real-time updates
 */
const GameBoard = () => {
  // Route and navigation hooks
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Core game state
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  
  // Chat system state
  const [chat, setChat] = useState([
    { id: 1, sender: 'System', message: 'Welcome to the game chat!', timestamp: new Date().toISOString() },
    { id: 2, sender: 'JHarvey', message: 'Hello everyone!', timestamp: new Date().toISOString() }
  ]);
  const [message, setMessage] = useState('');
  
  // Game items and board state
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [tileContents, setTileContents] = useState([]);
  
  // Player interaction state
  const [inviteUsername, setInviteUsername] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [gameLink, setGameLink] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [suggestedTiles, setSuggestedTiles] = useState([]);
  const [tileInputSuggestion, setTileInputSuggestion] = useState('');
  
  // Tile interaction state
  const [selectedTile, setSelectedTile] = useState(null);
  const [tileNote, setTileNote] = useState('');
  const fileInputRef = useRef(null);
  
  // Game progress state
  const [claimedTiles, setClaimedTiles] = useState([]);
  const [tilePhotos, setTilePhotos] = useState([]);
  const [tileApprovals, setTileApprovals] = useState([]);
  const [tileDenials, setTileDenials] = useState([]);
  const [tileNotes, setTileNotes] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  
  // Game creator and permissions state
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [originalCreator, setOriginalCreator] = useState(null);
  const gameCreatorRef = useRef(null);
  const isNewGameRef = useRef(false);
  const currentUser = user?.username;

  // Add missing state variables
  const [userGameState, setUserGameState] = useState(null);
  const [users, setUsers] = useState([]);
  const [itemTimers, setItemTimers] = useState({});

  /**
   * Initializes the game board arrays when the game loads or changes
   * Creates empty arrays for claimed tiles, photos, approvals, denials, and notes
   */
  useEffect(() => {
    if (game) {
      const totalTiles = game.rows * game.columns;
      
      // Only initialize if we don't have user-specific data loaded
      if (!userGameState?.claimedTiles) {
        setClaimedTiles(Array(totalTiles).fill(false));
        setTilePhotos(Array(totalTiles).fill(null));
        setTileApprovals(Array(totalTiles).fill([]));
        setTileDenials(Array(totalTiles).fill([]));
        setTileNotes(Array(totalTiles).fill(null));
      }
    }
  }, [game, userGameState]);

  /**
   * Handles the start of a new game
   * Initializes the game board with shuffled items for each player
   * Uses a seeded random number generator to ensure consistent board state
   */
  const handleStartGame = () => {
    const userBoards = {};
    
    // Initialize board for each user
    users.forEach(username => {
      // Filter out items that are hidden from this user
      const availableItems = items.filter(item => {
        return !item.hiddenFrom || !item.hiddenFrom.includes(username);
      });
      
      // Create a unique seed for each user based on their username and current time
      const userSeed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const timeSeed = Math.floor(Date.now() / 1000); // Add time-based component
      const combinedSeed = userSeed * timeSeed;
      
      // Fisher-Yates shuffle algorithm with seeded randomization
      const shuffledItems = [...availableItems];
      for (let i = shuffledItems.length - 1; i > 0; i--) {
        // Use a more complex seeded random number generation
        const randomValue = Math.abs(Math.sin(combinedSeed * (i + 1)) * 10000);
        const j = Math.floor(randomValue % (i + 1));
        [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
      }
      
      // Fill the board with shuffled items, padding with null if needed
      const userTileContents = Array(game.rows * game.columns).fill(null).map((_, index) => {
        if (index < shuffledItems.length) {
          return shuffledItems[index];
        }
        return null;
      });
      
      userBoards[username] = userTileContents;
    });
    
    // Set the current user's board
    if (currentUser) {
      setTileContents(userBoards[currentUser] || []);
    }
    
    setGameStarted(true);
  };

  /**
   * Handles file upload for tile photos
   * Processes the uploaded image and updates the tile state
   * Also handles associated notes and claim messages
   */
  const handleFileUpload = async (event, tileIndex) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result;
        setTilePhotos(prev => ({ ...prev, [tileIndex]: photoUrl }));
        
        // If there's a pending note, submit it along with the photo
        if (tileNotes[tileIndex] === undefined && tileNote) {
          setTileNotes(prev => ({ ...prev, [tileIndex]: tileNote }));
          setTileNote('');
        }
        
        // Add claim message with photo and any existing note
        addClaimMessage(tileIndex, photoUrl, tileNotes[tileIndex] || tileNote);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  /**
   * Handles the claim of a tile by a player
   * Updates game state and checks for win conditions
   * Also handles associated notes and claim messages
   */
  const handleClaimTile = () => {
    if (!selectedTile || winner) return;
    
    // Update claimed tiles array
    const newClaimedTiles = [...claimedTiles];
    newClaimedTiles[selectedTile.index] = true;
    setClaimedTiles(newClaimedTiles);
    
    // If there's a note, add it to the tile notes
    if (tileNote.trim()) {
      const newTileNotes = [...tileNotes];
      newTileNotes[selectedTile.index] = tileNote.trim();
      setTileNotes(newTileNotes);
    }
    
    // Add a claim message (without photo)
    addClaimMessage(selectedTile.index);
    
    // Check for win condition
    checkWinCondition(newClaimedTiles);
    
    // Close the popup
    setSelectedTile(null);
  };

  /**
   * Handles approval or denial of a claimed tile
   * Updates game state and chat messages accordingly
   * Manages the approval/denial tracking system
   */
  const handleApprovalAction = (messageId, tileIndex, isApproval) => {
    if (isApproval) {
      // Add current user to approvals for this tile
      const newTileApprovals = [...tileApprovals];
      if (!newTileApprovals[tileIndex].includes(currentUser)) {
        newTileApprovals[tileIndex] = [...newTileApprovals[tileIndex], currentUser];
        setTileApprovals(newTileApprovals);
      }
      
      // Remove from denials if previously denied
      const newTileDenials = [...tileDenials];
      newTileDenials[tileIndex] = newTileDenials[tileIndex].filter(user => user !== currentUser);
      setTileDenials(newTileDenials);
      
      // Update the original claim message with approval info
      setChat(prevChat => {
        const updatedChat = [...prevChat];
        const claimMessageIndex = updatedChat.findIndex(msg => msg.id === messageId);
        if (claimMessageIndex !== -1) {
          updatedChat[claimMessageIndex] = {
            ...updatedChat[claimMessageIndex],
            approvals: [...(updatedChat[claimMessageIndex].approvals || []), currentUser],
            denials: (updatedChat[claimMessageIndex].denials || []).filter(user => user !== currentUser)
          };
        }
        return updatedChat;
      });
      
      // Check if this approval triggers a win
      checkWinCondition(claimedTiles);
    } else {
      // Add current user to denials for this tile
      const newTileDenials = [...tileDenials];
      if (!newTileDenials[tileIndex].includes(currentUser)) {
        newTileDenials[tileIndex] = [...newTileDenials[tileIndex], currentUser];
        setTileDenials(newTileDenials);
      }
      
      // Remove from approvals if previously approved
      const newTileApprovals = [...tileApprovals];
      newTileApprovals[tileIndex] = newTileApprovals[tileIndex].filter(user => user !== currentUser);
      setTileApprovals(newTileApprovals);
      
      // Update the original claim message with denial info
      setChat(prevChat => {
        const updatedChat = [...prevChat];
        const claimMessageIndex = updatedChat.findIndex(msg => msg.id === messageId);
        if (claimMessageIndex !== -1) {
          updatedChat[claimMessageIndex] = {
            ...updatedChat[claimMessageIndex],
            denials: [...(updatedChat[claimMessageIndex].denials || []), currentUser],
            approvals: (updatedChat[claimMessageIndex].approvals || []).filter(user => user !== currentUser)
          };
        }
        return updatedChat;
      });
    }
  };

  /**
   * Handles photo selection from camera or gallery
   * Configures the file input based on selection type
   * Supports both mobile camera capture and gallery selection
   */
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

  /**
   * Formats a date string into a readable time format
   * Used for chat message timestamps
   */
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // FUTUREFIX: DUPLICATE handler - This permission check is duplicated
  // Modify our item adding logic to only allow the original creator (no admin)
  const canAddItems = currentUser === originalCreator;

  /**
   * Gets the timer status for a specific item
   * Used for time-limited items or special game mechanics
   */
  const getItemTimerStatus = (item) => {
    if (!gameStarted) return null;
    if (!item) return null;
    
    const timer = itemTimers[item.id];
    if (!timer) return null;
    
    return timer;
  };

  /**
   * Adds a claim message to the chat
   * @param {number} tileIndex - The index of the claimed tile
   * @param {string} [photoUrl] - Optional URL of the photo attached to the claim
   * @param {string} [note] - Optional note attached to the claim
   */
  const addClaimMessage = (tileIndex, photoUrl, note) => {
    const newMessage = {
      id: Date.now(),
      sender: currentUser,
      message: `Claimed tile ${tileIndex + 1}${note ? ` with note: ${note}` : ''}`,
      timestamp: new Date().toISOString(),
      tileIndex,
      photoUrl,
      note,
      approvals: [],
      denials: []
    };
    
    setChat(prevChat => [...prevChat, newMessage]);
  };

  /**
   * Checks if the game has been won based on the current state
   * @param {boolean[]} newClaimedTiles - Array of claimed tile states
   */
  const checkWinCondition = (newClaimedTiles) => {
    if (!game) return;
    
    const { rows, columns, winConditions } = game;
    const totalTiles = rows * columns;
    
    // Check if all tiles are claimed and approved
    const allTilesClaimed = newClaimedTiles.every((claimed, index) => {
      const approvals = tileApprovals[index] || [];
      const denials = tileDenials[index] || [];
      return claimed && approvals.length > denials.length;
    });
    
    if (allTilesClaimed) {
      setWinner(currentUser);
      setShowWinAnimation(true);
      return;
    }
    
    // Check row wins
    if (winConditions.byRow) {
      for (let row = 0; row < rows; row++) {
        const rowStart = row * columns;
        const rowEnd = rowStart + columns;
        const rowClaimed = newClaimedTiles.slice(rowStart, rowEnd).every((claimed, index) => {
          const tileIndex = rowStart + index;
          const approvals = tileApprovals[tileIndex] || [];
          const denials = tileDenials[tileIndex] || [];
          return claimed && approvals.length > denials.length;
        });
        
        if (rowClaimed) {
          setWinner(currentUser);
          setShowWinAnimation(true);
          return;
        }
      }
    }
    
    // Check column wins
    if (winConditions.byColumn) {
      for (let col = 0; col < columns; col++) {
        const columnClaimed = Array.from({ length: rows }, (_, row) => {
          const tileIndex = row * columns + col;
          const claimed = newClaimedTiles[tileIndex];
          const approvals = tileApprovals[tileIndex] || [];
          const denials = tileDenials[tileIndex] || [];
          return claimed && approvals.length > denials.length;
        }).every(Boolean);
        
        if (columnClaimed) {
          setWinner(currentUser);
          setShowWinAnimation(true);
          return;
        }
      }
    }
  };

  return (
    <div className="flex flex-col bg-background">
      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          // Handle the file upload
          if (e.target.files && e.target.files[0] && selectedTile) {
            // Process the file
            handleFileUpload(e, selectedTile.index);
          }
        }}
      />

      {/* Rest of the component JSX... */}
    </div>
  );
};

export default GameBoard; 