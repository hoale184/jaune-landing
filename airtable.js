let countdownTimer = null;
let galleryResizeHandler = null;
const trackedProductViews = new Set();
const SUBMIT_BUTTON_TEXT = "Hoàn tất";
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@gmail\.com(?:\.vn)?$/i;
const OPTIMIZED_IMAGE_VERSIONS = {
  Babie_top_1: "20260621",
  Fanie_top_4: "20260621"
};
const JAUNE_PRODUCTS = {
  dorie: {
    slug: "dorie",
    name: "DORIE TOP",
    price: 310000,
    description:
      "Áo thun dài tay basic với đường cổ rộng vừa phải, thiết kế để layer ngoài áo hai dây Sarie hoặc mặc đơn đều đẹp. Chất thun mềm, co dãn thoải mái. Thiết kế nhét mút rời dễ mặc, hai lớp để tạo form chuẩn.",
    images: [
      "images/Dorie_top_1.png",
      "images/Dorie_top_2.png",
      "images/Dorie_top_3.png",
      "images/Dorie_top_4.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  fanie: {
    slug: "fanie",
    name: "FANIE TOP",
    price: 260000,
    description:
      "Áo thun ngắn tay cổ tròn rộng, chất thun co dãn ôm sát vừa đủ — không quá tight fit mà vẫn tôn dáng. Dễ mix với jeans, chân váy hay layer trong blazer. Thiết kế nhét mút rời dễ mặc, hai lớp để tạo form chuẩn.",
    images: [
      "images/Fanie_top_1.jpeg",
      "images/Fanie_top_2.jpeg",
      "images/Fanie_top_3.jpeg",
      "images/Fanie_top_4.png"
    ],
    pairIndexes: [1, 2],
    sizes: ["S", "M"]
  },
  blanie: {
    slug: "blanie",
    name: "BLANIE TOP",
    price: 300000,
    description:
      "Áo ngắn tay khoét lưng, chất poly spandex tight fitting ôm trọn đường cong. Nữ tính, quyến rũ vừa đủ mà không over — đẹp nhất khi kết hợp quần cạp cao hoặc chân váy midi. Thiết kế nhét mút rời dễ mặc, hai lớp để tạo form chuẩn.",
    images: [
      "images/Blanie_top_1.png",
      "images/Blanie_top_2.png",
      "images/Blanie_top_3.png",
      "images/Blanie_top_4.png"
    ],
    pairIndexes: [1, 2],
    sizes: ["S", "M"]
  },
  sarie: {
    slug: "sarie",
    name: "SARIE TOP",
    price: 230000,
    description:
      "Áo hai dây thun gân mềm, fit vừa đủ không quá ôm. Item essential nâng cấp mọi outfit — mặc trong Dorie, layer dưới blazer, hay diện solo ngày nắng đều gọn gàng. Thiết kế nhét mút rời dễ mặc, hai lớp để tạo form chuẩn.",
    images: [
      "images/Sarie_top_1.png",
      "images/Sarie_top_2.png",
      "images/Sarie_top_3.png",
      "images/Sarie_top_4.png"
    ],
    pairIndexes: [1, 2],
    sizes: ["S", "M"]
  },
  babie: {
    slug: "babie",
    name: "BABIE TOP",
    price: 280000,
    description:
      "Áo thun ngắn tay cổ rộng, vải co dãn mold theo body tự nhiên. Form ôm vừa phải, tôn dáng mà vẫn thoải mái suốt ngày. Thiết kế nhét mút rời dễ mặc, hai lớp để tạo form chuẩn.",
    images: [
      "images/Babie_top_1.png",
      "images/Babie_top_2.png",
      "images/Babie_top_3.jpeg",
      "images/Babie_top_4.png"
    ],
    pairIndexes: [1, 2],
    sizes: ["S", "M"]
  }
};

function formatPrice(price) {
  return `${Number(price).toLocaleString("en-US")}đ`;
}

function trackMetaEvent(eventName, parameters) {
  if (typeof window.fbq !== "function") return false;

  try {
    window.fbq("track", eventName, parameters);
    return true;
  } catch (error) {
    console.warn(`Meta Pixel event ${eventName} was not sent:`, error);
    return false;
  }
}

function trackProductView(product) {
  if (trackedProductViews.has(product.slug)) return;

  const wasTracked = trackMetaEvent("ViewContent", {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "VND"
  });

  if (wasTracked) trackedProductViews.add(product.slug);
}

function setEmailError(message = "") {
  const emailField = document.getElementById("field-email");
  const errorMessage = document.getElementById("field-email-error");
  const hasError = Boolean(message);

  emailField.setAttribute("aria-invalid", String(hasError));
  errorMessage.textContent = message;
  errorMessage.hidden = !hasError;
}

function validateEmailField() {
  const emailField = document.getElementById("field-email");
  const email = emailField.value.trim();

  if (!email) {
    setEmailError("Vui lòng nhập email Gmail. Ví dụ: hoa@gmail.com");
    return false;
  }

  if (!EMAIL_PATTERN.test(email)) {
    setEmailError("Email cần kết thúc bằng @gmail.com hoặc @gmail.com.vn. Ví dụ: hoa@gmail.com");
    return false;
  }

  setEmailError();
  return true;
}

function getOptimizedImageSources(source) {
  const fileName = source.split("/").pop();
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const version = OPTIMIZED_IMAGE_VERSIONS[baseName];
  const optimizedBase = `images/optimized/${baseName}${version ? `-${version}` : ""}`;

  return {
    mobile: `${optimizedBase}-960.webp`,
    desktop: `${optimizedBase}-1440.webp`
  };
}

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

function openNotifyModal(productName, price, selectedSize, productSlug) {
  const modal = document.getElementById("notify-modal");
  const form = document.getElementById("notify-form");
  const submitButton = document.getElementById("submit-btn");
  const sizeField = document.getElementById("field-size");

  modal.classList.add("active");
  document.getElementById("modal-product-name").textContent = productName;
  form.dataset.product = productName;
  if (productSlug) form.dataset.productSlug = productSlug;
  else delete form.dataset.productSlug;
  form.dataset.price = price;
  form.reset();
  setEmailError();
  if (selectedSize) sizeField.value = selectedSize;
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

const emailField = document.getElementById("field-email");
const notifyForm = document.getElementById("notify-form");
const submitButton = document.getElementById("submit-btn");
emailField.addEventListener("invalid", (event) => {
  event.preventDefault();
  validateEmailField();
  emailField.focus();
});
emailField.addEventListener("input", () => {
  if (emailField.getAttribute("aria-invalid") === "true") validateEmailField();
});
emailField.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  emailField.blur();
});

notifyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});

submitButton.addEventListener("click", async function () {
  if (submitButton.disabled) return;

  if (!validateEmailField()) {
    emailField.focus();
    return;
  }

  if (!notifyForm.reportValidity()) return;

  const button = submitButton;
  const productName = notifyForm.dataset.product;
  const productSlug = notifyForm.dataset.productSlug;
  const selectedSize = document.getElementById("field-size").value;

  if (window.location.protocol === "file:") {
    alert("Form cần chạy trên Vercel production để gửi dữ liệu. Bản file local chỉ dùng để xem UI.");
    return;
  }

  button.disabled = true;
  button.textContent = "Đang gửi...";

  const payload = {
    customerName: document.getElementById("field-name").value.trim(),
    email: emailField.value.trim().toLowerCase(),
    productName,
    size: selectedSize,
    price: parseInt(notifyForm.dataset.price, 10)
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
      if (productSlug) {
        trackMetaEvent("Lead", {
          content_ids: [productSlug],
          content_name: productName,
          content_type: "product",
          value: payload.price,
          currency: "VND",
          size: selectedSize
        });
      }
      openSuccessModal();
    } else if (isStaticServerResponse(response)) {
      throw new Error("Local static preview does not run /api/interest, so this test was not saved to Airtable. Test on Vercel production or with Vercel dev.");
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
window.JAUNE_PRODUCTS = JAUNE_PRODUCTS;

function renderProductDetail() {
  const detailPage = document.getElementById("product-detail-page");
  if (!detailPage) return;

  const params = new URLSearchParams(window.location.search);
  const product = JAUNE_PRODUCTS[params.get("product")] || JAUNE_PRODUCTS.dorie;
  const pairIndexes = product.pairIndexes || [1, 2];
  let selectedSize = product.sizes[0];

  document.title = `JAUNE | ${product.name}`;
  document.getElementById("detail-name").textContent = product.name;
  document.getElementById("detail-price").textContent = formatPrice(product.price);
  document.getElementById("detail-description").textContent = product.description;
  trackProductView(product);

  const gallery = document.getElementById("detail-gallery");
  gallery.dataset.product = product.slug;
  const imageRatios = [];
  const updateDesktopRowHeight = () => {
    const firstRatio = imageRatios[pairIndexes[0]];
    const secondRatio = imageRatios[pairIndexes[1]];
    if (!firstRatio || !secondRatio) return;

    const rowGap = 16;
    const availableWidth = Math.max(gallery.clientWidth - rowGap, 1);
    const rowHeight = Math.floor(availableWidth / (firstRatio + secondRatio));
    gallery.style.setProperty("--detail-row-height", `${Math.min(rowHeight, 520)}px`);
  };

  const updateGallerySizing = () => {
    updateDesktopRowHeight();
  };

  gallery.innerHTML = "";
  product.images.forEach((src, index) => {
    const block = document.createElement("div");
    block.className = `detail-image-block ${pairIndexes.includes(index) ? "half" : "full"}`;

    const image = document.createElement("img");
    const optimizedSources = getOptimizedImageSources(src);
    image.className = "media-image";
    image.src = optimizedSources.mobile;
    image.srcset = `${optimizedSources.mobile} 960w, ${optimizedSources.desktop} 1440w`;
    image.sizes = "(max-width: 767px) calc(100vw - 48px), 680px";
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = index === 0 ? "sync" : "async";
    if (index === 0) image.fetchPriority = "high";
    image.alt = `${product.name} product photo ${index + 1}`;
    image.addEventListener(
      "error",
      () => {
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.src = src;
      },
      { once: true }
    );
    image.addEventListener("load", () => {
      if (image.naturalHeight) {
        imageRatios[index] = image.naturalWidth / image.naturalHeight;
        updateGallerySizing();
      }
      if (block.classList.contains("half") && image.naturalHeight) {
        block.style.setProperty("--image-ratio", image.naturalWidth / image.naturalHeight);
      }
    });
    block.appendChild(image);

    if (index === pairIndexes[0]) {
      const row = document.createElement("div");
      row.className = "detail-half-row";
      row.appendChild(block);
      gallery.appendChild(row);
    } else if (index === pairIndexes[1]) {
      const row = gallery.querySelector(".detail-half-row");
      row.appendChild(block);
    } else {
      gallery.appendChild(block);
    }
  });
  if (galleryResizeHandler) {
    window.removeEventListener("resize", galleryResizeHandler);
  }
  galleryResizeHandler = updateGallerySizing;
  window.addEventListener("resize", galleryResizeHandler);

  const sizeList = document.getElementById("detail-sizes");
  sizeList.innerHTML = "";
  product.sizes.forEach((size, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `detail-size-btn${index === 0 ? " active" : ""}`;
    button.textContent = size;
    button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
    button.addEventListener("click", () => {
      selectedSize = size;
      sizeList.querySelectorAll(".detail-size-btn").forEach((sizeButton) => {
        sizeButton.classList.remove("active");
        sizeButton.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
    });
    sizeList.appendChild(button);
  });

  document.getElementById("detail-cta").onclick = () => {
    openNotifyModal(product.name, product.price, selectedSize, product.slug);
  };
}

renderProductDetail();
window.addEventListener("pageshow", (event) => {
  if (event.persisted) renderProductDetail();
});
window.addEventListener("popstate", renderProductDetail);
