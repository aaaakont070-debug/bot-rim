/**
 * ------------------------------------------------------------------------
 * Project: Bot-Rim / GoatBot Architecture
 * Command: say (Advanced Text-to-Speech Engine)
 * Author: Fares & Security Engineering Team
 * Description: High-performance, secure, and 100% free TTS module
 * Version: 2.5.0-Enterprise
 * ------------------------------------------------------------------------
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "say",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Fares",
    description: "نظام تحويل النصوص إلى أصوات بشرية احترافية مجاناً",
    commandCategory: "الخدمات الصوتية",
    usages: "[النص المراد تحويله]",
    cooldowns: 3
};

// إعدادات هندسية متقدمة للمعالجة الصوتية
const CONFIG_ENGINE = {
    maxCharacters: 200, // الحد الأقصى للأحرف في الطلب الواحد لضمان عدم حظر الـ API
    defaultLanguage: "ar",
    clientType: "tw-ob",
    timeoutLimit: 15000
};

/**
 * دالة مساعدة للتحقق من صحة النص وتطهيره أمنياً
 */
function sanitizeInputText(input) {
    if (!input || typeof input !== "string") return "";
    // إزالة الرموز الضارة أو الأكواد غير المفهومة والحفاظ على النص البشري
    return input.trim().replace(/[<>]/g, "");
}

/**
 * دالة مساعدة لتوليد مسار مؤقت آمن للملفات الصوتية داخل السيرفر
 */
function generateSecureTempPath(threadID) {
    const randomHash = Math.random().toString(36.substring(2, 10));
    return path.join(__dirname, `cache`, `tts_${threadID}_${Date.now()}_${randomHash}.mp3`);
}

/**
 * معالج تنفيذ الأوامر الأساسي
 */
module.exports.run = async function({ api, event, args }) {
    const startTime = Date.now();
    const { threadID, messageID, senderID } = event;

    try {
        // الخطوة 1: استخراج النص ومعالجته
        const rawText = args.join(" ");
        const cleanedText = sanitizeInputText(rawText);

        // التحقق من وجود نص أساسي
        if (!cleanedText) {
            const usageMessage = 
                `⚠️ تنبيه أمني يا زميلي:\n` +
                `الرجاء إدخال النص المطلوب تحويله إلى بصمة صوتية.\n` +
                `مثال: /say السلام عليكم يا فنان`;
            
            return api.sendMessage(usageMessage, threadID, messageID);
        }

        // الخطوة 2: التحقق من قيود الطول لضمان عدم حدوث Timeout في السيرفر
        if (cleanedText.length > CONFIG_ENGINE.maxCharacters) {
            return api.sendMessage(
                `❌ عذراً يا زميلي، النص طويل جداً (${cleanedText.length} حرف).\n` +
                `الحد الأقصى المسموح به هو ${CONFIG_ENGINE.maxCharacters} حرف لضمان سرعة الاستجابة.`,
                
                threadID,
                messageID
            );
        }

        // إرسال إشعار البدء بالمعالجة هندسياً
        await api.sendMessage("🎙️ جاري تهيئة المحرك الصوتي وتوليد البصمة...", threadID, messageID);

        // الخطوة 3: بناء رابط الاستدعاء الآمن
        const encodedQuery = encodeURIComponent(cleanedText);
        const ttsEndpoint = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedQuery}&tl=${CONFIG_ENGINE.defaultLanguage}&client=${CONFIG_ENGINE.clientType}`;

        // الخطوة 4: التحقق من توفر أداة الجلب العالمية في السيرفر
        if (global.utils && typeof global.utils.getStreamFromURL === "function") {
            // الطريقة الأولى والأسرع المدمجة في السيرفر
            const audioStream = await global.utils.getStreamFromURL(ttsEndpoint);
            
            const executionTime = Date.now() - startTime;
            console.log(`[TTS Engine] Success for user ${senderID} in ${executionTime}ms`);

            return api.sendMessage({
                body: `🎙️ تم توليد الصوت بنجاح (${executionTime}ms)`,
                attachment: audioStream
            }, threadID, messageID);
        } 
        else {
            // الطريقة الاحتياطية البديلة المتكاملة (تخزين مؤقت وحذف فوري)
            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }

            const targetFilePath = generateSecureTempPath(threadID);
            
            // جلب البيانات عبر Axios مع إعدادات المهلة الزمنية
            const response = await axios({
                method: 'GET',
                url: ttsEndpoint,
                responseType: 'stream',
                timeout: CONFIG_ENGINE.timeoutLimit,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });

            // كتابة الملف مؤقتاً في السيرفر
            const writer = fs.createWriteStream(targetFilePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // إرسال الملف الصوتي ثم تنظيف السيرفر تلقائياً
            return api.sendMessage({
                attachment: fs.createReadStream(targetFilePath)
            }, threadID, async () => {
                try {
                    if (fs.existsSync(targetFilePath)) {
                        fs.unlinkSync(targetFilePath);
                    }
                } catch (cleanupError) {
                    console.error("[TTS Cleanup Error]:", cleanupError);
                }
            }, messageID);
        }

    } catch (error) {
        // نظام تسجيل الأخطاء المتقدم (Error Logging)
        console.error("[CRITICAL TTS ERROR]:", error);
        
        return api.sendMessage(
            `❌ حدث خطأ تقني غير متوقع أثناء معالجة البصمة الصوتية.\n` +
            `التفاصيل: ${error.message || "خطأ في الاتصال بالخادم الرئيسي"}`,
            
            threadID,
            messageID
        );
    }
};

/**
 * نظام فحص صلاحيات النظام الخلفي (System Health Check)
 */
module.exports.callBack = function() {
    console.log("[Module Loaded]: Say command (Enterprise TTS) initialized successfully.");
};
