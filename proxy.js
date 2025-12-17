// proxy.js
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

let container_id;

app.post("/facebook", async (req, res) => {
  try {
    const response = await axios({
      method: req.body.method || "GET",
      url: `https://graph.facebook.com/${req.body.endpoint}`,
      headers: {
        Authorization: `Bearer ${req.body.token}`,
        "Content-Type": "application/json",
      },
      data: req.body.payload || {},
    });
    container_id = response.data;
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get("/facebook", async (req, res) => {
  try {
    const endpoint = req.query.endpoint;
    const token = req.query.token;
    const url = `https://graph.facebook.com/v22.0/${endpoint}?access_token=${token}&fields=status_code`;
    const response = await axios({
      method: "GET",
      url,
    });
    res.json(response.data);
  } catch (err) {
    // Log the full error response for debugging
    console.error("Facebook API error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.message,
      details: err.response?.data || null,
    });
  }
});
app.post("/upload", async (req, res) => {
  try {
    const response = await axios({
      method: req.body.method || "GET",
      url: `https://graph.facebook.com/${req.body.endpoint}/media_publish?creation_id=${req.body.content}`,
      headers: {
        Authorization: `Bearer ${req.body.token}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(3000, () => console.log("Proxy running on port 3000"));
}

module.exports = app;
