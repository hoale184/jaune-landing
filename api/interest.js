const AIRTABLE_BASE_ID = "appJITLq25NIcJdB0";
const AIRTABLE_TABLE_NAME = "Pre-Orders";

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

  const payload = {
    fields: {
      "Customer Name": customerName.trim(),
      "Email": email.trim(),
      "Price": Number(price) || 0,
      "Status": "Pending",
      "Order Submitted At": new Date().toISOString(),
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
