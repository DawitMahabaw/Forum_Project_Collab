import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

// Create a token
function createToken(user) {
    return jwt.sign(
        {
            id: user.user_id,
        },
        secret,
        { expiresIn: "1h" }
    );
}


module.exports = { createToken };