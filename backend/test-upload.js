const fs = require('fs');

async function test() {
  try {
    const formData = new FormData();
    const pdfBuffer = fs.readFileSync('./node_modules/pdf-parse/test/data/01-valid.pdf');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('resume', blob, '01-valid.pdf');
    formData.append('targetRole', 'Software Engineer');

    const response = await fetch('http://localhost:5000/api/upload-resume', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
