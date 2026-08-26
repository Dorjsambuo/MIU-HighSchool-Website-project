// server.js (ESM) - Mongo backend for MIU site

import jwt from "jsonwebtoken";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ----- Paths (ESM __dirname fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ----- CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok =
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      if (ok) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// ----- Multer (uploads to disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({ storage });

// -------------------- MONGO --------------------
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Mongo connected. readyState =", mongoose.connection.readyState);

// A generic “Section” store: key => data (any shape)
const SectionSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
const Section = mongoose.model("Section", SectionSchema);

// Optional: track uploads metadata in Mongo (NOT the file bytes)
const UploadSchema = new mongoose.Schema(
  {
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
  },
  { timestamps: true },
);
const Upload = mongoose.model("Upload", UploadSchema);

// Helpers
async function ensureSection(key, defaultData) {
  await Section.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, data: defaultData } },
    { upsert: true },
  );
}

async function getSection(key, defaultData) {
  const doc = await Section.findOne({ key }).lean();
  return doc?.data ?? defaultData;
}

async function setSection(key, data) {
  await Section.findOneAndUpdate(
    { key },
    { key, data },
    { upsert: true, new: true },
  );
}

// ----- Seed defaults (runs once because of $setOnInsert)
await ensureSection("vice", {
  imageUrl: "",
  title: {
    en: "Dear Students, Parents, and Community,",
    mn: "Эрхэм оюутан, эцэг эх, олон нийтэд,",
  },
  p1: {
    en: "Welcome to Mongolian International School.",
    mn: "Монголын Итгэл Сургуульд тавтай морил.",
  },
  p2: {
    en: "As the Vice Principal, ...",
    mn: "Дэд захирлын хувьд ...",
  },
  signatureHtml: {
    en: "Mr.<br/>Vice Principal",
    mn: "Ноён.<br/>Дэд захирал",
  },
});

await ensureSection("missionVision", {
  mission: {
    en: "To provide a high-quality international education ...",
    mn: "Олон улсын өндөр чанартай боловсрол олгох ...",
  },
  vision: {
    en: "To be a leading international school ...",
    mn: "Тэргүүлэх олон улсын сургууль болох ...",
  },

  sections: [
    {
      id: 1,
      title: "Our Mission",
      content: {
        en: "To provide a high-quality international education ...",
        mn: "Олон улсын өндөр чанартай боловсрол олгох ...",
      },
    },
    {
      id: 2,
      title: "Our Vision",
      content: {
        en: "To be a leading international school ...",
        mn: "Тэргүүлэх олон улсын сургууль болох ...",
      },
    },
  ],
});

await ensureSection("success", {
  subtitle: {
    en: "Celebrating achievements and milestones",
    mn: "Амжилт, түүхэн үйл явдлуудыг тэмдэглэж байна",
  },
  graduates: { en: "500", mn: "500" },
  awards: {
    en: "Recognized for excellence in education",
    mn: "Боловсролын чанараар шалгарсан",
  },
  community: {
    en: "Active participation in community service projects",
    mn: "Олон нийтийн үйл ажиллагаанд идэвхтэй оролцдог",
  },
});

await ensureSection("cafeteria", {
  title: { en: "School Cafeteria", mn: "Сургуулийн хоолны газар" },
  subtitle: {
    en: "Healthy and nutritious meals for our students",
    mn: "Сурагчдад эрүүл, тэжээллэг хоол",
  },
  heading: {
    en: "Nutrition-Focused Meals",
    mn: "Тэжээллэг хоолонд чиглэсэн",
  },
  text: {
    en: "Our cafeteria provides balanced meals prepared daily by professional chefs using fresh ingredients...",
    mn: "Манай хоолны газар мэргэжлийн тогооч нарын өдөр бүр бэлтгэдэг тэнцвэртэй хоолыг шинэ хүнс ашиглан бэлтгэдэг...",
  },
  imageUrl: "",
});

await ensureSection("banner", {
  imageUrl: "/uploads/556981901_1889760831840412_9179320815925247158_n.jpg",
});

// Calendar format: { events: { "YYYY-MM-DD": { type, title, fullDesc } } }
await ensureSection("calendar", { events: {} });

await ensureSection("activities", {
  title: "Extracurricular Activities",
  subtitle: "Enriching experiences beyond the classroom",
  items: [
    {
      title: "Basketball Team",
      description: "Develop athletic skills and teamwork.",
      time: "Wed 3:40-5:00 PM",
      grades: "Grades 9-12",
      imageUrl: "/uploads/568292496_1908326693317159_3626035863105372190_n.jpg",
    },
    {
      title: "Taekwondo Club",
      description: "Develop athletic skills and teamwork.",
      time: " Mon/Wed 4:00-5:30 PM",
      grades: "Grades 7-12",
      imageUrl: "/uploads/559235804_1895783727904789_3739476468778142488_n.jpg",
    },
    {
      title: "Music & Arts",
      description:
        "Explore creativity through various art forms and musical instruments.",
      time: "Tue 3:40-5:00 PM",
      grades: "All Grades",
      imageUrl: "/uploads/497537379_1768540893962407_7532981151105264191_n.jpg",
    },
  ],
});

await ensureSection("specialPrograms", {
  title: "Special Programs",
  subtitle: "Unique opportunities for specialized learning",
  items: [
    {
      icon: "fas fa-graduation-cap",
      title: "College Prep",
      description:
        "Comprehensive guidance for university applications and career planning.",
    },
    {
      icon: "fas fa-language",
      title: "Language Immersion",
      description: "Intensive language programs in English, Korean.",
    },
    {
      icon: "fas fa-laptop-code",
      title: "STEM Program",
      description:
        "Advanced courses in Science, Technology, Engineering, and Mathematics.",
    },
  ],
});

await ensureSection("volunteer", {
  title: "Volunteer Programs",
  subtitle: "Make a difference in your community",
  items: [
    {
      title: "Tutoring Program",
      description:
        "Help elementary school students with reading and math skills. Training provided for all volunteers.",
      imageUrl:
        "/uploads/1769940668925-571824159_1915855125897649_9209040587861907538_n.jpg",
    },
    {
      title: "Environmental Club",
      description:
        "Participate in tree planting, recycling campaigns, and community cleanups.",
      imageUrl: "/uploads/1769940717539-1542.jpg",
    },
    {
      title: "Community Service",
      description:
        "Work with local organizations to support community development projects.",
      imageUrl:
        "/uploads/1769940756304-566387587_1908325923317236_7524284606729972988_n.jpg",
    },
  ],
});

await ensureSection("process", {
  title: "Admissions Process",
  subtitle: "Steps to join our community",
  steps: [
    {
      title: "Inquiry & Information",
      description:
        "Start by learning about our school programs and curriculum.",
      bullets: [
        "Attend Open House sessions",
        "Review academic programs",
        "Contact admissions office",
        "Schedule campus tour",
      ],
    },
    {
      title: "Application Submission",
      description:
        "Submit the complete application package including all required documents.",
      bullets: [
        "Complete online application form",
        "Submit academic records",
        "Provide birth certificate copy",
      ],
    },
    {
      title: "Assessment & Interview",
      description:
        "Students are invited for assessment and interview for placement.",
      bullets: ["Academic assessment", "English proficiency test"],
    },
    {
      title: "Admission Decision",
      description:
        "Receive admission decision and complete enrollment process.",
      bullets: [
        "Decision within 2 weeks",
        "Submit enrollment agreement",
        "Attend orientation",
      ],
    },
  ],
});

await ensureSection("application", {
  sectionTitle: "Online Admissions",
  sectionSubtitle: "Apply conveniently through our portal",

  leftTitle: "Apply Online",
  leftText:
    "Our online admissions portal makes it easy to apply from anywhere. Track your application status and submit documents electronically.",

  requirementsTitle: "Required Documents",
  requirementsItems: [
    "Completed application form",
    "Student's birth certificate",
    "Parent/guardian ID",
    "Teacher recommendations",
  ],

  cardTitle: "Start Application",
  cardText: "Begin your journey with Mongolian Itgel School today.",
  buttonText: "Apply Online",
  buttonUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSeYmx8V7M2LNLFUH08G06LKwdAtbhIq6DJngrFgp2TEosNdRg/viewform",

  helpText: "Need help? Contact admissions@mis.edu.mn",
});

await ensureSection("tuition", {
  sectionTitle: "Tuition & Fees",
  sectionSubtitle: "Transparent pricing for quality education",
  cards: [
    {
      title: "Primary School",
      subtitle: "Grades 1-5",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
    {
      title: "Middle School",
      subtitle: "Grades 6-8",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
    {
      title: "High School",
      subtitle: "Grades 9-12",
      items: [
        { label: "Annual Tuition", amount: "3,600,000T" },
        { label: "Registration Fee", amount: "20,000T" },
        { label: "Technology Fee", amount: "20,000T" },
        { label: "Books & Materials", amount: "10,000T" },
      ],
    },
  ],
});

await ensureSection("news", {
  sectionTitle: "School News",
  sectionSubtitle: "Latest updates from our school",
  items: [
    {
      title: "Science Fair Winners",
      date: "October 15, 2025",
      excerpt:
        "Our students achieved remarkable success at the annual science fair, winning multiple awards for innovative projects.",
      moreText:
        'Renewable Energy Solutions for Rural Mongolia," was developed by 11th-grade students and received special recognition from the Ministry of Education.',
      imageUrl: "/uploads/1111",
    },
    {
      title: "New Library Opening",
      date: "September 28, 2025",
      excerpt: "We are excited to announce the opening of our new library.",
      moreText:
        "The new library features state-of-the-art facilities including quiet study areas, group collaboration spaces, and a digital media center. With over 5,000 physical books, students now have unprecedented access to learning materials.",
      imageUrl: "/uploads/1112",
    },
    {
      title: "Sports Tournament Success",
      date: "August 20, 2025",
      excerpt:
        "Our school basketball team won the regional championship tournament.",
      moreText:
        "The school's basketball team demonstrated exceptional skill and determination throughout the regional tournament.",
      imageUrl: "/uploads/1345",
    },
  ],
});

await ensureSection("faq", {
  sectionTitle: "Frequently Asked Questions",
  sectionSubtitle: "Find answers to common questions",
  items: [
    {
      question: "What is the application deadline?",
      answer:
        "Applications are accepted year-round, but we recommend applying by April 30th for the following academic year starting in August.",
    },
    {
      question: "What documents are required for admission?",
      answer:
        "Required documents include:\n- Completed application form\n- Previous academic transcripts (2 years)\n- Birth certificate or passport copy\n- Parent/guardian identification\n- Teacher recommendations",
    },
    {
      question: "Is there an entrance exam?",
      answer:
        "Yes, students in grades 3-12 take an entrance assessment including:\n- English language proficiency test\n- Mathematics assessment\n- Reading comprehension (for grades 6-12)\n- Writing sample (for grades 9-12)",
    },
    {
      question: "What curriculum does the school follow?",
      answer:
        "We follow an international curriculum combining:\n- American Common Core Standards for English and Math\n- British curriculum for Sciences\n- Advanced Placement (AP) courses for high school\n- Mongolian language and cultural studies\n- English language programs",
    },
    {
      question: "Are scholarships available?",
      answer:
        "Yes, we offer several scholarship opportunities:\n- Academic Excellence Scholarship: For top-performing students\n- Need-Based Financial Aid: For families with financial constraints\n- Sports Scholarship: For exceptional athletes\n\nApplications must be submitted by March 31st each year.",
    },
  ],
});

await ensureSection("contact", {
  sectionTitle: "Contact Information",
  sectionSubtitle: "Get in touch with us",
  address: {
    org: "Mongolian Itgel School",
    line1: "Bayanzurkh District, 13khoroo",
    line2: "Ulaanbaatar, Mongolia",
  },
  phones: {
    mainOffice: "+976 123-4567",
    admissions: "+976 123-4568",
  },
  emails: {
    general: "info@mis.edu.mn",
    admissions: "admissions@mis.edu.mn",
    registrar: "registrar@mis.edu.mn",
  },
  socials: {
    facebook: "#",
    instagram: "#",
    email: "mailto:info@mis.edu.mn",
  },
});

// -------------------- ROUTES --------------------
app.get("/", (req, res) => res.send("✅ API is running"));

// Upload (save file to disk + save metadata to Mongo)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageUrl = `/uploads/${req.file.filename}`;

    await Upload.create({
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.json({ imageUrl });
  } catch (e) {
    console.error("Upload failed:", e);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Vice (merge)
app.get("/api/vice", async (req, res) => {
  res.json(await getSection("vice", {}));
});
app.post("/api/vice", async (req, res) => {
  const current = await getSection("vice", {});
  await setSection("vice", { ...current, ...req.body });
  res.json({ success: true });
});

// Mission & Vision (merge)
// Mission & Vision
app.get("/api/mission-vision", async (req, res) => {
  try {
    const data = await getSection("missionVision", {
      mission: "",
      vision: "",
      sections: [],
    });

    // New structure already exists
    if (Array.isArray(data.sections)) {
      return res.json({
        ...data,
        sections: data.sections,
      });
    }

    // Backward compatibility:
    // Convert old mission + vision into sections
    const sections = [
      {
        id: 1,
        title: "Our Mission",
        content: data.mission || "",
      },
      {
        id: 2,
        title: "Our Vision",
        content: data.vision || "",
      },
    ];

    res.json({
      ...data,
      sections,
    });
  } catch (error) {
    console.error("GET /api/mission-vision failed:", error);

    res.status(500).json({
      error: "Failed to load Mission & Vision",
    });
  }
});

app.post("/api/mission-vision", async (req, res) => {
  try {
    const current = await getSection("missionVision", {});

    const sections = Array.isArray(req.body.sections)
      ? req.body.sections.map((section, index) => ({
          id: section.id ?? Date.now() + index,
          title: String(section.title ?? ""),
          content: section.content ?? { en: "", mn: "" },
        }))
      : [];

    // Keep old mission/vision fields for compatibility
    let mission = current.mission || "";
    let vision = current.vision || "";

    if (sections.length > 0) {
      const missionSection = sections.find(
        (section) => section.title.toLowerCase().trim() === "our mission",
      );

      const visionSection = sections.find(
        (section) => section.title.toLowerCase().trim() === "our vision",
      );

      if (missionSection) {
        mission = missionSection.content;
      }

      if (visionSection) {
        vision = visionSection.content;
      }
    }

    await setSection("missionVision", {
      ...current,

      mission,
      vision,

      sections,
    });

    res.json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error("POST /api/mission-vision failed:", error);

    res.status(500).json({
      error: "Failed to save Mission & Vision",
    });
  }
});

// Success (merge)
app.get("/api/success", async (req, res) => {
  res.json(await getSection("success", {}));
});
app.post("/api/success", async (req, res) => {
  const current = await getSection("success", {});
  await setSection("success", { ...current, ...req.body });
  res.json({ success: true });
});

// Cafeteria (merge)
app.get("/api/cafeteria", async (req, res) => {
  res.json(await getSection("cafeteria", {}));
});
app.post("/api/cafeteria", async (req, res) => {
  const current = await getSection("cafeteria", {});
  await setSection("cafeteria", { ...current, ...req.body });
  res.json({ success: true });
});

// Banner (replace)
app.get("/api/banner", async (req, res) => {
  res.json(await getSection("banner", { imageUrl: "" }));
});
app.post("/api/banner", async (req, res) => {
  const { imageUrl } = req.body || {};
  await setSection("banner", { imageUrl: imageUrl || "" });
  res.json({ success: true });
});
app.delete("/api/banner", async (req, res) => {
  await setSection("banner", { imageUrl: "" });
  res.json({ success: true });
});

// Activities (replace whole object)
app.get("/api/activities", async (req, res) => {
  res.json(
    await getSection("activities", {
      title: "Extracurricular Activities",
      subtitle: "Enriching experiences beyond the classroom",
      items: [],
    }),
  );
});
app.put("/api/activities", async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid body" });
  }

  const next = {
    title: body.title ?? "Extracurricular Activities",
    subtitle: body.subtitle ?? "",
    items: Array.isArray(body.items) ? body.items : [],
  };

  await setSection("activities", next);
  res.json({ success: true });
});

// Special Programs (merge)
app.get("/api/special-programs", async (req, res) => {
  res.json(await getSection("specialPrograms", {}));
});
app.post("/api/special-programs", async (req, res) => {
  const current = await getSection("specialPrograms", {});
  await setSection("specialPrograms", { ...current, ...req.body });
  res.json({ success: true });
});

// Calendar (replace whole)
app.get("/api/calendar", async (req, res) => {
  res.json(await getSection("calendar", { events: {} }));
});
app.put("/api/calendar", async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || typeof body.events !== "object") {
    return res
      .status(400)
      .json({ error: "Invalid calendar format. Expected { events: { ... } }" });
  }

  for (const k of Object.keys(body.events)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      return res.status(400).json({ error: `Invalid date key: ${k}` });
    }
  }

  await setSection("calendar", { events: body.events });
  res.json({ success: true });
});

// Calendar: update ONE date
app.post("/api/calendar/event", async (req, res) => {
  const { date, event } = req.body || {};
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }

  const cal = await getSection("calendar", { events: {} });

  if (!event) {
    delete cal.events[date];
  } else {
    cal.events[date] = {
      type: event.type || "event",
      title: event.title || "",
      fullDesc: event.fullDesc || "",
    };
  }

  await setSection("calendar", cal);
  res.json({ success: true, calendar: cal });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminUsername || !adminPassword || !jwtSecret) {
    return res.status(500).json({
      message: "Admin authentication is not configured",
    });
  }

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    {
      username: adminUsername,
      role: "admin",
    },
    jwtSecret,
    {
      expiresIn: "8h",
    },
  );

  res.json({
    message: "Login successful",
    token,
  });
});

// ----- Start
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

app.get("/api/volunteer", async (req, res) => {
  res.json(
    await getSection("volunteer", {
      title: "Volunteer Programs",
      subtitle: "Make a difference in your community",
      items: [],
    }),
  );
});
app.put("/api/volunteer", async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid body" });
  }

  const next = {
    title: body.title ?? "Volunteer Programs",
    subtitle: body.subtitle ?? "",
    items: Array.isArray(body.items) ? body.items : [],
  };

  await setSection("volunteer", next);
  res.json({ success: true });
});

// Admissions Process
app.get("/api/process", async (req, res) => {
  const data = await getSection("process", {
    title: "Admissions Process",
    subtitle: "Steps to join our community",
    steps: [],
  });
  res.json(data);
});

app.put("/api/process", async (req, res) => {
  await setSection("process", {
    title: req.body.title ?? "",
    subtitle: req.body.subtitle ?? "",
    steps: Array.isArray(req.body.steps) ? req.body.steps : [],
  });
  res.json({ success: true });
});

// GET
app.get("/api/application", async (req, res) => {
  try {
    const doc = await Section.findOne({ key: "application" }).lean();
    res.json(doc?.data || null);
  } catch (e) {
    console.error("GET /api/application failed:", e);
    res.status(500).json({ error: "Failed to load application" });
  }
});

// PUT
app.put("/api/application", async (req, res) => {
  try {
    const payload = req.body || {};

    // basic normalization so the frontend always gets the right types
    const clean = {
      sectionTitle: String(payload.sectionTitle ?? ""),
      sectionSubtitle: String(payload.sectionSubtitle ?? ""),
      leftTitle: String(payload.leftTitle ?? ""),
      leftText: String(payload.leftText ?? ""),
      requirementsTitle: String(payload.requirementsTitle ?? ""),
      requirementsItems: Array.isArray(payload.requirementsItems)
        ? payload.requirementsItems.map((s) => String(s ?? ""))
        : [],
      cardTitle: String(payload.cardTitle ?? ""),
      cardText: String(payload.cardText ?? ""),
      buttonText: String(payload.buttonText ?? ""),
      buttonUrl: String(payload.buttonUrl ?? ""),
      helpText: String(payload.helpText ?? ""),
    };

    await Section.updateOne(
      { key: "application" },
      { $set: { data: clean } },
      { upsert: true },
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/application failed:", e);
    res.status(500).json({ error: "Failed to save application" });
  }
});

app.get("/api/tuition", async (req, res) => {
  try {
    const data = await getSection("tuition", {
      sectionTitle: "Tuition & Fees",
      sectionSubtitle: "Transparent pricing for quality education",
      cards: [],
    });

    // Backward compatibility: if old data exists (title/subtitle/fees), normalize it
    const normalized = {
      sectionTitle: data.sectionTitle ?? data.title ?? "",
      sectionSubtitle: data.sectionSubtitle ?? data.subtitle ?? "",
      cards: Array.isArray(data.cards)
        ? data.cards.map((c) => {
            const items = Array.isArray(c.items)
              ? c.items
              : Array.isArray(c.fees)
                ? c.fees.map((f) => ({
                    label: f.name ?? "",
                    amount: f.amount ?? "",
                  }))
                : [];

            return {
              title: c.title ?? "",
              subtitle: c.subtitle ?? "",
              items: items.map((it) => ({
                label: it.label ?? it.name ?? "",
                amount: it.amount ?? "",
              })),
            };
          })
        : [],
    };

    res.json(normalized);
  } catch (e) {
    console.error("GET /api/tuition failed:", e);
    res.status(500).json({ error: "Failed to load tuition" });
  }
});

app.put("/api/tuition", async (req, res) => {
  try {
    const body = req.body || {};

    let cards = body.cards;
    if (typeof cards === "string") {
      try {
        cards = JSON.parse(cards);
      } catch {
        cards = [];
      }
    }

    const clean = {
      sectionTitle: String(body.sectionTitle ?? body.title ?? ""),
      sectionSubtitle: String(body.sectionSubtitle ?? body.subtitle ?? ""),
      cards: Array.isArray(cards)
        ? cards.map((c) => {
            const rawItems = Array.isArray(c.items)
              ? c.items
              : Array.isArray(c.fees)
                ? c.fees.map((f) => ({
                    label: f.name ?? f.label ?? "",
                    amount: f.amount ?? "",
                  }))
                : [];

            return {
              title: String(c?.title ?? ""),
              subtitle: String(c?.subtitle ?? ""),
              items: rawItems.map((it) => ({
                label: String(it?.label ?? it?.name ?? ""),
                amount: String(it?.amount ?? ""),
              })),
            };
          })
        : [],
    };

    await setSection("tuition", clean);
    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/tuition failed:", e);
    res.status(500).json({ error: "Failed to save tuition" });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const raw = await getSection("news", {
      sectionTitle: "School News",
      sectionSubtitle: "",
      items: [],
    });

    // Backward compatible: if older data stored as an array, wrap it
    const normalized = Array.isArray(raw)
      ? { sectionTitle: "School News", sectionSubtitle: "", items: raw }
      : {
          sectionTitle: String(raw?.sectionTitle ?? "School News"),
          sectionSubtitle: String(raw?.sectionSubtitle ?? ""),
          items: Array.isArray(raw?.items) ? raw.items : [],
        };

    res.json(normalized);
  } catch (e) {
    console.error("GET /api/news failed:", e);
    res.status(500).json({ error: "Failed to load news" });
  }
});

// PUT news (accepts either full object or an array)
app.put("/api/news", async (req, res) => {
  try {
    const body = req.body || {};

    // Allow older admin code that sends an array directly:
    const incoming = Array.isArray(body) ? { items: body } : body;

    const clean = {
      sectionTitle: String(incoming.sectionTitle ?? "School News"),
      sectionSubtitle: String(incoming.sectionSubtitle ?? ""),
      items: Array.isArray(incoming.items)
        ? incoming.items.map((n) => ({
            title: String(n?.title ?? ""),
            date: String(n?.date ?? ""),
            imageUrl: String(n?.imageUrl ?? ""),
            excerpt: String(n?.excerpt ?? ""),
            moreText: String(n?.moreText ?? ""),
          }))
        : [],
    };

    await setSection("news", clean);
    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/news failed:", e);
    res.status(500).json({ error: "Failed to save news" });
  }
});

// FAQ: GET
app.get("/api/faq", async (req, res) => {
  try {
    const raw = await getSection("faq", {
      sectionTitle: "Frequently Asked Questions",
      sectionSubtitle: "Find answers to common questions",
      items: [],
    });

    // backward compatible: if older data stored as array, wrap it
    const normalized = Array.isArray(raw)
      ? {
          sectionTitle: "Frequently Asked Questions",
          sectionSubtitle: "Find answers to common questions",
          items: raw,
        }
      : {
          sectionTitle: String(
            raw?.sectionTitle ?? "Frequently Asked Questions",
          ),
          sectionSubtitle: String(
            raw?.sectionSubtitle ?? "Find answers to common questions",
          ),
          items: Array.isArray(raw?.items) ? raw.items : [],
        };

    res.json(normalized);
  } catch (e) {
    console.error("GET /api/faq failed:", e);
    res.status(500).json({ error: "Failed to load faq" });
  }
});

// FAQ: PUT (admin saves)
app.put("/api/faq", async (req, res) => {
  try {
    const b = req.body || {};

    const clean = {
      sectionTitle: String(b.sectionTitle ?? "Frequently Asked Questions"),
      sectionSubtitle: String(
        b.sectionSubtitle ?? "Find answers to common questions",
      ),
      items: Array.isArray(b.items)
        ? b.items.map((x) => ({
            question: String(x?.question ?? ""),
            answer: String(x?.answer ?? "").replaceAll("\\n", "\n"), // ✅ FIX
          }))
        : [],
    };

    await setSection("faq", clean);
    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/faq failed:", e);
    res.status(500).json({ error: "Failed to save faq" });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    const data = await getSection("contact", null);
    res.json(data);
  } catch (e) {
    console.error("GET /api/contact failed:", e);
    res.status(500).json({ error: "Failed to load contact" });
  }
});

app.put("/api/contact", async (req, res) => {
  try {
    const b = req.body || {};

    const clean = {
      sectionTitle: String(b.sectionTitle ?? "Contact Information"),
      sectionSubtitle: String(b.sectionSubtitle ?? "Get in touch with us"),
      address: {
        org: String(b?.address?.org ?? ""),
        line1: String(b?.address?.line1 ?? ""),
        line2: String(b?.address?.line2 ?? ""),
      },
      phones: {
        mainOffice: String(b?.phones?.mainOffice ?? ""),
        admissions: String(b?.phones?.admissions ?? ""),
      },
      emails: {
        general: String(b?.emails?.general ?? ""),
        admissions: String(b?.emails?.admissions ?? ""),
        registrar: String(b?.emails?.registrar ?? ""),
      },
      socials: {
        facebook: String(b?.socials?.facebook ?? "#"),
        instagram: String(b?.socials?.instagram ?? "#"),
        email: String(b?.socials?.email ?? ""),
      },
    };

    await setSection("contact", clean);
    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/contact failed:", e);
    res.status(500).json({ error: "Failed to save contact" });
  }
});
