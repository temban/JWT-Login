import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

const router = express.Router();

/* GET users listing. */
router.get('/get_users', authenticateToken, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json({ users: users.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
      [req.body.name, req.body.email, hashedPassword]
    );
    res.json({ users: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_menu', async (req, res) => {
  try {
    const menu = await pool.query('SELECT * FROM menu');
    res.json({ menu: menu.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific user by ID
router.get('/get_user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT to edit a user by ID
router.put('/edit_user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await pool.query(
      'UPDATE users SET user_name = $1, user_email = $2, user_password = COALESCE($3, user_password) WHERE user_id = $4 RETURNING *',
      [name, email, hashedPassword, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a user by ID
router.delete('/delete_user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);

    if (deleteUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: deleteUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

