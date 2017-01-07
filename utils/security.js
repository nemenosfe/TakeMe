const crypto = require('crypto'),
      Promise = require("bluebird");

module.exports = {
  authorize_appkey: function (appkey, mysqlConnection) {
    return new Promise(function(resolve, reject) {
      const errorUnauthorizedResponse = {error: {status_code: 401, error_description: "Unauthorized"}},
            sqlGetAppKey = "SELECT appkey FROM appkeys;"
      if (!appkey) { reject(errorUnauthorizedResponse); }
      mysqlConnection.query(sqlGetAppKey)
      .then((resultDB) => {
        const real_hashed_appkey = resultDB[0].appkey,
              requested_hashed_appkey = crypto.createHash('md5').update(appkey).digest("hex");
        (requested_hashed_appkey == real_hashed_appkey) ? resolve(1) : reject(errorUnauthorizedResponse);
      })
      .catch((err) => { reject(err); })
    });
  },
  authorize_token: function (token, uid, provider, mysqlConnection) {
    return new Promise(function(resolve, reject) {
      const errorNoUserResponse       = {error: {status_code: 422, error_description: "Unprocessable entity"}},
            errorUnauthorizedResponse = {error: {status_code: 401, error_description: "Unauthorized"}},
            sqlGetToken = `SELECT token FROM tokens WHERE users_uid = ${uid} AND users_provider = '${provider}';`;
      if (!token) { reject(errorUnauthorizedResponse); }
      mysqlConnection.query(sqlGetToken)
      .then((resultDB) => {
        if (!resultDB[0]) { reject(errorNoUserResponse); }
        else {
          const real_hashed_token = resultDB[0]["token"],
                requested_hashed_token = crypto.createHash('md5').update(token).digest("hex");
          (requested_hashed_token == real_hashed_token) ? resolve(1) : reject(errorUnauthorizedResponse);
        }
      })
      .catch((err) => { reject(err); })
    });
  }
};
