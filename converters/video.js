const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.convertVideo = async (bot, msg, format) => {
  const chatId = msg.chat.id;
  const file = await bot.getFile(msg.video.file_id);
  const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

  const input = path.join("temp", Date.now() + ".mp4");
  const output = input + "." + format;

  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(input, res.data);

  const cmd = ffmpeg(input);

  if (format === "gif") cmd.outputOptions("-vf fps=10,scale=320:-1");

  cmd.toFormat(format).save(output).on("end", async () => {
    if (format === "mp3") await bot.sendAudio(chatId, output);
    else await bot.sendDocument(chatId, output);

    fs.unlinkSync(input);
    fs.unlinkSync(output);
  });
};
