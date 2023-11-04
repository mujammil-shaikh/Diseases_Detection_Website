const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
require('dotenv').config({ path: 'a.env' });
 // Load environment variables from a .env file

if (!process.env.SKIN_API_KEY || !process.env.EYE_API_KEY) {
  console.error('Required environment variables are not set.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Use security headers with the 'helmet' middleware
app.use(helmet());

// Apply rate limiting to prevent abuse of the endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/skin/upload', limiter);
app.use('/eye/upload', limiter);

// Enable gzip compression for responses
app.use(compression());

// Enable structured request logging with 'morgan'
const morganFormat = ':method :url :status :response-time ms - :res[content-length]';
app.use(morgan(morganFormat));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/skin_Model.html', (req, res) => {
  res.sendFile(__dirname + '/public/skin_model.html');
});

app.get('/eye_Model.html', (req, res) => {
  res.sendFile(__dirname + '/public/eye_model.html');
});

app.post('/skin/upload', [
  upload.single('image'),
], async (req, res) => {
  console.log('Received Skin Disease Detection request.');
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);

  // Check if req.file exists and is not undefined
  if (!req.file) {
    console.error('Image file is required.');
    return res.status(400).json({ error: 'Image file is required' });
  }
  
  const data = req.file.buffer;

  try {
    console.log('Sending request to Hugging Face API for Skin Disease Detection.');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/SM200203102097/skinDiseasesDetectionModel',
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.SKIN_API_KEY}`,
          'Content-Type': 'image/jpeg',
        },
      }
    );

    if (response.status === 200) {
      console.log('Hugging Face API response:', response.data);
      res.json(response.data);
    } else {
      console.error('Hugging Face API Error:', response.status, response.statusText);
      res.status(response.status).send('Error processing the image.');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Error processing the image.');
  }
});


app.post('/eye/upload', [
  upload.single('image'),
], async (req, res) => {
  console.log('Received Skin Disease Detection request.');
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);

  // Check if req.file exists and is not undefined
  if (!req.file) {
    console.error('Image file is required.');
    return res.status(400).json({ error: 'Image file is required' });
  }

  const data = req.file.buffer;

  try {
    console.log('Sending request to Hugging Face API for Eye Disease Detection.');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/SM200203102097/eyeDiseasesDetectionModel',
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.EYE_API_KEY}`,
          'Content-Type': 'image/jpeg',
        },
      }
    );

    if (response.status === 200) {
      console.log('Hugging Face API response:', response.data);
      res.json(response.data);
    } else {
      console.error('Hugging Face API Error:', response.status, response.statusText);
      res.status(response.status).send('Error processing the image.');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Error processing the image.');
  }
});


// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
