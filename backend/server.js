const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
const corsOptions = {
  origin: [
    'https://nasarawa-dashboard.onrender.com',
    'http://localhost:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ✅ Serve frontend statically if present
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Utility function
const getData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];
};

// ✅ File Upload Setup
const upload = multer({ dest: 'uploads/' });

// ✅ Routes

app.get('/', (req, res) => {
  res.send('🚀 API is running');
});

// GET endpoints
app.get('/api/cpi', (req, res) => res.json(getData('cpi.json')));
app.get('/api/population', (req, res) => res.json(getData('population.json')));
app.get('/api/agriculture', (req, res) => res.json(getData('agriculture.json')));

// Upload Excel
app.post('/api/upload', upload.single('excelFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;
    const validSheets = ['CPI', 'Population', 'Agriculture'];

    let processed = false;

    validSheets.forEach(sheet => {
      if (sheetNames.includes(sheet)) {
        processed = true;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        const filename = sheet.toLowerCase() + '.json';
        const filePath = path.join(__dirname, 'data', filename);
        const existing = getData(filename);
        const merged = [...existing, ...data];
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
      }
    });

    if (!processed) {
      return res.status(400).json({
        error: 'Excel must include sheet named: CPI, Population, or Agriculture'
      });
    }

    res.json({ message: '✅ Data uploaded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// POST manual CPI
app.post('/api/cpi', (req, res) => {
  const { state, lga, month, year, value, description } = req.body;
  if (!state || !lga || !month || !year || !value) {
    return res.status(400).json({ error: 'Missing required CPI fields' });
  }

  const filePath = path.join(__dirname, 'data', 'cpi.json');
  const data = getData('cpi.json');
  data.push({ state, lga, month, year, value, description });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ CPI data added' });
});

// POST manual Population
app.post('/api/population', (req, res) => {
  const { state, lga, year, ageGroup, gender, population } = req.body;
  if (!state || !lga || !year || !ageGroup || !gender || !population) {
    return res.status(400).json({ error: 'Missing population fields' });
  }

  const filePath = path.join(__dirname, 'data', 'population.json');
  const data = getData('population.json');
  data.push({ state, lga, year, ageGroup, gender, population });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ Population data added' });
});

// POST manual Agriculture
app.post('/api/agriculture', (req, res) => {
  const { state, lga, year, crop, value } = req.body;
  if (!state || !lga || !year || !crop || !value) {
    return res.status(400).json({ error: 'Missing agriculture fields' });
  }

  const filePath = path.join(__dirname, 'data', 'agriculture.json');
  const data = getData('agriculture.json');
  data.push({ state, lga, year, crop, value });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ Agriculture data added' });
});

// Clear all data
app.delete('/api/clear-data', (req, res) => {
  const files = ['cpi.json', 'population.json', 'agriculture.json'];

  try {
    files.forEach(file => {
      const filePath = path.join(__dirname, 'data', file);
      fs.writeFileSync(filePath, '[]');
    });

    res.json({ message: '✅ All data cleared!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
