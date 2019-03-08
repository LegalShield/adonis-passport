const rewire = require('rewire');
const PassportPPLSI = require('../');
const expect = require('chai').expect;
const nock = require('nock');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('oauth2', function () {
  let Strategy, options, strategy;

  describe('password', function () {
    beforeEach(function () {
      Strategy = PassportPPLSI.OAuth2.PasswordStrategy;
      options = {
        base_url: 'localhost:5000/',
        base_protocol: 'http://',
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
        scope = nock(options.base_protocol + options.base_url, {
          reqheaders: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .post('/auth/v1/tokens', {
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

    describe('issuer', function () {
      let Strategy, options;

      beforeEach(function () {
        Strategy = rewire('../oauth2/authorization-code/strategy');
        const Issuer = Strategy.__get__('Issuer');
        const issuerSpy = sinon.spy(Strategy, 'Issuer');

        Strategy.__set__('Issuer', issuerSpy);

        options = {
          base_url: 'localhost:5000/',
          base_protocol: 'http://',
          client_id: 'some-client-id',
          client_secret: 'some-client-secret',
          redirect_uri: 'http://localhost:3000/callback'
        };
        new Strategy(options);
      });

      it('is configured correctly', function () {
        const issuerOptions = {
          issuer: options.base_url,
          authorization_endpoint: `${options.base_protocol + options.base_url}auth/v1/authorize`,
          token_endpoint: `${options.base_protocol + options.base_url}auth/v1/tokens`,
          jwks_uri: `${options.base_protocol + options.base_url}auth/v1/certificates`
        };

        expect(Strategy.Issuer.getCall(0).args[0]).to.eql(issuerOptions);
      });
    });

    describe('client', function () {
      let issuerSpy, clientOptions;
      let issuerFake = {
        Client: function () { }
      };

      beforeEach(function () {
        const Strategy = rewire('../oauth2/authorization-code/strategy');

        const options = {
          base_url: 'http://localhost:5000/',
          client_id: 'some-client-id',
          client_secret: 'some-client-secret',
          redirect_uri: 'http://localhost:3000/callback'
        };
        const issuerOptions = {
          issuer: options.base_url,
          authorization_endpoint: `${options.base_url}auth/authorize`,
          token_endpoint: `${options.base_url}auth/token`,
          jwks_uri: `${options.base_url}auth/certificates`
        };
        clientOptions = {
          client_id: options.client_id,
          client_secret: options.client_secret,
          redirect_uris: [
            options.redirect_uri
          ],
          token_endpoint_auth_method: 'client_secret_post'
        };

        const Issuer = Strategy.__get__('Issuer');
        const issuer = new Issuer(issuerOptions);
        const client = new issuer.Client(clientOptions);

        let issuerStub = sinon.stub(Strategy, 'Issuer');
        issuerStub.returns(issuerFake);
        issuerSpy = sinon.stub(issuerFake, 'Client').returns(client);

        Strategy.__set__('Issuer', issuerSpy);

        new Strategy(options);
      });

      it('is configured correctly', function () {
        expect(issuerSpy.getCall(0).args[0]).to.eql(clientOptions);
      });
    });

    describe('name', function () {
      it('sets the name', function () {
        expect(strategy.name).to.eql('pplsi-oauth2-authorization-code');
      });
    });
  });
});
