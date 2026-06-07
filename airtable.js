const AIRTABLE_CONFIG = {
  baseId: "appJITLq25NIcJdB0/tblt4q0tlZbaIbMTl/viwnETnf6AGCqoCOU",
  tableName: "Pre-Orders",
  apiKey: "PASTE_AIRTABLE_PAT_HERE"
};

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
  }
};

let countdownTimer = null;

function getAirtableBaseId() {
  return AIRTABLE_CONFIG.baseId.split("/")[0];
}

function getAirtableTableName() {
  return encodeURIComponent(AIRTABLE_CONFIG.tableName);
}

function getAirtableTablePath() {
  return getAirtableTableName();
}

async function getAirtableError(response) {
  try {
    const data = await response.json();
    return data.error?.message || data.error?.type || `Airtable returned ${response.status}`;
  } catch {
    return `Airtable returned ${response.status}`;
  }
}

function openNotifyModal(productName, price) {
  const modal = document.getElementById("notify-modal");
  const form = document.getElementById("notify-form");
  const submitButton = document.getElementById("submit-btn");

  modal.classList.add("active");
  document.getElementById("modal-product-name").textContent = productName;
  form.dataset.product = productName;
  form.dataset.price = price;
  form.reset();
  submitButton.disabled = false;
  submitButton.textContent = "Giữ chỗ thông báo";
}

function closeNotifyModal() {
  document.getElementById("notify-modal").classList.remove("active");
}

function openSuccessModal() {
  closeNotifyModal();
  document.getElementById("success-modal").classList.add("active");

  const fill = document.getElementById("countdown-fill");
  fill.style.transition = "none";
  fill.style.width = "100%";
  fill.getBoundingClientRect();
  fill.style.transition = "width 3.5s linear";
  fill.style.width = "0%";

  countdownTimer = setTimeout(() => {
    closeSuccessModal();
  }, 3500);
}

function closeSuccessModal() {
  clearTimeout(countdownTimer);
  document.getElementById("success-modal").classList.remove("active");
}

document.getElementById("notify-modal").addEventListener("click", function (event) {
  if (event.target === this) closeNotifyModal();
});

document.getElementById("success-modal").addEventListener("click", function (event) {
  if (event.target === this) closeSuccessModal();
});

document.getElementById("notify-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const button = document.getElementById("submit-btn");
  const productName = this.dataset.product;
  const selectedSize = document.getElementById("field-size").value;
  const linkedItemId = PRODUCT_ITEM_RECORDS[productName]?.[selectedSize];

  if (!linkedItemId) {
    alert("Sản phẩm hoặc size này chưa có trong Airtable. Vui lòng thử lại nhé!");
    return;
  }

  if (AIRTABLE_CONFIG.apiKey === "PASTE_AIRTABLE_PAT_HERE") {
    alert("Chưa cấu hình Airtable token trong airtable.js.");
    return;
  }

  button.disabled = true;
  button.textContent = "Đang gửi...";

  const payload = {
    fields: {
      "Customer Name": document.getElementById("field-name").value.trim(),
      "Email": document.getElementById("field-email").value.trim(),
      "Items": [linkedItemId],
      "Price": parseInt(this.dataset.price, 10),
      "Status": "Pending",
      "Notes": `Interest capture — pretotype batch\nProduct: ${productName}\nSize: ${selectedSize}`
    }
  };

  try {
    const response = await fetch(`https://api.airtable.com/v0/${getAirtableBaseId()}/${getAirtableTablePath()}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_CONFIG.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      openSuccessModal();
    } else {
      throw new Error(await getAirtableError(response));
    }
  } catch (error) {
    console.error("Airtable submit failed:", error);
    button.disabled = false;
    button.textContent = "Giữ chỗ thông báo";
    setTimeout(() => {
      alert(`Có lỗi xảy ra. Vui lòng thử lại nhé!\n\nAirtable: ${error.message}`);
    }, 0);
  }
});
