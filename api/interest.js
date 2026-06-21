const AIRTABLE_BASE_ID = "appJITLq25NIcJdB0";
const AIRTABLE_TABLE_NAME = "Pre-Orders";
const AIRTABLE_ITEMS_TABLE_NAME = "Collection Items";

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

async function getAirtableError(response) {
  try {
    const data = await response.json();
    return data.error?.message || data.error?.type || `Airtable returned ${response.status}`;
  } catch {
    return `Airtable returned ${response.status}`;
  }
}

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return request.body || {};
}

function normalizeValue(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchableValues(value) {
  if (Array.isArray(value)) return value.flatMap(getSearchableValues);
  if (value && typeof value === "object") return Object.values(value).flatMap(getSearchableValues);
  return value === null || value === undefined ? [] : [normalizeValue(value)];
}

async function getCollectionItems(airtableToken) {
  const records = [];
  let offset = null;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ITEMS_TABLE_NAME)}?${params}`,
      {
        headers: {
          "Authorization": `Bearer ${airtableToken}`
        }
      }
    );

    if (!response.ok) throw new Error(await getAirtableError(response));

    const data = await response.json();
    records.push(...(data.records || []));
    offset = data.offset || null;
  } while (offset);

  return records;
}

function findCollectionItem(records, productName, size) {
  const product = normalizeValue(productName);
  const shortProduct = product.replace(/\s+top$/, "");
  const normalizedSize = normalizeValue(size);
  const sizePattern = new RegExp(`(^|\\s)${normalizedSize}($|\\s)`);

  return records.find((record) => {
    const values = Object.values(record.fields || {}).flatMap(getSearchableValues);
    const productMatches = values.some(
      (value) => value.includes(product) || (shortProduct.length > 2 && value.includes(shortProduct))
    );
    const sizeMatches = values.some((value) => value === normalizedSize || sizePattern.test(value));
    return productMatches && sizeMatches;
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const airtableToken = process.env.AIRTABLE_TOKEN;

  if (!airtableToken) {
    sendJson(response, 500, { error: "Missing AIRTABLE_TOKEN environment variable" });
    return;
  }

  let body;

  try {
    body = parseBody(request);
  } catch {
    sendJson(response, 400, { error: "Invalid JSON body" });
    return;
  }

  const { customerName, email, productName, size, price } = body;

  if (!customerName || !email || !productName || !size) {
    sendJson(response, 400, { error: "Missing or invalid preorder details" });
    return;
  }

  let collectionItem;

  try {
    const collectionItems = await getCollectionItems(airtableToken);
    collectionItem = findCollectionItem(collectionItems, productName, size);
  } catch (error) {
    sendJson(response, 502, { error: `Unable to read Collection Items: ${error.message}` });
    return;
  }

  if (!collectionItem) {
    sendJson(response, 422, { error: `No Collection Items record found for ${productName} / Size ${size}` });
    return;
  }

  const payload = {
    fields: {
      "Customer Name": customerName.trim(),
      "Email": email.trim(),
      "Items": [collectionItem.id],
      "Price": Number(price) || 0,
      "Status": "Pending",
      "Notes": `Interest capture — pretotype batch\nProduct: ${productName}\nSize: ${size}`
    }
  };

  try {
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${airtableToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!airtableResponse.ok) {
      sendJson(response, airtableResponse.status, { error: await getAirtableError(airtableResponse) });
      return;
    }

    const data = await airtableResponse.json();
    sendJson(response, 200, { id: data.id });
  } catch {
    sendJson(response, 500, { error: "Unable to submit interest request" });
  }
};
