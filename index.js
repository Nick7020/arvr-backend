const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── MongoDB connection ── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ── Registration Schema ── */
const registrationSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  phone:       { type: String, required: true, trim: true },
  branch:      { type: String, required: true, trim: true },
  collegeName: { type: String, required: true, trim: true },
  teamName:    { type: String, required: true, trim: true },
  teamMembers: { type: String, required: true, trim: true },
  createdAt:   { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', registrationSchema);

/* ── POST /api/register ── */
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, branch, collegeName, teamName, teamMembers } = req.body;

    if (!name || !email || !phone || !branch || !collegeName || !teamName || !teamMembers) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check duplicate email
    const existing = await Registration.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }

    const registration = new Registration({ name, email, phone, branch, collegeName, teamName, teamMembers });
    await registration.save();

    res.status(201).json({ success: true, message: 'Registration successful! See you at the hackathon 🚀' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

/* ── GET /api/registrations (admin view) ── */
app.get('/api/registrations', async (req, res) => {
  try {
    const data = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Health check ── */
app.get('/', (req, res) => res.json({ status: 'AR/VR Hackathon API running 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
