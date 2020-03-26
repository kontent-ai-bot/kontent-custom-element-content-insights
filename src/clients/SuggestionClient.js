import unified from "unified";
import retext from "retext";
import english from "retext-english";
import stringify from "retext-stringify";

import acronyms from "retext-redundant-acronyms";
import equality from "retext-equality";
import intensify from "retext-intensify";
import passive from "retext-passive";
import profanities from "retext-profanities";
import repeated from "retext-repeated-words";

function extractAcronyms(text) {
  return new Promise((resolve, reject) =>
    unified()
      .use(english)
      .use(acronyms)
      .use(stringify)
      .process(text, (err, file) => {
        if (err) reject(err);
        resolve(file.messages);
      })
  );
}

function extractEquality(text) {
  return new Promise((resolve, reject) =>
    unified()
      .use(english)
      .use(equality)
      .use(stringify)
      .process(text, (err, file) => {
        if (err) reject(err);
        resolve(file.messages);
      })
  );
}

function extractIntensify(text) {
  return new Promise((resolve, reject) =>
    retext()
      .use(intensify)
      .process(text, (err, file) => {
        if (err) reject(err);
        return resolve(file.messages);
      })
  );
}

function extractPassive(text) {
  return new Promise((resolve, reject) =>
    unified()
      .use(english)
      .use(passive)
      .use(stringify)
      .process(text, (err, file) => {
        if (err) reject(err);
        let lines = text.split(/\r?\n/);
        for (let i = 0, msg; (msg = file.messages[i]); i++) {
          let lineNumber = msg.location.start.line;
          let from = msg.location.start.column - 20;
          if (from < 0) from = 0;
          let to = msg.location.end.column + 20;
          let chunk = lines[lineNumber - 1].substring(from, to);
          file.messages[i].chunk = chunk;
        }
        resolve(file.messages);
      })
  );
}

function extractProfanities(text) {
  return new Promise((resolve, reject) =>
    unified()
      .use(english)
      .use(profanities)
      .use(stringify)
      .process(text, (err, file) => {
        if (err) reject(err);
        resolve(file.messages);
      })
  );
}

function extractRepeatedWords(text) {
  return new Promise((resolve, reject) =>
    unified()
      .use(english)
      .use(repeated)
      .use(stringify)
      .process(text, (err, file) => {
        if (err) reject(err);
        resolve(file.messages);
      })
  );
}

export {
  extractRepeatedWords,
  extractProfanities,
  extractPassive,
  extractIntensify,
  extractEquality,
  extractAcronyms
};
