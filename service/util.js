const Handler = require('software-cli-api');
const { Lang } = require('./lang');
const CLIConfig = require('../config/commands.json');

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
      let tempPath = Handler.fs.join(Handler.fs.destinationRootPath(), input);

      if (Handler.fs.hasPath(tempPath)) {
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

  addToBaseConfig: (npmRootPath, folderName, description, inAnyPath) => {
    Handler.cli.loading.start(Lang.BUILDIN.ADD_CMD_CONFIG);
    let cmd = folderName.replaceAll(/-/g, ' ');
    let cliCfgPath = Handler.fs.join(npmRootPath, CLIConfig.packageName, 'config', 'commands.json');
    let config = Object.assign({}, CLIConfig);

    config.commands.push({
      command: cmd,
      description: description,
      custom: false
    });
    config.commands = Handler.data.arraySort(config.commands, 'command');
    if (!inAnyPath && config.inAnyPath.indexOf(cmd) === -1) {
      config.inAnyPath.push(cmd);
      config.inAnyPath = Handler.data.arraySort(config.inAnyPath);
    }

    Handler.fs.writeFile(cliCfgPath, config, true)
    Handler.cli.loading.succeed(Lang.BUILDIN.ADD_CMD_CONFIG_SUCCESS);
  },

  addToExtensions: function (npmRootPath, folderName, hasTemplates) {
    Handler.cli.loading.start(Lang.BUILDIN.ADD_CMD_EXTENSIONS);
    const cmdFolderPath = Handler.fs.join(npmRootPath, CLIConfig.packageName, 'extensions', folderName);
    const cmdIndexPath = Handler.fs.join(cmdFolderPath, 'index.js');
    const cmdTmplPath = Handler.fs.join(cmdFolderPath, 'tmpl');
    const baseIndexTmpl = Handler.fs.join(npmRootPath, CLIConfig.packageName, 'generator', 'cmd-create', 'tmpl', 'index.js');

    Handler.fs.createFloder(cmdFolderPath);
    Handler.fs.copyFile(baseIndexTmpl, cmdIndexPath);
    if (hasTemplates) {
      Handler.fs.createFloder(cmdTmplPath);
    }
    Handler.cli.loading.succeed(Lang.BUILDIN.ADD_CMD_EXTENSIONS_SUCCESS);
  },

  addToPkgBin: function (npmRootPath, folderName) {
    const temp = folderName.split('-') || folderName.split('_');
    const cmd = `${CLIConfig.name} ${temp.join(' ')}`;
    Handler.cli.loading.start(Lang.BUILDIN.ADD_CMD_PACKAGE);
    const pkg = Handler.fs.join(npmRootPath, CLIConfig.packageName, 'package.json');
    const pkgJson = Handler.fs.readFile(pkg, true);
    pkgJson.scripts[`debug_${folderName}`] = `cross-env DEBUG_ENV=true ${cmd}`;
    Handler.fs.writeFile(pkg, pkgJson, true);
    Handler.cli.loading.succeed(Lang.BUILDIN.ADD_CMD_PACKAGE_SUCCESS);
  },

  getExecRootPath: (debug) => {
    let root = process.cwd();
    if (debug && debug === 'true') {
      let testPath = '';
      if (process.platform === 'win32') {
        testPath = Handler.fs.join('D:', 'basedemo');
      } else {
        testPath = Handler.fs.join('/home', 'basedemo');
      }
      return testPath;
    } else {
      return root;
    }
  }
};

module.exports = { Util };