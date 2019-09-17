const util = require('util');
const LocalStrategy = require('passport-local').Strategy;
const url = require('url');
const request = require('request');
const jwt = require('jsonwebtoken');

const Strategy = function Strategy (options) {
  if (!options) { throw new Error('PasswordStrategy requires options'); }
  if (!options.base_url) { throw new Error('PasswordStrategy requires base_url to be set'); }
  if (!options.client_id) { throw new Error('PasswordStrategy requires client_id to be set'); }

  options.url = url.parse(options.base_protocol + options.base_url);
  options.url.pathname = 'auth/o_auth2/v1/token';

  LocalStrategy.call(this, options, function(username, password, next) {
    const params = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'password',
        scope: 'openid',
        username: username,
        password: password,
        client_id: options.client_id
      }
    };

    request.post(url.format(options.url), params, function (err, response, body) {
      try {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          throw (err);
        }

        const tokenset = JSON.parse(body);
        const id_token = jwt.decode(tokenset.id_token);

        next(null, { accessToken: tokenset.access_token, refreshToken: tokenset.refresh_token, idToken: id_token });
      } catch (error) {
        next(null, false);
      }
    });
  });

  this.name = 'pplsi-oauth2-password';
}

util.inherits(Strategy, LocalStrategy);

module.exports = Strategy;
