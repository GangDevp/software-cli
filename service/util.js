const path = require('path');
const fs = require('fs');
const { Lang } = require('./lang');

const Util = {

  volidateFileName(input) {
    if (/\s/.test(input)) {
      return Lang.BUILDIN.NAME_NO_WHITESPACE;
    }

    if (/[A-Z]/.test(input)) {
      return Lang.BUILDIN.NAME_LOWERCASE;
    }

    const regex = /[\s~`!@#$%^&*()\_=+[\]{}|;:'",<.>/?]/;//只允许使用-作为文件名分隔符
    if (regex.test(input)) {
      return Lang.BUILDIN.NAME_NO_SPECIAL_CHARACTER;
    }

    return true;
  },

  validatePath(input) {
    let commonValidate = Util.volidateFileName(input);

    if (commonValidate === true) {
      let tempPath = path.join(process.cwd(), input);

      if (fs.existsSync(tempPath)) {
        return `${input} ${Lang.BUILDIN.EXSITED}`
      } else {
        return true;
      }
    } else {
      return commonValidate;
    }
  },

  convertWordsToHump: (input) => {
    let text = '';
    let index = input.indexOf('-');

    if (index > -1) {
      input.split('-').map((item, index) => {
        if (index === 0) {
          text = item;
        } else {
          let newText = item.charAt(0).toUpperCase() + item.slice(1);
          text += newText;
        }
      });
    } else {
      text = input;
    }

    return text;
  },

  convertWordsToClassname: (input) => {
    let text = '';
    let index = input.indexOf('-');

    if (index > -1) {
      input.split('-').map((item, index) => {
        text += item.charAt(0).toUpperCase() + item.slice(1);;
      });
    } else {
      text = input.charAt(0).toUpperCase() + input.slice(1);;
    }

    return text;
  },

};

module.exports = { Util };