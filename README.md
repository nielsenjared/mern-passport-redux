# MERN + Passport + Redux

### Initialize Your Project with npm
```
mkdir mern-passport-redux
cd mern-passport-redux
npm init
```
During the init process you will be prompted to add a GitHub repository. Now would be a good time to make a new project on GitHub. Add the repo link to your package.json when prompted.

### Initialize Your Project with Git
```
git init
git remote add origin https://github.com/nielsenjared/mern-passport-redux.git
```

Add a .gitignore
`atom .gitignore`

Add `node_modules` to `.gitignore`

### Set Up a Simple Server
Install Express:
`npm install --save express`

Add a server.js:
```
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send("Hello World!");
});
const PORT = process.env.PORT || 3001;
app.listen(PORT);
```

Start your server to verify it works.
`node server.js`

And navigate to http://localhost:3001/

Add nodemon:
`npm install --save nodemon`

And to package.json, add a new script:
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
		“server”: “nodemon server.js”
  },
```

We will use “server” to run nodemon in development. To do so use `npm run server`

Try it!

### Deploy to Heroku

Do not wait until the last minute to deploy! Let’s deploy this now so we can test deployment periodically.

Update package.json:
```
	"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    “server”: “nodemon server.js”,
    "start": "node server.js"
  },
```

Heroku needs “start” to know which file to run the app in production.

Add, commit, and push to GitHub.
```
git add .
git commit -m “First”
git push -u origin master
```

Log into Heroku.
`heroku login`

Create a new dyno
`heroku create`

Then push to Heroku:
`git push heroku master`

Navigate to the URL provided to verify your app.

In the future:
```
	git add .
	git commit -m “Ch-ch-ch-changes…”
	git push heroku master
```

### User Auth with GitHub
Install two packages, Passport and its GitHub strategy:
`npm install --save passport passport-github`

We will create two applications with GitHub for handling authentication. One for development and one for production. Let’s create the dev creds now and the prod creds later.

Register a new application with GitHub https://github.com/settings/applications/new

Give it a name with the suffix `-dev` (ex: `rand-o-dev`)

Enter your URL, in this case, because we’re making our calls from our development environment, enter: `http://localhost:3001`

Description!

And a callback that originates from your development environment. The convention is: `http://127.0.0.1:3001/auth/github/callback`

This will route you to a page where you will be presented with a Client ID and a Client Secret.

Create a `config` directory and within that a `keys.js` file.

In `keys.js`, export a module containing your clientID and clientSecret:
```
module.exports = {
  githubClientID: '38e1301537669a8d39d7',
  githubClientSecret: '172b1f4ac52f090f8857be1968436a8e5c7251b0'
};
```

To .gitignore add:
`keys.js`

If you RTFM, you will see how to setup a GitHub Passport strategy: https://github.com/jaredhanson/passport-github#configure-strategy

So to server.js add:
```
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const keys = require('./config/keys');

passport.use(new GitHubStrategy({
    clientID: keys.githubClientID,
    clientSecret: keys.githubClientSecret,
    callbackURL: "http://127.0.0.1:3001/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

Note above that we required our keys.js file and inside the Strategy, changed GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to `keys.githubClientID` and `keys.githubClientSecret`.

Start your server:
`npm run server’

And navigate to http://localhost:3001/auth/github

You should be presented with a login prompt. Rejoice!

Login and you should be routed to our callback which routes you back home. But you will receive an error:
`ReferenceError: User is not defined`

Why? Because we are attempting to use a User model that we have yet to define. Before we setup our database, let’s refactor this application with an MVC framework.

### MVC

Create a routes directory and within in it an authRoutes.js file. Import passport:
`const passport = require('passport');`

Cut the routes from server.js and paste them into authRoutes.js. We can delete the ‘Hello World’ route at this point:
```
module.exports = app => {
  app.get('/auth/github',
  passport.authenticate('github'));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
}
```

Next create a `services` directory and within it a `passport.js` file.
Cut the `passport.use` method from `server.js` and paste it into `passport.js` along with its dependencies:
```
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const keys = require('./config/keys');
passport.use(new GitHubStrategy({
    clientID: keys.githubClientID,
    clientSecret: keys.githubClientSecret,
    callbackURL: "http://127.0.0.1:3001/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

Be sure to modify the relative path to keys.js:
`const keys = require('../config/keys.js');`

Import `passport.js` and `authRoutes.js` into `server.js`:
```
const express = require('express');
require('./services/passport');
const app = express();
require('./routes/authRoutes')(app);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
```

Verify that your app still works. And by works I mean you’re still getting the Reference error. Let’s address that now.

### MongoDB

Install Mongoose:
`npm install --save mongoose`

To server.js add:
```
const mongoose = require('mongoose');
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/rand-o",
  {
    useMongoClient: true
  }
);
```

Add a models folder to your app and within it a User.js file.

In User.js:
```
const mongoose = require('mongoose');
const { Schema } = mongoose;
const userSchema = new Schema({
  githubId: String
});
mongoose.model('users', userSchema);
```

To server.js, above the passport import, add:
`require('./models/User.js');`

To `passport.js`, import Mongoose and the User model:
```
const mongoose = require('mongoose');
const User = mongoose.model('users');
```

Replace the callback in GitHubStrategy with a Mongoose query of our User model:
```
passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubClientID,
      clientSecret: keys.githubClientSecret,
      callbackURL: "http://127.0.0.1:3001/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      new User({ googleId: profile.id }).save();
return cb(null, profile);
    }
  )
);
```

#### Start MongoDB

Apple && Windows: `mongod`

If you’re on Linux: `sudo service mongod start`

Start your server and navigate to http://localhost:3001/auth/github

Open Robo3T or mongo shell and verify that your database was created and users collection with a new document exists.

### Cookies
If all is going well, it’s not going well. You’re probably receiving this:
`Error: passport.initialize() middleware not in use`

Let’s deal. Cookie time:
`npm install --save cookie-session`

To server.js add:
```
const cookieSession =require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys.js');
```

And below the app declaration, add:
```
	app.use(
  cookieSession({
    maxAge: 30* 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());
```

Add the following to services/passport.js, below imports and above passport.use():
```
passport.serializeUser((user, done) => {
  done(null, user.id);
})
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});
```

And edit the Strategy:
```
passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubClientID,
      clientSecret: keys.githubClientSecret,
      callbackURL: 'http://127.0.0.1:3001/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ githubId: profile.id }).then(existingUser => {
        if (existingUser) {
          done(null, existingUser);
        } else {
          new User({ githubId: profile.id })
            .save()
            .then(user => done(null, user));
        }
      });
    }
  )
);
```

To keys.js add:
	`cookieKey: “Cis4cookie”`

To authRoutes.js, add:
```
app.get('/auth/user', (req, res) => {
  		res.send(req.user);
});
And while we’re at it, add our logout:
app.get('/auth/logout', (req, res) => {
    req.logout();
    res.send("Bye bye.");
});
```

Again, verify that your app authenticates and that a document is posting to MongoDB. Hit all the routes!

## Deploy?

In config, create a dev.js file.

Move the code snippet in keys.js to the dev.js file. Under cookieKey, add:
`githubCallbackURL: 'http://127.0.0.1:3001/auth/github/callback'`

Edit keys.js:
```
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}
```

Create a prod.js file and add:
```
module.exports = {
  githubClientID: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  cookieKey: process.env.COOKIE_KEY,
  githubCallbackURL: process.env.GITHUB_CALLBACK_URL
};
```

Edit .gitignore:
```
node_modules
dev.js
```

On GitHub.com, under Settings, select Developer settings.

Create a new OAuth app, `mern-passport-redux`

Set the Application name to your Heroku URL:
`https://stormy-beach-74916.herokuapp.com/`

Set the Authorization callback URL to:
`https://stormy-beach-74916.herokuapp.com//auth/github/callback`

On heroku.com, find your app.

Under Resources in the Add Ons field, search mLab and select the only option returned.

In the modal, click Provision. Your app now has MongoDB on Heroku.

Click Settings and click Reveal Config Vars.

Add your Key/Value pairs for your clientID, client secret and cookies. You should already have a MONGODB_URI. Your COOKIE_KEY can be any string of any length so long as it is alphanumeric. No symbols.

Add, commit and push to GitHub and Heroku.

Verify your app works by navigating to the `/auth/github` route at your Heroku URL and then run:
`heroku addons:open mongolab` to verify that your database connection is working in production. You may need to create an mLab account. The above command will route you to mLab and allow you to view collections and documents via the browser.

### React

Facebook recommends using Create React App to set up a new React app, and so we will. (RTFM: https://github.com/facebookincubator/create-react-app). If you don’t already have it installed, run:
`npm install -g create-react-app`

From within the root directory of your application (here, mern-passport-redux):
`create-react-app client`

Connect the front-end to the back-end.
`npm install --save concurrently`

To the package.json in your server directory add:
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "server": "nodemon server.js",
    "start": "node server.js",
    "client": "npm run start --prefix client",
    "dev": "concurrently \"npm run start\" \"npm run client\""
  },
```

To the package.json in your client directory, just below “private” add:
`"proxy": "http://localhost:3001/",`

From here on you will start your app with
`npm run dev`

This will start both servers concurrently. Verify that it works.

### React on Heroku

`npm install --save path`

To server.js, just above PORT and listen(), add:
```
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
```

To package.json in your root directory, under scripts, add:
`"heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"`

RTFM: https://devcenter.heroku.com/articles/nodejs-support#customizing-the-build-process

Add, commit and push to Heroku. Verify that your app builds and is now live on Heroku. If you test routes, will notice that none of them work. Now it’s time to add routing! But first, Redux.

### Redux

In the client directory, install the following dependencies:
redux
react-redux
redux-thunk
axios
react-router-dom

`npm install --save redux react-redux redux-thunk axios react-router-dom`

#### Actions

TODO Explanation of Redux actions

In src, create a new folder actions and within it create two files, index.js and types.js:
Edit types.js:

`export const FETCH_USER = 'fetch_user';`

Edit index.js:
```
import axios from 'axios';
import { FETCH_USER } from './types';
export const fetchUser = () => async dispatch => {
  const res = await axios.get('/auth/user');
  dispatch({ type: FETCH_USER, payload: res.data });
};
```

#### Reducers

TODO Explanation of reducers

In /src, create a reducers directory and within it an index.js and an authReducer.js file.
`mkdir src/reducers && touch src/reducers/index.js src/reducers/authReducer.js`

Edit src/reducers/authReducer.js:
```
import { FETCH_USER } from '../actions/types';
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_USER:
      return action.payload || false;
    default:
      return state;
  }
}
```

Edit /src/reducers/index.js:
```
import { combineReducers } from 'redux';
import authReducer from './authReducer';

export default combineReducers({
  auth: authReducer
});
```

#### Redux Thunk

TODO Explanation of store, Provider && thunk

To /src/index.js add:
```
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import './index.css';
import App from './App';
import reducers from './reducers';
import registerServiceWorker from './registerServiceWorker';
const store = createStore(reducers, {}, applyMiddleware(reduxThunk));
ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
registerServiceWorker();
```

Verify no errors:
`npm run dev`

### Routing

In /src add a components folder and within it create three components:
Header.js
Landing.js
Dashboard.js.

TODO Explain Redux container (spec. connect)

Edit Header.js:
```
import React, { Component } from 'react';
import { connect } from 'react-redux';
class Header extends Component {
renderContent() {
		switch (this.props.auth) {
			case null:
				return;
			case false:
				return <a href="/auth/github">Login w/GitHub</a>;
			default:
				return <a href="/auth/logout">Logout</a>;
		}
	}
	render() {
		return (
			<div>
				{this.renderContent()}
			</div>
		)
	}
}
function mapStateToProps({auth}) {
	return { auth };
}
export default connect(mapStateToProps)(Header);
```

Edit Landing.js:
```
import React from 'react';
const Landing = () => <h1>You have landed.</h1>;
export default Landing;
```

Edit Dashboard.js:
```
import React from 'react';
const Dashboard = () => <h1>Paradise by the Dashboard component.</h1>;
export default Dashboard;
```

Edit App.js:
```
import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './actions';
import Header from './components/Header';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }
  render() {
    return (
      <div className="container">
        <Router>
		<div>
          	<Header />
            <Route exact path ="/" component={Landing} />
            <Route exact path ="/dashboard" component={Dashboard} />
		</div>
        </Router>
      </div>
    );
  }
}
export default connect(null, actions)(App);
```

In authRoutes.js, Edit the callback redirect and add a redirect to the logout route.

TODO handle failureRedirect

```
const passport = require('passport');
module.exports = app => {
  app.get('/auth/github',
  passport.authenticate('github'));
//TODO handle failureRedirect i.e: no /login route
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  });
app.get('/auth/user', (req, res) => {
  		res.send(req.user);
});
app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
}
```

Lastly, update the Authorized callback URL on GitHub because we are no longer routing to port 3001:
http://localhost:3000/auth/github/callback

From within the root directory of your app:
`npm run dev’

You should be routed to http://localhost:3000/ and see the text ‘You have landed’.

Now the moment of truth. Test authentication from the React-side: http://localhost:3000/auth/github

Paradise by the Dashboard component!

But there’s an issue we need to resolve with Logout. We have what is referred to as a race condition. On /logout, our redirect() is executing before our logout() is complete so our Landing component is rendering but our switch is returning the default value.

If you recall in /actions/index.js, we used async and await. We now need to add that to our Passport strategy.
```
async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ githubId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = await new User({ githubId: profile.id }).save();
      done(null, user);
    }
```

Verify login and logout work locally. Then delete all documents from your database and verify that a new document is still being created.

Add, commit, and push to GitHub then to Heroku and verify login works in production.

### TODO Build An App

## Resources
https://github.com/StephenGrider/FullstackReactCode
https://medium.com/@heyamberwilkie/refactoring-a-react-app-to-use-redux-and-thunk-part-two-adding-redux-72921132709a
https://medium.com/@slavik57/async-race-conditions-in-javascript-526f6ed80665
