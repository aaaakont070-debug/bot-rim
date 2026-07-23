const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "صوت"],
		version: "5.0.0",
		author: "Fares",
		countDown: 3,
		role: 0,
		description: { ar: "توليد صوت نسائي بشري حقيقي وواقعي 100%" },
		category: "utility",
		guide: { ar: "{pn} <النص> — إرسال بصمة صوتية بصوت بنت حقيقي" }
	},

	onStart: async function ({ args, message, event }) {
		let text = "";

		try {
			// دعم الرد على الرسائل أو كتابة النص مباشرة
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
				text = text.slice(0, 250); // حماية الذاكرة والحد الأقصى للطلبات
			}

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `ai_girl_voice_${Date.now()}.mp3`);

			// 🔑 ضع مفتاح الـ API الخاص بك هنا بين العلامتين
			const apiKey = "sk_bc652b075a4a7adeae2d11536b4633026aa0c8e5acfd3d18";
			
			// 🎙️ ضع معرف الصوت النسائي (Voice ID) هنا بين العلامتين
			const voiceId = "21m00Tcm4TlvDq8ikWAM";

			const response = await axios({
				method: "post",
				url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
				headers: {
					"Accept": "audio/mpeg",
					"Content-Type": "application/json",
					"xi-api-key": apiKey
				},
				data: {
					text: text,
					model_id: "eleven_multilingual_v2", // نموذج ممتاز يدعم اللغة العربية واللهجات بدقة
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75
					}
				},
				responseType: "stream",
				timeout: 25000
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

				// حذف الملف المؤقت بعد الإرسال للحفاظ على مساحة السيرفر
				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 20000);
			} else {
				return message.reply("⌀ تعذر إنشاء الملف الصوتي الذكي.");
			}

		} catch (error) {
			console.error("AI Voice Error:", error);
			return message.reply("⌀ حدث خطأ في الاتصال بخدمة الصوت، تأكد من صحة المفتاح ومعرف الصوت.");
		}
	}
};
