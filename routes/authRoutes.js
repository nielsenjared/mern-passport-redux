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
    req.session = null;
    res.redirect('/');
  });
}
