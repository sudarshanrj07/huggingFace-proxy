// proxy.js
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

let container_id;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facebook Proxy API</title>
      <style>
        :root { --bg: #0f172a; --text: #f8fafc; --accent: #38bdf8; --code-bg: #1e293b; --border: #334155; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; line-height: 1.6; }
        .container { max-width: 650px; padding: 2rem; width: 100%; box-sizing: border-box; }
        h1 { color: var(--accent); margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
        .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 1.5rem; }
        .badge::before { content: ""; width: 6px; height: 6px; background: currentColor; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
        .card { background: var(--code-bg); border-radius: 0.75rem; padding: 1.5rem; margin-top: 1.5rem; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        h3 { margin-top: 0; font-size: 1.125rem; color: #e2e8f0; }
        .endpoint { display: flex; align-items: baseline; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
        .endpoint:last-child { border-bottom: none; padding-bottom: 0; }
        .method { font-family: monospace; font-weight: bold; font-size: 0.875rem; min-width: 3.5rem; }
        .method.GET { color: #60a5fa; }
        .method.POST { color: #818cf8; }
        .path { font-family: monospace; color: #cbd5e1; }
        .desc { font-size: 0.875rem; color: #94a3b8; margin-left: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">System Operational</div>
        <h1>Facebook Graph Proxy</h1>
        <p style="color: #94a3b8; font-size: 1.125rem;">Secure intermediary service for Facebook Graph API interactions.</p>
        
        <div class="card">
          <h3>Available Endpoints</h3>
          <div class="endpoint">
            <span class="method POST">POST</span>
            <span class="path">/facebook</span>
            <span class="desc">Proxy Requests</span>
          </div>
          <div class="endpoint">
            <span class="method GET">GET</span>
            <span class="path">/facebook</span>
            <span class="desc">Read Data</span>
          </div>
          <div class="endpoint">
            <span class="method POST">POST</span>
            <span class="path">/upload</span>
            <span class="desc">Media Upload</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

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
