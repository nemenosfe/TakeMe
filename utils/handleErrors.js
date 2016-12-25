module.exports = {
  handleError: function (err, res) {
    if (err.error && err.error.status_code) {
      res
        .status(err.error.status_code)
        .json({error: true, message: err.error.error_description})
    } else {
      res
        .status(500)
        .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
    }
  },
  handleNoParams: function(res) {
    res
      .status(403)
      .json({error: true, message: 'Missing params'})
  }
};
