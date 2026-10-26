const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const Url = require('../models/Url');

// Helper to generate a random 7-character code
function generateCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/url/shorten - Create short URL
router.post('/shorten', async (req, res) => {
  const origUrl = req.body.origUrl || req.body.url || req.body.longUrl;
  
  // ✅ Added a fallback so it never becomes undefined
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  if (!validUrl.isUri(origUrl)) {
    return res.status(400).json('Invalid URL format. Include http:// or https://');
  }

  try {
    let url = await Url.findOne({ origUrl });

    if (url) {
      return res.json(url);
    } else {
      const urlId = generateCode();
      const shortUrl = `${baseUrl}/${urlId}`;

      url = new Url({
        origUrl,
        shortUrl,
        urlId,
        date: new Date()
      });

      await url.save();
      return res.json(url);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json('Server error');
  }
});

// GET /api/url/all - Get all links for history table
router.get('/all', async (req, res) => {
  try {
    const urls = await Url.find().sort({ date: -1 });
    res.json(urls);
  } catch (err) {
    console.error(err);
    return res.status(500).json('Server error');
  }
});

// ✅ IMPORTANT: Make sure you have a redirect route for visiting the short link!
// If this is in a separate file, make sure it's mapped correctly in your server.js
router.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlId: req.params.code });
    if (url) {
      return res.redirect(url.origUrl);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

module.exports = router;