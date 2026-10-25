const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Url = require('./models/Url');

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/url', require('./routes/url'));

// GET /:code - Redirect to original URL and track click
app.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlId: req.params.code });

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.origUrl);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));