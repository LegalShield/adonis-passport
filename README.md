# Passport PPLSI
A collection of [passport](http://www.passportjs.org/) stragegies for authenticating against [LegalShield](https://legalshield.com/).

These modules let you authenticate using LegalShield in your Node.js applications. By plugging into Passport, LegalShield authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/).

## Install
    $ npm install passport-pplsi

## Current Strategies
* [OAuth2](#oauth2)
    * [PasswordGrantStrategy](#passwordgrantstrategy)

## OAuth2

### PasswordGrantStrategy

##### Configure Strategy
The PPLSI OAuth2 Password Grant authentication strategy authenticates users using a PPLSI account and the OAuth 2.0 password grant flow. The strategy requires a base URL for the PPLSI authentication server and your PPLSI client ID to be passed in.

    const PPLSIStrategy = require('passport-pplsi').OAuth2.PasswordGrantStrategy;

    passport.use(new PPLSIStrategy({
      baseURL: PPLSI_AUTHENTICATION_SERVER_BASE_URL,
      clientID: PPLSI_CLIENT_ID
    }));

##### Authenticate Requests
Use `passport.authenticate()`, specifying the `'pplsi-oauth2-password-grant'` strategy, to authenticate requests.

For example, as a route middleware in an [Express](http://expressjs.com/) application:

    app.post('/login', passport.authenticate('pplsi-oauth2-password-grant', function(req, res) {
      res.send(req.session.passport.user);
    });

## Tests
    npm test

## Prior Work
This strategy is based on Jared Hanson's GitHub strategy for passport: [Jared Hanson](http://github.com/jaredhanson)
