const PassportPPLSI = require('../');
const expect = require('chai').expect;
const fs = require('fs');

describe('metadata', function () {
  it('reports the correct package', function () {
    var packageJSON = JSON.parse(fs.readFileSync('./package.json').toString());

    expect(PassportPPLSI.version).to.eql(packageJSON.version);
  });
});
