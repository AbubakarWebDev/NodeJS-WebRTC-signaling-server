// Send any success response
module.exports.success = (message, results, statusCode) => {
    return {
        message,
        error: false,
        code: statusCode,
        results
    };
};

// Send any error response
module.exports.error = (message, statusCode) => {
    // List of common HTTP request code
    const codes = [
        200, // OK - The request was successful
        
        201, // Created - The request was successful and a resource was created
        
        400, // Bad Request - The request was invalid or cannot be served. The exact error should be explained in the error payload.

        401, // Unauthorized - Authentication failed or user does not have permissions for the requested operation
        
        404, // Not Found - The requested resource could not be found but may be available again in the future
        
        403, // Forbidden - Authentication succeeded, but authenticated user does not have access to the requested resource
        
        422, // Unprocessable Entity - The request was well-formed, but the server was unable to process it due to  invalid or missing data that is required to complete the request
        
        500  // Internal Server Error - An error occurred on the server
    ];

    // Get matched code
    const findCode = codes.find((code) => code == statusCode);

    if (!findCode) statusCode = 500;
    else statusCode = findCode;

    return {
        message,
        code: statusCode,
        error: true
    };
};

// Send any validation error response
module.exports.validation = (errors) => {
    return {
        message: "Validation errors",
        error: true,
        code: 422,
        errors
    };
};