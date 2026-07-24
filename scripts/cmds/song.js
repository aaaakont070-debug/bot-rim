"use strict";

const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");


module.exports = {

config:{
	name:"song",
	aliases:["music","mp3"],
	version:"1.0.0",
	author:"Fares",
	countDown:10,
	role:0,

	description:{
		ar:"تحميل أغاني من اليوتيوب"
	},

	category:"music",

	guide:{
		ar:"{pn} اسم الأغنية"
	}
},


onStart: async function({api,args,event}){


let query = args.join(" ");


if(!query)
return api.sendMessage(
"🎵 اكتب اسم الأغنية\nمثال:\n/song يا ليل",
event.threadID,
event.messageID
);



let cache =
path.join(__dirname,"cache");


await fs.ensureDir(cache);



let file =
path.join(
cache,
`song_${Date.now()}.mp3`
);



try{


api.setMessageReaction(
"🔎",
event.messageID,
()=>{},
true
);



let search =
await yts(query);



let video =
search.videos[0];


if(!video)
return api.sendMessage(
"❌ لم أجد الأغنية",
event.threadID,
event.messageID
);



api.setMessageReaction(
"⬇️",
event.messageID,
()=>{},
true
);



const stream =
ytdl(video.url,{
	filter:"audioonly",
	quality:"highestaudio"
});



const writer =
fs.createWriteStream(file);



stream.pipe(writer);



writer.on(
"finish",
async()=>{


let stat =
await fs.stat(file);



if(stat.size < 1000){

fs.remove(file);
return api.sendMessage(
"❌ الملف فارغ",
event.threadID,
event.messageID
);

}



await api.sendMessage({

body:
`🎵 ${video.title}\n\n✅ تم التحميل`,

attachment:
fs.createReadStream(file)

},
event.threadID,
()=>{

fs.remove(file)
.catch(()=>{});

},
event.messageID);



api.setMessageReaction(
"✅",
event.messageID,
()=>{},
true
);



});



stream.on(
"error",
err=>{

console.log(
"[SONG ERROR]",
err.message
);


fs.remove(file)
.catch(()=>{});


api.sendMessage(
"❌ فشل تحميل الأغنية",
event.threadID,
event.messageID
);

});



}
catch(err){


console.log(
"[SONG]",
err.message
);


api.sendMessage(
"❌ حدث خطأ أثناء البحث أو التحميل",
event.threadID,
event.messageID
);


}


}

};
