// ─── DATE UTILS ───────────────────────────────────────────────────────────────

// Lấy ngày hôm nay dạng YYYY-MM-DD
export function getToday() {
  return new Date().toISOString().split("T")[0];
}

// Lấy ngày N ngày sau hôm nay
export function getDaysFromToday(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Tính số đêm giữa 2 ngày
export function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diff / 86400000));
}

// Format ngày: "2026-03-20" → "March 20, 2026"
export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format ngày ngắn: "2026-03-20" → "Mar 20, 2026"
export function formatDateShort(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Kiểm tra ngày check-in có hợp lệ không (không được là ngày quá khứ)
export function isValidCheckIn(checkIn) {
  if (!checkIn) return false;
  return checkIn >= getToday();
}

// Kiểm tra ngày check-out có hợp lệ không (phải sau check-in)
export function isValidCheckOut(checkIn, checkOut) {
  if (!checkIn || !checkOut) return false;
  return checkOut > checkIn;
}

// Kiểm tra có thể huỷ phòng không (trước 24h so với check-in)
export function canCancel(checkInDate) {
  if (!checkInDate) return false;
  const checkIn = new Date(checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkIn - now) / 3600000;
  return hoursUntilCheckIn >= 24;
}

// ─── PRICE UTILS ──────────────────────────────────────────────────────────────

// Tính giá cuối cùng theo công thức: basePrice × multiplier × nights
export function calcFinalPrice(basePrice, multiplier = 1, nights = 1) {
  return Math.round(basePrice * multiplier * nights);
}

// Tính thuế 10%
export function calcTax(subtotal) {
  return Math.round(subtotal * 0.1);
}

// Tính tổng tiền (subtotal + tax)
export function calcTotal(basePrice, multiplier = 1, nights = 1) {
  const subtotal = calcFinalPrice(basePrice, multiplier, nights);
  const tax = calcTax(subtotal);
  return { subtotal, tax, total: subtotal + tax };
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCardNumber(val) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatCardExpiry(val) {
  let v = val.replace(/\D/g, "");
  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
  return v;
}

// Tạo mã đặt phòng ngẫu nhiên: "LS-A1B2C3"
export function generateBookingRef() {
  return "LS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Lấy chữ cái đầu của tên: "John Doe" → "JD"
export function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text dài: "Hello World" → "Hello..."
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

// ─── VALIDATION UTILS ─────────────────────────────────────────────────────────

// Validate email
export function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// Validate phone (10-15 số)
export function isValidPhone(phone) {
  return /^\+?[\d\s\-]{10,15}$/.test(phone);
}

// Validate password (tối thiểu 6 ký tự)
export function isValidPassword(password) {
  return password && password.length >= 6;
}

// ─── STORAGE UTILS ────────────────────────────────────────────────────────────

// Lưu vào localStorage an toàn
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Storage set error:", err);
  }
}

// Lấy từ localStorage an toàn
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Xoá khỏi localStorage
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Storage remove error:", err);
  }
}