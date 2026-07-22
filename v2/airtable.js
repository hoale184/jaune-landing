let countdownTimer = null;
let galleryResizeHandler = null;
let galleryScrollHandler = null;
let interestQueueProcessing = false;
let interestQueueTimer = null;
const trackedProductViews = new Set();
const SUBMIT_BUTTON_TEXT = "Hoàn tất";
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@gmail\.com(?:\.vn)?$/i;
const INTEREST_QUEUE_STORAGE_KEY = "jaune-interest-queue-v1";
const INTEREST_QUEUE_MAX_ITEMS = 50;
const INTEREST_QUEUE_BASE_DELAY_MS = 5000;
const INTEREST_QUEUE_MAX_DELAY_MS = 5 * 60 * 1000;
const OPTIMIZED_IMAGE_VERSIONS = {};
const SIZE_GUIDE = {
  S: "Size S — V1 <86, V2 <70",
  M: "Size M — V1 <90, V2 <75"
};
const JAUNE_PRODUCTS = {
  blanie: {
    slug: "blanie",
    name: "BLANIE TOP",
    price: 245000,
    description:
      "Dịu dàng trong từng đường cắt. Cổ thuyền trải nhẹ qua bờ vai, tạo cảm giác thanh thoát và nữ tính với phom ôm gọn tự nhiên.",
    images: [
      "images/Blanie/Blanie_1.png",
      "images/Blanie/Blanie_2.png",
      "images/Blanie/Blanie_3.png",
      "images/Blanie/Blanie_4.png",
      "images/Blanie/Blanie_5.png",
      "images/Blanie/Blanie_6.png",
      "images/Blanie/Blanie_7.png",
      "images/Blanie/Blanie_8.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  ellie: {
    slug: "ellie",
    name: "ELLIE TOP",
    price: 230000,
    description:
      "Đơn giản nhưng ấn tượng. Đường cắt gọn phối cùng chất thun co dãn, ôm trọn đường cong tự nhiên đầy nữ tính. Đặc biệt tích hợp mút ngực may sẵn tiện lợi.",
    images: [
      "images/Ellie/Ellie_1.png",
      "images/Ellie/Ellie_2.png",
      "images/Ellie/Ellie_3.png",
      "images/Ellie/Ellie_4.png",
      "images/Ellie/Ellie_5.png",
      "images/Ellie/Ellie_6.png",
      "images/Ellie/Ellie_7.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  elsie: {
    slug: "elsie",
    name: "ELSIE TOP",
    price: 270000,
    description:
      "Nhẹ nhàng nhưng không hề mờ nhạt. Cổ thuyền khéo léo ôm trọn bờ vai tự nhiên, mang đến silhouette mềm mại và khí chất.",
    images: [
      "images/Elsie/Elsie_1.png",
      "images/Elsie/Elsie_2.png",
      "images/Elsie/Elsie_3.png",
      "images/Elsie/Elsie_4.png",
      "images/Elsie/Elsie_5.png",
      "images/Elsie/Elsie_6.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  farie: {
    slug: "farie",
    name: "FARIE TOP",
    price: 270000,
    description:
      "Dành cho các cô gái yêu sự nữ tính cho mọi dịp. Thiết kế trễ vai tôn bờ vai thanh thoát, tạo nên silhouette mềm mại, và đầy tinh tế. Tích hợp mút ngực may sẵn tiện lợi.",
    images: [
      "images/Farie/Farie_1.png",
      "images/Farie/Farie_2.png",
      "images/Farie/Farie_3.png",
      "images/Farie/Farie_4.png",
      "images/Farie/Farie_5.png",
      "images/Farie/Farie_6.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  julie: {
    slug: "julie",
    name: "JULIE TOP",
    price: 260000,
    description:
      "Nổi bật theo cách riêng. Thiết kế lệch vai giúp tổng thể trông có gu hơn và mang đến vẻ ngoài nữ tính mà tinh tế. Tích hợp mút ngực may sẵn tiện lợi.",
    images: [
      "images/Julie/Julie_1.png",
      "images/Julie/Julie_2.png",
      "images/Julie/Julie_3.png",
      "images/Julie/Julie_4.png",
      "images/Julie/Julie_5.png",
      "images/Julie/Julie_6.png",
      "images/Julie/Julie_7.png",
      "images/Julie/Julie_8.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  lorie: {
    slug: "lorie",
    name: "LORIE TOP",
    price: 245000,
    description:
      "Dành cho những cô gái yêu vẻ đẹp của sự tối giản. Cổ lọ ôm nhẹ tạo nên silhouette gọn gàng và thanh thoát, được hoàn thiện trên chất vải thun gân ôm mượt theo cơ thể.",
    images: [
      "images/Lorie/Lorie_1.png",
      "images/Lorie/Lorie_2.png",
      "images/Lorie/Lorie_3.png",
      "images/Lorie/Lorie_4.png",
      "images/Lorie/Lorie_5.png",
      "images/Lorie/Lorie_6.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  },
  rosie: {
    slug: "rosie",
    name: "ROSIE TOP",
    price: 260000,
    description:
      "Thiết kế đầy nữ tính. Một chút mềm mại khiến tổng thể trở nên cuốn hút hơn. Cổ U sâu khéo léo tôn phần cổ và xương quai xanh, chất thun gân ôm nhẹ tạo đường cong tự nhiên.",
    images: [
      "images/Rosie/Rosie_1.png",
      "images/Rosie/Rosie_2.png",
      "images/Rosie/Rosie_3.png",
      "images/Rosie/Rosie_4.png",
      "images/Rosie/Rosie_5.png",
      "images/Rosie/Rosie_6.png"
    ],
    pairIndexes: [0, 1],
    sizes: ["S", "M"]
  }
};

function formatPrice(price) {
  const numericPrice = Number(price);
  if (!numericPrice) return "Đang cập nhật";
  return `${numericPrice.toLocaleString("en-US")}đ`;
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

async function getSubmitResult(response) {
  try {
    return await response.json();
  } catch {
    return {
      error: `Server returned ${response.status}`
    };
  }
}

function isLocalStaticPreview() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname);
}

function isStaticServerResponse(response) {
  return isLocalStaticPreview() && [404, 405, 501].includes(response.status);
}

function canSyncInterestQueue() {
  return window.location.protocol !== "file:" && navigator.onLine !== false;
}

function createClientSubmissionId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `jaune-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readInterestQueue() {
  try {
    const rawQueue = window.localStorage.getItem(INTEREST_QUEUE_STORAGE_KEY);
    const queue = rawQueue ? JSON.parse(rawQueue) : [];
    if (!Array.isArray(queue)) return [];

    return queue.filter((item) => {
      return item && typeof item.id === "string" && item.payload && typeof item.payload === "object";
    });
  } catch (error) {
    console.warn("Unable to read interest queue:", error);
    return [];
  }
}

function writeInterestQueue(queue) {
  try {
    const nextQueue = queue.slice(-INTEREST_QUEUE_MAX_ITEMS);
    window.localStorage.setItem(INTEREST_QUEUE_STORAGE_KEY, JSON.stringify(nextQueue));
  } catch (error) {
    console.warn("Unable to save interest queue:", error);
  }
}

function updateInterestQueueItem(itemId, updates) {
  const queue = readInterestQueue();
  const index = queue.findIndex((item) => item.id === itemId);
  if (index === -1) return;

  queue[index] = {
    ...queue[index],
    ...(typeof updates === "function" ? updates(queue[index]) : updates)
  };
  writeInterestQueue(queue);
}

function removeInterestQueueItem(itemId) {
  writeInterestQueue(readInterestQueue().filter((item) => item.id !== itemId));
}

function getQueueRetryDelay(attempts) {
  const exponent = Math.min(Math.max(attempts, 0), 6);
  const delay = INTEREST_QUEUE_BASE_DELAY_MS * 2 ** exponent;
  const jitter = Math.floor(Math.random() * 1000);

  return Math.min(delay + jitter, INTEREST_QUEUE_MAX_DELAY_MS);
}

function getNextQueueDelay(queue) {
  const now = Date.now();
  const nextRetryAt = queue.reduce((nextTime, item) => {
    if (!item.nextRetryAt) return now;
    return Math.min(nextTime, item.nextRetryAt);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(nextRetryAt)) return INTEREST_QUEUE_BASE_DELAY_MS;

  return Math.max(nextRetryAt - now, 1000);
}

function scheduleInterestQueue(delay = 1000) {
  clearTimeout(interestQueueTimer);

  if (!canSyncInterestQueue()) return;

  interestQueueTimer = setTimeout(() => {
    processInterestQueue();
  }, Math.max(delay, 1000));
}

function trackQueuedLead(item) {
  const meta = item.meta || {};
  if (!meta.productSlug) return;

  trackMetaEvent("Lead", {
    content_ids: [meta.productSlug],
    content_name: meta.productName,
    content_type: "product",
    value: meta.price,
    currency: "VND",
    size: meta.size
  });
}

function enqueueInterestSubmission(payload, meta) {
  const item = {
    id: createClientSubmissionId(),
    payload,
    meta,
    attempts: 0,
    createdAt: Date.now(),
    nextRetryAt: 0,
    lastError: ""
  };

  writeInterestQueue([...readInterestQueue(), item]);
  scheduleInterestQueue();

  return item;
}

function rescheduleInterestItem(item, errorMessage = "", retryable = true) {
  const attempts = Number(item.attempts || 0) + 1;
  const retryDelay = retryable ? getQueueRetryDelay(attempts) : INTEREST_QUEUE_MAX_DELAY_MS;

  updateInterestQueueItem(item.id, {
    attempts,
    lastError: errorMessage,
    nextRetryAt: Date.now() + retryDelay,
    updatedAt: Date.now()
  });
}

async function submitQueuedInterestItem(item) {
  const response = await fetch("/api/interest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...item.payload,
      clientSubmissionId: item.id
    })
  });

  if (response.ok) {
    trackQueuedLead(item);
    removeInterestQueueItem(item.id);
    return true;
  }

  const result = await getSubmitResult(response);
  const retryable =
    result.retryable === true ||
    isStaticServerResponse(response) ||
    response.status === 429 ||
    response.status >= 500;

  rescheduleInterestItem(item, result.error || `Server returned ${response.status}`, retryable);

  if (!retryable) {
    console.warn("Interest submission is queued but blocked by a non-retryable response:", result);
  }

  return false;
}

async function processInterestQueue() {
  if (interestQueueProcessing || !canSyncInterestQueue()) return;

  const queue = readInterestQueue();
  if (!queue.length) return;

  interestQueueProcessing = true;

  try {
    const now = Date.now();

    for (const item of queue) {
      if (item.nextRetryAt && item.nextRetryAt > now) continue;

      const wasSubmitted = await submitQueuedInterestItem(item);
      if (!wasSubmitted) break;
    }
  } catch (error) {
    const nextItem = readInterestQueue().find((item) => !item.nextRetryAt || item.nextRetryAt <= Date.now());
    if (nextItem) {
      rescheduleInterestItem(nextItem, error.message || "Network request failed");
    }
    console.warn("Interest queue will retry later:", error);
  } finally {
    interestQueueProcessing = false;

    const remainingQueue = readInterestQueue();
    if (remainingQueue.length) {
      scheduleInterestQueue(getNextQueueDelay(remainingQueue));
    }
  }
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
  const modal = document.getElementById("notify-modal");
  if (modal) modal.classList.remove("active");
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

const notifyModalEl = document.getElementById("notify-modal");
const successModalEl = document.getElementById("success-modal");
const emailField = document.getElementById("field-email");
const notifyForm = document.getElementById("notify-form");
const submitButton = document.getElementById("submit-btn");

if (notifyModalEl) {
  notifyModalEl.addEventListener("click", function (event) {
    if (event.target === this) closeNotifyModal();
  });
}

if (successModalEl) {
  successModalEl.addEventListener("click", function (event) {
    if (event.target === this) closeSuccessModal();
  });
}

if (emailField && notifyForm && submitButton) {
  const defaultSubmitButtonText = submitButton.textContent;

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

  submitButton.addEventListener("click", function () {
    if (submitButton.disabled) return;

    if (!notifyForm.dataset.product || !notifyForm.dataset.productSlug) {
      if (typeof window.openItemModal === "function") window.openItemModal();
      return;
    }

    if (!validateEmailField()) {
      emailField.focus();
      return;
    }

    if (!notifyForm.reportValidity()) return;

    const button = submitButton;
    const productName = notifyForm.dataset.product;
    const productSlug = notifyForm.dataset.productSlug;
    const selectedSize = document.getElementById("field-size").value;

    button.disabled = true;
    button.textContent = "Đang gửi...";

    const payload = {
      customerName: document.getElementById("field-name").value.trim(),
      email: emailField.value.trim().toLowerCase(),
      productName,
      size: selectedSize,
      price: parseInt(notifyForm.dataset.price, 10)
    };

    enqueueInterestSubmission(payload, {
      productSlug,
      productName,
      size: selectedSize,
      price: payload.price
    });
    openSuccessModal();
    processInterestQueue();

    button.disabled = false;
    button.textContent = defaultSubmitButtonText;
  });
}

window.openNotifyModal = openNotifyModal;
window.closeNotifyModal = closeNotifyModal;
window.openSuccessModal = openSuccessModal;
window.closeSuccessModal = closeSuccessModal;
window.JAUNE_PRODUCTS = JAUNE_PRODUCTS;

function renderProductDetail() {
  const detailPage = document.getElementById("product-detail-page");
  if (!detailPage) return;

  const params = new URLSearchParams(window.location.search);
  const product = JAUNE_PRODUCTS[params.get("product")] || JAUNE_PRODUCTS.blanie;
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

  const dotsContainer = document.getElementById("detail-gallery-dots");
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    const slides = Array.from(gallery.querySelectorAll(".detail-image-block"));
    slides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `detail-gallery-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Ảnh ${index + 1}/${slides.length}`);
      dot.addEventListener("click", () => {
        slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      });
      dotsContainer.appendChild(dot);
    });

    if (galleryScrollHandler) {
      gallery.removeEventListener("scroll", galleryScrollHandler);
    }
    let scrollFrame = null;
    galleryScrollHandler = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        const galleryLeft = gallery.getBoundingClientRect().left;
        let closestIndex = 0;
        let closestDistance = Infinity;
        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.getBoundingClientRect().left - galleryLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        dotsContainer.querySelectorAll(".detail-gallery-dot").forEach((dot, index) => {
          dot.classList.toggle("active", index === closestIndex);
        });
      });
    };
    gallery.addEventListener("scroll", galleryScrollHandler);
  }

  const sizeList = document.getElementById("detail-sizes");
  const sizeGuide = document.getElementById("detail-size-guide");
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
      if (sizeGuide) sizeGuide.textContent = SIZE_GUIDE[size] || "";
    });
    sizeList.appendChild(button);
  });
  if (sizeGuide) sizeGuide.textContent = SIZE_GUIDE[selectedSize] || "";

  document.getElementById("detail-cta").onclick = () => {
    openNotifyModal(product.name, product.price, selectedSize, product.slug);
  };
}

const detailBackLink = document.querySelector(".detail-back");
if (detailBackLink) {
  detailBackLink.addEventListener("click", (event) => {
    const sameOriginReferrer =
      document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (sameOriginReferrer && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
}

renderProductDetail();
processInterestQueue();
window.addEventListener("online", processInterestQueue);
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") processInterestQueue();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) renderProductDetail();
  processInterestQueue();
});
window.addEventListener("popstate", renderProductDetail);
