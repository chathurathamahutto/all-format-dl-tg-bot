const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const { convertImage } = require("./converters/image");
const { convertAudio } = require("./converters/audio");
const { convertVideo } = require("./converters/video");
const { convertToPDF } = require("./converters/document");

const BOT_TOKEN = "YOUR_BOT_TOKEN";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const cache = new Map();
const TEMP = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP);

// start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
`🔄 *ALL FORMAT CONVERTER BOT*

📎 Send Image / Audio / Video
🎯 Choose output format
⚡ Fast • Safe • Unlimited`,
    { parse_mode: "Markdown" }
  );
});

// receive files
bot.on(["photo", "document", "audio", "video"], async (msg) => {
  const chatId = msg.chat.id;
  const id = Math.random().toString(36).slice(2, 8);

  cache.set(id, msg);

  await bot.sendMessage(chatId, "📂 Choose output format:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🖼️ WEBP", callback_data: `img_webp_${id}` },
          { text: "🖼️ JPG", callback_data: `img_jpg_${id}` }
        ],
        [
          { text: "🎵 MP3", callback_data: `aud_mp3_${id}` },
          { text: "🎵 WAV", callback_data: `aud_wav_${id}` }
        ],
        [
          { text: "🎬 MP3 (Video)", callback_data: `vid_mp3_${id}` },
          { text: "🎬 GIF", callback_data: `vid_gif_${id}` }
        ],
        [
          { text: "📄 PDF", callback_data: `doc_pdf_${id}` }
        ]
      ]
    }
  });
});

// callbacks
bot.on("callback_query", async (q) => {
  const [type, format, id] = q.data.split("_");
  const msg = cache.get(id);
  const chatId = q.message.chat.id;

  if (!msg) {
    return bot.sendMessage(chatId, "❌ File expired. Send again.");
  }

  try {
    if (type === "img") await convertImage(bot, msg, format);
    if (type === "aud") await convertAudio(bot, msg, format);
    if (type === "vid") await convertVideo(bot, msg, format);
    if (type === "doc") await convertToPDF(bot, msg);

    cache.delete(id);
    bot.answerCallbackQuery(q.id);
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, "❌ Conversion failed.");
  }
});

console.log("🚀 ALL FORMAT CONVERTER BOT RUNNING");
