[![Codeship Status for LegalShield/passport-pplsi](https://app.codeship.com/projects/257350e0-f4f5-0136-2f32-1e71af04627f/status?branch=master)](/projects/320798)

# Passport PPLSI
A collection of [passport](http://www.passportjs.org/) strategies for authenticating against [PPLSI](https://legalshield.com/).

These modules let you authenticate using PPLSI in your Node.js applications. By plugging into Passport, PPLSI authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/).

## Install
    $ npm install @pplsi/passport-pplsi

## Current Strategies
* [OAuth2](#oauth2)
  * [PasswordStrategy](#passwordstrategy)
  * [AuthorizationCodeStrategy](#authorizationcodestrategy)

## OAuth2

### PasswordStrategy

#### Configure Strategy
The PPLSI OAuth2 Password authentication strategy authenticates users using a PPLSI account and the OAuth 2.0 password grant flow. The strategy requires a base URL for the PPLSI authentication server and your PPLSI client ID to be passed in.

    const PasswordStrategy = require('@pplsi/passport-pplsi').OAuth2.PasswordStrategy;

    passport.use(new PasswordStrategy({
      base_url: 'https://api.legalshield.com',
      client_id: some-client-id
    }));

You can optionally pass in the scope to use when making the token request. By default the scope is `openid`. This will return the `id_token` but if you want to include claims with that token you will need to pass in the claims that you want in the scope. So if you wanted additional claims you would include them in the options like so:

    const PasswordStrategy = require('@pplsi/passport-pplsi').OAuth2.PasswordStrategy;

    passport.use(new PasswordStrategy({
      base_url: 'https://api.legalshield.com',
      client_id: some-client-id,
      scope: 'openid name roles'
    }));


#### Authenticate Requests
Use `passport.authenticate()`, specifying the `'pplsi-oauth2-password'` strategy, to authenticate requests.

For example, as a route middleware in an [Express](http://expressjs.com/) application:

    app.post('/login', passport.authenticate('pplsi-oauth2-password', function(req, res) {
      res.send(req.session.passport.user);
    });
    
------

### AuthorizationCodeStrategy

#### Configure Strategy
The PPLSI OAuth2 Authorization Code authentication strategy authenticates users using a PPLSI account and the OAuth 2.0 authorization code grant flow. The strategy requires the base URL for the PPLSI authentication server, your PPLSI client ID, your PPLSI client secret, and your applications redirect URI to be passed in.

    const AuthorizationCodeStrategy = require('@pplsi/passport-pplsi').OAuth2.AuthorizationCodeStrategy;

    passport.use('pplsi-oauth2-authorization-code', new AuthorizationCodeStrategy({
      base_url: 'https://api.legalshield.com',
      client_id: some-client-id,
      client_secret: some-client-secret,
      redirect_uri: 'https://example.com/callback'
    }));

#### Authenticate Requests
Use `passport.authenticate()`, specifying the `'pplsi-oauth2-authorization-code'` strategy, to authenticate requests. You will also need to pass in the request query as the second parameter to authenticate with google or facebook.

For example, as a route middleware in an [Express](http://expressjs.com/) application:

    app.get('/auth/pplsi', function(req, res, next) {
      passport.authenticate('pplsi-oauth2-authorization-code', req.query || {})(req, res, next);
    });
    
    app.get('/auth/pplsi/callback', passport.authenticate('pplsi-oauth2-authorization-code', { failureRedirect: '/error', successRedirect: '/home' }));

## Tests
    npm test

## Prior Work
This strategy is based on Jared Hanson's GitHub strategy for passport: [Jared Hanson](http://github.com/jaredhanson)
