let populationData = [];
let chart = null;

window.onload = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/population');
    populationData = await res.json();
    applyPopulationFilters();
  } catch (err) {
    document.getElementById('noData').textContent = "Error loading data.";
    document.getElementById('noData').style.display = "block";
  }
};

function applyPopulationFilters() {
  const lga = document.getElementById('lgaFilter').value;
  const gender = document.getElementById('genderFilter').value;
  const age = document.getElementById('ageFilter').value.trim().toLowerCase();

  const filtered = populationData.filter(item => {
    return (!lga || item.lga === lga) &&
           (!gender || item.gender === gender) &&
           (!age || item.ageGroup.toLowerCase().includes(age));
  });

  renderPopulationChart(filtered);
}

function renderPopulationChart(data) {
  const noDataEl = document.getElementById('noData');
  const canvas = document.getElementById('populationChart');

  if (data.length === 0) {
    noDataEl.style.display = "block";
    canvas.style.display = "none";
    if (chart) chart.destroy();
    return;
  }

  noDataEl.style.display = "none";
  canvas.style.display = "block";

  const labels = data.map(d => `${d.lga} (${d.ageGroup})`);
  const values = data.map(d => d.population);

  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Population Count',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'blue',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
