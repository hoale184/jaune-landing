let countdownTimer = null;
const SUBMIT_BUTTON_TEXT = "Hoàn tất";

async function getSubmitError(response) {
  try {
    const data = await response.json();
    return data.error || `Server returned ${response.status}`;
  } catch {
    return `Server returned ${response.status}`;
  }
}

function isLocalStaticPreview() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname);
}

function isStaticServerResponse(response) {
  return isLocalStaticPreview() && [404, 405, 501].includes(response.status);
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
  submitButton.textContent = SUBMIT_BUTTON_TEXT;
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

  if (window.location.protocol === "file:") {
    alert("Form cần chạy trên Vercel production để gửi dữ liệu. Bản file local chỉ dùng để xem UI.");
    return;
  }

  button.disabled = true;
  button.textContent = "Đang gửi...";

  const payload = {
    customerName: document.getElementById("field-name").value.trim(),
    email: document.getElementById("field-email").value.trim(),
    productName,
    size: selectedSize,
    price: parseInt(this.dataset.price, 10)
  };

  try {
    const response = await fetch("/api/interest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      openSuccessModal();
    } else if (isStaticServerResponse(response)) {
      console.warn("Local static preview does not run Vercel Functions. Showing success UI without writing to Airtable.");
      openSuccessModal();
    } else {
      throw new Error(await getSubmitError(response));
    }
  } catch (error) {
    console.error("Interest submit failed:", error);
    button.disabled = false;
    button.textContent = SUBMIT_BUTTON_TEXT;
    setTimeout(() => {
      alert(`Có lỗi xảy ra. Vui lòng thử lại nhé!\n\n${error.message}`);
    }, 0);
  }
});

window.openNotifyModal = openNotifyModal;
window.closeNotifyModal = closeNotifyModal;
window.openSuccessModal = openSuccessModal;
window.closeSuccessModal = closeSuccessModal;
