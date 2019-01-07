const util = require('util');
const LocalStrategy = require('passport-local').Strategy;
const url = require('url');
const request = require('request');
const JWT = require('jsonwebtoken');

const Strategy = function Strategy (options) {
  if (!options) { throw new Error('PasswordGrantStrategy requires options'); }
  if (!options.baseURL) { throw new Error('PasswordGrantStrategy requires baseURL to be set'); }
  if (!options.clientID) { throw new Error('PasswordGrantStrategy requires clientID to be set'); }

  options.url = url.parse(options.baseURL);
  options.url.pathname = '/auth/token';

  LocalStrategy.call(this, options, function(username, password, next) {
    const params = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: { grant_type: 'password', scope: 'openid', username: username, password: password, client_id: options.clientID }
    };

    request.post(url.format(options.url), params, function (err, response, body) {
      try {
        const tokenset = JSON.parse(body);
        const id_token = JWT.decode(tokenset.id_token);

        next(null, { accessToken: tokenset.access_token, refreshToken: tokenset.refresh_token, idToken: id_token });
      } catch (error) {
        next(null, false);
      }
    });
  });

  this.name = 'pplsi-oauth2-password-grant';
}

util.inherits(Strategy, LocalStrategy);

module.exports = Strategy;
