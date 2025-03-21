const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
  }
});

let qrCode = '';
let isConnected = false;

// Gerar QR Code
client.on('qr', async (qr) => {
  qrCode = await qrcode.toDataURL(qr); // Converte QR para imagem base64
});

client.on('ready', () => {
  isConnected = true;
  console.log('WhatsApp conectado!');
});

client.initialize();

// Rotas da API
app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

app.get('/qrcode', (req, res) => {
  res.send(`<img src="${qrCode}" />`); // Frontend pode consumir isso como URL
});

app.post('/send', async (req, res) => {
  const { number, message } = req.body;
  await client.sendMessage(`${number}@c.us`, message);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
