import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import { database, hashPassword, initializeDatabase, profileRow, verifyPassword } from "./database.js";
import { predictProviderSuitability, trainProviderSuitabilityModel } from "./mlModel.js";

initializeDatabase();
let providerSuitabilityModel = trainProviderSuitabilityModel(
  database.prepare("SELECT rating, review_count, experience_years FROM provider_profiles WHERE approval_status='approved'").all(),
);
const port = Number(process.env.PORT || 4000);
const secret = process.env.JWT_SECRET || "local-development-secret-change-before-production";
const services = ["plumbing", "electrical", "cleaning", "carpentry", "appliance-repair", "painting"];

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:5173" });
  res.end(JSON.stringify(data));
}
function makeToken(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, role: user.role, name: user.name, exp: Date.now() + 604800000 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
function currentUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const [payload, signature] = (token || "").split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload || "").digest("base64url");
  if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const tokenUser = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (tokenUser.exp <= Date.now()) return null;
    // Use the database role, not only the role that was saved in an old browser token.
    const savedUser = database.prepare("SELECT id, name, email, role FROM users WHERE id=?").get(tokenUser.id);
    return savedUser || null;
  } catch { return null; }
}
function requireUser(req, res, roles) {
  const user = currentUser(req);
  if (!user) { send(res, 401, { message: "Authentication is required." }); return null; }
  if (roles && !roles.includes(user.role)) { send(res, 403, { message: "You do not have permission for this action." }); return null; }
  return user;
}
async function readBody(req) {
  const chunks = []; for await (const part of req) chunks.push(part);
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return null; }
}
function profiles(params) {
  let sql = "SELECT * FROM provider_profiles WHERE approval_status = 'approved'";
  const values = [], service = params.get("service"), city = params.get("city"), search = params.get("search") || "";
  if (service) { sql += " AND service_slug = ?"; values.push(service); }
  if (city) { sql += " AND city LIKE ?"; values.push(`%${city}%`); }
  sql += " AND rating >= ? AND (business_name LIKE ? OR specialties LIKE ?) ORDER BY rating DESC, review_count DESC";
  values.push(Number(params.get("minRating") || 0), `%${search}%`, `%${search}%`);
  return database.prepare(sql).all(...values).map((row) => ({
    ...profileRow(row),
    reviews: database.prepare("SELECT rating, review_text AS text, substr(u.name, 1, 1) || '.' AS author FROM provider_reviews pr JOIN users u ON u.id=pr.customer_id WHERE pr.provider_id=? ORDER BY pr.created_at DESC LIMIT 6").all(row.id),
  }));
}

// Hybrid recommender: content matching finds the relevant trade skills, then a
// trained logistic-regression model estimates provider suitability from stored
// rating, review and experience data. Both are blended into a final ranking.
const relatedTerms = {
  leak: ["leakage", "pipe", "tap", "drain", "water"], pipe: ["leak", "leakage", "drain", "tap"], tap: ["faucet", "leak", "leakage"], drain: ["blocked", "clog", "cleaning", "pipe"],
  fan: ["electrical", "wiring", "power"], light: ["lighting", "electrical", "wiring"], wiring: ["electrical", "power", "socket", "mcb"], socket: ["electrical", "wiring", "power"],
  clean: ["cleaning", "deep", "kitchen", "bathroom", "sofa", "carpet"], stain: ["cleaning", "deep", "sofa", "carpet"],
  furniture: ["carpentry", "wood", "cabinet", "door", "repair"], door: ["carpentry", "wood", "repair"], cupboard: ["cabinet", "carpentry", "wardrobe"],
  fridge: ["refrigerator", "appliance"], refrigerator: ["appliance", "repair"], washing: ["washing", "appliance", "machine"], ac: ["air", "conditioner", "appliance"],
  paint: ["painting", "interior", "exterior", "wall", "waterproofing"], wall: ["painting", "texture", "waterproofing"], damp: ["waterproofing", "painting"],
};
function features(text) {
  const words = String(text || "").toLowerCase().match(/[a-z]{2,}/g) || [];
  return new Set(words.flatMap((word) => [word, ...(relatedTerms[word] || [])]));
}
function recommendProviders(serviceSlug, problem) {
  const issue = features(problem);
  const candidates = database.prepare("SELECT * FROM provider_profiles WHERE approval_status='approved' AND service_slug=?").all(serviceSlug);
  return candidates.map((row) => {
    const provider = profileRow(row);
    const specialtyWords = features(`${provider.specialties.join(" ")} ${provider.bio}`);
    const matched = [...issue].filter((word) => specialtyWords.has(word));
    const relevance = issue.size ? matched.length / issue.size : 0;
    const mlSuitability = predictProviderSuitability(providerSuitabilityModel, provider);
    const score = Math.round((relevance * 0.55 + mlSuitability * 0.45) * 100);
    return { id: provider.id, business_name: provider.business_name, rating: provider.rating, review_count: provider.review_count, specialties: provider.specialties, score, ml_suitability: Math.round(mlSuitability * 100), matched_skills: matched.slice(0, 4), reason: matched.length ? `Matches your issue: ${matched.slice(0, 3).join(", ")}` : "Strong provider-performance match" };
  }).sort((a, b) => b.score - a.score || b.rating - a.rating || b.review_count - a.review_count).slice(0, 3);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS" }); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host}`), path = url.pathname, method = req.method;
  const body = ["POST", "PUT", "PATCH"].includes(method) ? await readBody(req) : {};
  if (body === null) return send(res, 400, { message: "Request body must be valid JSON." });
  try {
    if (method === "GET" && path === "/api/health") return send(res, 200, { status: "ok" });
    if (method === "GET" && path === "/api/services") return send(res, 200, services);
    if (method === "GET" && path === "/api/ml/model-info") return send(res, 200, providerSuitabilityModel && {
      modelType: providerSuitabilityModel.modelType,
      modelVersion: providerSuitabilityModel.modelVersion,
      trainedAt: providerSuitabilityModel.trainedAt,
      featureNames: providerSuitabilityModel.featureNames,
      trainingRecords: providerSuitabilityModel.trainingRecords,
      positiveClass: providerSuitabilityModel.positiveClass,
    });
    if (method === "GET" && path === "/api/auth/me") {
      const user = requireUser(req, res); if (!user) return;
      return send(res, 200, { user });
    }
    if (method === "POST" && path === "/api/contact-messages") {
      const { name, email, message } = body;
      if (!name?.trim() || !email?.trim()?.includes("@") || !message?.trim()) return send(res, 400, { message: "Please enter your name, a valid email address, and a message." });
      if (name.trim().length > 100 || email.trim().length > 160 || message.trim().length > 2000) return send(res, 400, { message: "Your message is too long. Please keep it under 2,000 characters." });
      const row = database.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)").run(name.trim(), email.trim(), message.trim());
      return send(res, 201, { id: Number(row.lastInsertRowid), message: "Thanks! Your message has been sent to our support team." });
    }
    if (method === "POST" && path === "/api/auth/register") {
      const { name, email, password, role = "customer" } = body;
      if (!name?.trim() || !email?.includes("@") || !password || password.length < 6) return send(res, 400, { message: "Provide a name, valid email, and password of at least 6 characters." });
      if (!["customer", "provider"].includes(role)) return send(res, 400, { message: "Invalid account role." });
      const row = database.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)").run(name.trim(), email.trim(), hashPassword(password), role);
      const user = { id: Number(row.lastInsertRowid), name: name.trim(), email: email.trim(), role };
      return send(res, 201, { user, token: makeToken(user), message: role === "provider" ? "Account created. Complete your profile for approval." : "Account created." });
    }
    if (method === "POST" && path === "/api/auth/login") {
      const user = database.prepare("SELECT * FROM users WHERE email = ?").get(body.email?.trim());
      if (!user || !verifyPassword(body.password || "", user.password_hash)) return send(res, 401, { message: "Incorrect email or password." });
      const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      return send(res, 200, { user: publicUser, token: makeToken(publicUser) });
    }
    if (method === "GET" && path === "/api/providers") return send(res, 200, profiles(url.searchParams));
    if (method === "POST" && path === "/api/recommendations") {
      const { serviceSlug, problem } = body;
      if (!services.includes(serviceSlug) || !problem?.trim() || problem.trim().length < 3) return send(res, 400, { message: "Choose a service and describe the problem in a few words." });
      return send(res, 200, { recommendationMethod: "Hybrid content matching + trained logistic regression", recommendations: recommendProviders(serviceSlug, problem.trim()) });
    }
    const providerId = path.match(/^\/api\/providers\/(\d+)$/);
    if (method === "GET" && providerId) { const provider = database.prepare("SELECT * FROM provider_profiles WHERE id=? AND approval_status='approved'").get(providerId[1]); return provider ? send(res, 200, { ...profileRow(provider), reviews: database.prepare("SELECT rating, review_text AS text, substr(u.name, 1, 1) || '.' AS author FROM provider_reviews pr JOIN users u ON u.id=pr.customer_id WHERE pr.provider_id=? ORDER BY pr.created_at DESC LIMIT 6").all(provider.id) }) : send(res, 404, { message: "Provider not found." }); }
    if (path === "/api/providers/me/profile") {
      const user = requireUser(req, res, ["provider"]); if (!user) return;
      if (method === "GET") return send(res, 200, profileRow(database.prepare("SELECT * FROM provider_profiles WHERE user_id=?").get(user.id)) || null);
      if (method === "PUT") {
        const { serviceSlug, businessName, city, phone, experienceYears, specialties, bio = "", credentialNote = "", photoData = "", availabilityNote = "" } = body;
        if (!services.includes(serviceSlug) || !businessName?.trim() || !city?.trim() || !/^\d{10}$/.test(phone || "") || !Array.isArray(specialties) || !specialties.length) return send(res, 400, { message: "Complete service, name, city, 10-digit phone number, and at least one specialty." });
        if (photoData && (!/^data:image\/(jpeg|png|webp);base64,/.test(photoData) || photoData.length > 2800000)) return send(res, 400, { message: "Upload a JPG, PNG, or WebP image no larger than 2 MB." });
        const values = [serviceSlug, businessName.trim(), city.trim(), phone, Number(experienceYears || 0), JSON.stringify(specialties), bio.trim(), credentialNote.trim(), photoData || "", availabilityNote.trim(), user.id];
        if (database.prepare("SELECT id FROM provider_profiles WHERE user_id=?").get(user.id)) database.prepare("UPDATE provider_profiles SET service_slug=?, business_name=?, city=?, phone=?, experience_years=?, specialties=?, bio=?, credential_note=?, photo_data=?, availability_note=?, approval_status='pending' WHERE user_id=?").run(...values);
        else database.prepare("INSERT INTO provider_profiles (service_slug,business_name,city,phone,experience_years,specialties,bio,credential_note,photo_data,availability_note,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(...values);
        return send(res, 200, { message: "Profile submitted for admin approval." });
      }
    }
    if (method === "POST" && path === "/api/bookings") {
      const user = requireUser(req, res, ["customer"]); if (!user) return;
      const { providerId: id, serviceSlug, date, time, phone, address, problem } = body;
      const provider = database.prepare("SELECT id FROM provider_profiles WHERE id=? AND approval_status='approved'").get(id);
      if (!provider || !services.includes(serviceSlug) || !date || !time || !/^\d{10}$/.test(phone || "") || !address?.trim() || !problem?.trim()) return send(res, 400, { message: "Please provide complete, valid booking details." });
      const row = database.prepare("INSERT INTO bookings (customer_id,provider_id,service_slug,requested_date,requested_time,customer_phone,address,problem) VALUES (?,?,?,?,?,?,?,?)").run(user.id, id, serviceSlug, date, time, phone, address.trim(), problem.trim());
      return send(res, 201, { id: Number(row.lastInsertRowid), message: "Booking request sent." });
    }
    if (method === "GET" && path === "/api/bookings/me") {
      const user = requireUser(req, res); if (!user) return;
      const column = user.role === "provider" ? "p.user_id" : "b.customer_id";
      return send(res, 200, database.prepare(`SELECT b.*,p.business_name,p.city,u.name AS customer_name,u.email AS customer_email,r.gross_amount,r.commission_rate,r.commission_amount,r.provider_payout,r.recorded_at AS revenue_recorded_at,pr.rating AS my_rating,pr.review_text AS my_review FROM bookings b JOIN provider_profiles p ON p.id=b.provider_id JOIN users u ON u.id=b.customer_id LEFT JOIN platform_revenue r ON r.booking_id=b.id LEFT JOIN provider_reviews pr ON pr.booking_id=b.id WHERE ${column}=? ORDER BY b.created_at DESC`).all(user.id));
    }
    const reviewBooking = path.match(/^\/api\/bookings\/(\d+)\/review$/);
    if (method === "POST" && reviewBooking) {
      const user = requireUser(req, res, ["customer"]); if (!user) return;
      const rating = Number(body.rating);
      const reviewText = body.reviewText?.trim();
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !reviewText || reviewText.length > 1000) return send(res, 400, { message: "Choose a rating from 1 to 5 and write a review under 1,000 characters." });
      const booking = database.prepare("SELECT id, provider_id, status FROM bookings WHERE id=? AND customer_id=?").get(reviewBooking[1], user.id);
      if (!booking) return send(res, 404, { message: "Booking not found." });
      if (booking.status !== "completed") return send(res, 400, { message: "You can review a provider after the service is completed." });
      if (database.prepare("SELECT id FROM provider_reviews WHERE booking_id=?").get(booking.id)) return send(res, 409, { message: "You have already reviewed this completed booking." });
      database.exec("BEGIN");
      try {
        database.prepare("INSERT INTO provider_reviews (booking_id, provider_id, customer_id, rating, review_text) VALUES (?, ?, ?, ?, ?)").run(booking.id, booking.provider_id, user.id, rating, reviewText);
        database.prepare("UPDATE provider_profiles SET rating = ROUND(((rating * review_count) + ?) / (review_count + 1), 2), review_count = review_count + 1 WHERE id=?").run(rating, booking.provider_id);
        database.exec("COMMIT");
      } catch (error) { database.exec("ROLLBACK"); throw error; }
      const provider = database.prepare("SELECT rating, review_count FROM provider_profiles WHERE id=?").get(booking.provider_id);
      providerSuitabilityModel = trainProviderSuitabilityModel(
        database.prepare("SELECT rating, review_count, experience_years FROM provider_profiles WHERE approval_status='approved'").all(),
      );
      return send(res, 201, { message: "Thank you—your rating and review have been published.", provider });
    }
    const bookingId = path.match(/^\/api\/bookings\/(\d+)\/status$/);
    if (method === "PATCH" && bookingId) {
      const user = requireUser(req, res, ["provider", "admin"]); if (!user) return;
      if (!["accepted", "declined", "completed", "cancelled"].includes(body.status)) return send(res, 400, { message: "Invalid booking status." });
      const booking = database.prepare("SELECT b.id,p.user_id FROM bookings b JOIN provider_profiles p ON p.id=b.provider_id WHERE b.id=?").get(bookingId[1]);
      if (!booking || (user.role === "provider" && booking.user_id !== user.id)) return send(res, 404, { message: "Booking not found." });
      if (body.status === "completed") {
        const serviceAmount = Number(body.serviceAmount);
        if (!Number.isFinite(serviceAmount) || serviceAmount <= 0) return send(res, 400, { message: "Enter a valid final service amount before completing this booking." });
        const currentBooking = database.prepare("SELECT status FROM bookings WHERE id=?").get(bookingId[1]);
        if (!currentBooking || !['accepted', 'completed'].includes(currentBooking.status)) return send(res, 400, { message: "Only an accepted booking can be marked complete." });
        const grossAmount = Math.round(serviceAmount * 100) / 100;
        const commissionAmount = Math.round(grossAmount * 0.10 * 100) / 100;
        const providerPayout = Math.round((grossAmount - commissionAmount) * 100) / 100;
        database.exec("BEGIN");
        try {
          database.prepare("UPDATE bookings SET status='completed', final_amount=?, completed_at=CURRENT_TIMESTAMP WHERE id=?").run(grossAmount, bookingId[1]);
          database.prepare("INSERT INTO platform_revenue (booking_id,gross_amount,commission_amount,provider_payout) VALUES (?,?,?,?) ON CONFLICT(booking_id) DO UPDATE SET gross_amount=excluded.gross_amount,commission_amount=excluded.commission_amount,provider_payout=excluded.provider_payout,recorded_at=CURRENT_TIMESTAMP").run(bookingId[1], grossAmount, commissionAmount, providerPayout);
          database.exec("COMMIT");
        } catch (error) { database.exec("ROLLBACK"); throw error; }
        return send(res, 200, { message: `Booking completed. Fixnear commission: ₹${commissionAmount.toFixed(2)}. Provider payout: ₹${providerPayout.toFixed(2)}.`, revenue: { grossAmount, commissionAmount, providerPayout } });
      }
      database.prepare("UPDATE bookings SET status=? WHERE id=?").run(body.status, bookingId[1]); return send(res, 200, { message: "Booking status updated." });
    }
    if (method === "GET" && path === "/api/admin/revenue") {
      const user = requireUser(req, res, ["admin"]); if (!user) return;
      const summary = database.prepare("SELECT COUNT(*) AS completed_jobs, COALESCE(SUM(gross_amount),0) AS gross_service_value, COALESCE(SUM(commission_amount),0) AS fixnear_revenue, COALESCE(SUM(provider_payout),0) AS provider_payouts FROM platform_revenue").get();
      const recent = database.prepare("SELECT r.*,b.service_slug,p.business_name,u.name AS customer_name FROM platform_revenue r JOIN bookings b ON b.id=r.booking_id JOIN provider_profiles p ON p.id=b.provider_id JOIN users u ON u.id=b.customer_id ORDER BY r.recorded_at DESC LIMIT 10").all();
      return send(res, 200, { summary, recent });
    }
    if (method === "GET" && path === "/api/admin/contact-messages") {
      const user = requireUser(req, res, ["admin"]); if (!user) return;
      return send(res, 200, database.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all());
    }
    if (method === "GET" && path === "/api/admin/providers") {
      const user = requireUser(req, res, ["admin"]); if (!user) return;
      const status = url.searchParams.get("status") || "pending";
      return send(res, 200, database.prepare("SELECT p.*,u.name AS account_name,u.email FROM provider_profiles p LEFT JOIN users u ON u.id=p.user_id WHERE approval_status=? ORDER BY p.created_at ASC").all(status).map(profileRow));
    }
    const approval = path.match(/^\/api\/admin\/providers\/(\d+)\/status$/);
    if (method === "PATCH" && approval) {
      const user = requireUser(req, res, ["admin"]); if (!user) return;
      if (!["approved", "rejected"].includes(body.status)) return send(res, 400, { message: "Status must be approved or rejected." });
      const row = database.prepare("UPDATE provider_profiles SET approval_status=? WHERE id=?").run(body.status, approval[1]);
      return row.changes ? send(res, 200, { message: `Provider profile ${body.status}.` }) : send(res, 404, { message: "Provider profile not found." });
    }
    return send(res, 404, { message: "Route not found." });
  } catch (error) {
    if (error.message.includes("UNIQUE")) return send(res, 409, { message: "An account already exists for this email." });
    console.error(error); return send(res, 500, { message: "The server could not complete that request." });
  }
});
server.listen(port, () => console.log(`Backend API running at http://localhost:${port}`));

