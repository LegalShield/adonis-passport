const PassportPPLSI = require('../');
const expect = require('chai').expect;
const nock = require('nock');
const jwt = require('jsonwebtoken');

describe('oauth2', function () {
  let Strategy, options, strategy;

  describe('password grant', function () {
    beforeEach(function () {
      Strategy = PassportPPLSI.OAuth2.PasswordGrantStrategy;
      options = {
        baseURL: 'http://localhost:5000/',
        clientID: 'some-client-id'
      };
      strategy = new Strategy(options);
    });

    describe('options', function () {
      it('requires options to be passed in', function () {
        expect(Strategy).to.throw(Error, 'PasswordGrantStrategy requires options');
      });

      it('requires a baseURL to be passed in the options object', function () {
        expect(function () { Strategy({}) }).to.throw(Error, 'PasswordGrantStrategy requires baseURL to be set');
      });

      it('requires a clientID to be passed in the options object', function () {
        expect(function () { Strategy({ baseURL: 'someURL' }) }).to.throw(Error, 'PasswordGrantStrategy requires clientID to be set');
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
        scope = nock(options.baseURL, {
          reqheaders: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .post('/auth/token', {
            grant_type: 'password',
            scope: 'openid',
            username: 'some-username',
            password: 'some-password',
            client_id: options.clientID
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
        expect(strategy.name).to.eql('pplsi-oauth2-password-grant');
      });
    });
  });
});
