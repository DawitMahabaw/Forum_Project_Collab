import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

// Create a token
export function createToken(user) {
    return jwt.sign(
        {
            id: user.user_id,
        },
        secret,
        { expiresIn: "1h" }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null; // invalid or expired token
    }
}

