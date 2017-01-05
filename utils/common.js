const randomstring = require("randomstring"),
      crypto = require('crypto');

module.exports = {
  generateRandomString: function(numCharacters = 50) {
    return randomstring.generate(numCharacters);
  },
  getFormattedDateTimeNow: function () {
    const currentdate = new Date();
    return  _addZero(currentdate.getFullYear()) + "-" +
            _addZero(currentdate.getMonth()+1)  + "-"+
            _addZero(currentdate.getDate()) + " "  +
            _addZero(currentdate.getHours()) + ":"   +
            _addZero(currentdate.getMinutes()) + ":" +
            _addZero(currentdate.getSeconds());
  },
  getEncryptedInMd5:  function(stringToBeEncrypted) {
    return crypto.createHash('md5').update(stringToBeEncrypted).digest("hex");
  }
};

function _addZero(str) {
  return str < 10 ? ('0' + str) : str;
}
