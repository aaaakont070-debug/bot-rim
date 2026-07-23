const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "صوت"],
		version: "3.0.0",
		author: "SIFAT",
		countDown: 3,
		role: 0,
		description: { ar: "توليد صوت بشري طبيعي وواضح" },
		category: "utility",
		guide: { ar: "{pn} <النص> — إرسال بصمة صوتية بشرية" }
	},

	onStart: async function ({ args, message, event }) {
		let text = "";

		try {
			if (event.type === "message_reply") {
				text = event.messageReply?.body || "";
			} else {
				if (!args || !args.length) {
					return message.reply("⌀ أهلاً بك يا فارس، الرجاء كتابة النص المراد تحويله إلى صوت بشري.");
				}
				text = args.join(" ");
			}

			if (!text || !text.trim()) {
				return message.reply("⌀ لم يتم العثور على أي نص لتحويله.");
			}

			if (text.length > 250) {
				text = text.slice(0, 250);
			}

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `human_voice_${Date.now()}.mp3`);

			// استخدام محرك صوتي ذكي ونقي يدعم النطق البشري الواضح
			const encodedText = encodeURIComponent(text);
			const apiURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ar&client=tw-ob`;

			const response = await axios({
				method: "get",
				url: apiURL,
				responseType: "stream",
				timeout: 12000,
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
				}
			});

			const writer = fs.createWriteStream(tmpPath);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			if (await fs.pathExists(tmpPath)) {
				await message.reply({
					attachment: fs.createReadStream(tmpPath)
				});

				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 20000);
			} else {
				return message.reply("⌀ تعذر إنشاء الملف الصوتي البشري.");
			}

		} catch (error) {
			console.error("Human Voice TTS Error:", error);
			return message.reply("⌀ حدث خطأ بسيط أثناء معالجة الصوت، نظام البوت يعمل بشكل آمن تماماً ولم يتأثر.");
		}
	}
};
