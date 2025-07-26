// 🟦 CPI FORM SUBMIT
document.getElementById('cpiForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    state: this.state.value,
    lga: this.lga.value,
    month: this.month.value,
    year: this.year.value,
    value: this.value.value,
    description: this.description.value || ''
  };

  try {
    const res = await fetch('http://localhost:5000/api/cpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || 'CPI submitted!');
    this.reset();
  } catch (err) {
    alert('Error submitting CPI');
    console.error(err);
  }
});

// 🟩 POPULATION FORM SUBMIT
document.getElementById('populationForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    state: this.state.value,
    lga: this.lga.value,
    year: this.year.value,
    ageGroup: this.ageGroup.value,
    gender: this.gender.value,
    population: this.population.value
  };

  try {
    const res = await fetch('http://localhost:5000/api/population', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || 'Population submitted!');
    this.reset();
  } catch (err) {
    alert('Error submitting population data');
    console.error(err);
  }
});

// 🟨 AGRICULTURE FORM SUBMIT
document.getElementById('agricultureForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    state: this.state.value,
    lga: this.lga.value,
    year: this.year.value,
    crop: this.crop.value,
    value: this.value.value
  };

  try {
    const res = await fetch('http://localhost:5000/api/agriculture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || 'Agriculture data submitted!');
    this.reset();
  } catch (err) {
    alert('Error submitting agriculture data');
    console.error(err);
  }
});
function logout() {
  // Clear any saved login state (if using localStorage/sessionStorage)
  localStorage.removeItem('adminLoggedIn');

  // Redirect to login page
  window.location.href = 'login.html';
}
function toggleForm(sectionId) {
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? 'block' : 'none';
  });
}
document.getElementById('excelForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.querySelector('input[name="excelFile"]');
  formData.append('excelFile', fileInput.files[0]);

  try {
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    document.getElementById('uploadStatus').textContent = result.message || result.error;
  } catch (err) {
    document.getElementById('uploadStatus').textContent = '❌ Upload failed.';
    console.error(err);
  }
});
