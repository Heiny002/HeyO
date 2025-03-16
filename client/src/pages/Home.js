import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const Home = () => {
  const [games, setGames] = useState([]);
  const [invitedGames, setInvitedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Handle accepting a game invitation
  const handleAcceptInvite = async (gameId) => {
    try {
      const response = await fetch(`${config.API_URL}/games/invite/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (response.ok) {
        // Remove from invited games and add to active games
        setInvitedGames(invitedGames.filter(game => game.id !== gameId));
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  // Handle rejecting a game invitation
  const handleRejectInvite = async (gameId) => {
    try {
      const response = await fetch(`${config.API_URL}/games/invite/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        // Remove from invited games
        setInvitedGames(invitedGames.filter(game => game.id !== gameId));
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch user's games
        const gamesResponse = await fetch(`${config.API_URL}/games`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const gamesData = await gamesResponse.json();
        
        // Fetch invited games
        const invitedResponse = await fetch(`${config.API_URL}/games/invited`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const invitedData = await invitedResponse.json();
        
        setGames(gamesData.games || []);
        setInvitedGames(invitedData.games || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoading(false);
      }
    };

    fetchGames();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">My Games</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-8">
          {/* Active Games */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Active Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map(game => (
                <GameCard key={game.id} game={game} onClick={() => navigate(`/game/${game.id}`)} />
              ))}
            </div>
          </section>
          
          {/* Game Invitations */}
          {invitedGames.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Game Invitations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitedGames.map(game => (
                  <GameInviteCard 
                    key={game.id} 
                    game={game}
                    onAccept={() => handleAcceptInvite(game.id)}
                    onReject={() => handleRejectInvite(game.id)}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Create New Game Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate('/create-game')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Game card component
const GameCard = ({ game, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
  >
    <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
    <p className="text-gray-600">Players: {game.playerCount}</p>
    <p className="text-gray-600">Created: {new Date(game.createdAt).toLocaleDateString()}</p>
  </div>
);

// Game invitation card component
const GameInviteCard = ({ game, onAccept, onReject }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
    <p className="text-gray-600 mb-4">You've been invited to join this game!</p>
    <div className="flex space-x-2">
      <button
        onClick={onAccept}
        className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Reject
      </button>
    </div>
  </div>
);

export default Home; 