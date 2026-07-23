const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const LANG_ALIASES = {
	ar: "ar", arabic: "ar", العربية: "ar",
	en: "en", english: "en",
	fr: "fr", french: "fr",
	de: "de", german: "de",
	es: "es", spanish: "es",
	tr: "tr", turkish: "tr",
};

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak", "قول", "نطق"],
		version: "2.1.0",
		author: "SIFAT",
		countDown: 3,
		role: 0,
		description: { ar: "تحويل النص إلى صوت بشري واضح باللغة العربية أو لغات أخرى" },
		category: "utility",
		guide: { ar: "{pn} <النص> — نطق النص بالعربية\n{pn} <النص> | ar — تحديد اللغة\n◈ قم بالرد على أي رسالة لتتحول إلى صوت" }
	},

	onStart: async function ({ args, message, event }) {
		let text = "";
		let lang = "ar"; // جعل اللغة الافتراضية العربية لتناسب طلبك تماماً

		try {
			if (event.type === "message_reply") {
				text = event.messageReply?.body || "";
				if (args[0]) {
					const lcode = args[0].toLowerCase();
					lang = LANG_ALIASES[lcode] || lcode;
				}
			} else {
				if (!args || !args.length) {
					return message.reply("⌀ الرجاء كتابة نص أو الرد على رسالة لتحويلها إلى صوت.");
				}
				if (args.includes("|")) {
					const fullArgs = args.join(" ");
					const parts = fullArgs.split("|").map(a => a.trim());
					text = parts[0];
					const lcode = (parts[1] || "ar").toLowerCase();
					lang = LANG_ALIASES[lcode] || lcode;
				} else {
					text = args.join(" ");
				}
			}

			if (!text || !text.trim()) {
				return message.reply("⌀ لم يتم العثور على أي نص لتحويله.");
			}

			// تحديد الحد الأقصى للنص لتجنب حظر جوجل أو توقف النظام
			if (text.length > 300) {
				text = text.slice(0, 300);
			}

			const tmpDir = path.join(__dirname, "tmp");
			await fs.ensureDir(tmpDir);
			const tmpPath = path.join(tmpDir, `tts_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp3`);

			// تقسيم النصوص الطويلة بأمان لتفادي أخطاء الـ Stream
			const chunks = text.match(/.{1,100}/g) || [text];
			
			for (let i = 0; i < chunks.length; i++) {
				const encodedChunk = encodeURIComponent(chunks[i]);
				const response = await axios({
					method: "get",
					url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedChunk}`,
						responseType: "stream",
					timeout: 10000
				});

				const writer = fs.createWriteStream(tmpPath, { flags: i === 0 ? "w" : "a" });
				response.data.pipe(writer);
				
				await new Promise((resolve, reject) => {
					writer.on("finish", resolve);
					writer.on("error", reject);
				});
			}

			// التأكد من أن الملف تم إنشاؤه بنجاح قبل الإرسال
			if (await fs.pathExists(tmpPath)) {
				await message.reply({
					body: `🔊 اللغة: ${lang}`,
					attachment: fs.createReadStream(tmpPath)
				});

				// تنظيف الملف بعد الإرسال لعدم ملء مساحة التخزين في البوت
				setTimeout(() => {
					fs.remove(tmpPath).catch(() => {});
				}, 30000);
			} else {
				return message.reply("⌀ تعذر إنشاء الملف الصوتي.");
			}

		} catch (error) {
			console.error("TTS Error:", error);
			return message.reply("⌀ حدث خطأ أثناء توليد الصوت، يرجى المحاولة لاحقاً.");
		}
	}
};
