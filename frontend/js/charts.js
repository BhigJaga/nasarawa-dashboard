async function fetchCPIData() {
  const res = await fetch('http://localhost:5000/api/cpi');
  return res.json();
}

function updateCPIChart(data, chart) {
  const labels = data.map(d => `${d.month} ${d.year}`);
  const values = data.map(d => parseFloat(d.value));
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

function setupCPIChart(rawData) {
  const ctx = document.getElementById('cpiChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'CPI',
        data: [],
        backgroundColor: 'rgba(0, 99, 255, 0.2)',
        borderColor: 'rgba(0, 99, 255, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });

  // Populate year dropdown
  const years = [...new Set(rawData.map(d => d.year))];
  const yearSelect = document.getElementById('yearFilter');
  years.sort().forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    yearSelect.appendChild(opt);
  });

  // Initial load
  updateCPIChart(rawData, chart);

  // Filters
  document.getElementById('lgaFilter').addEventListener('change', () => {
    applyFilters(rawData, chart);
  });
  document.getElementById('yearFilter').addEventListener('change', () => {
    applyFilters(rawData, chart);
  });
}

function applyFilters(data, chart) {
  const lga = document.getElementById('lgaFilter').value;
  const year = document.getElementById('yearFilter').value;

  let filtered = [...data];
  if (lga) filtered = filtered.filter(d => d.lga === lga);
  if (year) filtered = filtered.filter(d => d.year == year);

  updateCPIChart(filtered, chart);
}

// Load and setup on page load
if (document.getElementById('cpiChart')) {
  fetchCPIData().then(setupCPIChart);
}
// 🔵 Fetch & draw population chart
if (document.getElementById('populationChart')) {
  fetch('http://localhost:5000/api/population')
    .then(res => res.json())
    .then(data => {
      const grouped = {};
      data.forEach(item => {
        const key = `${item.year} ${item.gender}`;
        grouped[key] = (grouped[key] || 0) + parseInt(item.population);
      });

      const labels = Object.keys(grouped);
      const values = Object.values(grouped);

      new Chart(document.getElementById('populationChart'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Population Count',
            data: values,
            backgroundColor: '#36A2EB'
          }]
        }
      });
    });
}

// 🟢 Fetch & draw agriculture chart
if (document.getElementById('agricultureChart')) {
  fetch('http://localhost:5000/api/agriculture')
    .then(res => res.json())
    .then(data => {
      const crops = {};
      data.forEach(item => {
        crops[item.crop] = (crops[item.crop] || 0) + parseFloat(item.value);
      });

      const labels = Object.keys(crops);
      const values = Object.values(crops);

      new Chart(document.getElementById('agricultureChart'), {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Production (tonnes)',
            data: values,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ]
          }]
        }
      });
    });
}
