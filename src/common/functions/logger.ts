//=======================================================
//
//  ##       #####    ####     ####    #####  #####
//  ##      ##   ##  ##       ##       ##     ##  ##
//  ##      ##   ##  ##  ###  ##  ###  #####  #####
//  ##      ##   ##  ##   ##  ##   ##  ##     ##  ##
//  ######   #####    ####     ####    #####  ##   ##
//
//=======================================================

// NOTE: Example: logger("{red}Hello World{reset}", { type: "error" });

import fs from "fs";
import { LoggerEnum } from "../enums/logger.enum";
import config from "config";
import { IApplicationConfig } from "../../../config/config.interface";

const applicationConfig: IApplicationConfig = config.get("application");

export const logger = (text: any, type = LoggerEnum.INFO) => {
  const isServer: boolean = JSON.parse(process.env.IS_ON_SERVER || "false");
  const now = new Date();
  const date = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);

  const path = `${applicationConfig.logPath}${date}/`;

  isServer && !fs.existsSync(path) && fs.mkdirSync(path);

  const time =
    ("0" + now.getHours()).slice(-2) +
    ":" +
    ("0" + now.getMinutes()).slice(-2) +
    ":" +
    ("0" + now.getSeconds()).slice(-2) +
    " " +
    process_id;

  if (typeof text === "object" || Array.isArray(text)) {
    text = JSON.stringify(text, null, 2);
  }

  const logText = text
    .replace(/{green}/g, "")
    .replace(/{blue}/g, "")
    .replace(/{yellow}/g, "")
    .replace(/{red}/g, "")
    .replace(/{reset}/g, "");

  text = text
    .replace(/{green}/g, "\u001b[32;1m")
    .replace(/{blue}/g, "\u001b[34;1m")
    .replace(/{yellow}/g, "\u001b[38;5;226m")
    .replace(/{red}/g, "\x1b[31m")
    .replace(/{reset}/g, "\x1b[0m");

  !applicationConfig.logOnMongo && console.log("-" + text);

  // ─────────────────────────────────────────────── START: SAVE LOG ON MONGODB ─────
  applicationConfig.logOnMongo &&
    (async () => {
      await mongo
        .collection(`${type}_logs`)
        .insertOne({
          text: logText,
          time: now.toUTCString(),
          process_id,
        })
        .then(() => console.log("-" + text))
        .catch((err) => console.log("Logger mongodb insert:", err.stack));
    })();
  // ────────────────────────────────────────────────────────────────────────────────
  applicationConfig.logOnMongo &&
    ![LoggerEnum.REQUEST].includes(type) &&
    (async () => {
      await mongo
        .collection("all_logs")
        .insertOne({
          type,
          text: logText,
          time: now.toUTCString(),
          process_id,
        })
        .then(() => console.log("-" + text))
        .catch((err) => console.log("Logger mongodb insert:", err.stack));
    })();
  // ───────────────────────────────────────────────── END: SAVE LOG ON MONGODB ─────

  if (isServer) {
    fs.appendFile(path + type + ".log", `${date} ${time} ${text} \n`, (err) => console.log(err));

    ![LoggerEnum.REQUEST].includes(type) &&
      fs.appendFile(path + "all.log", `${date} ${time} ${text} \n`, (err) => console.log(err));
  }
};

export default { logger };
