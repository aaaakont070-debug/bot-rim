export default {
    config: {
        name: "say",
        version: "1.0.0",
        author: "Fares",
        countDown: 5,
        role: 0,
        shortDescription: "تحويل النص إلى صوت",
        longDescription: "تحويل النص إلى بصمة صوتية بشرية مجاناً",
        category: "الخدمات الصوتية",
        guide: {
            ar: "{pn} [النص]"
        }
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const text = args.join(" ");
        
        if (!text) {
            return api.sendMessage("أهلاً بك يا فارس، الرجاء كتابة النص المراد تحويله.", threadID, messageID);
        }

        try {
            await api.sendMessage("🎙️ جاري توليد الصوت...", threadID, messageID);

            const encodedText = encodeURIComponent(text);
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ar&client=tw-ob`;

            return api.sendMessage({
                attachment: await global.utils.getStreamFromURL(url)
            }, threadID, messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage("حدث خطأ في توليد الصوت.", threadID, messageID);
        }
    }
};
