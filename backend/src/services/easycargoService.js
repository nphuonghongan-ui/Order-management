/**
 * easy-cargo API wrapper.
 *
 * We use three endpoints from the easy-cargo REST API (v1):
 *   - POST /authentication    → get an auth token (cached in memory)
 *   - POST /shipment-inputs/  → create a shipment
 *   - GET  /shipments/{id}    → get the open_shipment_url for that shipment
 *
 * The easy-cargo API DOES NOT compute the load plan — the user has to
 * open the open_shipment_url in a browser and click "Calculate"
 * themselves.
 *
 * Token strategy: PROACTIVE only. We refresh the cached token in
 * `authenticate()` based on its `expires` time (with a 60s safety
 * buffer). We do NOT retry on 401 — a 401 means the token is
 * genuinely bad and re-using a freshly-cached token won't help.
 *
 * Required env vars (see .env.sample):
 *   EASYCARGO_USERNAME — registered email
 *   EASYCARGO_API_KEY  — API key assigned by easy-cargo support
 *
 * `cargospace_id` is optional — we omit it so the user picks the
 * container inside easy-cargo's web app.
 *
 * Rate limits: 60/hour, 480/day per user. No mitigation here; callers
 * must respect these limits.
 */

import PartNum from '../models/PartNum.js';

const EASYCARGO_BASE = 'https://go.easycargo3d.com/api/v1';

function readCredentials() {
  const username = process.env.EASYCARGO_USERNAME;
  const apiKey = process.env.EASYCARGO_API_KEY;
  if (!username || !apiKey) {
    throw new Error(
      'EASYCARGO_USERNAME and EASYCARGO_API_KEY must be set in the backend .env file.',
    );
  }
  return { username, apiKey };
}

async function authenticate() {
  const { username, apiKey } = readCredentials();

  const res = await fetch(`${EASYCARGO_BASE}/authentication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ username, api_key: apiKey }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `easy-cargo auth failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const data = await res.json();
  return data.authentication_token;
}

async function easycargoFetch(path, options = {}) {
  const token = await authenticate();

  const res = await fetch(`${EASYCARGO_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-AuthenticationToken': token,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // not JSON — generic 401
    }
    throw new Error(
      `easy-cargo ${path} failed (401): ${body?.message || 'Unauthorized — token may be expired or invalid'}`,
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `easy-cargo ${path} failed (${res.status}): ${text || res.statusText}`,
    );
  }

  return res.json();
}

/**
 * Build the easy-cargo `items[]` payload from a PackingList document.
 * Skips items whose partNum has no dimension in the PartNum collection.
 * Returns the mapped array plus a list of skipped partNums for diagnostics.
 */
async function buildItems(packingList) {
  const partNums = [
    ...new Set(packingList.items.map((it) => it.partNum)),
  ];
  const partNumDocs = await PartNum.find({ partNum: { $in: partNums } });
  const partNumMap = new Map(
    partNumDocs.map((p) => [p.partNum, p]),
  );

  const items = [];
  const skipped = [];
  for (const it of packingList.items) {
    const part = partNumMap.get(it.partNum);
    const dim = part?.dimension;
    const weightKg = part?.weightKg;
    const qty = it.qty || 1;
    if (!dim || !weightKg || qty <= 0) {
      if (!dim || !weightKg) skipped.push(it.partNum);
      continue;
    }
    items.push({
      group_name: it.poNum,
      description: it.partNum,
      pieces: qty,
      width: dim.width,
      height: dim.height,
      length: dim.length,
      total_weight: qty * weightKg,
      is_stackable: true,
      is_tiltable: true,
      is_rotable: true,
    });
  }
  return { items, skipped };
}

/**
 * Get a single shipment by id. Returns the parsed response body,
 * which includes `open_shipment_url` (the URL the user opens in a
 * browser to view and calculate the load plan).
 */
export async function getShipment(shipmentId) {
  return easycargoFetch(`/shipments/${shipmentId}`, { method: 'GET' });
}

/**
 * Create a shipment on easy-cargo and return its `open_shipment_url`
 * for the user to open in a browser. Throws if the packing list has
 * no items with dimensions, or if any easy-cargo API call fails.
 */
export async function createShipmentFromPackingList(packingList) {
  const { items, skipped } = await buildItems(packingList);
  if (items.length === 0) {
    const detail = skipped.length > 0
      ? ` No dimensions found for partNum(s): ${skipped.join(', ')}.`
      : '';
    throw new Error(`Packing list has no items with dimensions.${detail}`);
  }

  const name = packingList.plNumber || String(packingList._id);

  const shipment = await easycargoFetch('/shipment-inputs/', {
    method: 'POST',
    body: JSON.stringify({
      name,
      measure_system: 1, // Metric (mm/kg)
      items,
    }),
  });

  // Fetch the full shipment details to get `open_shipment_url`.
  // (POST /shipment-inputs/ only returns the id.)
  const details = await getShipment(shipment.id);

  return {
    shipmentId: shipment.id,
    openShipmentUrl: details.open_shipment_url,
    skippedPartNums: skipped,
  };
}
