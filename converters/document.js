const PDFDocument = require("pdfkit");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

exports.convertToPDF = async (bot, msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.photo.at(-1).file_id;
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

  const img = path.join("temp", Date.now() + ".png");
  const pdf = img.replace(".png", ".pdf");

  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(img, res.data);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdf));
  doc.image(img, { fit: [500, 700] });
  doc.end();

  doc.on("finish", async () => {
    await bot.sendDocument(chatId, pdf);
    fs.unlinkSync(img);
    fs.unlinkSync(pdf);
  });
};
