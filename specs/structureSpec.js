const PassportPPLSI = require('../');
const expect = require('chai').expect;

describe('structure', function () {
  it('exports OAuth2', function () {
    expect(PassportPPLSI.OAuth2).to.exist;
  });

  it('exports OAuth2.PasswordStrategy', function () {
    expect(PassportPPLSI.OAuth2.PasswordStrategy).to.exist;
  });

  it('exports OAuth2.AuthorizationCodeStrategy', function () {
    expect(PassportPPLSI.OAuth2.AuthorizationCodeStrategy).to.exist;
  });
});
