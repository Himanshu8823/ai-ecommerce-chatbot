import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersPath = path.join(__dirname, '../data/users.json');

const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
const saveUsers = (users) => fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

export const login = (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Use demo account: alex@example.com / password123'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token: 'demo-token-' + Buffer.from(user.email).toString('base64'),
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const users = getUsers();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const newUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name,
      email: email.trim(),
      password,
      phone: phone || '+1 (555) 000-0000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      address: {
        street: '100 Innovation Way',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States'
      }
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token: 'demo-token-' + Buffer.from(newUser.email).toString('base64'),
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = (req, res) => {
  try {
    const users = getUsers();
    const demoUser = users[0];
    const { password: _, ...userWithoutPassword } = demoUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
