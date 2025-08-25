// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' folder (includes index.html, log.html, CSS, JS, etc.)
app.use(express.static('RailConnect'));

// Temporary store for journey info between steps
let pendingBookingInfo = {};

// Route: Serve home page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'RailConnect', 'index.html'));
});

// Route: Handle form submission from index.html
app.post('/book', (req, res) => {
  // Save journey details
  pendingBookingInfo = {
    from: req.body.from,
    to: req.body.to,
    date: req.body.date,
    class: req.body.class,
  };

  // Redirect user to second form page (log.html)
  res.redirect('/log');
});

// Route: Serve your second form page (log.html)
app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'Railconnect', 'log.html'));
});

// Route: Handle form submission from log.html
app.post('/log', (req, res) => {
  // Combine journey info and user info into one booking object
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

  // Path where bookings will be stored
  const dataDir = path.join(__dirname, 'data');
  const filePath = path.join(dataDir, 'bookings.json');

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Read existing bookings or initialize empty array
  let bookings = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    if (data) bookings = JSON.parse(data);
  }

  // Add new booking
  bookings.push(booking);

  // Write updated bookings back to file
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

  // Clear temporary booking info
  pendingBookingInfo = {};

  // Send confirmation response (you can customize or redirect to a confirmation page)
  res.send(`
    <h1>Booking Confirmed!</h1>
    <p>Thank you, ${booking.name}. Your booking has been saved successfully.</p>
    <p><a href="/">Back to Home</a></p>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
