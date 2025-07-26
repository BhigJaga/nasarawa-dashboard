const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());
// Serve frontend static files (like index.html, .css, .js)
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route for root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Helper to read data
const getData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};
const upload = multer({ dest: 'uploads/' });

// API GET Routes
app.get('/api/cpi', (req, res) => {
  const data = getData('cpi.json');
  res.json(data);
});

app.get('/api/population', (req, res) => {
  const data = getData('population.json');
  res.json(data);
});

app.get('/api/agriculture', (req, res) => {
  const data = getData('agriculture.json');
  res.json(data);
});

// API POST Routes
app.post('/api/upload', upload.single('excelFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;

    let matchedSheet = null;
const validSheets = ['CPI', 'Population', 'Agriculture'];

validSheets.forEach(sheet => {
  if (sheetNames.includes(sheet)) {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
    let filename = '';

    if (sheet === 'CPI') filename = 'cpi.json';
    else if (sheet === 'Population') filename = 'population.json';
    else if (sheet === 'Agriculture') filename = 'agriculture.json';

    const filePath = path.join(__dirname, 'data', filename);
    let existing = [];

    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const merged = [...existing, ...data];
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  }
});

res.json({ message: '✅ All matched sheets imported successfully!' });
    if (!matchedSheet) {
      return res.status(400).json({ error: 'Sheet must be named CPI, Population, or Agriculture' });
    }

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[matchedSheet]);
    let filename = '';

    if (matchedSheet === 'CPI') filename = 'cpi.json';
    else if (matchedSheet === 'Population') filename = 'population.json';
    else if (matchedSheet === 'Agriculture') filename = 'agriculture.json';

    const filePath = path.join(__dirname, 'data', filename);
    let existing = [];

    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const merged = [...existing, ...data];
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));

    res.json({ message: `${matchedSheet} data imported successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Add CPI Data
app.post('/api/cpi', (req, res) => {
  const { state, lga, month, year, value, description } = req.body;

  if (!state || !lga || !month || !year || !value) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }

  const filePath = path.join(__dirname, 'data', 'cpi.json');
  const data = getData('cpi.json');

  data.push({ state, lga, month, year, value, description });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json({ message: '✅ CPI data added successfully' });
});

// Add Population Data
app.post('/api/population', (req, res) => {
  const { state, lga, year, ageGroup, gender, population } = req.body;

  if (!state || !lga || !year || !ageGroup || !gender || !population) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }

  const filePath = path.join(__dirname, 'data', 'population.json');
  const data = getData('population.json');

  data.push({ state, lga, year, ageGroup, gender, population });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json({ message: '✅ Population data added successfully' });
});


// Add Agriculture Data
app.post('/api/agriculture', (req, res) => {
  const { state, lga, year, crop, value } = req.body;

  if (!state || !lga || !year || !crop || !value) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }

  const filePath = path.join(__dirname, 'data', 'agriculture.json');
  const data = getData('agriculture.json');

  data.push({ state, lga, year, crop, value });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json({ message: '✅ Agriculture data added successfully' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
});
