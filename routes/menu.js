import express from 'express';
import pool from '../db.js';
// import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authorization.js';

const router = express.Router();

router.get('/get_menu', async (req, res) => {
    try {
      const menu = await pool.query('SELECT * FROM menu');
      res.json({ menu: menu.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST to create a new menu item
  router.post('/create_menu', async (req, res) => {
    const { menu_name, menu_description, menu_price, user_id } = req.body;
  
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      const newMenu = await pool.query(
        'INSERT INTO menu (menu_name, menu_description, menu_price, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [menu_name, menu_description, menu_price, user_id]
      );
      res.status(201).json({ menu: newMenu.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default router;
