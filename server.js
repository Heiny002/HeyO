const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'hey-o-game-secret-key';

// Initialize database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists');
        
        // Check if admin exists, if not create it
        db.get('SELECT * FROM users WHERE username = ?', ['JHarvey'], (err, user) => {
          if (err) {
            console.error('Error checking for admin:', err.message);
          } else if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('HeyOApp!', salt);
            
            db.run('INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)',
              ['JHarvey', 'jimheiniger@yahoo.com', hashedPassword, 1],
              (err) => {
                if (err) {
                  console.error('Error creating admin account:', err.message);
                } else {
                  console.log('Admin account created');
                }
              }
            );
          }
        });
      }
    });
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
// Register route
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if user already exists
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (user) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // Insert new user
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error registering user', error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  });
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Find user
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = bcrypt.compareSync(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  });
});

// Protected route example
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app from other devices at http://192.168.0.28:${PORT}`);
}); 