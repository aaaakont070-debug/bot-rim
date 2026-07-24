const https = require("https");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "say",
    aliases: ["tts", "صوت", "نطق"],
    version: "6.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,

    description: {
      ar: "تحويل النص إلى صوت"
    },

    category: "utility",

    guide: {
      ar: "{pn} النص"
    }
  },


  onStart: async function ({ args, message }) {

    if (!args.length)
      return message.reply("⚠️ اكتب النص");


    let text = args.join(" ");

    if (text.length > 300)
      text = text.slice(0,300);


    let file =
    path.join(__dirname, `voice_${Date.now()}.mp3`);


    try {

      let url =
      "https://translate.google.com/translate_tts" +
      "?ie=UTF-8" +
      "&client=tw-ob" +
      "&tl=ar" +
      "&q=" +
      encodeURIComponent(text);


      let audio = await new Promise((resolve,reject)=>{

        https.get(url,{
          headers:{
            "User-Agent":
            "Mozilla/5.0"
          }
        },res=>{

          let data=[];

          res.on("data",chunk=>{
            data.push(chunk);
          });

          res.on("end",()=>{
            resolve(Buffer.concat(data));
          });

        }).on("error",reject);

      });


      fs.writeFileSync(file,audio);


      await message.reply({
        body:"🤖 تم إنشاء الصوت",
        attachment:fs.createReadStream(file)
      });


      setTimeout(()=>{
        fs.unlink(file,()=>{});
      },60000);


    } catch(err){

      console.log(err);

      message.reply(
        "❌ خطأ في إنشاء الصوت"
      );

    }

  }
};
