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
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://nasarawa-dashboard.onrender.com',
      'http://localhost:5500'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight
app.use(express.json());

// ✅ Serve static files
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// ✅ Helper: Read JSON data
const getData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];
};

// ✅ Multer file upload
const upload = multer({ dest: 'uploads/' });

// ✅ Default route
app.get('/', (req, res) => {
  res.send('🚀 API is running');
});

// ✅ GET endpoints
app.get('/api/cpi', (req, res) => res.json(getData('cpi.json')));
app.get('/api/population', (req, res) => res.json(getData('population.json')));
app.get('/api/agriculture', (req, res) => res.json(getData('agriculture.json')));

// ✅ Upload Excel
app.post('/api/upload', upload.single('excelFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;
    const validSheets = ['CPI', 'Population', 'Agriculture'];
    let foundSheet = false;

    validSheets.forEach(sheet => {
      if (sheetNames.includes(sheet)) {
        foundSheet = true;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        const filename = sheet.toLowerCase() + '.json';
        const filePath = path.join(__dirname, 'data', filename);
        const existing = getData(filename);
        const merged = [...existing, ...data];
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
      }
    });

    if (!foundSheet) {
      return res.status(400).json({
        error: 'Excel file must contain sheet: CPI, Population, or Agriculture',
      });
    }

    res.json({ message: '✅ Data imported successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// ✅ Manual CPI entry
app.post('/api/cpi', (req, res) => {
  const { state, lga, month, year, value, description } = req.body;
  if (!state || !lga || !month || !year || !value) {
    return res.status(400).json({ error: 'Missing required CPI fields' });
  }

  const data = getData('cpi.json');
  data.push({ state, lga, month, year, value, description });
  fs.writeFileSync(path.join(__dirname, 'data', 'cpi.json'), JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ CPI data added' });
});

// ✅ Manual Population entry
app.post('/api/population', (req, res) => {
  const { state, lga, year, ageGroup, gender, population } = req.body;
  if (!state || !lga || !year || !ageGroup || !gender || !population) {
    return res.status(400).json({ error: 'Missing population fields' });
  }

  const data = getData('population.json');
  data.push({ state, lga, year, ageGroup, gender, population });
  fs.writeFileSync(path.join(__dirname, 'data', 'population.json'), JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ Population data added' });
});

// ✅ Manual Agriculture entry
app.post('/api/agriculture', (req, res) => {
  const { state, lga, year, crop, value } = req.body;
  if (!state || !lga || !year || !crop || !value) {
    return res.status(400).json({ error: 'Missing agriculture fields' });
  }

  const data = getData('agriculture.json');
  data.push({ state, lga, year, crop, value });
  fs.writeFileSync(path.join(__dirname, 'data', 'agriculture.json'), JSON.stringify(data, null, 2));
  res.status(201).json({ message: '✅ Agriculture data added' });
});

// ✅ Clear all data
app.delete('/api/clear-data', (req, res) => {
  const files = ['cpi.json', 'population.json', 'agriculture.json'];

  try {
    files.forEach(file => {
      fs.writeFileSync(path.join(__dirname, 'data', file), '[]');
    });
    res.json({ message: '✅ All data cleared!' });
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
