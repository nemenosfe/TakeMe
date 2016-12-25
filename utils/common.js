const randomstring = require("randomstring"),
      crypto = require('crypto');

module.exports = {
  generateRandomString: function(numCharacters = 200) {
    return randomstring.generate(numCharacters);
  },
  getFormattedDateTimeNow: function () {
    const currentdate = new Date();
    return  addZero(currentdate.getFullYear()) + "-" +
            addZero(currentdate.getMonth()+1)  + "-"+
            addZero(currentdate.getDate()) + " "  +
            addZero(currentdate.getHours()) + ":"   +
            addZero(currentdate.getMinutes()) + ":" +
            addZero(currentdate.getSeconds());
  },
  getEncryptedInMd5:  function(stringToBeEncrypted) {
    return crypto.createHash('md5').update(stringToBeEncrypted).digest("hex");
  }
};

function addZero(str) {
  return str < 10 ? ('0' + str) : str;
}
