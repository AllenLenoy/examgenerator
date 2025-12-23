/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            error: `Duplicate ${field}`,
            message: `This ${field} already exists`
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            message: 'The provided ID is not valid'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Authentication token is malformed'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Please login again'
        });
    }

    // Custom application errors
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
};

export default errorHandler;
