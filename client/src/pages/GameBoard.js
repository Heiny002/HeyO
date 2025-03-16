import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad, FaPlus, FaPlay, FaCog, FaCamera, FaImage, FaTrophy, FaCheck, FaTimes, FaComment, FaEnvelope, FaCopy, FaShareAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const GameBoard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
  
  // State for friend invitations
  const [inviteUsername, setInviteUsername] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [gameLink, setGameLink] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // State for tile suggestions
  const [suggestedTiles, setSuggestedTiles] = useState([]);
  const [tileInputSuggestion, setTileInputSuggestion] = useState('');
  
  // State for tile selection popup
  const [selectedTile, setSelectedTile] = useState(null);
  const [tileNote, setTileNote] = useState('');
  const fileInputRef = useRef(null);
  
  // Add state to track claimed tiles, photos, approvals, and winners
  const [claimedTiles, setClaimedTiles] = useState([]);
  const [tilePhotos, setTilePhotos] = useState([]); // Store photos for each tile
  const [tileApprovals, setTileApprovals] = useState([]); // Store approvals for each tile
  const [tileDenials, setTileDenials] = useState([]); // Store denials for each tile
  const [tileNotes, setTileNotes] = useState([]); // Store notes for each tile
  const [winner, setWinner] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [users, setUsers] = useState(['JHarvey', 'Taylor', 'Alex', 'Jordan']); // Simulated users
  const currentUser = user?.username || 'You'; // Get username from AuthContext
  
  // For handling claims waiting for approval
  const [claimMessages, setClaimMessages] = useState([]);

  // User-specific game state - maintained in localStorage
  const [userGameState, setUserGameState] = useState({});

  // Add after user declaration around line 12
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add a reference to store the createdBy value for debugging
  const gameCreatorRef = useRef(null);

  // Keep track of whether this is a new game being created
  const isNewGameRef = useRef(id === 'new' || !id);
  
  // Add an immutable property for the original creator of the game
  // This will be set ONCE during game creation and never changed
  const [originalCreator, setOriginalCreator] = useState(null);

  // Calculate minimum required items
  const calculateMinItems = (rows, columns) => {
    const totalTiles = rows * columns;
    return Math.ceil(totalTiles + (totalTiles * 0.3));
  };

  // On component mount, get game data
  useEffect(() => {
    console.log("Component mounting with Current user:", currentUser, "User object:", user);
    console.log("Game ID:", id, "Is new game:", isNewGameRef.current);
    
    // Check if the original creator is already stored for this game
    const storedOriginalCreator = localStorage.getItem(`original_creator_${id}`);
    
    // If this is a new game, the current user is automatically the creator
    if (isNewGameRef.current) {
      console.log("NEW GAME: Setting current user as creator:", currentUser);
      setIsGameCreator(true);
      gameCreatorRef.current = currentUser;
      
      // Set the original creator - this is permanent and immutable
      if (!storedOriginalCreator) {
        console.log("Setting ORIGINAL CREATOR to:", currentUser);
        localStorage.setItem(`original_creator_${id || 'new'}`, currentUser);
        setOriginalCreator(currentUser);
      } else {
        console.log("Game already has original creator:", storedOriginalCreator);
        setOriginalCreator(storedOriginalCreator);
      }
      
      // In a real app, you would save this to the backend
      localStorage.setItem(`game_creator_${id || 'new'}`, currentUser);
    } else if (storedOriginalCreator) {
      // If the game exists and has an original creator, use that
      console.log("Found original creator in storage:", storedOriginalCreator);
      setOriginalCreator(storedOriginalCreator);
      
      // Only set isGameCreator to true if the current user is the original creator
      setIsGameCreator(currentUser === storedOriginalCreator);
    }
    
    if (location.state?.game) {
      // If we have game data from navigation state, use it
      const gameData = location.state.game;
      
      // If the game doesn't have an originalCreator field, add it from localStorage or set it to current user
      if (!gameData.originalCreator) {
        const creator = storedOriginalCreator || currentUser;
        const updatedGame = {
          ...gameData,
          originalCreator: creator
        };
        setGame(updatedGame);
        setOriginalCreator(creator);
        
        // Save the original creator to localStorage
        if (!storedOriginalCreator) {
          localStorage.setItem(`original_creator_${id}`, creator);
        }
      } else {
        // Game already has originalCreator field
        setGame(gameData);
        setOriginalCreator(gameData.originalCreator);
      }
      
      // CRITICAL FIX: Only assign creator if the game truly has no creator
      // This prevents reassigning creator when switching users
      if (!location.state.game.createdBy) {
        console.log("Game has no creator, setting to original creator or current user");
        
        // Use original creator if available, otherwise current user
        const gameCreator = storedOriginalCreator || currentUser;
        console.log("Assigning creator from storage or current user:", gameCreator);
        
        const updatedGame = {
          ...location.state.game,
          createdBy: gameCreator,
          originalCreator: gameCreator
        };
        
        setGame(updatedGame);
        gameCreatorRef.current = gameCreator;
        setOriginalCreator(gameCreator);
        
        // Only set as creator if it's actually this user
        if (gameCreator === currentUser) {
          setIsGameCreator(true);
        }
      } else {
        // Store creator info in ref for debugging
        console.log("Game already has creator:", location.state.game.createdBy);
        gameCreatorRef.current = location.state.game.createdBy;
        
        // Store the creator permanently
        localStorage.setItem(`game_creator_${id}`, location.state.game.createdBy);
      }
      
      // Set the active tab if provided in the state
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
      
      console.log("Game creator check:", location.state.game.createdBy, "Current user:", currentUser);
      console.log("Original creator check:", originalCreator, "Current user:", currentUser);
      
      // Check if current user is the original creator of the game
      if (originalCreator === currentUser) {
        console.log("SUCCESS: Current user is the original creator");
        setIsGameCreator(true);
      } else if (location.state.game.createdBy === currentUser) {
        console.log("WARNING: Current user listed as creator but not original creator");
      } else {
        console.log("MISMATCH: createdBy:", location.state.game.createdBy, "currentUser:", currentUser);
        console.log("MISMATCH: originalCreator:", originalCreator, "currentUser:", currentUser);
        
        // Explicitly set NOT the creator
        console.log("CONFIRMED: Current user is NOT the creator");
        setIsGameCreator(false);
      }
      
      // Check if current user is an admin
      if (user?.isAdmin) {
        setIsAdmin(true);
      }
      
      setLoading(false);
    } else {
      // Check if we have stored the creator in localStorage
      const storedCreator = localStorage.getItem(`game_creator_${id}`);
      if (storedCreator) {
        console.log("Found stored creator:", storedCreator, "Current user:", currentUser);
        gameCreatorRef.current = storedCreator;
        if (storedCreator === currentUser) {
          console.log("MATCH: Setting isGameCreator to true from localStorage");
          setIsGameCreator(true);
        } else {
          // Explicitly set NOT the creator
          console.log("CONFIRMED: Current user is NOT the creator");
          setIsGameCreator(false);
        }
      }
    
      // In a real app, you would fetch the game data from an API
      // For now, we'll just simulate a loading state
      setTimeout(() => {
        // Check localStorage first to see if we already know about this game
        const storedCreator = localStorage.getItem(`game_creator_${id}`);
        const storedOriginalCreator = localStorage.getItem(`original_creator_${id}`);
        
        // Example fallback game data
        const newGame = {
          id: id || 'new-game-' + Date.now(),
          name: 'Example Board',
          rows: 4,
          columns: 3,
          createdAt: new Date().toISOString(),
          // Use stored creator first if available, otherwise current user
          createdBy: storedCreator || currentUser,
          // Use stored original creator if available or set to current user for new games
          originalCreator: storedOriginalCreator || currentUser
        };
        
        // Store creator info in ref for debugging
        gameCreatorRef.current = newGame.createdBy;
        setOriginalCreator(newGame.originalCreator);
        
        // Only save creator to localStorage if we don't already have one
        if (!storedCreator) {
          localStorage.setItem(`game_creator_${newGame.id}`, newGame.createdBy);
        }
        
        // Save original creator if not set yet
        if (!storedOriginalCreator) {
          localStorage.setItem(`original_creator_${newGame.id}`, newGame.originalCreator);
        }
        
        setGame(newGame);
        
        console.log("Fallback game creator check:", newGame.createdBy, "Current user:", currentUser);
        console.log("Fallback original creator check:", newGame.originalCreator, "Current user:", currentUser);
        
        // Check if current user is the original creator
        if (newGame.originalCreator === currentUser) {
          console.log("SUCCESS: Current user is the original creator");
          setIsGameCreator(true);
        } else if (newGame.createdBy === currentUser) {
          console.log("WARNING: Current user listed as creator but not original creator");
          // Don't set isGameCreator to true if not the original creator
          setIsGameCreator(false);
        } else {
          console.log("MISMATCH: createdBy:", newGame.createdBy, "currentUser:", currentUser);
          // Explicitly set NOT the creator
          setIsGameCreator(false);
        }
        
        // Check if current user is an admin
        if (user?.isAdmin) {
          setIsAdmin(true);
        }
        
        setLoading(false);
      }, 1000);
    }
  }, [id, location.state, currentUser, user, originalCreator]);

  // Add a new useEffect to handle route changes that might indicate game creation steps
  useEffect(() => {
    // Check if we already have a stored creator for this game
    const storedCreator = localStorage.getItem(`game_creator_${id || 'new'}`);
    const storedOriginalCreator = localStorage.getItem(`original_creator_${id || 'new'}`);
    
    // If the URL contains "board-builder" or "set-tiles", mark this as a new game being created
    // BUT only if we don't already have a creator stored (prevents overwriting)
    if (!storedOriginalCreator && (window.location.pathname.includes('board-builder') || 
        window.location.pathname.includes('set-tiles'))) {
      console.log("Detected board builder / set tiles - marking as new game");
      isNewGameRef.current = true;
      setIsGameCreator(true);
      gameCreatorRef.current = currentUser;
      
      // Store this information for persistence
      localStorage.setItem(`game_creator_${id || 'new'}`, currentUser);
      
      // Set and store the ORIGINAL creator - this value will never change
      localStorage.setItem(`original_creator_${id || 'new'}`, currentUser);
      setOriginalCreator(currentUser);
    } else if (storedOriginalCreator) {
      // If we have a stored original creator, use that to determine if user is the creator
      console.log("Found existing original creator for this game:", storedOriginalCreator);
      setOriginalCreator(storedOriginalCreator);
      setIsGameCreator(storedOriginalCreator === currentUser);
    }
  }, [id, currentUser]);

  // Load user-specific game state from localStorage
  useEffect(() => {
    if (game && user) {
      const storageKey = `game_${game.id}_user_${user.id}`;
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setUserGameState(parsedState);
          
          // Apply user-specific state if it exists
          if (parsedState.tileContents) setTileContents(parsedState.tileContents);
          if (parsedState.claimedTiles) setClaimedTiles(parsedState.claimedTiles);
          if (parsedState.tilePhotos) setTilePhotos(parsedState.tilePhotos);
          if (parsedState.tileApprovals) setTileApprovals(parsedState.tileApprovals);
          if (parsedState.tileDenials) setTileDenials(parsedState.tileDenials);
          if (parsedState.tileNotes) setTileNotes(parsedState.tileNotes);
          if (parsedState.gameStarted) setGameStarted(parsedState.gameStarted);
          
          // Don't override chat with user-specific chat to maintain shared chat experience
        } catch (e) {
          console.error("Error parsing saved game state", e);
        }
      }
    }
  }, [game, user]);

  // Save user-specific game state to localStorage when it changes
  useEffect(() => {
    if (game && user && gameStarted) {
      const storageKey = `game_${game.id}_user_${user.id}`;
      const stateToSave = {
        tileContents,
        claimedTiles,
        tilePhotos,
        tileApprovals,
        tileDenials,
        tileNotes,
        gameStarted
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [game, user, tileContents, claimedTiles, tilePhotos, tileApprovals, tileDenials, tileNotes, gameStarted]);

  // Initialize arrays when game loads or changes
  useEffect(() => {
    if (game) {
      const totalTiles = game.rows * game.columns;
      
      // Only initialize if we don't have user-specific data loaded
      if (!userGameState.claimedTiles) {
        setClaimedTiles(Array(totalTiles).fill(false));
        setTilePhotos(Array(totalTiles).fill(null));
        setTileApprovals(Array(totalTiles).fill([]));
        setTileDenials(Array(totalTiles).fill([]));
        setTileNotes(Array(totalTiles).fill(null));
      }
    }
  }, [game, userGameState]);

  // Handle chat message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const newMessage = {
      id: chat.length + 1,
      sender: currentUser,
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
    
    // Check if the item contains @ mentions
    const text = itemInput.trim();
    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const mentionedUsers = matches.map(match => match[1]);
    
    const newItem = {
      id: Date.now(),
      text: text,
      hiddenFrom: mentionedUsers
    };
    
    setItems([...items, newItem]);
    setItemInput('');
    
    // Add a message to the chat about the new item
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} added a new item: "${text}"`,
      timestamp: new Date().toISOString(),
      item: newItem
    };
    
    setChat([...chat, newMessage]);
  };

  // Handle friend invitation by username
  const handleInviteFriend = (e) => {
    e.preventDefault();
    
    if (!inviteUsername.trim()) return;
    
    // Check if user already invited
    if (invitedUsers.includes(inviteUsername.trim())) {
      return;
    }
    
    setInvitedUsers([...invitedUsers, inviteUsername.trim()]);
    
    // Add system message about invitation
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} invited ${inviteUsername.trim()} to join the game.`,
      timestamp: new Date().toISOString()
    };
    
    setChat([...chat, newMessage]);
    setInviteUsername('');
  };

  // Generate shareable game link
  const generateGameLink = () => {
    // In a real app, you'd create a unique link with the game ID
    const link = `${window.location.origin}/join-game/${id}`;
    setGameLink(link);
    return link;
  };

  // Share game link via different methods
  const shareGameLink = (method) => {
    const link = gameLink || generateGameLink();
    
    // In a real app, these would use the Web Share API or deep links
    switch(method) {
      case 'text':
        window.open(`sms:?body=Join my game! ${link}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Join my game!&body=Click this link to join: ${link}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(link);
        setShowCopySuccess(true);
        
        // Hide the success message and close the popup after 1.5 seconds
        setTimeout(() => {
          setShowCopySuccess(false);
          document.getElementById('inviteMenu').classList.add('hidden');
        }, 1500);
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Join my game!',
            text: 'Click this link to join:',
            url: link
          });
        }
    }
  };

  // Handle tile suggestion from users
  const handleSuggestTile = (e) => {
    e.preventDefault();
    
    if (!tileInputSuggestion.trim()) return;
    
    // Check for @mentions
    const text = tileInputSuggestion.trim();
    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const mentionedUsers = matches.map(match => match[1]);
    
    console.log("Creating suggestion with text:", text);
    console.log("Mentioned users:", mentionedUsers);
    console.log("Current user is creator:", isGameCreator);
    console.log("Game creator from ref:", gameCreatorRef.current);
    
    // Create suggestion with proper hiddenFrom
    const newSuggestion = {
      id: Date.now(),
      text: text,
      suggestedBy: currentUser,
      hiddenFrom: mentionedUsers.length > 0 ? mentionedUsers : undefined
    };
    
    console.log("New suggestion object:", newSuggestion);
    
    setSuggestedTiles([...suggestedTiles, newSuggestion]);
    
    // Add message about the suggestion
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} suggested a new tile: "${text}"`,
      timestamp: new Date().toISOString(),
      suggestion: newSuggestion
    };
    
    console.log("Adding new message with suggestion:", newMessage);
    console.log("Current isGameCreator status:", isGameCreator);
    
    setChat([...chat, newMessage]);
    setTileInputSuggestion('');
    
    // Hide the suggest tile menu after submission
    document.getElementById('suggestTileMenu').classList.add('hidden');
  };

  // Handle approving a suggested tile
  const handleApproveSuggestion = (suggestionId) => {
    const suggestion = suggestedTiles.find(s => s.id === suggestionId);
    
    if (!suggestion) return;
    
    // Add to items - preserve the hiddenFrom property completely
    const newItem = {
      id: Date.now(),
      text: suggestion.text,
      hiddenFrom: suggestion.hiddenFrom
    };
    
    setItems([...items, newItem]);
    
    // Remove from suggestions
    setSuggestedTiles(suggestedTiles.filter(s => s.id !== suggestionId));
    
    // Add system message about approval
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} approved and added a new tile to the game.`,
      timestamp: new Date().toISOString(),
      item: newItem
    };
    
    setChat([...chat, newMessage]);
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
    if (!hasEnoughItems) {
      return;
    }
    
    // In a real app, you would generate unique boards for each user
    // For now, we'll simulate this for the current user
    const userBoards = {};
    
    // Create a board for each user with truly unique randomization
    users.forEach(username => {
      // Create a unique seed for each user to ensure different board layouts
      const userSeed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Use the seed to generate a consistent but unique shuffle for this user
      const shuffledItems = [...items].sort(() => {
        // Use a deterministic but unique shuffle based on the username
        const randomValue = Math.sin(userSeed * 9999) * 10000;
        return 0.5 - Math.sin(randomValue % 1);
      });
      
      const userTileContents = Array(game.rows * game.columns).fill(null).map((_, index) => {
        if (index < shuffledItems.length && index < game.rows * game.columns) {
          return shuffledItems[index];
        }
        return null;
      });
      
      userBoards[username] = userTileContents;
    });
    
    // For the current user - ensure we get this user's unique board
    let currentUserBoard;
    if (userBoards[currentUser]) {
      // Use the pre-generated board for this user
      currentUserBoard = userBoards[currentUser];
    } else {
      // Generate a new unique board for this user
      currentUserBoard = generateUserBoard();
    }
    
    setTileContents(currentUserBoard);
    setGameStarted(true);
    
    // Add system message about game start
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: 'The game has started! Click on a tile to claim it.',
      timestamp: new Date().toISOString()
    };
    
    setChat([...chat, newMessage]);
    
    // Navigate to board tab when game starts
    setActiveTab('board');
  };
  
  // Generate a board for the current user with guaranteed uniqueness
  const generateUserBoard = () => {
    // Create a unique seed for the current user
    const userSeed = currentUser.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the seed to generate a consistent but unique shuffle for this user
    const shuffledItems = [...items].sort(() => {
      // Use a deterministic but unique shuffle based on username
      const randomValue = Math.sin(userSeed * 9999) * 10000;
      return 0.5 - Math.sin(randomValue % 1);
    });
    
    return Array(game.rows * game.columns).fill(null).map((_, index) => {
      if (index < shuffledItems.length && index < game.rows * game.columns) {
        return shuffledItems[index];
      }
      return null;
    });
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (!gameStarted || !tileContents[index] || claimedTiles[index] || winner) {
      return;
    }
    
    // Check if this tile is hidden from the current user
    if (isTileHiddenFromUser(tileContents[index])) {
      return;
    }
    
    setSelectedTile({
      index,
      item: tileContents[index]
    });
    setTileNote('');
  };

  // Check if a tile should be hidden from current user (if tagged with @username)
  const isTileHiddenFromUser = (tile) => {
    if (!tile || !tile.hiddenFrom) return false;
    return tile.hiddenFrom.includes(currentUser);
  };

  // Get display text for an item based on @mentions
  const getItemDisplayText = (item) => {
    if (!item) return '';
    
    // If the current user is mentioned in the item, show "A tile about you!"
    if (item.hiddenFrom && item.hiddenFrom.includes(currentUser)) {
      return "A tile about you!";
    }
    
    return item.text;
  };

  // Function to get required approvals count
  const getRequiredApprovals = () => {
    // Half of the other users (excluding current user)
    return Math.ceil((users.length - 1) / 2);
  };

  // Check if a tile is approved by enough users
  const isTileApproved = (index) => {
    return tileApprovals[index] && tileApprovals[index].length >= getRequiredApprovals();
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
        // Tile must be claimed AND approved by enough users
        if (!newClaimedTiles[index] || !isTileApproved(index)) {
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
        // Tile must be claimed AND approved by enough users
        if (!newClaimedTiles[index] || !isTileApproved(index)) {
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

  // Handle file upload after selection
  const handleFileUpload = (file, tileIndex) => {
    if (!file) return;
    
    // In a real app, you would upload the file to a server
    // Here we'll just use a data URL as a placeholder
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target.result;
      
      // Update tile photos array
      const newTilePhotos = [...tilePhotos];
      newTilePhotos[tileIndex] = photoUrl;
      setTilePhotos(newTilePhotos);
      
      // Claim the tile since a photo was added
      const newClaimedTiles = [...claimedTiles];
      newClaimedTiles[tileIndex] = true;
      setClaimedTiles(newClaimedTiles);
      
      // If there's a note, add it to the tile notes
      if (tileNote.trim()) {
        const newTileNotes = [...tileNotes];
        newTileNotes[tileIndex] = tileNote.trim();
        setTileNotes(newTileNotes);
      }
      
      // Check for win condition
      checkWinCondition(newClaimedTiles);
      
      // Create a claim message
      addClaimMessage(tileIndex, photoUrl);
      
      // Close the popup
      setSelectedTile(null);
    };
    reader.readAsDataURL(file);
  };

  // Add a claim message to chat and track it for approvals
  const addClaimMessage = (tileIndex, photoUrl = null) => {
    const messageId = chat.length + 1;
    const tile = tileContents[tileIndex];
    
    // Create the message object
    const newMessage = {
      id: messageId,
      sender: 'System',
      message: `${currentUser} claimed the "${getItemDisplayText(tile)}" tile`,
      timestamp: new Date().toISOString(),
      claimInfo: {
        tileIndex,
        user: currentUser,
        photo: photoUrl,
        note: tileNote
      }
    };
    
    // Add to chat
    setChat([...chat, newMessage]);
    
    // Track this message for approvals
    setClaimMessages([...claimMessages, {
      messageId,
      tileIndex,
      user: currentUser
    }]);
  };

  // Handle adding a note to a tile without claiming it
  const handleAddNote = () => {
    if (!selectedTile || !tileNote.trim()) return;
    
    // Update tile notes array
    const newTileNotes = [...tileNotes];
    newTileNotes[selectedTile.index] = tileNote.trim();
    setTileNotes(newTileNotes);
    
    // Close the popup
    setSelectedTile(null);
  };

  // Handle claim button click
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

  // Handle approval or denial of a claimed tile
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
      
      // Add approval message to chat
      const newMessage = {
        id: chat.length + 1,
        sender: 'System',
        message: `${currentUser} approved the "${getItemDisplayText(tileContents[tileIndex])}" tile claim`,
        timestamp: new Date().toISOString()
      };
      setChat([...chat, newMessage]);
      
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
      
      // Add denial message to chat
      const newMessage = {
        id: chat.length + 1,
        sender: 'System',
        message: `${currentUser} denied the "${getItemDisplayText(tileContents[tileIndex])}" tile claim`,
        timestamp: new Date().toISOString()
      };
      setChat([...chat, newMessage]);
    }
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

  // Generate consistent color for each user
  const getUserColor = (username) => {
    // List of background colors with good text contrast
    const colors = [
      'bg-blue-200 text-blue-900',     // Blue
      'bg-green-200 text-green-900',   // Green
      'bg-yellow-200 text-yellow-900', // Yellow
      'bg-pink-200 text-pink-900',     // Pink
      'bg-purple-200 text-purple-900', // Purple
      'bg-indigo-200 text-indigo-900', // Indigo
      'bg-red-200 text-red-900',       // Red
      'bg-orange-200 text-orange-900'  // Orange
    ];
    
    // Create a simple hash of the username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to select a color
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Get consistent color for current user
  const currentUserColor = 'bg-primary-light text-gray-800';
  const systemMessageColor = 'bg-gray-200 text-gray-800';

  // Modify our suggestion approval logic to use ONLY the original creator (no admin)
  const canApproveSuggestions = currentUser === originalCreator;

  // Modify our item adding logic to only allow the original creator (no admin)
  const canAddItems = currentUser === originalCreator;

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
            handleFileUpload(e.target.files[0], selectedTile.index);
          }
        }}
      />

      {/* Header with tabs */}
      <header className="bg-white shadow-md relative z-10">
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
              
              {isGameCreator && (
                <div className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                  <FaGamepad className="mr-1 text-green-600" /> 
                  Creator
                </div>
              )}
              
              {isAdmin && (
                <div className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <FaCog className="mr-1 text-blue-600" /> 
                  Admin
                </div>
              )}
              
              {/* Show game creator info with emphasis on original creator */}
              <div className="ml-4 text-sm text-gray-600">
                Game Creator: {originalCreator || game.createdBy} {originalCreator === currentUser ? "(You)" : ""}
              </div>
            </div>
            
            {/* Debugging section */}
            <div className="flex items-center">
              {/* Force creator status button */}
              <button 
                className="p-2 mr-2 rounded bg-red-200 hover:bg-red-300 transition-colors text-xs"
                onClick={() => {
                  console.log("Manual override - setting as creator");
                  setIsGameCreator(true);
                }}
                title="Force creator status for debugging"
              >
                Debug: Force Creator
              </button>
            
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
          </div>
          
          {/* Tab buttons */}
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
                  const isClaimed = !!claimedTiles[index];
                  const isApproved = isTileApproved(index);
                  const hasPhoto = tilePhotos[index] !== null;
                  const isHiddenFromUser = gameStarted && tileContents[index] && isTileHiddenFromUser(tileContents[index]);
                  
                  let tileStyle = "bg-gradient-to-br from-primary-light to-secondary-light cursor-pointer";
                  
                  if (isClaimed && isApproved) {
                    tileStyle = "bg-gradient-to-br from-green-400 to-green-600 cursor-default";
                  } else if (isClaimed && !isApproved) {
                    tileStyle = "bg-gradient-to-br from-yellow-400 to-yellow-600 cursor-default";
                  } else if (isHiddenFromUser) {
                    tileStyle = "bg-gradient-to-br from-gray-400 to-gray-600 cursor-not-allowed";
                  }
                  
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
                      whileHover={{ scale: isClaimed || isHiddenFromUser ? 1 : 0.95 }}
                      whileTap={{ scale: isClaimed || isHiddenFromUser ? 1 : 0.9 }}
                      className={`rounded-lg shadow-md ${tileStyle} flex items-center justify-center font-bold text-white text-lg p-2 overflow-hidden relative`}
                      onClick={() => !isClaimed && !isHiddenFromUser && handleTileClick(index)}
                    >
                      {hasPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <FaImage className="text-white text-xl" />
                        </div>
                      )}
                      {isHiddenFromUser ? (
                        <span className="text-center">Hidden</span>
                      ) : gameStarted && tileContents[index] ? (
                        <div className="text-center flex flex-col">
                          <span>{getItemDisplayText(tileContents[index])}</span>
                          {tileNotes[index] && (
                            <span className="text-xs font-normal mt-1 text-gray-200">{tileNotes[index]}</span>
                          )}
                        </div>
                      ) : (
                        index + 1
                      )}
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
                {/* Chat component - appears first on mobile */}
                <div className={`${gameStarted ? 'md:col-span-3' : 'md:col-span-2'} order-1 bg-white rounded-lg shadow-lg p-4 flex flex-col`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Game Chat</h2>
                    
                    {/* Friend invitation section */}
                    <div className="flex space-x-2">
                      <div className="relative">
                        <button 
                          onClick={() => document.getElementById('inviteMenu').classList.toggle('hidden')}
                          className="btn-secondary px-3 py-1 text-sm flex items-center"
                        >
                          <FaPlus className="mr-1" /> Invite Friends
                        </button>
                        <div id="inviteMenu" className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3 z-30 hidden">
                          <h3 className="font-bold text-sm mb-2">Invite by Username</h3>
                          <form onSubmit={handleInviteFriend} className="flex mb-3">
                            <input
                              type="text"
                              className="input-field flex-grow mr-1 text-sm"
                              placeholder="Username..."
                              value={inviteUsername}
                              onChange={(e) => setInviteUsername(e.target.value)}
                            />
                            <motion.button
                              type="submit"
                              className="btn-primary text-sm px-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={!inviteUsername.trim()}
                            >
                              Add
                            </motion.button>
                          </form>
                          
                          <h3 className="font-bold text-sm mb-2">Share Link</h3>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => shareGameLink('text')}
                              className="btn-secondary p-2 text-lg"
                              title="Share via Text Message"
                            >
                              <FaComment />
                            </button>
                            <button 
                              onClick={() => shareGameLink('email')}
                              className="btn-secondary p-2 text-lg"
                              title="Share via Email"
                            >
                              <FaEnvelope />
                            </button>
                            <button 
                              onClick={() => shareGameLink('copy')}
                              className="btn-secondary p-2 text-lg"
                              title="Copy Link"
                            >
                              <FaCopy />
                            </button>
                            <button 
                              onClick={() => shareGameLink('share')}
                              className="btn-secondary p-2 text-lg"
                              title="Share..."
                            >
                              <FaShareAlt />
                            </button>
                          </div>
                          
                          {showCopySuccess && (
                            <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md text-sm text-center">
                              Link copied to clipboard!
                            </div>
                          )}
                          
                          {invitedUsers.length > 0 && (
                            <>
                              <h3 className="font-bold text-sm mt-3 mb-2">Invited Users</h3>
                              <ul className="text-sm">
                                {invitedUsers.map((user, index) => (
                                  <li key={index} className="mb-1">{user}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!gameStarted && (
                        <div className="relative">
                          <button 
                            onClick={() => document.getElementById('suggestTileMenu').classList.toggle('hidden')}
                            className="btn-secondary px-3 py-1 text-sm flex items-center"
                          >
                            <FaPlus className="mr-1" /> Suggest Tile
                          </button>
                          <div id="suggestTileMenu" className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3 z-30 hidden">
                            <form onSubmit={handleSuggestTile} className="flex mb-3">
                              <input
                                type="text"
                                className="input-field flex-grow mr-1 text-sm"
                                placeholder="Suggest a tile... (use @ to hide from users)"
                                value={tileInputSuggestion}
                                onChange={(e) => setTileInputSuggestion(e.target.value)}
                              />
                              <motion.button
                                type="submit"
                                className="btn-primary text-sm px-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!tileInputSuggestion.trim()}
                              >
                                Suggest
                              </motion.button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg" style={{ maxHeight: '60vh' }}>
                    {[...chat].reverse().map((msg) => {
                      // Check if this is a claim message that needs approval buttons
                      const isClaimMessage = msg.claimInfo !== undefined;
                      const tileIndex = isClaimMessage ? msg.claimInfo.tileIndex : null;
                      
                      // Check if this is a tile suggestion message
                      const isSuggestionMessage = msg.suggestion !== undefined;
                      
                      // Check if this is an item message with a mention
                      const isItemMessage = msg.item !== undefined;
                      
                      // Log message type for debugging
                      if (isSuggestionMessage) {
                        console.log("Suggestion message:", msg, "isGameCreator:", isGameCreator, "gameStarted:", gameStarted);
                      }
                      
                      // Get appropriate message text (handling @mentions)
                      let messageText = msg.message;
                      
                      // Special handling for claim messages related to hidden tiles
                      if (isClaimMessage && tileContents[tileIndex] && 
                          tileContents[tileIndex].hiddenFrom && 
                          tileContents[tileIndex].hiddenFrom.includes(currentUser)) {
                        messageText = `${msg.claimInfo.user} claimed the "A tile about you!" tile`;
                      }
                      
                      // Determine if current user has already voted on this claim
                      const hasApproved = tileIndex !== null && tileApprovals[tileIndex]?.includes(currentUser);
                      const hasDenied = tileIndex !== null && tileDenials[tileIndex]?.includes(currentUser);
                      
                      // Determine message color based on sender
                      let messageColor = '';
                      if (msg.sender === 'System') {
                        messageColor = systemMessageColor;
                      } else if (msg.sender === currentUser) {
                        messageColor = currentUserColor;
                      } else {
                        messageColor = getUserColor(msg.sender);
                      }
                      
                      // For debugging - check button visibility conditions
                      const shouldShowApprovalButton = isSuggestionMessage && !gameStarted && canApproveSuggestions;
                      if (isSuggestionMessage) {
                        console.log(`Approval button conditions:`, {
                          isSuggestionMessage, 
                          notGameStarted: !gameStarted, 
                          isGameCreator,
                          gameCreatorFromRef: gameCreatorRef.current,
                          currentUser,
                          suggestionBy: msg.suggestion.suggestedBy,
                          shouldShow: shouldShowApprovalButton
                        });
                      }
                      
                      return (
                        <div key={msg.id} className={`mb-3 ${msg.sender === currentUser ? 'text-right' : ''}`}>
                          <div className={`inline-block px-4 py-2 rounded-lg ${messageColor} ${
                            msg.sender === 'System' ? 'w-full' : ''
                          }`}>
                            {msg.sender !== currentUser && (
                              <div className="font-bold text-sm">{msg.sender}</div>
                            )}
                            
                            {/* Message content with proper handling of mentions */}
                            <p>
                              {isSuggestionMessage && msg.suggestion.hiddenFrom && msg.suggestion.hiddenFrom.includes(currentUser)
                                ? `${msg.suggestion.suggestedBy} suggested a tile about you!`
                                : isItemMessage && msg.item.hiddenFrom && msg.item.hiddenFrom.includes(currentUser)
                                  ? `A new tile about you was added to the game`
                                  : messageText
                              }
                            </p>
                            
                            {/* Display attached photo if exists */}
                            {isClaimMessage && msg.claimInfo.photo && (
                              <div className="mt-2">
                                <img 
                                  src={msg.claimInfo.photo} 
                                  alt="Claim evidence" 
                                  className="w-full h-auto rounded-lg shadow-sm"
                                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                                />
                              </div>
                            )}
                            
                            {/* Display note if exists */}
                            {isClaimMessage && msg.claimInfo.note && (
                              <div className="mt-2 bg-white bg-opacity-50 p-2 rounded text-sm italic">
                                Note: {msg.claimInfo.note}
                              </div>
                            )}
                            
                            {/* Changed button for game creator - now a green checkmark */}
                            {isSuggestionMessage && !gameStarted && canApproveSuggestions && (
                              <div className="mt-2 flex justify-end">
                                <button 
                                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                                  onClick={() => handleApproveSuggestion(msg.suggestion.id)}
                                  title="Add to Game"
                                >
                                  <FaCheck />
                                </button>
                              </div>
                            )}
                            
                            {/* For debugging - show creator status next to message if applicable */}
                            {isSuggestionMessage && (
                              <div className="mt-1 text-xs text-red-600 font-bold">
                                Debug: Original Creator={originalCreator}, You={currentUser}, Match={originalCreator === currentUser ? "YES" : "NO"}
                              </div>
                            )}
                            
                            {/* Approval buttons for claims */}
                            {isClaimMessage && msg.claimInfo.user !== currentUser && (
                              <div className="mt-2 flex justify-end space-x-2">
                                <button 
                                  className={`p-2 rounded-full ${hasApproved ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-green-100'}`}
                                  onClick={() => handleApprovalAction(msg.id, tileIndex, true)}
                                  disabled={hasApproved}
                                >
                                  <FaCheck />
                                </button>
                                <button 
                                  className={`p-2 rounded-full ${hasDenied ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-red-100'}`}
                                  onClick={() => handleApprovalAction(msg.id, tileIndex, false)}
                                  disabled={hasDenied}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                            
                            {/* Approval status */}
                            {isClaimMessage && (
                              <div className="mt-2 text-xs text-gray-600 flex justify-between">
                                <span>
                                  Approvals: {tileApprovals[tileIndex]?.length || 0}/{getRequiredApprovals()}
                                </span>
                                <span>
                                  Denials: {tileDenials[tileIndex]?.length || 0}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-600 mt-1">{formatTime(msg.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })}
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
                
                {/* Game Items component - appears second on mobile */}
                {!gameStarted && (
                  <div className="order-2 md:order-1 md:col-span-1 bg-white rounded-lg shadow-lg p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Game Items</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Add items for the game. You need at least {minItemsRequired} items.
                      ({items.length} / {minItemsRequired})
                    </p>
                    
                    {(canAddItems) && (
                      <form onSubmit={handleAddItem} className="flex mb-4">
                        <input
                          type="text"
                          className="input-field flex-grow mr-2"
                          placeholder="Add an item... (use @ to hide from users)"
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
                    )}
                    
                    {hasEnoughItems && !gameStarted && (isGameCreator || isAdmin) && (
                      <motion.button
                        onClick={() => {
                          handleStartGame();
                          // Navigate to board tab when game starts
                          setActiveTab('board');
                        }}
                        className="btn-success w-full mb-4 flex items-center justify-center"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaPlay className="mr-2" /> Start Game
                      </motion.button>
                    )}
                    
                    <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-2 max-h-[40vh]">
                      {items.length > 0 ? (
                        <ul className="space-y-2">
                          {items.map((item, index) => (
                            <li key={item.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                              <span className="font-medium">
                                {index + 1}. {getItemDisplayText(item)}
                                {(isGameCreator || isAdmin) && item.hiddenFrom && item.hiddenFrom.length > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (Hidden from: {item.hiddenFrom.join(', ')})
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500 py-4">No items added yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tile popup dialog */}
      <AnimatePresence>
        {selectedTile && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 p-4"
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
                {getItemDisplayText(selectedTile.item)}
              </h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-bold" htmlFor="tileNote">
                    Add a note:
                  </label>
                </div>
                <textarea
                  id="tileNote"
                  className="input-field min-h-[100px] w-full"
                  placeholder="Write your note here..."
                  value={tileNote}
                  onChange={(e) => setTileNote(e.target.value)}
                ></textarea>
                
                {/* Buttons under the text input */}
                <div className="flex space-x-2 mt-3">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={handleAddNote}
                    disabled={!tileNote.trim()}
                    title="Add note without claiming"
                  >
                    +
                  </button>
                  
                  <motion.button
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhotoSelect('camera')}
                    title="Take photo"
                  >
                    <FaCamera />
                  </motion.button>
                  
                  <motion.button
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePhotoSelect('gallery')}
                    title="Choose from gallery"
                  >
                    <FaImage />
                  </motion.button>
                </div>
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
              </div>
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
                <p>{winner} has been completed and approved!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard; 