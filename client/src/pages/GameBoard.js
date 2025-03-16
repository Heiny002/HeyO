import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad, FaPlus, FaPlay, FaCog, FaCamera, FaImage, FaTrophy, FaCheck, FaTimes, FaComment, FaEnvelope, FaCopy, FaShareAlt, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
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

  // New states for item editing
  const [editingItem, setEditingItem] = useState(null);
  const [editItemInput, setEditItemInput] = useState('');
  
  // New state for timer functionality
  const [selectedTimer, setSelectedTimer] = useState(0); // Default to "No timer" (0 minutes)
  const [itemTimers, setItemTimers] = useState({}); // Track active timers {itemId: {endTime, remaining}}
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Available timer options in minutes
  const getTimerOptions = () => {
    // Add "No timer" option with value 0
    const noTimer = [0];
    
    // 1-10 minutes (every minute)
    const oneToTen = Array.from({length: 10}, (_, i) => i + 1);
    
    // 12-30 minutes (every even minute)
    const twelveToThirty = Array.from({length: 10}, (_, i) => (i * 2) + 12);
    
    // 35-120 minutes (every 5 minutes)
    const thirtyFiveToOneHundredTwenty = Array.from({length: 18}, (_, i) => (i * 5) + 35);
    
    return [...noTimer, ...oneToTen, ...twelveToThirty, ...thirtyFiveToOneHundredTwenty];
  };
  
  // Format timer display
  const formatTimeDisplay = (minutes) => {
    if (minutes === 0) return "No timer";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}hr:${mins.toString().padStart(2, '0')}mins`;
    }
    return `${minutes}mins`;
  };
  
  // Format countdown display
  const formatCountdown = (remainingSeconds) => {
    if (remainingSeconds <= 0) return "Time's up!";
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}hr:${mins.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;
    }
    
    return `${minutes}m:${seconds.toString().padStart(2, '0')}s`;
  };

  // Start the timer interval when game starts
  useEffect(() => {
    if (gameStarted && !timerIntervalId) {
      // Update timers every second
      const intervalId = setInterval(() => {
        setItemTimers(prevTimers => {
          const now = Date.now();
          const updatedTimers = {...prevTimers};
          
          // Update remaining time for each active timer
          Object.keys(updatedTimers).forEach(itemId => {
            const timer = updatedTimers[itemId];
            if (timer.endTime > now) {
              updatedTimers[itemId] = {
                ...timer,
                remaining: Math.floor((timer.endTime - now) / 1000)
              };
            } else {
              updatedTimers[itemId] = {
                ...timer,
                remaining: 0,
                expired: true
              };
            }
          });
          
          return updatedTimers;
        });
      }, 1000);
      
      setTimerIntervalId(intervalId);
      
      return () => clearInterval(intervalId);
    }
  }, [gameStarted]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [timerIntervalId]);

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

  // Add new state for message previews and win animation
  const [messagePreview, setMessagePreview] = useState(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // Function to show message preview
  const showMessagePreview = (message) => {
    setMessagePreview(message);
    setTimeout(() => setMessagePreview(null), 3000);
  };

  // Handle chat message submission with preview
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
    showMessagePreview(newMessage);
    setMessage('');
  };

  // Check for win condition - updated with animation
  const checkWinCondition = (newClaimedTiles) => {
    if (!game) return false;
    
    const { rows, columns } = game;
    const winConditions = game.winConditions || { byRow: true, byColumn: true, byAll: false };
    let foundWin = false;
    
    // Check rows if that win condition is enabled
    if (winConditions.byRow) {
      for (let row = 0; row < rows; row++) {
        let rowComplete = true;
        for (let col = 0; col < columns; col++) {
          const index = row * columns + col;
          if (!newClaimedTiles[index] || !isTileApproved(index)) {
            rowComplete = false;
            break;
          }
        }
        if (rowComplete) {
          const winMessage = `Row ${row + 1} Complete!`;
          setWinner(winMessage);
          setShowWinAnimation(true);
          
          // Add win message to chat
          const winSystemMessage = {
            id: chat.length + 1,
            sender: 'System',
            message: `🏆 ${currentUser} has won by completing ${winMessage}! 🎉`,
            timestamp: new Date().toISOString(),
            isWinMessage: true
          };
          setChat(prevChat => [...prevChat, winSystemMessage]);
          showMessagePreview(winSystemMessage);
          
          foundWin = true;
          return true;
        }
      }
    }
    
    // Similar updates for column and full board wins...
    // ... existing win condition checks ...
    
    return false;
  };

  // Handle item submission with timer
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
      hiddenFrom: mentionedUsers,
      timerMinutes: selectedTimer // Add timer duration
    };
    
    setItems([...items, newItem]);
    setItemInput('');
    setSelectedTimer(0); // Reset timer to 0 after submission
    
    // Add a message to the chat about the new item
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} added a new item: "${text}"${selectedTimer > 0 ? ` (${formatTimeDisplay(selectedTimer)})` : ''}`,
      timestamp: new Date().toISOString(),
      item: newItem
    };
    
    setChat([...chat, newMessage]);
    showMessagePreview(newMessage);
  };

  // Handle editing an item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditItemInput(item.text);
    setSelectedTimer(0); // Default to "No Timer" when editing
  };

  // Handle saving edited item
  const handleSaveEdit = () => {
    if (!editingItem || !editItemInput.trim()) return;
    
    // Check if the item contains @ mentions
    const text = editItemInput.trim();
    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const mentionedUsers = matches.map(match => match[1]);
    
    const updatedItem = {
      ...editingItem,
      text: text,
      hiddenFrom: mentionedUsers,
      timerMinutes: selectedTimer
    };
    
    // Update the item in the items array
    setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
    
    // Add a message to the chat about the edit
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} edited an item: "${text}" (${formatTimeDisplay(selectedTimer)})`,
      timestamp: new Date().toISOString(),
      item: updatedItem
    };
    
    setChat([...chat, newMessage]);
    showMessagePreview(newMessage);
    
    // Reset editing state
    setEditingItem(null);
    setEditItemInput('');
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // Find the item to be deleted for the message
      const itemToDelete = items.find(item => item.id === itemId);
      
      // Filter out the item from the items array
      setItems(items.filter(item => item.id !== itemId));
      
      // Add a message to the chat about the deletion
      const newMessage = {
        id: chat.length + 1,
        sender: 'System',
        message: `${currentUser} removed an item: "${itemToDelete?.text || 'Unknown item'}"`,
        timestamp: new Date().toISOString()
      };
      
      setChat([...chat, newMessage]);
      showMessagePreview(newMessage);
    }
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
    showMessagePreview(newMessage);
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

  // Handle tile suggestion with timer
  const handleSuggestTile = (e) => {
    e.preventDefault();
    
    if (!tileInputSuggestion.trim()) return;
    
    // Check for @mentions
    const text = tileInputSuggestion.trim();
    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const mentionedUsers = matches.map(match => match[1]);
    
    // Create suggestion with proper hiddenFrom and timer
    const newSuggestion = {
      id: Date.now(),
      text: text,
      suggestedBy: currentUser,
      hiddenFrom: mentionedUsers.length > 0 ? mentionedUsers : undefined,
      timerMinutes: selectedTimer
    };
    
    setSuggestedTiles([...suggestedTiles, newSuggestion]);
    
    // Add message about the suggestion
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} suggested a new tile: "${text}"${selectedTimer > 0 ? ` (${formatTimeDisplay(selectedTimer)})` : ''}`,
      timestamp: new Date().toISOString(),
      suggestion: newSuggestion
    };
    
    setChat([...chat, newMessage]);
    showMessagePreview(newMessage);
    setTileInputSuggestion('');
    setSelectedTimer(0); // Reset timer to 0 after submission
    
    // Hide the suggest tile menu after submission
    document.getElementById('suggestTileMenu').classList.add('hidden');
  };

  // Handle approving a suggested tile (updated with timer)
  const handleApproveSuggestion = (suggestionId) => {
    const suggestion = suggestedTiles.find(s => s.id === suggestionId);
    
    if (!suggestion) return;
    
    // Add to items - preserve the hiddenFrom property completely and add timer
    const newItem = {
      id: Date.now(),
      text: suggestion.text,
      hiddenFrom: suggestion.hiddenFrom,
      timerMinutes: suggestion.timerMinutes || selectedTimer
    };
    
    setItems([...items, newItem]);
    
    // Remove from suggestions
    setSuggestedTiles(suggestedTiles.filter(s => s.id !== suggestionId));
    
    // Add system message about approval
    const newMessage = {
      id: chat.length + 1,
      sender: 'System',
      message: `${currentUser} approved and added a new tile to the game: "${suggestion.text}" (${formatTimeDisplay(newItem.timerMinutes)})`,
      timestamp: new Date().toISOString(),
      item: newItem
    };
    
    setChat([...chat, newMessage]);
    showMessagePreview(newMessage);
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

  // Handle game start - updated to initialize timers and properly randomize tiles
  const handleStartGame = () => {
    if (!hasEnoughItems) {
      return;
    }
    
    // Initialize timers for all items that have a timer
    const initialTimers = {};
    const now = Date.now();
    
    // Initialize userBoards object to store boards for each user
    const userBoards = {};
    
    items.forEach(item => {
      // Only initialize timers for items with timerMinutes > 0
      if (item.timerMinutes > 0) {
        const durationMs = item.timerMinutes * 60 * 1000;
        initialTimers[item.id] = {
          endTime: now + durationMs,
          remaining: Math.floor(durationMs / 1000),
          expired: false
        };
      }
    });
    
    setItemTimers(initialTimers);
    
    // Create a board for each user with truly unique randomization
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
    
    // Check if the timer for this tile has expired
    const tileItem = tileContents[index];
    const timerInfo = tileItem && tileItem.id ? getItemTimerStatus(tileItem) : null;
    if (timerInfo && timerInfo.expired) {
      // Don't allow interaction with expired tiles
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
    
    // Create the message object with initial empty arrays for approvals and denials
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
      },
      approvals: [],
      denials: []
    };
    
    // Add to chat and show preview
    setChat([...chat, newMessage]);
    showMessagePreview(newMessage);
    
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

  // Add new state for full-size photo viewer
  const [fullSizePhoto, setFullSizePhoto] = useState(null);

  // Handle photo click in chat
  const handlePhotoClick = (photoUrl) => {
    setFullSizePhoto(photoUrl);
  };

  // Handle closing full-size photo
  const handleClosePhoto = () => {
    setFullSizePhoto(null);
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

  // Function to get item timer status
  const getItemTimerStatus = (item) => {
    if (!gameStarted) return null;
    if (!item) return null;
    
    const timer = itemTimers[item.id];
    if (!timer) return null;
    
    return timer;
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
            handleFileUpload(e.target.files[0], selectedTile.index);
          }
        }}
      />

      {/* Full-size Photo Overlay */}
      <AnimatePresence>
        {fullSizePhoto && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePhoto}
          >
            <motion.div 
              className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                onClick={handleClosePhoto}
              >
                <FaTimes className="text-gray-600" />
              </button>
              <img 
                src={fullSizePhoto} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          {/* Compact Win Conditions info */}
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center text-sm">
            <FaTrophy className="text-yellow-500 mr-2 flex-shrink-0" />
            <div className="flex items-center flex-wrap gap-x-4">
              <span className="font-medium text-gray-800">Win by:</span>
              {(game.winConditions?.byRow || game.winConditions === undefined) && (
                <span className="inline-flex items-center">
                  <FaCheck className="text-green-500 mr-1" size={12} /> Complete Row
                </span>
              )}
              {(game.winConditions?.byColumn || game.winConditions === undefined) && (
                <span className="inline-flex items-center">
                  <FaCheck className="text-green-500 mr-1" size={12} /> Complete Column
                </span>
              )}
              {game.winConditions?.byAll && (
                <span className="inline-flex items-center">
                  <FaCheck className="text-green-500 mr-1" size={12} /> Full Board
                </span>
              )}
              <span className="text-xs text-gray-500">
                (50% approval required)
              </span>
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
              className="w-full p-4 flex flex-col items-center justify-center relative"
            >
              {/* Message Preview Area - Updated to overlay */}
              <AnimatePresence>
                {messagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-8 left-0 right-0 z-10 pointer-events-none flex justify-center"
                  >
                    <div className="w-full max-w-4xl px-4">
                      <div className={`rounded-lg p-3 shadow-md bg-opacity-90 backdrop-blur-sm ${
                        messagePreview.sender === 'System' 
                          ? 'bg-gray-100' 
                          : messagePreview.sender === currentUser
                            ? 'bg-primary-light'
                            : getUserColor(messagePreview.sender)
                      }`}>
                        {messagePreview.sender !== 'System' && (
                          <span className="font-bold">{messagePreview.sender}: </span>
                        )}
                        {messagePreview.message}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Board - Remove mb-4 since preview is absolutely positioned */}
              <div 
                className="bg-white rounded-lg shadow-lg p-4 w-full max-w-4xl aspect-auto"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: `repeat(${game.columns}, 1fr)`,
                  gridTemplateRows: `repeat(${game.rows}, 1fr)`,
                  gap: '8px',
                  width: '100%',
                  height: `calc(100vh - 200px)` // Restore original height since preview is overlaid
                }}
              >
                {Array.from({ length: game.rows * game.columns }).map((_, index) => {
                  const isClaimed = !!claimedTiles[index];
                  const isApproved = isTileApproved(index);
                  const hasPhoto = tilePhotos[index] !== null;
                  const isHiddenFromUser = gameStarted && tileContents[index] && isTileHiddenFromUser(tileContents[index]);
                  
                  // Get timer status for this tile
                  const tileItem = gameStarted && tileContents[index] ? tileContents[index] : null;
                  const timerInfo = tileItem && tileItem.id ? getItemTimerStatus(tileItem) : null;
                  const isExpired = timerInfo && timerInfo.expired;
                  
                  let tileStyle = "bg-gradient-to-br from-primary-light to-secondary-light cursor-pointer";
                  
                  if (isClaimed && isApproved) {
                    tileStyle = "bg-gradient-to-br from-green-400 to-green-600 cursor-default";
                  } else if (isClaimed && !isApproved) {
                    tileStyle = "bg-gradient-to-br from-yellow-400 to-yellow-600 cursor-default";
                  } else if (isHiddenFromUser) {
                    tileStyle = "bg-gradient-to-br from-gray-400 to-gray-600 cursor-not-allowed";
                  } else if (isExpired) {
                    tileStyle = "bg-gradient-to-br from-red-300 to-red-500 cursor-not-allowed";
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
                      whileHover={{ scale: isClaimed || isHiddenFromUser || isExpired ? 1 : 0.95 }}
                      whileTap={{ scale: isClaimed || isHiddenFromUser || isExpired ? 1 : 0.9 }}
                      className={`rounded-lg shadow-md ${tileStyle} flex flex-col items-center justify-center font-bold text-white p-4 overflow-hidden relative`}
                      onClick={() => !isClaimed && !isHiddenFromUser && !isExpired && handleTileClick(index)}
                    >
                      {/* Timer indicator in top right corner */}
                      {gameStarted && timerInfo && tileItem?.timerMinutes > 0 && (
                        <div className={`absolute top-1 right-1 bg-black bg-opacity-60 rounded-md px-1.5 py-0.5 text-xs flex items-center ${timerInfo.remaining <= 60 ? 'text-red-300 font-bold' : 'text-white'}`}>
                          <FaClock className="mr-1 text-[10px]" />
                          {formatCountdown(timerInfo.remaining)}
                        </div>
                      )}
                      
                      {hasPhoto && (
                        <div className="absolute inset-2 rounded-lg overflow-hidden">
                          <img 
                            src={tilePhotos[index]} 
                            alt="Tile evidence" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30" />
                        </div>
                      )}
                      
                      {isHiddenFromUser ? (
                        <span className="text-center relative z-10">Hidden</span>
                      ) : isExpired && !isClaimed ? (
                        <div className="text-center flex flex-col relative z-10">
                          <span>{getItemDisplayText(tileContents[index])}</span>
                          <span className="text-xs font-normal mt-1 text-gray-200">Time's up!</span>
                        </div>
                      ) : gameStarted && tileContents[index] ? (
                        <div className="text-center flex flex-col relative z-10">
                          <span>{getItemDisplayText(tileContents[index])}</span>
                          {tileNotes[index] && (
                            <span className="text-xs font-normal mt-1 text-gray-200">{tileNotes[index]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="relative z-10">{index + 1}</span>
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
                            <form onSubmit={handleSuggestTile} className="flex flex-col mb-3">
                              <input
                                type="text"
                                className="input-field flex-grow mb-2 text-sm"
                                placeholder="Suggest a tile... (use @ to hide from users)"
                                value={tileInputSuggestion}
                                onChange={(e) => setTileInputSuggestion(e.target.value)}
                              />
                              
                              {/* Timer selector */}
                              <div className="mb-2">
                                <label className="block text-xs text-gray-600 mb-1">Time Limit:</label>
                                <select 
                                  className="w-full p-1 text-sm border rounded"
                                  value={selectedTimer}
                                  onChange={(e) => setSelectedTimer(parseInt(e.target.value))}
                                >
                                  {getTimerOptions().map(minutes => (
                                    <option key={minutes} value={minutes}>
                                      {formatTimeDisplay(minutes)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
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
                      
                      // Get timer info for item or suggestion
                      const itemForTimer = msg.item || (isSuggestionMessage ? msg.suggestion : null);
                      const timerInfo = gameStarted && itemForTimer ? getItemTimerStatus(itemForTimer) : null;
                      
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
                            
                            {/* Show timer for items and suggestions if game has started */}
                            {gameStarted && itemForTimer && itemForTimer.timerMinutes > 0 && (
                              <div className="mt-1 flex items-center text-xs">
                                <FaClock className="mr-1" />
                                <span className={`${timerInfo && timerInfo.remaining <= 60 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                                  {timerInfo ? formatCountdown(timerInfo.remaining) : formatTimeDisplay(itemForTimer.timerMinutes)}
                                </span>
                              </div>
                            )}
                            
                            {/* Display attached photo if exists */}
                            {isClaimMessage && msg.claimInfo.photo && (
                              <div className="mt-2">
                                <img 
                                  src={msg.claimInfo.photo} 
                                  alt="Claim evidence" 
                                  className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  onClick={() => handlePhotoClick(msg.claimInfo.photo)}
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
                                  className={`p-2 rounded-full ${msg.approvals?.includes(currentUser) ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-green-100'}`}
                                  onClick={() => handleApprovalAction(msg.id, tileIndex, true)}
                                  disabled={msg.approvals?.includes(currentUser)}
                                >
                                  <FaCheck />
                                </button>
                                <button 
                                  className={`p-2 rounded-full ${msg.denials?.includes(currentUser) ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-red-100'}`}
                                  onClick={() => handleApprovalAction(msg.id, tileIndex, false)}
                                  disabled={msg.denials?.includes(currentUser)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                            
                            {/* Approval status */}
                            {isClaimMessage && (
                              <div className="mt-2 text-xs text-gray-600 flex justify-between">
                                <span>
                                  Approvals: {msg.approvals?.length || 0}/{getRequiredApprovals()}
                                  {msg.approvals?.length > 0 && (
                                    <span className="text-gray-500 ml-1">
                                      ({msg.approvals.join(', ')})
                                    </span>
                                  )}
                                </span>
                                <span>
                                  Denials: {msg.denials?.length || 0}
                                  {msg.denials?.length > 0 && (
                                    <span className="text-gray-500 ml-1">
                                      ({msg.denials.join(', ')})
                                    </span>
                                  )}
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
                      <form onSubmit={handleAddItem} className="flex flex-col mb-4">
                        <input
                          type="text"
                          className="input-field w-full mb-2"
                          placeholder="Add an item... (use @ to hide from users)"
                          value={itemInput}
                          onChange={(e) => setItemInput(e.target.value)}
                          disabled={gameStarted}
                        />
                        
                        <div className="flex space-x-2">
                          {/* Timer selector - moved next to + button */}
                          <select 
                            className="flex-grow p-2 text-sm border rounded"
                            value={selectedTimer}
                            onChange={(e) => setSelectedTimer(parseInt(e.target.value))}
                            disabled={gameStarted}
                          >
                            {getTimerOptions().map(minutes => (
                              <option key={minutes} value={minutes}>
                                {formatTimeDisplay(minutes)}
                              </option>
                            ))}
                          </select>
                          
                          <motion.button
                            type="submit"
                            className="btn-primary px-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!itemInput.trim() || gameStarted}
                          >
                            <FaPlus />
                          </motion.button>
                        </div>
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
                          {items.map((item, index) => {
                            // Get timer info for this item
                            const timerInfo = gameStarted ? getItemTimerStatus(item) : null;
                            
                            return (
                              <li key={item.id} className="bg-white p-3 rounded-md shadow-sm">
                                <div className="flex justify-between items-center">
                                  <div className="flex-grow">
                                    <span className="font-medium">
                                      {index + 1}. {getItemDisplayText(item)}
                                      {(isGameCreator || isAdmin) && item.hiddenFrom && item.hiddenFrom.length > 0 && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          (Hidden from: {item.hiddenFrom.join(', ')})
                                        </span>
                                      )}
                                    </span>
                                    
                                    {/* Display timer */}
                                    {item.timerMinutes > 0 && (
                                      <div className="mt-1 flex items-center text-xs">
                                        <FaClock className="mr-1 text-gray-500" />
                                        <span className={`${
                                          gameStarted && timerInfo && timerInfo.remaining <= 60 
                                            ? 'text-red-500 font-bold' 
                                            : 'text-gray-600'
                                        }`}>
                                          {gameStarted 
                                            ? (timerInfo ? formatCountdown(timerInfo.remaining) : "Loading...") 
                                            : formatTimeDisplay(item.timerMinutes)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Edit/Delete buttons for game creator */}
                                  {!gameStarted && (isGameCreator || isAdmin) && (
                                    <div className="flex space-x-2">
                                      <button 
                                        className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-500"
                                        onClick={() => handleEditItem(item)}
                                        title="Edit item"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button 
                                        className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-500"
                                        onClick={() => handleDeleteItem(item.id)}
                                        title="Delete item"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
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

      {/* Win Animation Overlay */}
      <AnimatePresence>
        {showWinAnimation && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-confetti"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [1, 1.2, 1.5],
              }}
              transition={{
                duration: 3,
                times: [0, 0.5, 1],
                repeat: 0
              }}
            />
            <motion.div
              className="text-6xl font-bold text-primary text-center bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  damping: 10,
                  stiffness: 100
                }
              }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <div className="text-3xl mb-2">🎉 Winner! 🎉</div>
              <div>{winner}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner notification toast */}
      <AnimatePresence>
        {winner && !selectedTile && (
          <motion.div
            className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg shadow-2xl z-40"
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.5 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200
            }}
          >
            <div className="flex items-center">
              <FaTrophy className="text-4xl text-yellow-200 mr-4" />
              <div>
                <h3 className="font-bold text-2xl mb-1">Winner!</h3>
                <p className="text-yellow-100">{winner}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              
              {/* Show timer status if applicable */}
              {selectedTile.item && selectedTile.item.timerMinutes > 0 && (
                <div className="mb-3 text-center">
                  <span className={`flex items-center justify-center text-sm font-medium ${
                    getItemTimerStatus(selectedTile.item)?.expired ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    <FaClock className="mr-1" />
                    {getItemTimerStatus(selectedTile.item)?.expired 
                      ? "Time's up! This tile can no longer be claimed." 
                      : `Time remaining: ${formatCountdown(getItemTimerStatus(selectedTile.item)?.remaining || 0)}`
                    }
                  </span>
                </div>
              )}

              {/* Display photo if it exists */}
              {tilePhotos[selectedTile.index] && (
                <div className="relative mb-4">
                  <img 
                    src={tilePhotos[selectedTile.index]} 
                    alt="Tile evidence" 
                    className="w-full h-auto rounded-lg"
                  />
                  {/* Overlay note if it exists */}
                  {tileNotes[selectedTile.index] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg max-w-[90%] text-center">
                        <p className="text-gray-800">{tileNotes[selectedTile.index]}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Check if timer is expired before rendering claim controls */}
              {(!selectedTile.item || !selectedTile.item.timerMinutes || 
                (selectedTile.item.timerMinutes > 0 && !getItemTimerStatus(selectedTile.item)?.expired)) ? (
                <>
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-red-500 text-lg font-medium mb-3 text-center">
                    This tile's time has expired
                  </div>
                  <p className="text-gray-600 text-center mb-4">
                    You can no longer claim this tile because the time limit has been reached.
                  </p>
                  <motion.button
                    className="btn-secondary w-full flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTile(null)}
                  >
                    Close
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Editing Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingItem(null)}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                Edit Item
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="editItemInput">
                  Item Text:
                </label>
                <input
                  type="text"
                  id="editItemInput"
                  className="input-field w-full"
                  value={editItemInput}
                  onChange={(e) => setEditItemInput(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="editItemTimer">
                  Time Limit:
                </label>
                <select 
                  id="editItemTimer"
                  className="w-full p-2 border rounded"
                  value={selectedTimer}
                  onChange={(e) => setSelectedTimer(parseInt(e.target.value))}
                >
                  {getTimerOptions().map(minutes => (
                    <option key={minutes} value={minutes}>
                      {formatTimeDisplay(minutes)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  className="btn-secondary flex-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-primary flex-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdit}
                  disabled={!editItemInput.trim()}
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard; 