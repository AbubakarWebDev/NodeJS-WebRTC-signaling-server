const { error } = require("../utils/apiResponse");

function errorHandler(err, req, res, next) {
    console.log("Error Logged from errorHandler middleware: ", err.message);
    res.status(err.status || 500);
    res.send(error(err.message || "Something Went Wrong!", res.statusCode));
}

module.exports = errorHandler;