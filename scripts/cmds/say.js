const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "صوت"],
		version: "5.0.0",
		author: "SIFAT",
		countDown: 5,
		role: 0,
		description: { ar: "توليد صوت نسائي بشري حقيقي وواقعي 100% باستخدام الذكاء الاصطناعي" },
		category: "utility",
		guide: { ar: "{pn} <النص> — إرسال بصمة صوتية بصوت بنت حقيقي" }
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
				text = text.slice(0, 250); // الحفاظ على الحد الآمن لعدم تجاوز استهلاك الخادم
			}

			// رسالة تنبيه بأن المعالجة الذكية جارية
			const waitingMsg = await message.reply("⏳ جاري توليد الصوت البشري الطبيعي...");

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `ai_girl_voice_${Date.now()}.mp3`);

			// هنا يتم وضع معرف الصوت البشري النسائي (Voice ID) ومفتاح الخدمة الخاص بك
			// ملاحظة: يمكنك وضع مفتاحك هنا أو استدعاؤه من ملف الإعدادات config.json لأمان أعلى
			const apiKey = global.GoatBot?.config?.aiVoiceApiKey || "ضع_مفتاح_الـ_API_هنا";
			const voiceId = "21m00Tcm4TlvDq8ikWAM"; // مثال لشصخية صوت نسائي شهير في المنصة

			if (apiKey === "ضع_مفتاح_الـ_API_هنا") {
				if (waitingMsg && waitingMsg.messageID) {
					try { api.unsendMessage(waitingMsg.messageID); } catch (_) {}
				}
				return message.reply("⚠️ تنبيه: يرجى إعداد مفتاح خدمة الصوت (API Key) في ملف الإعدادات لتفعيل الصوت البشري الحقيقي.");
			}

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
					model_id: "eleven_multilingual_v2", // نموذج يدعم اللغة العربية بدقة عالية
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75
					}
				},
				responseType: "stream",
				timeout: 20000
			});

			const writer = fs.createWriteStream(tmpPath);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			// حذف رسالة الانتظار إن وجدت
			if (waitingMsg && waitingMsg.messageID) {
				try { api.unsendMessage(waitingMsg.messageID); } catch (_) {}
			}

			if (await fs.pathExists(tmpPath)) {
				await message.reply({
					attachment: fs.createReadStream(tmpPath)
				});

				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 20000);
			} else {
				return message.reply("⌀ تعذر إنشاء الملف الصوتي الذكي.");
			}

		} catch (error) {
			console.error("AI Voice Error:", error);
			return message.reply("⌀ حدث خطأ في الاتصال بخدمة الصوت الذكي، البوت يعمل بأمان ولن يتأثر.");
		}
	}
};
