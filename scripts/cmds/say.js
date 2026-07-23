const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "صوت"],
		version: "6.0.0",
		author: "Fares",
		countDown: 3,
		role: 0,
		description: { ar: "توليد صوت بشري حقيقي وواقعي 100%" },
		category: "utility",
		guide: { ar: "{pn} <النص> — إرسال بصمة صوتية" }
	},

	onStart: async function ({ args, message, event }) {
		let text = "";

		try {
			if (event.type === "message_reply") {
				text = event.messageReply?.body || "";
			} else {
				if (!args || !args.length) {
					return message.reply("⌀ أهلاً بك يا فارس، الرجاء كتابة النص لتحويله إلى صوت بشري حقيقي.");
				}
				text = args.join(" ");
			}

			if (!text || !text.trim()) {
				return message.reply("⌀ لم يتم العثور على أي نص لتحويله.");
			}

			if (text.length > 250) {
				text = text.slice(0, 250);
			}

			const waitingMsg = await message.reply("⏳ جاري توليد الصوت الذكي...");

			const apiKey = "sk_c5ca42838d3c5d431343386551b5b30a020a3622d6056704";
			const voiceId = "21m00Tcm4TlvDq8ikWAM"; // أو المعرّف الذي اخترته

			const response = await axios.post(
				`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
				{
					text: text,
					model_id: "eleven_multilingual_v2",
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75
					}
				},
				{
					headers: {
						"Accept": "audio/mpeg",
						"Content-Type": "application/json",
						"xi-api-key": apiKey
					},
					responseType: "arraybuffer",
					timeout: 30000
				}
			);

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `voice_${Date.now()}.mp3`);

			await fs.writeFile(tmpPath, response.data);

			if (await fs.pathExists(tmpPath)) {
				await message.reply({
					attachment: fs.createReadStream(tmpPath)
				});

				// حذف رسالة الانتظار إن أمكن أو تركها
				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 15000);
			} else {
				return message.reply("⌀ تعذر حفظ الملف الصوتي.");
			}

		} catch (error) {
			console.error("ElevenLabs Error:", error.response?.data ? Buffer.from(error.response.data).toString() : error.message);
			return message.reply("⌀ حدث خطأ أثناء الاتصال بخدمة الصوت، تأكد من صحة المفتاح.");
		}
	}
};
