import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool from '../db.js'; // Adjust the path as needed
import { jwtTokens } from '../utils/jwt-helpers.js'; // Adjust the path as needed

const router = express.Router();
const client = new OAuth2Client('70912245721-40neqr6u551m5eg1vreiml0v2sog9cc5.apps.googleusercontent.com');

// Google Sign-In and account creation endpoint
router.post('/login', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        // Verify the ID token with Google
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: '70912245721-40neqr6u551m5eg1vreiml0v2sog9cc5.apps.googleusercontent.com',
        });

        // Extract the payload from the token
        const payload = ticket.getPayload();

        // Log the entire payload object
        console.log("Google Account Payload:", payload);

        const userEmail = payload.email;
        const userName = payload.name;
        const userPhone = payload.phone_number || ''; // Google might not provide this, check if needed
        const userPicture = payload.picture || ''; // Optional: Get user's Google profile picture URL

        // Check if the user exists in the database
        const users = await pool.query('SELECT * FROM users WHERE user_email = $1', [userEmail]);

        let user;
        if (users.rows.length === 0) {
            // If the user does not exist, create a new user
            const newUser = await pool.query(
                'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
                [userName, userEmail, ''] // No password needed for Google users
            );
            user = newUser.rows[0];
        } else {
            // User exists, retrieve user data
            user = users.rows[0];
        }

        // Generate JWT tokens
        const tokens = jwtTokens({ user_id: user.user_id, user_name: user.user_name, user_email: user.user_email });

        // Set refresh token in cookies
        res.cookie('refresh_token', tokens.refreshToken, {
            ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        // Return the JWT tokens, the user info, and the entire payload
        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                user_id: user.user_id,
                user_name: userName,
                user_email: userEmail,
                user_phone: userPhone,
                user_picture: userPicture
            },
            payload // Include the entire payload object in the response
        });

    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

export default router;
