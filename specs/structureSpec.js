const PassportPPLSI = require('../');
const expect = require('chai').expect;

describe('structure', function () {
  it('exports OAuth2', function () {
    expect(PassportPPLSI.OAuth2).to.exist;
  });

  it('exports OAuth2.PasswordGrantStrategy', function () {
    expect(PassportPPLSI.OAuth2.PasswordGrantStrategy).to.exist;
  });
});
