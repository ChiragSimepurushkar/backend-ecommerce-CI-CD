import jwt from 'jsonwebtoken';

const auth = async (request, response, next) => {
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

        // if (!token) {
        //     token = request.query.token;
        // }
        if (!token) {
            return response.status(401).json({
                message: "Provide token"
            });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if (!decode) {
            return response.status(401).json({
                message: "unauthorized access",
                error: true,
                success: false
            });
        }

        request.userId = decode.id;
        next();

    } catch (error) {
        // Check if error is JWT specific
        if (error.name === 'TokenExpiredError') {
            return response.status(401).json({
                message: "Token has expired",
                error: true,
                success: false
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            });
        }

        // Generic error
        return response.status(401).json({ // Changed from 500 to 401
            message: "You have not login",
            error: true,
            success: false
        });
    }
};

export default auth;