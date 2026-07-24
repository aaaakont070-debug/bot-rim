const https = require("https");
const fs = require("fs");
const path = require("path");

const LANGS = {
  ar: "ar",
  عربي: "ar",
  arabic: "ar",
  en: "en",
  english: "en",
  fr: "fr",
  french: "fr"
};


module.exports = {
  config: {
    name: "say",
    aliases: ["tts", "صوت", "نطق"],
    version: "5.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,

    description: {
      ar: "تحويل النص إلى صوت روبوت Google مجاني"
    },

    category: "utility",

    guide: {
      ar: "{pn} النص | اللغة"
    }
  },


  onStart: async function ({ args, message }) {

    if (!args.length)
      return message.reply("⚠️ اكتب النص");


    let data = args.join(" ").split("|");

    let text = data[0].trim();

    let lang = "ar";

    if (data[1]) {
      lang =
      LANGS[data[1].trim().toLowerCase()] || "ar";
    }


    const file =
    path.join(__dirname, `say_${Date.now()}.mp3`);


    function download(url){

      return new Promise((resolve,reject)=>{

        https.get(url,{
          headers:{
            "User-Agent":"Mozilla/5.0"
          }
        },res=>{

          let chunks=[];

          res.on("data",d=>chunks.push(d));

          res.on("end",()=>{

            resolve(Buffer.concat(chunks));

          });

        }).on("error",reject);

      });

    }


    try {

      let parts =
      text.match(/.{1,150}/g);


      let audio=[];


      for(let part of parts){

        let url =
        "https://translate.google.com/translate_tts"+
        `?ie=UTF-8&q=${encodeURIComponent(part)}&tl=${lang}&client=tw-ob`;


        let data =
        await download(url);


        audio.push(data);
      }


      fs.writeFileSync(
        file,
        Buffer.concat(audio)
      );


      await message.reply({
        body:
        `🤖 تم إنشاء الصوت\n🌐 ${lang}`,
        attachment:
        fs.createReadStream(file)
      });


      setTimeout(()=>{
        fs.unlink(file,()=>{});
      },60000);


    } catch(e){

      console.log(e);

      message.reply(
        "❌ تعذر إنشاء الصوت"
      );

    }

  }
};
