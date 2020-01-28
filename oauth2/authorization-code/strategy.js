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

  if (!options.scope) { options.scope = 'openid'; }

  const redirect_base_url = options.redirect_base_url || options.base_url;

  let authorizationURL = url.parse(options.base_protocol + redirect_base_url);
  authorizationURL.pathname = 'auth/o_auth2/v1/authorize';
  let tokenURL = url.parse(options.base_protocol + options.base_url);
  tokenURL.pathname = 'auth/o_auth2/v1/token';
  let jwksURL = url.parse(options.base_protocol + options.base_url);
  jwksURL.pathname = 'auth/o_auth2/v1/certificates';

  issuerOptions = {
    issuer: options.base_protocol + redirect_base_url,
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
    token_endpoint_auth_method: 'client_secret_post',
    scope: options.scope
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
