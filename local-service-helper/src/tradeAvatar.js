const tradeConfig = {
  plumbing: { label: "PLUMBER", icon: "🔧", color: "#1777a8", uniform: "#1e9bd7" },
  electrical: { label: "ELECTRICIAN", icon: "⚡", color: "#d67c00", uniform: "#f2a323" },
  cleaning: { label: "CLEANING PRO", icon: "✦", color: "#16835a", uniform: "#35ad79" },
  carpentry: { label: "CARPENTER", icon: "▰", color: "#915d28", uniform: "#bb7e3b" },
  "appliance-repair": { label: "REPAIR TECH", icon: "⚙", color: "#6254a8", uniform: "#8374d2" },
  painting: { label: "PAINTER", icon: "✚", color: "#c34d66", uniform: "#e06d85" },
};

export function tradeAvatar(service, name, seed = 0) {
  const config = tradeConfig[service] || tradeConfig.plumbing;
  const skin = ["#f2c29e", "#d99369", "#b8734d", "#f5d0b5"][Number(seed) % 4];
  const shift = (Number(seed) * 19) % 52;
  const initials = String(name || "Local Pro").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 520"><rect width="420" height="520" fill="${config.color}"/><circle cx="${350 - shift}" cy="92" r="112" fill="#ffffff" opacity=".10"/><path d="M0 430 Q125 365 210 430 T420 430 V520 H0Z" fill="#102b43" opacity=".34"/><rect x="22" y="23" width="120" height="34" rx="17" fill="#fff" opacity=".18"/><text x="82" y="46" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="15" font-weight="700">VERIFIED</text><circle cx="210" cy="210" r="82" fill="${skin}"/><path d="M126 193 Q210 106 294 193 V166 Q210 95 126 166Z" fill="#f6c84f"/><rect x="118" y="161" width="184" height="27" rx="13" fill="#e0aa24"/><circle cx="180" cy="214" r="7" fill="#253748"/><circle cx="240" cy="214" r="7" fill="#253748"/><path d="M181 255 Q210 275 239 255" fill="none" stroke="#9a513d" stroke-width="6" stroke-linecap="round"/><path d="M102 405 Q112 303 210 299 Q308 303 318 405 V520 H102Z" fill="${config.uniform}"/><path d="M170 310 L210 346 L250 310" fill="none" stroke="#fff" stroke-width="12" opacity=".75"/><circle cx="210" cy="405" r="47" fill="#fff" opacity=".94"/><text x="210" y="423" text-anchor="middle" font-family="Arial,sans-serif" font-size="38">${config.icon}</text><text x="210" y="470" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="16" font-weight="700">${config.label}</text><text x="210" y="496" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="15" opacity=".88">${initials} • LOCAL EXPERT</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
