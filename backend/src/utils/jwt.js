import jwt from "jsonwebtoken";
import env from "../config/env.js";

const JWT_EXPIRES_IN = "1d";

const generateToken = (userId) => {
    const token = jwt.sign(
        {
            userId,
        },
        env.jwtSecret,
        {
            expiresIn: JWT_EXPIRES_IN,
        },
    );
    return token;
};

const verifyToken = (token) => {
    return jwt.verify(token, env.jwtSecret);
};

export { generateToken, verifyToken };
