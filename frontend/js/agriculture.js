async function fetchAgricultureData() {
  const res = await fetch('http://localhost:5000/api/agriculture');
  return await res.json();
}

let chart;

function renderChart(data) {
  const ctx = document.getElementById('agricultureChart').getContext('2d');

  const labels = data.map(d => `${d.crop} (${d.lga})`);
  const values = data.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Production (tonnes)',
        data: values,
        backgroundColor: 'rgba(76, 175, 80, 0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: 'Agriculture Production (Tonnes)'
        }
      }
    }
  });
}

function filterAgriculture() {
  const lga = document.getElementById('filterLGA').value.toLowerCase();
  const year = document.getElementById('filterYear').value;
  const crop = document.getElementById('filterCrop').value.toLowerCase();

  fetchAgricultureData().then(data => {
    let filtered = data;

    if (lga) {
      filtered = filtered.filter(item => item.lga.toLowerCase() === lga);
    }
    if (year) {
      filtered = filtered.filter(item => item.year == year);
    }
    if (crop) {
      filtered = filtered.filter(item => item.crop.toLowerCase().includes(crop));
    }

    if (filtered.length === 0) {
      document.getElementById('agricultureChart').style.display = 'none';
      document.getElementById('noData').style.display = 'block';
    } else {
      document.getElementById('agricultureChart').style.display = 'block';
      document.getElementById('noData').style.display = 'none';
      renderChart(filtered);
    }
  });
}

// Load data initially
filterAgriculture();
