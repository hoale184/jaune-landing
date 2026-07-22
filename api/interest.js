const AIRTABLE_BASE_ID = "appJITLq25NIcJdB0";
const AIRTABLE_TABLE_NAME = "Pre-Orders";
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@gmail\.com(?:\.vn)?$/i;
const AIRTABLE_RETRY_DELAYS_MS = [700, 1800, 3500];
const MAX_RETRY_AFTER_MS = 4500;
const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const PRODUCT_ITEM_RECORDS = {
  "DORIE TOP": {
    S: "recbPoya6EEXMikXE",
    M: "rectmtMN0eM3Sepuz"
  },
  "FANIE TOP": {
    S: "recmFP3FzPTbOpNWv",
    M: "recbf0JxiiYTiJCmV"
  },
  "BLANIE TOP": {
    S: "recZblJnqnNdY57kS",
    M: "recoYCbejOJYooovH"
  },
  "SARIE TOP": {
    S: "recQJabxgWGlANmAm",
    M: "reczIpc21Oa8BNovz"
  },
  "BABIE TOP": {
    S: "reca5Z6WYbOQY4fdc",
    M: "recYPQav7g9zVPuEb"
  },
  "ELLIE TOP": {
    S: "recl80kLsQf4Ck28s",
    M: "recJRavdCF5lgfkPt"
  },
  "ELSIE TOP": {
    S: "recJ5gotceeFEe5Nk",
    M: "recJuosNL3AEippiQ"
  },
  "FARIE TOP": {
    S: "recvtPqjHrl4fV42t",
    M: "recLzlIY2CD8tvU9E"
  },
  "JULIE TOP": {
    S: "recr4syq9Csi5IHjc",
    M: "rec8M8lJn50om43X2"
  },
  "LORIE TOP": {
    S: "recMVQqedfnRCMMDR",
    M: "rec8G3UKo8GCfv1BX"
  },
  "ROSIE TOP": {
    S: "recHfk23CMfyGqawu",
    M: "rec1k942FzemcMve4"
  }
};

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

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryAfterMs(response) {
  const retryAfter = response.headers.get("retry-after");

  if (!retryAfter) return null;

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(retryAfterSeconds * 1000, 0);
  }

  const retryAfterDate = Date.parse(retryAfter);
  if (Number.isFinite(retryAfterDate)) {
    return Math.max(retryAfterDate - Date.now(), 0);
  }

  return null;
}

function getRetryDelay(response, attempt) {
  const retryAfterMs = response ? getRetryAfterMs(response) : null;
  const fallbackDelay = AIRTABLE_RETRY_DELAYS_MS[attempt] || AIRTABLE_RETRY_DELAYS_MS[AIRTABLE_RETRY_DELAYS_MS.length - 1];

  if (retryAfterMs === null) return fallbackDelay;

  return Math.min(Math.max(retryAfterMs, fallbackDelay), MAX_RETRY_AFTER_MS);
}

async function submitToAirtable(airtableToken, payload) {
  let lastResult = {
    ok: false,
    status: 503,
    error: "Unable to submit interest request",
    retryable: true
  };

  for (let attempt = 0; attempt <= AIRTABLE_RETRY_DELAYS_MS.length; attempt += 1) {
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

      if (airtableResponse.ok) {
        return {
          ok: true,
          data: await airtableResponse.json()
        };
      }

      const error = await getAirtableError(airtableResponse);
      const retryable = RETRYABLE_STATUSES.has(airtableResponse.status);
      lastResult = {
        ok: false,
        status: airtableResponse.status,
        error,
        retryable
      };

      if (!retryable || attempt === AIRTABLE_RETRY_DELAYS_MS.length) {
        return lastResult;
      }

      await wait(getRetryDelay(airtableResponse, attempt));
    } catch {
      lastResult = {
        ok: false,
        status: 503,
        error: "Unable to submit interest request",
        retryable: true
      };

      if (attempt === AIRTABLE_RETRY_DELAYS_MS.length) {
        return lastResult;
      }

      await wait(getRetryDelay(null, attempt));
    }
  }

  return lastResult;
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

  const { customerName, email, productName, size, price, clientSubmissionId } = body;
  const linkedItemId = PRODUCT_ITEM_RECORDS[productName]?.[size];
  const normalizedSubmissionId =
    typeof clientSubmissionId === "string" ? clientSubmissionId.trim().slice(0, 80) : "";

  if (
    typeof customerName !== "string" ||
    typeof email !== "string" ||
    typeof productName !== "string" ||
    typeof size !== "string" ||
    !customerName.trim() ||
    !email.trim() ||
    !productName.trim() ||
    !size.trim()
  ) {
    sendJson(response, 400, { error: "Missing or invalid preorder details" });
    return;
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    sendJson(response, 400, { error: "Email phải có đuôi @gmail.com hoặc @gmail.com.vn" });
    return;
  }

  if (!linkedItemId) {
    sendJson(response, 422, { error: `No Collection Items record configured for ${productName} / Size ${size}` });
    return;
  }

  const payload = {
    fields: {
      "Customer Name": customerName.trim(),
      "Email": email.trim().toLowerCase(),
      "Items": [linkedItemId],
      "Price": Number(price) || 0,
      "Status": "Pending",
      "Notes": [
        "Interest capture — pretotype batch",
        `Product: ${productName}`,
        `Size: ${size}`,
        normalizedSubmissionId ? `Submission ID: ${normalizedSubmissionId}` : ""
      ]
        .filter(Boolean)
        .join("\n")
    }
  };

  const result = await submitToAirtable(airtableToken, payload);

  if (!result.ok) {
    sendJson(response, result.status, {
      error: result.error,
      retryable: result.retryable
    });
    return;
  }

  sendJson(response, 200, { id: result.data.id });
};
