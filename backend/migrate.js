// migrate.js
// Нэг удаа ажиллуулах migration script.
// Хуучин string field-үүдийг { en, mn } bilingual object болгож хөрвүүлнэ.
//
// Ажиллуулах заавар:
//   1. Энэ файлыг backend/ folder дотор хий (server.js-тэй ижил түвшинд)
//   2. Terminal дээр: node migrate.js
//   3. Амжилттай дуусмагц энэ файлыг устгаж болно (дахин хэрэггүй)

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Mongo connected for migration.");

const SectionSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
const Section = mongoose.model("Section", SectionSchema);

// Аль хэдийн { en, mn } хэлбэртэй эсэхийг шалгах
function isBilingual(val) {
  return (
    val &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    ("en" in val || "mn" in val)
  );
}

// Хоосон string эсвэл string-ийг bilingual болгох
// (mn орчуулгыг хоосон үлдээнэ - дараа нь admin panel-с бөглөнө)
function toBi(val) {
  if (isBilingual(val)) return val; // аль хэдийн хийгдсэн бол алгасна
  const en = typeof val === "string" ? val : "";
  return { en, mn: "" };
}

async function migrateVice() {
  const doc = await Section.findOne({ key: "vice" });
  if (!doc) return console.log("⏭  vice: олдсонгүй, алгасав");
  const d = doc.data || {};

  d.title = toBi(d.title);
  d.p1 = toBi(d.p1);
  d.p2 = toBi(d.p2);
  d.signatureHtml = toBi(d.signatureHtml);
  // imageUrl bilingual биш тул хэвээр үлдээнэ

  await Section.updateOne({ key: "vice" }, { $set: { data: d } });
  console.log("✅ vice migrate хийгдлээ");
}

async function migrateSuccess() {
  const doc = await Section.findOne({ key: "success" });
  if (!doc) return console.log("⏭  success: олдсонгүй, алгасав");
  const d = doc.data || {};

  d.subtitle = toBi(d.subtitle);
  d.graduates = toBi(d.graduates);
  d.awards = toBi(d.awards);
  d.community = toBi(d.community);

  await Section.updateOne({ key: "success" }, { $set: { data: d } });
  console.log("✅ success migrate хийгдлээ");
}

async function migrateCafeteria() {
  const doc = await Section.findOne({ key: "cafeteria" });
  if (!doc) return console.log("⏭  cafeteria: олдсонгүй, алгасав");
  const d = doc.data || {};

  d.title = toBi(d.title);
  d.subtitle = toBi(d.subtitle);
  d.heading = toBi(d.heading);
  d.text = toBi(d.text);
  // imageUrl bilingual биш

  await Section.updateOne({ key: "cafeteria" }, { $set: { data: d } });
  console.log("✅ cafeteria migrate хийгдлээ");
}

async function migrateMissionVision() {
  const doc = await Section.findOne({ key: "missionVision" });
  if (!doc) return console.log("⏭  missionVision: олдсонгүй, алгасав");
  const d = doc.data || {};

  d.mission = toBi(d.mission);
  d.vision = toBi(d.vision);

  if (Array.isArray(d.sections)) {
    d.sections = d.sections.map((s) => ({
      ...s,
      // title-г string хэвээр үлдээнэ - server.js POST route
      // title.toLowerCase() ашигладаг тул bilingual object болговол эвдэрнэ
      title: typeof s.title === "string" ? s.title : s.title?.en || "",
      content: toBi(s.content),
    }));
  }

  await Section.updateOne({ key: "missionVision" }, { $set: { data: d } });
  console.log("✅ missionVision migrate хийгдлээ");
}

try {
  await migrateVice();
  await migrateSuccess();
  await migrateCafeteria();
  await migrateMissionVision();
  console.log("🎉 Бүх migration амжилттай дууслаа!");
} catch (e) {
  console.error("❌ Migration failed:", e);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
