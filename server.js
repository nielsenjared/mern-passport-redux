const express = require('express');
const mongoose = require('mongoose');
const cookieSession =require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys.js');

require('./models/User.js');
require('./services/passport');

const app = express();

app.use(
  cookieSession({
    maxAge: 7 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
    saveUninitialized: false,
    resave: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/rand-o",
  {
    useMongoClient: true
  }
);

require('./routes/authRoutes')(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT);
