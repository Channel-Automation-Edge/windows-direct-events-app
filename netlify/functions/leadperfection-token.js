// Netlify Function for LeadPerfection Token Authentication
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // API credentials
    const API_CREDENTIALS = {
      grant_type: 'password',
      username: 'ChannelAutomation',
      password: 'ChannelAutomation',
      clientid: 'wq55a',
      appkey: process.env.VITE_LEAD_PERFECTION_APP_KEY
    };

    // Create form data
    const formData = new URLSearchParams();
    Object.entries(API_CREDENTIALS).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make request to LeadPerfection API
    const response = await fetch('https://api.leadperfection.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: data
    };

  } catch (error) {
    console.error('Error in token function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
