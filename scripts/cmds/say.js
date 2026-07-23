const gtts = require('gtts');
const fs = require('fs-extra');
const path = require('path');

export default {
    config: {
        name: "say",
        version: "1.0.0",
        author: "Fares & Gemini",
        countDown: 5,
        role: 0,
        shortDescription: "تحويل النص إلى صوت",
        longDescription: "تحويل النص المدخل إلى بصمة صوتية بشرية مجاناً",
        category: "media",
        guide: {
            en: "{pn} [text]"
        }
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const text = args.join(" ");
        
        if (!text) {
            return api.sendMessage("أهلاً بك يا زميلي، الرجاء كتابة النص المراد تحويله.", threadID, messageID);
        }

        try {
            await api.sendMessage("🎙️ جاري هندسة الصوت الاحترافي...", threadID, messageID);

            const fileName = `voice_${Date.now()}.mp3`;
            const filePath = path.join(__dirname, fileName);

            const speech = new gtts(text, 'ar');

            speech.save(filePath, async (err) => {
                if (err) {
                    console.error(err);
                    return api.sendMessage("حدث خطأ في توليد الملف الصوتي.", threadID, messageID);
                }

                await api.sendMessage({
                    attachment: fs.createReadStream(filePath)
                }, threadID, () => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }, messageID);
            });

        } catch (error) {
            console.error(error);
            return api.sendMessage("حدث خطأ تقني في السيرفر.", threadID, messageID);
        }
    }
};
