const util = require('util');
const Issuer = require('openid-client').Issuer;
const OpenIDStrategy = require('openid-client').Strategy;
const url = require('url');

const Strategy = function Strategy (options) {
  if (!options) { throw new Error('AuthorizationCodeStrategy requires options'); }
  if (!options.base_url) { throw new Error('AuthorizationCodeStrategy requires base_url to be set'); }
  if (!options.client_id) { throw new Error('AuthorizationCodeStrategy requires client_id to be set'); }
  if (!options.client_secret) { throw new Error('AuthorizationCodeStrategy requires client_secret to be set'); }
  if (!options.redirect_uri) { throw new Error('AuthorizationCodeStrategy requires redirect_uri to be set'); }

  let authorizationURL = url.parse(options.base_url);
  authorizationURL.pathname = 'auth/v1/authorize';
  authorizationURL.protocol = options.base_protocol;
  let tokenURL = url.parse(options.base_url);
  tokenURL.pathname = 'auth/v1/tokens';
  tokenURL.protocol = options.base_protocol;
  let jwksURL = url.parse(options.base_url);
  jwksURL.pathname = 'auth/v1/certificates';
  jwksURL.protocol = options.base_protocol;

  issuerOptions = {
    issuer: options.base_url,
    authorization_endpoint: url.format(authorizationURL),
    token_endpoint: url.format(tokenURL),
    jwks_uri: url.format(jwksURL)
  };
  clientOptions = {
    client_id: options.client_id,
    client_secret: options.client_secret,
    redirect_uris: [
      options.redirect_uri
    ],
    token_endpoint_auth_method: 'client_secret_post'
  };

  const issuer = new Strategy.Issuer(issuerOptions);
  const client = new issuer.Client(clientOptions);

  OpenIDStrategy.call(this, { client: client }, function(tokenset, next) {
    next(null, { accessToken: tokenset.access_token, refreshToken: tokenset.refresh_token, idToken: tokenset.claims });
  });

  this.name = 'pplsi-oauth2-authorization-code';
}

Strategy.Issuer = Issuer;

util.inherits(Strategy, OpenIDStrategy);

module.exports = Strategy;
