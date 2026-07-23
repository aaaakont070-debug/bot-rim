"use strict";

const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const boldMap = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲",
  f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
  k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼",
  p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
  u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆",
  z: "𝘇"
};

const cmdFontMap = {
  ...boldMap,
  "0": "𝟬",
  "1": "𝟭",
  "2": "𝟮",
  "3": "𝟯",
  "4": "𝟰",
  "5": "𝟱",
  "6": "𝟲",
  "7": "𝟳",
  "8": "𝟴",
  "9": "𝟵"
};

function toFont(text) {
  return String(text || "")
    .toLowerCase()
    .split("")
    .map(char => cmdFontMap[char] || char)
    .join("");
}

const gifURLs = [
  "https://i.giphy.com/media/ZOGCyj0NW28gg/giphy.gif",
  "https://i.giphy.com/media/98dujYZyq4mOc/giphy.gif",
  "https://i.giphy.com/media/FeVg8ViEczcxG/giphy.gif",
  "https://i.giphy.com/media/8Lc5xmvzRhlLy/giphy.gif",
  "https://i.giphy.com/media/XBuPC4YTAFSta/giphy.gif",
  "https://i.giphy.com/media/1dcLFNKRUKvte/giphy.gif",
  "https://i.giphy.com/media/A5KGHdmmxHdwk/giphy.gif",
  "https://i.giphy.com/media/TbWQoPQOxwBpe/giphy.gif",
  "https://i.imgur.com/xhKItwf.gif",
  "https://media.giphy.com/media/4xKJUTzWPAVoY/giphy.gif",
  "https://media.giphy.com/media/59d1zo8SUSaUU/giphy.gif",
  "https://i.giphy.com/media/4TmxH7ZMn1aYE/giphy.gif",
  "https://i.giphy.com/media/bqSkJ4IwNcoZG/giphy.gif",
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
  "https://i.giphy.com/media/ODECD7W3dzk5y/giphy.gif",
  "https://i.giphy.com/media/1ylfuYzjErdKkJsGPi/giphy.gif",
  "https://i.giphy.com/media/FSWQDkuL088TK/giphy.gif",
  "https://i.giphy.com/media/HOmZcACWYNntC/giphy.gif"
];

const COMMANDS_PER_PAGE = 10;

function getAllCommands() {
  const commands = [];

  for (const [name, cmd] of global.GoatBot.commands) {
    if (!cmd || !cmd.config) continue;

    const commandName = String(name).toLowerCase();

    if (commandName === "help") continue;

    commands.push({
      name: String(name)
    });
  }

  return commands.sort((a, b) =>
    a.name.localeCompare(
      b.name,
      "en",
      {
        sensitivity: "base"
      }
    )
  );
}

/*
  Messenger لا يملك خاصية توسيط حقيقية.
  لذلك نستعمل مسافات ثابتة.

  إذا أردت تحريك كل القائمة:
  زد أو أنقص الرقم هنا.
*/
const CENTER_SPACES = "        ";

/*
  هذه الدالة تجعل العنوان ورقم الصفحة
  في وسط القائمة بشكل ثابت.
*/
function centerMenuText(text) {
  return CENTER_SPACES + String(text || "");
}

function createPageMessage(
  commands,
  page,
  totalPages,
  prefix
) {
  const start =
    (page - 1) * COMMANDS_PER_PAGE;

  const pageCommands =
    commands.slice(
      start,
      start + COMMANDS_PER_PAGE
    );

  let msg = "";

  /*
    عنوان القائمة في الوسط.
  */
  msg +=
    centerMenuText("commands list") +
    "\n\n";

  /*
    الأوامر في الوسط.
  */
  for (const command of pageCommands) {
    msg +=
      centerMenuText(
        `${prefix}${command.name}`
      ) +
      "\n";
  }

  /*
    رقم الصفحة في الوسط.
  */
  msg +=
    "\n" +
    centerMenuText(
      `〈 page ${page}/${totalPages} 〉`
    );

  return msg;
}

function createCommandDetail(
  cmd,
  prefix
) {
  const {
    name,
    version,
    author,
    guide,
    category,
    longDescription,
    shortDescription,
    aliases
  } = cmd.config;

  const desc =
    longDescription?.en ||
    longDescription ||
    shortDescription?.en ||
    shortDescription ||
    "No description";

  const usage =
    String(
      guide?.en ||
      guide ||
      `{pn}${name}`
    )
      .replace(
        /{pn}/g,
        prefix
      )
      .replace(
        /{name}/g,
        name
      );

  return (
    "╭┈─────┈─ ─┈────┈╮\n" +
    "  🌸 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🌸\n" +
    "╰┈─────┈─ ─┈────┈╯\n\n" +
    `🪷 𝐍𝐚𝐦𝐞: ${toFont(name)}\n` +
    `🪷 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${toFont(category || "General")}\n` +
    `🪷 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${
      aliases?.length
        ? aliases.join(", ")
        : "None"
    }\n` +
    `🪷 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${
      version || "1.0"
    }\n` +
    `🪷 𝐀𝐮𝐭𝐡𝐨𝐫: ${
      author || "S1FU"
    }\n\n` +
    "┌──────ʚ🍄ɞ──────┐\n" +
    `📖 𝐃𝐞𝐬𝐜: ${desc}\n\n` +
    `💡 𝐔𝐬𝐚𝐠𝐞: ${usage}\n` +
    "└──────ʚ🍄ɞ──────┘\n\n" +
    "🌸𝐒𝐭𝐚𝐲 𝐇𝐚𝐩𝐩𝐲&𝐁𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥🌸\n" +
    "╰┈───┈──────┈───┈╯"
  );
}

async function getHelpGif() {
  const cacheDir =
    path.join(
      __dirname,
      "cache"
    );

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(
      cacheDir,
      {
        recursive: true
      }
    );
  }

  const indexFile =
    path.join(
      cacheDir,
      "help_gif_index.json"
    );

  let index = 0;

  if (fs.existsSync(indexFile)) {
    try {
      const savedData =
        JSON.parse(
          fs.readFileSync(
            indexFile,
            "utf8"
          )
        );

      index =
        (
          Number(
            savedData.index || 0
          ) + 1
        ) %
        gifURLs.length;

    } catch {
      index = 0;
    }
  }

  fs.writeFileSync(
    indexFile,
    JSON.stringify({
      index
    })
  );

  const gifPath =
    path.join(
      cacheDir,
      `help_gif_${index}.gif`
    );

  const needsDownload =
    !fs.existsSync(gifPath) ||
    fs.statSync(gifPath).size === 0;

  if (needsDownload) {
    await downloadFile(
      gifURLs[index],
      gifPath
    );
  }

  return gifPath;
}

module.exports = {
  config: {
    name: "help",

    aliases: [
      "menu",
      "help1",
      "help2",
      "help3",
      "help4",
      "help5",
      "help6",
      "help7",
      "help8",
      "help9",
      "help10",
      "help11",
      "help12",
      "help13",
      "help14",
      "help15"
    ],

    version: "8.1",

    author: "𝐒𝐈𝐅𝐀𝐓",

    shortDescription:
      "Show all available commands",

    longDescription:
      "Displays commands in centered pages with a rotating GIF.",

    category: "system",

    guide:
      "{pn}help [page number | command name]"
  },

  onStart: async function ({
    message,
    args,
    prefix,
    commandName
  }) {
    const allCommands =
      global.GoatBot.commands;

    let query =
      args?.[0]
        ? String(
            args[0]
          ).trim()
        : "";

    const usedCommand =
      String(
        commandName || ""
      ).toLowerCase();

    /*
      يدعم:

      /help
      /help 2
      /help2
      /help15
    */
    if (
      /^help\d+$/.test(
        usedCommand
      )
    ) {
      query =
        usedCommand.replace(
          /^help/,
          ""
        );
    }

    let gifPath = null;

    try {
      gifPath =
        await getHelpGif();

    } catch (error) {
      console.error(
        "HELP GIF ERROR:",
        error
      );
    }

    /*
      تفاصيل أمر:

      /help ai
      /help music
    */
    if (
      query &&
      !/^\d+$/.test(query)
    ) {
      const lowerQuery =
        query.toLowerCase();

      const cmd =
        allCommands.get(
          lowerQuery
        ) ||
        [
          ...allCommands.values()
        ].find(
          command =>
            (
              command.config?.aliases ||
              []
            ).some(
              alias =>
                String(alias)
                  .toLowerCase() ===
                lowerQuery
            )
        );

      if (
        !cmd ||
        !cmd.config
      ) {
        return message.reply(
          `❌ Command "${query}" not found.`
        );
      }

      const detailMsg =
        createCommandDetail(
          cmd,
          prefix
        );

      const replyData = {
        body: detailMsg
      };

      if (
        gifPath &&
        fs.existsSync(
          gifPath
        )
      ) {
        replyData.attachment =
          fs.createReadStream(
            gifPath
          );
      }

      return message.reply(
        replyData
      );
    }

    const commands =
      getAllCommands();

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          commands.length /
          COMMANDS_PER_PAGE
        )
      );

    let page =
      query &&
      /^\d+$/.test(query)
        ? parseInt(
            query,
            10
          )
        : 1;

    if (page < 1) {
      page = 1;
    }

    if (
      page >
      totalPages
    ) {
      page =
        totalPages;
    }

    const menuMessage =
      createPageMessage(
        commands,
        page,
        totalPages,
        prefix
      );

    const replyData = {
      body: menuMessage
    };

    if (
      gifPath &&
      fs.existsSync(
        gifPath
      )
    ) {
      replyData.attachment =
        fs.createReadStream(
          gifPath
        );
    }

    return message.reply(
      replyData
    );
  }
};

function downloadFile(
  url,
  destination
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const file =
        fs.createWriteStream(
          destination
        );

      const request =
        https.get(
          url,
          response => {

            /*
              دعم روابط التحويل.
            */
            if (
              response.statusCode >= 300 &&
              response.statusCode < 400 &&
              response.headers.location
            ) {
              file.close();

              fs.unlink(
                destination,
                () => {}
              );

              return downloadFile(
                response.headers.location,
                destination
              )
                .then(resolve)
                .catch(reject);
            }

            if (
              response.statusCode !== 200
            ) {
              file.close();

              fs.unlink(
                destination,
                () => {}
              );

              return reject(
                new Error(
                  `Failed to download GIF (${response.statusCode})`
                )
              );
            }

            response.pipe(
              file
            );

            file.on(
              "finish",
              () => {
                file.close(
                  resolve
                );
              }
            );
          }
        );

      request.on(
        "error",
        error => {
          file.close();

          fs.unlink(
            destination,
            () => {}
          );

          reject(
            error
          );
        }
      );

      file.on(
        "error",
        error => {
          file.close();

          fs.unlink(
            destination,
            () => {}
          );

          reject(
            error
          );
        }
      );
    }
  );
}
