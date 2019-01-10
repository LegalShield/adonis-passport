const PassportPPLSI = require('../');
const expect = require('chai').expect;
const nock = require('nock');
const jwt = require('jsonwebtoken');

describe('oauth2', function () {
  let Strategy, options, strategy;

  describe('password', function () {
    beforeEach(function () {
      Strategy = PassportPPLSI.OAuth2.PasswordStrategy;
      options = {
        base_url: 'http://localhost:5000/',
        client_id: 'some-client-id'
      };
      strategy = new Strategy(options);
    });

    describe('options', function () {
      it('requires options to be passed in', function () {
        expect(Strategy).to.throw(Error, 'PasswordStrategy requires options');
      });

      it('requires a base_url to be passed in the options object', function () {
        expect(function () { Strategy({}) }).to.throw(Error, 'PasswordStrategy requires base_url to be set');
      });

      it('requires a client_id to be passed in the options object', function () {
        expect(function () { Strategy({ base_url: 'someURL' }) }).to.throw(Error, 'PasswordStrategy requires client_id to be set');
      });
    });

    describe('request', function () {
      let scope, responseBody, idToken;

      beforeEach(function () {
        idToken = jwt.sign({ some: 'claim' }, 'super-secret');
        responseBody = {
          access_token: 'some-access-token',
          refresh_token: 'some-refresh-token',
          id_token: idToken
        };
        scope = nock(options.base_url, {
          reqheaders: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .post('/auth/token', {
            grant_type: 'password',
            scope: 'openid',
            username: 'some-username',
            password: 'some-password',
            client_id: options.client_id
          })
          .reply(201, responseBody);
      });

      describe('success', function () {
        it('calls next with the authentication tokens', function (done) {
          strategy._verify('some-username', 'some-password', function (user, info) {
            expect(user).to.be.null;
            expect(info).to.eql({
              accessToken: 'some-access-token',
              refreshToken: 'some-refresh-token',
              idToken: jwt.decode(idToken)
            });

            done();
          });
        });
      });

      describe('failure', function () {
        it('calls next passing false', function (done) {
          strategy._verify('some-username', 'bad-password', function (user, info) {
            expect(user).to.be.null;
            expect(info).to.eql(false);

            done();
          });
        });
      });
    });

    describe('name', function () {
      it('sets the name', function () {
        expect(strategy.name).to.eql('pplsi-oauth2-password');
      });
    });
  });

  describe('authorization code', function () {
    beforeEach(function () {
      Strategy = PassportPPLSI.OAuth2.AuthorizationCodeStrategy;
      options = {
        base_url: 'http://localhost:5000/',
        client_id: 'some-client-id',
        client_secret: 'some-client-secret',
        redirect_uri: 'http://localhost:3000/callback',
      };
      strategy = new Strategy(options);
    });

    describe('options', function () {
      it('requires options to be passed in', function () {
        expect(Strategy).to.throw(Error, 'AuthorizationCodeStrategy requires options');
      });

      it('requires a base_url to be passed in the options object', function () {
        expect(function () { Strategy({}) }).to.throw(Error, 'AuthorizationCodeStrategy requires base_url to be set');
      });

      it('requires a client_id to be passed in the options object', function () {
        expect(function () { Strategy({ base_url: 'someURL' }) }).to.throw(Error, 'AuthorizationCodeStrategy requires client_id to be set');
      });

      it('requires a client_secret to be passed in the options object', function () {
        expect(function () { Strategy({
          base_url: 'someURL',
          client_id: 'some-client-id'
        }) }).to.throw(Error, 'AuthorizationCodeStrategy requires client_secret to be set');
      });

      it('requires a redirect_uri to be passed in the options object', function () {
        expect(function () { Strategy({
          base_url: 'someURL',
          client_id: 'some-client-id',
          client_secret: 'some-client-secret'
        }) }).to.throw(Error, 'AuthorizationCodeStrategy requires redirect_uri to be set');
      });
    });

    describe('name', function () {
      it('sets the name', function () {
        expect(strategy.name).to.eql('pplsi-oauth2-authorization-code');
      });
    });
  });
});
