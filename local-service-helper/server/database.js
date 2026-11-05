import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const directory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(directory, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

export const database = new DatabaseSync(path.join(dataDirectory, "local-service-helper.db"));
database.exec("PRAGMA foreign_keys = ON;");

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedValue) {
  const [salt, savedHash] = String(storedValue || "").split(":");
  if (!salt || !savedHash) return false;
  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(savedHash, "hex"), Buffer.from(actualHash, "hex"));
}

const seedProviders = [
  ["plumbing", "Rajesh Kumar", "Ahmedabad", "8 Years Experience", 4.9, 127, "Pipe Repair, Leakage Repair, Bathroom Plumbing, Drain Cleaning"],
  ["plumbing", "Amit Patel", "Ahmedabad", "6 Years Experience", 4.7, 94, "Tap Repair, Drain Cleaning, Water Tank Services"],
  ["plumbing", "Suresh Sharma", "Ahmedabad", "10 Years Experience", 4.8, 156, "Pipe Repair, Bathroom Plumbing, Water Tank Services"],
  ["plumbing", "Naveen Desai", "Ahmedabad", "7 Years Experience", 4.8, 119, "Drain Cleaning, Tap Repair, Bathroom Plumbing"],
  ["electrical", "Vikram Singh", "Ahmedabad", "9 Years Experience", 4.9, 138, "Home Wiring, Fan Repair, Lighting, Socket Repair"],
  ["electrical", "Manish Patel", "Ahmedabad", "7 Years Experience", 4.7, 102, "Fan Installation, Lighting, MCB Repair"],
  ["electrical", "Rakesh Sharma", "Ahmedabad", "11 Years Experience", 4.8, 171, "Electrical Inspection, Inverter Setup, Power Faults"],
  ["electrical", "Harish Mehta", "Ahmedabad", "8 Years Experience", 4.8, 126, "Power Faults, Socket Repair, Lighting"],
  ["cleaning", "Pooja Shah", "Ahmedabad", "8 Years Experience", 4.9, 136, "Deep Cleaning, Kitchen Cleaning, Bathroom Cleaning"],
  ["cleaning", "Sunita Patel", "Ahmedabad", "6 Years Experience", 4.8, 112, "Regular Cleaning, Window Cleaning, Floor Cleaning"],
  ["cleaning", "Rahul Verma", "Ahmedabad", "9 Years Experience", 4.7, 98, "Deep Cleaning, Sofa Cleaning, Carpet Cleaning"],
  ["cleaning", "Meena Iyer", "Ahmedabad", "7 Years Experience", 4.9, 124, "Kitchen Cleaning, Move-in Cleaning, Window Cleaning"],
  ["carpentry", "Arjun Mehta", "Ahmedabad", "10 Years Experience", 4.9, 143, "Furniture Repair, Door Repair, Furniture Assembly"],
  ["carpentry", "Deepak Shah", "Ahmedabad", "7 Years Experience", 4.7, 108, "Door Repair, Bed Repair, Cabinet Repair"],
  ["carpentry", "Mahesh Kumar", "Ahmedabad", "12 Years Experience", 4.8, 165, "Custom Furniture, Woodwork, Door Installation"],
  ["carpentry", "Pranav Joshi", "Ahmedabad", "9 Years Experience", 4.8, 132, "Wardrobe Repair, Furniture Assembly, Cabinet Repair"],
  ["appliance-repair", "Karan Joshi", "Ahmedabad", "9 Years Experience", 4.9, 142, "Refrigerator Repair, Washing Machines, Microwaves"],
  ["appliance-repair", "Nitin Shah", "Ahmedabad", "7 Years Experience", 4.7, 108, "Air Conditioners, Water Purifiers, Geysers"],
  ["appliance-repair", "Sameer Khan", "Ahmedabad", "11 Years Experience", 4.8, 165, "TV Repair, Refrigerators, Kitchen Appliances"],
  ["appliance-repair", "Farhan Ali", "Ahmedabad", "8 Years Experience", 4.7, 111, "Air Conditioner Repair, Geysers, Water Purifiers"],
  ["painting", "Ravi Patel", "Ahmedabad", "10 Years Experience", 4.9, 151, "Interior Painting, Wall Textures, Waterproofing"],
  ["painting", "Imran Shaikh", "Ahmedabad", "8 Years Experience", 4.7, 119, "Exterior Painting, Metal Painting, Wood Polish"],
  ["painting", "Devendra Rao", "Ahmedabad", "12 Years Experience", 4.8, 174, "Texture Painting, Commercial Painting, Ceiling Work"],
  ["painting", "Sanjay Verma", "Ahmedabad", "9 Years Experience", 4.8, 140, "Interior Painting, Exterior Painting, Waterproofing"],
];

// Login-enabled demo accounts for testing every provider dashboard. The first
// four records per service above remain public sample listings; these records
// are real provider accounts and therefore can receive/manage bookings.
const demoNames = {
  plumbing: ["Aarav Shah", "Dev Patel", "Ishaan Mehta", "Kunal Joshi", "Milan Desai", "Nirav Shah", "Parth Trivedi", "Rohan Dave", "Sahil Patel", "Tushar Mehta", "Vishal Shah", "Yash Joshi", "Aditya Rana", "Bhavin Patel", "Chirag Shah"],
  electrical: ["Arnav Patel", "Bhavesh Shah", "Chetan Dave", "Dhruv Joshi", "Eshan Mehta", "Gaurav Patel", "Hemant Shah", "Jatin Dave", "Kirtan Joshi", "Lakshya Mehta", "Mitesh Patel", "Neel Shah", "Om Dave", "Piyush Joshi", "Ritesh Mehta"],
  cleaning: ["Anjali Patel", "Bhavna Shah", "Chandni Dave", "Divya Joshi", "Ekta Mehta", "Falguni Patel", "Gauri Shah", "Hetal Dave", "Isha Joshi", "Jhanvi Mehta", "Kajal Patel", "Nisha Shah", "Pooja Dave", "Riddhi Joshi", "Sonali Mehta"],
  carpentry: ["Akash Patel", "Bharat Shah", "Chirag Dave", "Dinesh Joshi", "Eshwar Mehta", "Harsh Patel", "Jignesh Shah", "Ketan Dave", "Lalit Joshi", "Mohan Mehta", "Nakul Patel", "Pratik Shah", "Ramesh Dave", "Sagar Joshi", "Tejas Mehta"],
  "appliance-repair": ["Aakash Shah", "Brijesh Patel", "Chetan Mehta", "Darshan Dave", "Eklavya Joshi", "Hardik Shah", "Jay Patel", "Kaushal Mehta", "Mihir Dave", "Nakul Joshi", "Pranav Shah", "Rahil Patel", "Sanket Mehta", "Tanmay Dave", "Utsav Joshi"],
  painting: ["Amit Shah", "Brij Patel", "Chetan Joshi", "Dharam Mehta", "Eshan Dave", "Harit Shah", "Jayesh Patel", "Kishan Joshi", "Manav Mehta", "Nayan Dave", "Pratik Shah", "Ravi Patel", "Smit Joshi", "Tapan Mehta", "Yuvraj Dave"],
};

const demoDetails = {
  plumbing: { specialties: ["Pipe Repair", "Leakage Repair", "Drain Cleaning", "Tap Repair"], bio: "Reliable plumbing repairs, leak detection, and drainage work for homes.", availability: "Mon–Sat, 8 AM–7 PM" },
  electrical: { specialties: ["Home Wiring", "Fan Repair", "Lighting", "Socket Repair"], bio: "Safe electrical repairs, installations, and fault checks for homes.", availability: "Mon–Sat, 9 AM–6 PM" },
  cleaning: { specialties: ["Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa Cleaning"], bio: "Detailed home cleaning with careful attention to every surface.", availability: "Daily, 8 AM–6 PM" },
  carpentry: { specialties: ["Furniture Repair", "Door Repair", "Cabinet Repair", "Furniture Assembly"], bio: "Practical furniture, door, and woodwork repairs for your home.", availability: "Mon–Sat, 9 AM–7 PM" },
  "appliance-repair": { specialties: ["Refrigerator Repair", "Washing Machines", "Air Conditioners", "Water Purifiers"], bio: "Quick diagnostics and dependable repairs for everyday appliances.", availability: "Mon–Sat, 9 AM–6 PM" },
  painting: { specialties: ["Interior Painting", "Exterior Painting", "Wall Textures", "Waterproofing"], bio: "Clean, careful painting and finishing work for homes and offices.", availability: "Mon–Sat, 8 AM–6 PM" },
};

const demoProviderPassword = "Provider@123";

const tradePhotos = {
  plumbing: ["https://www.shutterstock.com/image-photo/plumber-installing-water-equipment-meter-260nw-2397229661.jpg", "https://static.vecteezy.com/system/resources/thumbnails/074/237/006/small/experienced-plumber-fixing-sink-pipe-with-screwdriver-skilled-handyman-repairing-plumbing-system-in-service-business-photo.jpg", "https://static.vecteezy.com/system/resources/thumbnails/067/082/003/small/professional-male-plumber-in-uniform-is-fixing-water-meter-with-special-work-tools-at-home-photo.jpg", "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=85"],
  electrical: ["https://thumbs.dreamstime.com/b/young-electrical-engineer-protective-workware-repairing-connecting-wires-using-screw-driver-workplace-young-247556897.jpg", "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=85", "https://ecif.pt/sites/default/files/un-electricista-trabajando-0.jpeg", "https://www.maintana.com/storage/2023/12/commercial-electrician.jpg"],
  cleaning: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80", "https://i.pinimg.com/736x/20/a9/f2/20a9f2d32dc2044765f0ce46a0af2274.jpg", "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=85", "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=85"],
  carpentry: ["https://mccoymart.com/post/wp-content/uploads/The-Top-10-Benefits-Of-Hiring-A-Professional-Carpenter.jpg", "https://img.magnific.com/free-photo/carpenter-cutting-mdf-board-inside-workshop_23-2149451066.jpg?semt=ais_hybrid&w=740&q=80", "https://thumbs.dreamstime.com/b/indian-carpenter-making-furniture-workshop-india-january-168882518.jpg", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=85"],
  "appliance-repair": ["https://tirupatiservicecenter.com/wp-content/uploads/2025/08/Trupati-service-center-1.webp", "https://doorstepappliancerepair.in/wp-content/uploads/2026/04/Untitled-design-80.png", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=85", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=85"],
  painting: ["https://images.unsplash.com/photo-1562259949-a4ebf6a0d348?auto=format&fit=crop&w=500&q=85", "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&w=500&q=85", "https://images.unsplash.com/photo-1562259949-a4ebf6a0d348?auto=format&fit=crop&w=600&q=85&crop=faces", "https://images.unsplash.com/photo-1562259949-a4ebf6a0d348?auto=format&fit=crop&w=450&q=85&crop=entropy"],
};

const demoPhotoUrl = (serviceSlug, index) => tradePhotos[serviceSlug][index % tradePhotos[serviceSlug].length];

export function initializeDatabase() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'provider', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS provider_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      service_slug TEXT NOT NULL,
      business_name TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      experience_years INTEGER NOT NULL DEFAULT 0,
      specialties TEXT NOT NULL DEFAULT '[]',
      bio TEXT NOT NULL DEFAULT '',
      credential_note TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '',
      photo_data TEXT NOT NULL DEFAULT '',
      availability_note TEXT NOT NULL DEFAULT '',
      approval_status TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
      rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      service_slug TEXT NOT NULL,
      requested_date TEXT NOT NULL,
      requested_time TEXT NOT NULL,
      customer_phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      problem TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested', 'accepted', 'declined', 'completed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(provider_id) REFERENCES provider_profiles(id)
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read', 'resolved')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS provider_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      provider_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY(provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS platform_revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      gross_amount REAL NOT NULL CHECK(gross_amount > 0),
      commission_rate REAL NOT NULL DEFAULT 0.10,
      commission_amount REAL NOT NULL CHECK(commission_amount >= 0),
      provider_payout REAL NOT NULL CHECK(provider_payout >= 0),
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
  `);
  const bookingColumns = database.prepare("PRAGMA table_info(bookings)").all().map((column) => column.name);
  if (!bookingColumns.includes("customer_phone")) database.exec("ALTER TABLE bookings ADD COLUMN customer_phone TEXT NOT NULL DEFAULT ''");
  if (!bookingColumns.includes("final_amount")) database.exec("ALTER TABLE bookings ADD COLUMN final_amount REAL");
  if (!bookingColumns.includes("completed_at")) database.exec("ALTER TABLE bookings ADD COLUMN completed_at TEXT");
  const profileColumns = database.prepare("PRAGMA table_info(provider_profiles)").all().map((column) => column.name);
  if (!profileColumns.includes("photo_data")) database.exec("ALTER TABLE provider_profiles ADD COLUMN photo_data TEXT NOT NULL DEFAULT ''");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@localservicehelper.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const existingAdmin = database.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);

  if (!existingAdmin) {
    database.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
      .run("Local Service Helper Admin", adminEmail, hashPassword(adminPassword));
  }

  const providerCount = database.prepare("SELECT COUNT(*) AS count FROM provider_profiles WHERE user_id IS NULL").get().count;
  if (providerCount === 0) {
    const insert = database.prepare(`
      INSERT INTO provider_profiles
        (service_slug, business_name, city, phone, experience_years, specialties, bio, approval_status, rating, review_count, availability_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?)
    `);
    for (const [serviceSlug, name, city, experience, rating, reviews, specialties] of seedProviders) {
      const years = Number.parseInt(experience, 10);
      insert.run(serviceSlug, name, city, "0000000000", years, JSON.stringify(specialties.split(", ")), `Experienced ${serviceSlug.replace("-", " ")} professional.`, rating, reviews, "Available weekdays and weekends by appointment");
    }
  }

  // 15 usable provider accounts for each service, meant only for local demos.
  // Email pattern: <service>.provider01@demo.local through provider15.
  const findUser = database.prepare("SELECT id FROM users WHERE email=?");
  const createUser = database.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'provider')");
  const findProfile = database.prepare("SELECT id, photo_url FROM provider_profiles WHERE user_id=?");
  const createProfile = database.prepare(`INSERT INTO provider_profiles
    (user_id, service_slug, business_name, city, phone, experience_years, specialties, bio, credential_note, availability_note, approval_status, rating, review_count)
    VALUES (?, ?, ?, 'Ahmedabad', ?, ?, ?, ?, 'Demo provider account', ?, 'approved', ?, ?)`);
  const addProfilePhoto = database.prepare("UPDATE provider_profiles SET photo_url=? WHERE id=? AND (photo_url='' OR photo_url IS NULL OR photo_url LIKE 'https://loremflickr.com/%')");
  const serviceSlugs = Object.keys(demoNames);
  for (const serviceSlug of serviceSlugs) {
    const detail = demoDetails[serviceSlug];
    demoNames[serviceSlug].forEach((name, index) => {
      const email = `${serviceSlug}.provider${String(index + 1).padStart(2, "0")}@demo.local`;
      let account = findUser.get(email);
      if (!account) {
        const result = createUser.run(name, email, hashPassword(demoProviderPassword));
        account = { id: Number(result.lastInsertRowid) };
      }
      const profile = findProfile.get(account.id);
      if (!profile) {
        const rating = Number((4.5 + ((index % 5) * 0.1)).toFixed(1));
        const reviews = 24 + index * 7;
        const phone = `9${String(700000000 + index + serviceSlugs.indexOf(serviceSlug) * 100).padStart(9, "0")}`;
        createProfile.run(account.id, serviceSlug, name, phone, 3 + (index % 12), JSON.stringify(detail.specialties), detail.bio, detail.availability, rating, reviews);
        const created = findProfile.get(account.id);
        addProfilePhoto.run(demoPhotoUrl(serviceSlug, index), created.id);
      } else {
        addProfilePhoto.run(demoPhotoUrl(serviceSlug, index), profile.id);
      }
    });
  }
}

export function profileRow(row) {
  return row && { ...row, specialties: JSON.parse(row.specialties || "[]") };
}

