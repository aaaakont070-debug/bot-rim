const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const boldMap = {
  a:'𝗮', b:'𝗯', c:'𝗰', d:'𝗱', e:'𝗲',
  f:'𝗳', g:'𝗴', h:'𝗵', i:'𝗶', j:'𝗷',
  k:'𝗸', l:'𝗹', m:'𝗺', n:'𝗻', o:'𝗼',
  p:'𝗽', q:'𝗾', r:'𝗿', s:'𝘀', t:'𝘁',
  u:'𝘂', v:'𝘃', w:'𝘄', x:'𝘅', y:'𝘆',
  z:'𝘇'
};

const cmdFontMap = {
  ...boldMap,
  '0':'𝟬',
  '1':'𝟭',
  '2':'𝟮',
  '3':'𝟯',
  '4':'𝟰',
  '5':'𝟱',
  '6':'𝟲',
  '7':'𝟳',
  '8':'𝟴',
  '9':'𝟵'
};

const toFont = text =>
  text.toLowerCase().split("").map(c => cmdFontMap[c] || c).join("");
};

const cmdFontMap = {
  ...smallCapsMap,
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'
};

const toSmallCaps = t =>
  t.toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

const toCmdFont = t =>
  t.toLowerCase().split("").map(c => cmdFontMap[c] || c).join("");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "6.0",
    author: "𝐒𝐈𝐅𝐀𝐓",
    shortDescription: "Show all available commands",
    longDescription: "Displays a categorized command list with a rotating video (different every time).",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    const cleanCategoryName = (text) => {
      if (!text) return "OTHERS";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    };


    if (!global.GoatBot.cacheHelp) {
      const cachedCategories = {};
      for (const [name, cmd] of allCommands) {
        if (!cmd?.config || name === "help") continue;
        const cat = cleanCategoryName(cmd.config.category);
        if (!cachedCategories[cat]) cachedCategories[cat] = [];
        cachedCategories[cat].push(name);
      }
      global.GoatBot.cacheHelp = cachedCategories;
    }
    const categoriesList = global.GoatBot.cacheHelp;

      const gifURLs = [
  "https://i.giphy.com/media/ZOGCyj0NW28gg/giphy.gif",
  "https://i.giphy.com/media/98dujYZyq4mOc/giphy.gif",
 "https://i.giphy.com/media/FeVg8ViEczcxG/giphy.gif",
"https://i.giphy.com/media/8Lc5xmvzRhlLy/giphy.gif",
"https://i.giphy.com/media/XBuPC4YTAFSta/giphy.gif",
  "https://i.giphy.com/media/1dcLFNKRUKvte/giphy.gif",
"https://i.giphy.com/media/1dcLFNKRUKvte/giphy.gif",
   "https://i.giphy.com/media/A5KGHdmmxHdwk/giphy.gif",
    "https://i.giphy.com/media/TbWQoPQOxwBpe/giphy.gif",
  "https://i.imgur.com/xhKItwf.gif",
  "https://media.giphy.com/media/4xKJUTzWPAVoY/giphy.gif",
   "https://media.giphy.com/media/59d1zo8SUSaUU/giphy.gif",
   "https://media.giphy.com/media/59d1zo8SUSaUU/giphy.gif",
    "https://i.giphy.com/media/4xKJUTzWPAVoY/giphy.gif",
    "https://i.giphy.com/media/4TmxH7ZMn1aYE/giphy.gif",
    "https://i.giphy.com/media/bqSkJ4IwNcoZG/giphy.gif",
    "https://i.giphy.com/media/BS5xpdVyMKniU/giphy.gif",
    "https://i.giphy.com/media/BS5xpdVyMKniU/giphy.gif",
    "https://i.giphy.com/media/TlDd1mxmPGQo/giphy.gif",
    "https://i.giphy.com/media/mEu08tXUqWI3ms4kDK/giphy.gif",
    "https://i.giphy.com/media/EVju4o7HRs8QquQmYV/giphy.gif",
    "https://i.giphy.com/media/ZE57NgGdXs3pf6uDio/giphy.gif",
    "https://i.giphy.com/media/84VixDW3c3AZ19jcm7/giphy.gif",
    "https://media.giphy.com/media/L0gMC6eeMoDJL0RdRL/giphy.gif",
    "https://i.giphy.com/media/WJKA6tktuSYAKMhz8H/giphy.gif",
    "https://i.giphy.com/media/Sxw1JkqEBZjWvMNZ4X/giphy.gif",
    "https://i.giphy.com/media/2fjJDMP3Q3ZVK0KehW/giphy.gif",
    "https://i.giphy.com/media/1oEUK0kZI4wTGJMeO3/giphy.gif",
    "https://i.giphy.com/media/IHcm76l1rbhlK/giphy.gif",
    "https://i.giphy.com/media/MwtHY03ldRPgc/giphy.gif",
    "https://i.giphy.com/media/2fjJDMP3Q3ZVK0KehW/giphy.gif",
    "https://i.giphy.com/media/ODECD7W3dzk5y/giphy.gif",
    "https://i.giphy.com/media/1ylfuYzjErdKkJsGPi/giphy.gif",
    "https://i.giphy.com/media/ODECD7W3dzk5y/giphy.gif",
    "https://i.giphy.com/media/FSWQDkuL088TK/giphy.gif",
    "https://i.giphy.com/media/HOmZcACWYNntC/giphy.gif",
    "https://i.giphy.com/media/HOmZcACWYNntC/giphy.gif",
    
];
  

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const indexFile = path.join(cacheDir, "help_gif_index.json");
    let index = 0;
    if (fs.existsSync(indexFile)) {
      try {
        index = (JSON.parse(fs.readFileSync(indexFile)).index + 1) % gifURLs.length;
      } catch {}
    }
    fs.writeFileSync(indexFile, JSON.stringify({ index }));

    const gifPath = path.join(cacheDir, `help_gif_${index}.gif`);
    if (!fs.existsSync(gifPath)) {
      await downloadFile(gifURLs[index], gifPath);
    }

    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd = allCommands.get(query) || [...allCommands.values()].find(c => (c.config?.aliases || []).map(a => a.toLowerCase()).includes(query));

      if (!cmd || !cmd.config) return message.reply(`❌ Command "${query}" not found.`);

      const { name, version, author, guide, category, longDescription, shortDescription, aliases } = cmd.config;
      const desc = longDescription?.en || longDescription || shortDescription?.en || shortDescription || "No description";
      const usage = (guide?.en || guide || `{pn}${name}`).replace(/{pn}/g, prefix).replace(/{name}/g, name);

      const detailMsg =
        `╭┈─────┈─ ─┈────┈╮\n` +
        `  🌸 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🌸\n` +
        `╰┈─────┈─ ─┈────┈╯\n\n` +
        ` 🪷 𝐍𝐚𝐦𝐞: ${toSmallCaps(name)}\n` +
        ` 🪷 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${toSmallCaps(category || "General")}\n` +
        ` 🪷 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
        ` 🪷 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${version || "1.0"}\n` +
        ` 🪷 𝐀𝐮𝐭𝐡𝐨𝐫: ${author || "S1FU"}\n\n` +
        ` ┌──────ʚ🍄ɞ──────┐\n` +
        `  📖 𝐃𝐞𝐬𝐜: ${desc}\n\n` +
        `  💡 𝐔𝐬𝐚𝐠𝐞: ${usage}\n` +
        ` └──────ʚ🍄ɞ──────┘\n\n` +
        ` 🌸𝐒𝐭𝐚𝐲 𝐇𝐚𝐩𝐩𝐲&𝐁𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥🌸\n` +
        `╰┈───┈──────┈───┈╯`;

      return message.reply({ body: detailMsg, attachment: fs.createReadStream(gifPath) });
    }


    let msg = `╭┈─────┈──┈─────┈╮\n` +
              `       🌸 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔 🌸\n` +
              `╰┈─────┈──┈─────┈╯\n\n`;

    const sortedCategories = Object.keys(categoriesList).sort();

    for (const cat of sortedCategories) {
      msg += `╭┈─┈━[🌸 ${toSmallCaps(cat)} ]\n`;
      const commands = categoriesList[cat].sort();
      for (let i = 0; i < commands.length; i += 2) {
        const a = toCmdFont(commands[i]);
        const b = commands[i + 1] ? toCmdFont(commands[i + 1]) : null;
        msg += b ? `┋⌬ ${a.padEnd(12)} ⌬ ${b}\n` : `┋⌬ ${a}\n`;
      }
      msg += `┕┈───┈──┈────┈𒐬\n\n`;
    }

    msg += `╭┈───────┈┈ ೄྀ࿐┐\n` +
           ` 🍄 𝐓𝐨𝐭𝐚𝐥: ${allCommands.size - 1}\n` +
           ` 🎀 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}\n` +
           ` 🌸𝐒𝐭𝐚𝐲 𝐇𝐚𝐩𝐩𝐲 & 𝐁𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥🌸\n` +
           `╰┈──────┈──────┈─┘`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(gifPath)
    });
  }
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}
