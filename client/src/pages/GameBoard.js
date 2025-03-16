import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaComments, FaGamepad, FaPlus, FaPlay, FaCog, FaCamera, FaImage, FaTrophy, FaCheck, FaTimes, FaComment, FaEnvelope, FaCopy, FaShareAlt, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Dialog, DialogContent, TextField, Button } from '@mui/material';
import config from '../config';
import { useAuth } from '../hooks/useAuth';

const GameBoard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
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
  const [userSuggestions, setUserSuggestions] = useState([]);
  
  // State for tile suggestions
  const [suggestedTiles, setSuggestedTiles] = useState([]);
  const [tileInputSuggestion, setTileInputSuggestion] = useState('');
  
  // State for tile selection popup
  const [selectedTile, setSelectedTile] = useState(null);
  const [tileNote, setTileNote] = useState('');
  const fileInputRef = useRef(null);
  
  // Add state to track claimed tiles, photos, approvals, and winners
  const [claimedTiles, setClaimedTiles] = useState({});
  const [tilePhotos, setTilePhotos] = useState({}); // Store photos for each tile
  const [tileApprovals, setTileApprovals] = useState({}); // Store approvals for each tile
  const [tileDenials, setTileDenials] = useState({}); // Store denials for each tile
  const [tileNotes, setTileNotes] = useState({}); // Store notes for each tile
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

  // Fetch user suggestions
  const fetchUserSuggestions = async (searchTerm) => {
    try {
      const response = await fetch(`${config.API_URL}/users/search?term=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserSuggestions(data.users || []);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  // Handle username input change
  const handleUsernameInputChange = (e) => {
    const value = e.target.value;
    setInviteUsername(value);
    if (value.trim()) {
      fetchUserSuggestions(value);
    } else {
      setUserSuggestions([]);
    }
  };

  // Select username from suggestions
  const handleSelectUsername = (username) => {
    setInviteUsername(username);
    setUserSuggestions([]);
  };

  // Handle friend invitation by username
  const handleInviteFriend = async (e) => {
    e.preventDefault();
    
    if (!inviteUsername.trim()) return;
    
    try {
      const response = await fetch(`${config.API_URL}/games/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: inviteUsername.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add system message about invitation
        const newMessage = {
          id: chat.length + 1,
          sender: 'System',
          message: `${currentUser} invited ${inviteUsername} to join the game.`,
          timestamp: new Date().toISOString()
        };
        setChat([...chat, newMessage]);
        setInviteUsername('');
        setUserSuggestions([]);
      } else {
        console.error('Error inviting user:', data.message);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    }
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
      const newTilePhotos = {...tilePhotos};
      newTilePhotos[tileIndex] = photoUrl;
      setTilePhotos(newTilePhotos);
      
      // Claim the tile since a photo was added
      const newClaimedTiles = {...claimedTiles};
      newClaimedTiles[tileIndex] = true;
      setClaimedTiles(newClaimedTiles);
      
      // If there's a note, add it to the tile notes
      if (tileNote.trim()) {
        const newTileNotes = {...tileNotes};
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
    const newTileNotes = {...tileNotes};
    newTileNotes[selectedTile.index] = tileNote.trim();
    setTileNotes(newTileNotes);
    
    // Close the popup
    setSelectedTile(null);
  };

  // Handle claim button click
  const handleClaimTile = () => {
    if (!selectedTile || winner) return;
    
    // Update claimed tiles array
    const newClaimedTiles = {...claimedTiles};
    newClaimedTiles[selectedTile.index] = true;
    setClaimedTiles(newClaimedTiles);
    
    // If there's a note, add it to the tile notes
    if (tileNote.trim()) {
      const newTileNotes = {...tileNotes};
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
      const newTileApprovals = {...tileApprovals};
      if (!newTileApprovals[tileIndex].includes(currentUser)) {
        newTileApprovals[tileIndex] = [...newTileApprovals[tileIndex], currentUser];
        setTileApprovals(newTileApprovals);
      }
      
      // Remove from denials if previously denied
      const newTileDenials = {...tileDenials};
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
      const newTileDenials = {...tileDenials};
      if (!newTileDenials[tileIndex].includes(currentUser)) {
        newTileDenials[tileIndex] = [...newTileDenials[tileIndex], currentUser];
        setTileDenials(newTileDenials);
      }
      
      // Remove from approvals if previously approved
      const newTileApprovals = {...tileApprovals};
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

  // Handle photo upload
  const handlePhotoUpload = async (e, tileIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTilePhotos(prev => ({
        ...prev,
        [tileIndex]: reader.result
      }));
      
      // If there's a note in the input but not submitted, auto-submit it with the photo
      if (tileNote && !tileNotes[tileIndex]) {
        setTileNotes(prev => ({
          ...prev,
          [tileIndex]: tileNote
        }));
      }
      
      // Auto-claim the tile with photo and note
      handleClaimTile(tileIndex, reader.result, tileNote);
      setTileNote(''); // Clear the note input after submission
    };
    reader.readAsDataURL(file);
  };

  // Handle note submission
  const handleNoteSubmit = (e, tileIndex) => {
    e.preventDefault();
    if (!tileNote.trim()) return;

    setTileNotes(prev => ({
      ...prev,
      [tileIndex]: tileNote
    }));

    // If there's already a photo, update the claim
    if (tilePhotos[tileIndex]) {
      handleClaimTile(tileIndex, tilePhotos[tileIndex], tileNote);
    }
    
    setTileNote(''); // Clear the note input after submission
  };

  // Update the tile dialog to allow note input before approval
  const renderTileDialog = () => {
    if (!selectedTile) return null;
    
    const isClaimed = claimedTiles[selectedTile.index];
    const isApproved = approvedClaims[selectedTile.index];
    
    return (
      <Dialog
        open={!!selectedTile}
        onClose={handleCloseTileDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="space-y-4">
          {/* ... existing dialog content ... */}
          
          {/* Allow note input before approval */}
          {!isApproved && (
            <form onSubmit={(e) => handleNoteSubmit(e, selectedTile.index)} className="mt-4">
              <TextField
                fullWidth
                label="Add a note"
                value={tileNote}
                onChange={(e) => setTileNote(e.target.value)}
                variant="outlined"
                size="small"
                disabled={isApproved}
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!tileNote.trim() || isApproved}
                >
                  Add Note
                </Button>
              </div>
            </form>
          )}
          
          {/* ... rest of dialog content ... */}
        </DialogContent>
      </Dialog>
    );
  };

  // Handle closing tile dialog
  const handleCloseTileDialog = () => {
    setSelectedTile(null);
    setTileNote('');
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
    <div className="flex flex-col bg-background min-h-screen">
      {/* Game header with board name and win conditions */}
      <div className="bg-white shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/games')}
              className="text-primary hover:text-primary-dark"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-primary">{game.name}</h1>
          </div>
          
          {/* Win conditions */}
          <div className="flex items-center space-x-4">
            {game.winConditions?.map((condition, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <FaTrophy className={`${condition.achieved ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span>{condition.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 p-4">
        {/* Game board */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* ... existing board rendering code ... */}
        </div>
      </div>

      {/* Chat and controls section */}
      <div className="bg-white shadow-md p-4">
        {/* ... existing chat and controls code ... */}
      </div>
    </div>
  );
};

export default GameBoard; 