const express = require('express');
const cors = require('cors');
const maxmind = require('@maxmind/geoip2-node');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.GEOIP_DB_PATH || path.join(__dirname, 'GeoLite2-City.mmdb');

let reader = null;

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim().replace(/^::ffff:/, '');
  }
  return (req.socket?.remoteAddress || req.ip || '').replace(/^::ffff:/, '');
}

async function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`GeoIP database not found at ${DB_PATH}`);
  }
  reader = await maxmind.open(DB_PATH);
  console.log(`Loaded GeoIP database: ${DB_PATH}`);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, dbLoaded: !!reader });
});

app.get('/api/ip-location', async (req, res) => {
  try {
    if (!reader) {
      return res.status(503).json({
        ok: false,
        error: 'GeoIP database not loaded'
      });
    }

    const ip = String(req.query.ip || getClientIp(req)).trim();
    if (!ip) {
      return res.status(400).json({
        ok: false,
        error: 'Missing IP'
      });
    }

    const record = reader.city(ip);

    const country = record?.country?.names?.en || null;
    const countryCode = record?.country?.isoCode || null;
    const region = record?.subdivisions?.[0]?.names?.en || null;
    const regionCode = record?.subdivisions?.[0]?.isoCode || null;

    res.json({
      ok: true,
      ip,
      country,
      countryCode,
      region,
      regionCode
    });
  } catch (err) {
    if (err && (err.name === 'AddressNotFoundError' || /not found/i.test(err.message))) {
      return res.json({
        ok: true,
        ip: String(req.query.ip || getClientIp(req)).trim(),
        country: null,
        countryCode: null,
        region: null,
        regionCode: null
      });
    }

    console.error(err);
    res.status(500).json({
      ok: false,
      error: 'Lookup failed'
    });
  }
});

(async () => {
  await loadDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
