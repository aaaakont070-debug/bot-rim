module.exports.config = {
    name: "say",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Fares",
    description: "تحويل النص إلى صوت بشري",
    commandCategory: "الخدمات الصوتية",
    usages: "[النص]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const text = args.join(" ");
    if (!text) {
        return api.sendMessage("الرجاء كتابة النص المراد تحويله يا فارس.", event.threadID, event.messageID);
    }

    try {
        await api.sendMessage("🎙️ جاري توليد الصوت...", event.threadID, event.messageID);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
        
        return api.sendMessage({
            attachment: await global.utils.getStreamFromURL(url)
        }, event.threadID, event.messageID);
        
    } catch (err) {
        console.error(err);
        return api.sendMessage("حدث خطأ في توليد الصوت.", event.threadID, event.messageID);
    }
};
