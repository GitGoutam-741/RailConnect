// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // needed for login/register JSON

// Serve static files (your HTML, CSS, JS, etc.)
app.use(express.static('RailConnect'));

// Temporary store for journey info between steps
let pendingBookingInfo = {};

// ----------------- Existing Booking Routes -----------------

// Route: Serve home page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'RailConnect', 'index.html'));
});

// Route: Handle form submission from index.html
app.post('/book', (req, res) => {
  pendingBookingInfo = {
    from: req.body.from,
    to: req.body.to,
    date: req.body.date,
    class: req.body.class,
  };

  res.redirect('/log');
});

// Route: Serve your second form page (loginpage.html)
app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'RailConnect', 'loginpage.html'));
});

// Route: Handle form submission from loginpage.html
app.post('/log', (req, res) => {
  const booking = {
    from: pendingBookingInfo.from,
    to: pendingBookingInfo.to,
    date: pendingBookingInfo.date,
    class: pendingBookingInfo.class,
    name: req.body.name,
    username: req.body.username,
    phone: req.body.phone,
    dob: req.body.dob,
    captcha: req.body.captcha,
  };

  const dataDir = path.join(__dirname, 'data');
  const filePath = path.join(dataDir, 'bookings.json');

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  let bookings = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    if (data) bookings = JSON.parse(data);
  }

  bookings.push(booking);

  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
  pendingBookingInfo = {};

  res.send(`
    <h1>Booking Confirmed!</h1>
    <p>Thank you, ${booking.name}. Your booking has been saved successfully.</p>
    <p><a href="/">Back to Home</a></p>
  `);
});

// ----------------- NEW: Registration & Login -----------------

const usersFile = path.join(__dirname, 'data', 'users.json');

// Utility functions
function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function saveUsers(users) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Registration
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users.push({ username, password, email });
  saveUsers(users);

  res.json({ message: 'Registration successful' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  let users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user) return res.status(404).json({ message: 'Username does not exist' });
  if (user.password !== password) return res.status(401).json({ message: 'Wrong password' });

  res.json({ message: 'Login successful' });
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
