const https = require("https");
const fs = require("fs");
const path = require("path");


module.exports = {

config:{
	name:"say",
	aliases:["tts","صوت","نطق"],
	version:"8.0.0",
	author:"Fares",
	countDown:5,
	role:0,

	description:{
		ar:"صوت Google محسّن"
	},

	category:"utility",

	guide:{
		ar:"{pn} النص"
	}
},



onStart: async function({args,message,event}){


try{


let text="";


if(event.type==="message_reply")
	text=event.messageReply.body;
else
	text=args.join(" ");



if(!text)
	return message.reply("⚠️ اكتب النص");



if(text.length>600)
	text=text.substring(0,600);



let lang="ar";



// تقسيم الجمل
let parts =
text.match(/.{1,150}/g);



let buffers=[];



for(let part of parts){


let url =
"https://translate.google.com/translate_tts"+
"?ie=UTF-8"+
"&client=tw-ob"+
"&tl="+lang+
"&q="+encodeURIComponent(part);



let audio =
await new Promise((resolve,reject)=>{


https.get(url,{

headers:{
"User-Agent":
"Mozilla/5.0"
}

},res=>{


let data=[];


res.on("data",c=>{
data.push(c);
});


res.on("end",()=>{

resolve(
Buffer.concat(data)
);

});


}).on("error",reject);


});


buffers.push(audio);


}



let file =
path.join(
__dirname,
"google_voice_"+Date.now()+".mp3"
);



fs.writeFileSync(
file,
Buffer.concat(buffers)
);



await message.reply({

body:
"🎙️ Google TTS محسّن\n🤖 صوت AI",

attachment:
fs.createReadStream(file)

});



setTimeout(()=>{

try{
fs.unlinkSync(file);
}catch(e){}

},60000);



}

catch(e){

console.log(
"[SAY ERROR]",
e.message
);


message.reply(
"❌ فشل إنشاء الصوت"
);


}


}


};
