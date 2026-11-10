require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const CONFIG_URL = process.env.CONFIG_URL;
const LOG_URL = process.env.LOG_URL;
const LOG_API_TOKEN = process.env.LOG_API_TOKEN;

async function fetchDroneConfig(droneId) {
  const response = await fetch(CONFIG_URL);
  if (!response.ok) throw new Error('Failed to fetch from Config Server');
  const result = await response.json();
  const list = Array.isArray(result) ? result : (result.data || []);
  return list.find(item => Number(item.drone_id) === Number(droneId));
}

app.get('/configs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const drone = await fetchDroneConfig(droneId);

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    res.json({
      drone_id: drone.drone_id,
      drone_name: drone.drone_name,
      light: drone.light,
      country: drone.country,
      weight: drone.weight
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/status/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const drone = await fetchDroneConfig(droneId);

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    res.json({
      condition: drone.condition
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/logs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 12;

    const query = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sort: '-created',
      filter: `(drone_id=${Number(droneId)})`
    });

    const response = await fetch(`${LOG_URL}?${query.toString()}`, {
      headers: {
        'Authorization': `Bearer ${LOG_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Log Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const formattedLogs = (data.items || []).map(item => ({
      drone_id: item.drone_id,
      drone_name: item.drone_name,
      created: item.created,
      country: item.country,
      celsius: item.celsius
    }));

    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/logs', async (req, res) => {
  try {
    const { drone_id, drone_name, country, celsius } = req.body;

    const payload = {
      drone_id: Number(drone_id),
      drone_name: String(drone_name),
      country: String(country),
      celsius: Number(celsius)
    };

    const response = await fetch(LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOG_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create log: ${errText}`);
    }

    const createdRecord = await response.json();
    res.status(201).json(createdRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});