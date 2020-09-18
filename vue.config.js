const fs = require("fs");

module.exports = {
  devServer: {
    disableHostCheck: true,
    https: {
      key: fs.readFileSync("./localhost.key"),
      cert: fs.readFileSync("./localhost.cert")
    }
  }
};
