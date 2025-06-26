require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: fs.readFileSync(filePath),
    });

    const data = await response.json();
    const transcript = data?.results?.channels[0]?.alternatives[0]?.transcript || '';
    res.json({ transcript });

  } catch (err) {
    res.status(500).json({ error: 'Failed to transcribe audio' });
  } finally {
    fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
