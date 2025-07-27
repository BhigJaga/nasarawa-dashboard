const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure required directories exist
['uploads', 'data'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
});

// ✅ CORS Configuration - Allow frontend origins
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://nasarawa-dashboard.onrender.com'],
  methods: ['GET', 'POST'],
  credentials: false
}));

app.use(express.json());

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ Helper to read JSON data from files
const getData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];
};

// ✅ Multer setup for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads/')
});

// ✅ GET Endpoints
app.get('/api/cpi', (req, res) => res.json(getData('cpi.json')));
app.get('/api/population', (req, res) => res.json(getData('population.json')));
app.get('/api/agriculture', (req, res) => res.json(getData('agriculture.json')));

// ✅ Excel File Upload Endpoint
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
      return res.status(400).json({ error: 'Excel file must include a sheet named CPI, Population, or Agriculture' });
    }

    res.json({ message: '✅ Data imported successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// ✅ Manual CPI form POST
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

// ✅ Manual Population form POST
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

// ✅ Manual Agriculture form POST
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

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
