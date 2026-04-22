/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({path: '.env.local'});
const fs = require('fs');

async function run() {
  const apiKey = process.env.NANONETS_API_KEY;
  const modelId = process.env.NANONETS_MODEL_ID;
  
  const formData = new FormData();
  formData.append('urls', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

  console.log("Sending URL to Nanonets...");
  try {
    const response = await fetch(
      `https://app.nanonets.com/api/v2/OCR/Model/${modelId}/LabelFile/`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64')
        },
        body: formData,
      }
    );
    
    if (!response.ok) {
      console.log("Error status:", response.status);
      console.log("Error text:", await response.text());
      return;
    }
    const data = await response.json();
    console.log("Success! Data keys:", Object.keys(data));
    console.log("Message:", data.message);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

run();
