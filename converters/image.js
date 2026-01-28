const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

exports.convertImage = async (bot, msg, format) => {
  const chatId = msg.chat.id;
  const fileId = msg.photo
    ? msg.photo.at(-1).file_id
    : msg.document.file_id;

  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

  const input = path.join("temp", Date.now() + ".img");
  const output = input + "." + format;

  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(input, res.data);

  await sharp(input)[format]({ quality: 90 }).toFile(output);

  await bot.sendDocument(chatId, output, { caption: "✅ Image Converted" });
  fs.unlinkSync(input);
  fs.unlinkSync(output);
};
