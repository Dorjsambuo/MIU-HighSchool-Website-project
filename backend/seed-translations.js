// seed-translations.js
// ensureSection нь зөвхөн шинэ document дээр л ажилладаг тул
// (аль хэдийн байгаа document-ыг өөрчлөхгүй) энэ script нь
// vice / success / cafeteria section-уудыг ШУУД, ЗААВАЛ шинэчилнэ.
//
// Ажиллуулах:
//   cd backend
//   node seed-translations.js

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Mongo connected.");

const SectionSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
const Section = mongoose.model("Section", SectionSchema);

async function forceSet(key, data) {
  const doc = await Section.findOne({ key });
  if (!doc) {
    console.log(`⚠️  ${key}: document олдсонгүй, шинээр үүсгэнэ`);
    await Section.create({ key, data });
    console.log(`✅ ${key}: шинээр үүсгэлээ`);
    return;
  }

  // Одоо байгаа өгөгдлийг хадгалж, зөвхөн орчуулгын талбаруудыг merge хийнэ
  const current = doc.data || {};
  const merged = { ...current, ...data };

  await Section.updateOne({ key }, { $set: { data: merged } });
  console.log(`✅ ${key}: орчуулга бичигдлээ`);
}

await forceSet("vice", {
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

await forceSet("success", {
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

await forceSet("cafeteria", {
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
});

await forceSet("missionVision", {
  mission: {
    en: "To provide a high-quality international education ...",
    mn: "Олон улсын өндөр чанартай боловсрол олгох ...",
  },
  vision: {
    en: "To be a leading international school ...",
    mn: "Тэргүүлэх олон улсын сургууль болох ...",
  },
});

console.log("🎉 Орчуулгууд бүгд database руу бичигдлээ!");
await mongoose.disconnect();
process.exit(0);
