const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage
let users = [];
let exercises = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: users.length.toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Log an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration), // Convert duration to a number
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id
  };
  exercises.push(newExercise);
  res.json({
    ...user, // Include the user object in the response
    ...newExercise // Include the exercise fields
  });
});

// Get full exercise log of a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const userExercises = exercises.filter(exercise => exercise._id === _id);
  
  let filteredExercises = userExercises;
  if (from) {
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) >= new Date(from));
  }
  if (to) {
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) <= new Date(to));
  }
  if (limit) {
    filteredExercises = filteredExercises.slice(0, limit);
  }

  // Convert duration to a number for each exercise
  filteredExercises.forEach(exercise => {
    exercise.duration = parseInt(exercise.duration);
  });

  res.json({
    _id,
    username: userExercises.length > 0 ? userExercises[0].username : '',
    count: filteredExercises.length,
    log: filteredExercises
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
