const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "صوت"],
		version: "9.0.0",
		author: "Fares",
		countDown: 3,
		role: 0,
		description: { ar: "توليد صوت بشري واقعي واحترافي بناءً على طلب المستخدم" },
		category: "utility",
		guide: { ar: "{pn} <النص> — تحويل أي نص إلى صوت بشري حقيقي" }
	},

	onStart: async function ({ args, message, event }) {
		let text = "";

		try {
			if (event.type === "message_reply") {
				text = event.messageReply?.body || "";
			} else {
				if (!args || !args.length) {
					return message.reply("⌀ أهلاً بك يا فارس، الرجاء كتابة النص المراد تحويله.");
				}
				text = args.join(" ");
			}

			if (!text || !text.trim()) {
				return message.reply("⌀ النص فارغ.");
			}

			if (text.length > 300) {
				text = text.slice(0, 300);
			}

			const waitingMsg = await message.reply("🎙️ جاري هندسة الصوت الاحترافي...");

			// 🔑 ضع مفتاح OpenAI API الخاص بك هنا (يبدأ بـ sk-)
			const openaiApiKey = "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";

			const response = await axios.post(
				"https://api.openai.com/v1/audio/speech",
				{
					model: "tts-1", // نموذج عالي السرعة والجودة
					input: text,
					voice: "nova", // صوت نسائي بشري ناعم وواقعي جداً (أو اختر alloy / shimmer)
					response_format: "mp3"
				},
				{
					headers: {
						"Authorization": `Bearer ${openaiApiKey}`,
						"Content-Type": "application/json"
					},
					responseType: "arraybuffer",
					timeout: 30000
				}
			);

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `openai_voice_${Date.now()}.mp3`);

			await fs.writeFile(tmpPath, response.data);

			if (await fs.pathExists(tmpPath)) {
				await message.reply({
					attachment: fs.createReadStream(tmpPath)
				});

				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 15000);
			} else {
				return message.reply("⌀ تعذر حفظ الملف الصوتي.");
			}

		} catch (error) {
			console.error("OpenAI TTS Error:", error.response?.data ? Buffer.from(error.response.data).toString() : error.message);
			return message.reply("⌀ حدث خطأ في الـ API الاحترافي، تأكد من المفتاح.");
		}
	}
};
