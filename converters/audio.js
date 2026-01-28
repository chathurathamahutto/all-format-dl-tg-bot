const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.convertAudio = async (bot, msg, format) => {
  const chatId = msg.chat.id;
  const fileId = msg.audio.file_id;
  const file = await bot.getFile(fileId);

  const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
  const input = path.join("temp", Date.now() + ".input");
  const output = input + "." + format;

  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(input, res.data);

  ffmpeg(input)
    .toFormat(format)
    .save(output)
    .on("end", async () => {
      await bot.sendAudio(chatId, output);
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });
};
