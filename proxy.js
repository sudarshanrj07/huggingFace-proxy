// proxy.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/facebook', async (req, res) => {
  try {
    const response = await axios({
      method: req.body.method || 'GET',
      url: `https://graph.facebook.com/${req.body.endpoint}`,
      headers: {
        Authorization: `Bearer ${req.body.token}`,
        'Content-Type': 'application/json',
      },
      data: req.body.payload || {},
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
