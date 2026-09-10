const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', service: 'zsp-aitool', studio: true }));
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-App': 'zsp-aitool'
  });
  
  res.end(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZSP AI Studio · HyperFrames</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #131b2e;
      --primary: #ee4d2d;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #1e293b;
      --accent: #0ea5e9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(19, 27, 46, 0.8);
      backdrop-filter: blur(12px);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text);
      text-decoration: none;
    }
    .logo-badge {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); }
    main {
      flex: 1;
      padding: 2.5rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .hero {
      margin-bottom: 2.5rem;
    }
    .hero h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      color: var(--muted);
      font-size: 1.1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.75rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: #334155;
    }
    .card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn-secondary {
      background: #1e293b;
      color: var(--text);
    }
    .btn:hover { opacity: 0.9; }
    .status-panel {
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #10b981;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 1.5rem 2rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <span>ZSP AI Studio</span>
      <span class="logo-badge">HyperFrames</span>
    </a>
    <nav class="nav-links">
      <a href="https://zarvis.zeaz.dev">Z.A.R.V.I.S.</a>
      <a href="https://chat.zeaz.dev">Chat</a>
      <a href="https://qwen.zeaz.dev">Qwen</a>
      <a href="https://zwf.zeaz.dev">Workforce Control</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Shopee Affiliate AI Content & Video Studio</h1>
      <p>ระบบสร้างคอนเทนต์ภาษาไทย วิดีโอรีวิว HyperFrames และคลังสินค้า Shopee อัตโนมัติ</p>
    </section>

    <div class="grid">
      <div class="card">
        <h3>🎬 HyperFrames Video Studio</h3>
        <p>สร้างวิดีโอรีวิวสินค้าความละเอียดสูง พร้อมบทบรรยายภาษาไทย และแอนิเมชันกราฟิกอัตโนมัติ</p>
        <button class="btn btn-primary" onclick="alert('HyperFrames Engine Ready')">เปิดสตูดิโอวิดีโอ</button>
      </div>

      <div class="card">
        <h3>✍️ AI Copywriting & Presets</h3>
        <p>สร้างแคปชันรีวิวสินค้า Shopee โพสต์โซเชียลมีเดีย พร้อมแท็ก Affiliate ปฏิบัติตามมาตรฐานอย่างถูกต้อง</p>
        <button class="btn btn-secondary" onclick="alert('AI Copywriter Ready')">สร้างเนื้อหาใหม่</button>
      </div>

      <div class="card">
        <h3>📦 Shopee Product Ingestion</h3>
        <p>ดึงข้อมูลสินค้า ภาพ OCR และซิงก์ราคาโปรโมชันเข้าสู่ระบบแคตตาล็อก 23 ตาราง</p>
        <button class="btn btn-secondary" onclick="alert('Product Catalog Sync Active')">จัดการคลังสินค้า</button>
      </div>
    </div>

    <div class="status-panel">
      <div class="status-indicator">
        <span class="dot"></span>
        <span>ZSP AI Studio Core Online · Thai-First Pipeline Active</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--muted);">
        Port :3005 · Bound to Cloudflare Argo Tunnel
      </div>
    </div>
  </main>

  <footer>
    © 2026 ZEAZ ZSP AI Tool · Thai-first Shopee Affiliate Platform · Powered by zWorkforce Control Plane
  </footer>
</body>
</html>`);
});

server.listen(PORT, HOST, () => {
  console.log(`ZSP AI Studio Standalone Server listening on http://${HOST}:${PORT}`);
});
