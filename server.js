require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- MongoDB Connection ----------------
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------------- Models ----------------
const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  active: { type: Boolean, default: true }
});
const User = mongoose.model('User', UserSchema);

const JobSchema = new mongoose.Schema({
  customerName: String,
  vehicleReg: String,
  complaint: String,
  location: String,
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', JobSchema);

// ---------------- Auth Routes ----------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, email: user.email, role: user.role });
});

// ---------------- Jobs Routes ----------------
app.get('/api/admin/jobs/new', async (req, res) => {
  const jobs = await Job.find({ status: 'new' }).sort({ createdAt: -1 });
  res.json(jobs);
});

app.get('/api/admin/jobs/all', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});