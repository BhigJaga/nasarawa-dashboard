const BASE_URL = 'https://nasarawa-api.onrender.com'; // ✅ Your deployed API base

// CPI Submit
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
    const res = await fetch(`${BASE_URL}/api/cpi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || '✅ CPI submitted');
    this.reset();
  } catch (err) {
    alert('❌ Error submitting CPI');
    console.error(err);
  }
});

// Population Submit
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
    const res = await fetch(`${BASE_URL}/api/population`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || '✅ Population submitted');
    this.reset();
  } catch (err) {
    alert('❌ Error submitting population');
    console.error(err);
  }
});

// Agriculture Submit
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
    const res = await fetch(`${BASE_URL}/api/agriculture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || '✅ Agriculture submitted');
    this.reset();
  } catch (err) {
    alert('❌ Error submitting agriculture');
    console.error(err);
  }
});

// Excel Upload
document.getElementById('excelForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const fileInput = document.querySelector('input[name="excelFile"]');
  const formData = new FormData();
  if (!fileInput.files.length) {
    document.getElementById('uploadStatus').textContent = '❌ Select a file.';
    return;
  }

  formData.append('excelFile', fileInput.files[0]);

  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
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

// Logout
function logout() {
  localStorage.removeItem('adminLoggedIn');
  window.location.href = 'login.html';
}

// Toggle forms
function toggleForm(sectionId) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.style.display = section.id === sectionId ? 'block' : 'none';
  });
}
