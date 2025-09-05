require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: ['http://localhost:8081', 'http://127.0.0.1:8081'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.post('/api/id-analyzer/scan', async (req, res) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_ID_ANALYZER_API_KEY || process.env.ID_ANALYZER_API_KEY;
    const region = process.env.ID_ANALYZER_REGION || 'US';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    let baseUrl;
    switch (region) {
      case 'EU':
        baseUrl = 'https://api2-eu.idanalyzer.com';
        break;
      case 'AS':
        baseUrl = 'https://api2-as.idanalyzer.com';
        break;
      default:
        baseUrl = 'https://api2.idanalyzer.com';
    }

    const response = await fetch(`${baseUrl}/scan`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'ID Analyzer API error', details: errorText });
    }

    const data = await response.json();
    
    const transformField = (field) => {
      if (Array.isArray(field) && field.length > 0) {
        return field[0].value || '';
      }
      return field || '';
    };

    const toCamelCase = (str) => {
      if (!str) return '';
      return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const transformedResult = {};
    if (data.data) {
      Object.keys(data.data).forEach(key => {
        transformedResult[key] = transformField(data.data[key]);
      });
    }
    
    const mappedResult = {
      first_name: toCamelCase(transformedResult.firstName) || '',
      last_name: toCamelCase(transformedResult.lastName) || '',
      full_name: toCamelCase(transformedResult.fullName) || '',
      rut: transformedResult.personalNumber || '',
      birth_date: transformedResult.dob || '',
      residence_country: transformedResult.countryFull || '',
      
      firstName: toCamelCase(transformedResult.firstName) || '',
      lastName: toCamelCase(transformedResult.lastName) || '',
      fullName: toCamelCase(transformedResult.fullName) || '',
      documentNumber: transformedResult.personalNumber || '',
      dateOfBirth: transformedResult.dob || '',
      birthdate: transformedResult.dob || '',
      nationality: transformedResult.countryFull || '',
      documentType: transformedResult.documentName || '',
      expiryDate: transformedResult.expiry || '',
      issueDate: transformedResult.issued || '',
      address: '',
      region: '',
      commune: '',
      confidence: data.reviewScore || 0,
      authenticity: {
        score: 0,
        decision: data.decision || 'review',
        tampered: false
      }
    };

    const transformedResponse = {
      success: data.success || false,
      result: mappedResult,
      error: data.warning || undefined,
      confidence: data.reviewScore || 0,
      decision: data.decision || 'review'
    };
    
    res.json(transformedResponse);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
});

app.listen(PORT, () => {

});
