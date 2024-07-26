const { Base, Wait, CLI, API } = require('software-cli-core');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');
const CLIConfig = require('../../config/commands.json');

Base.extends({
  init() {
    Base.state = {
      folderName: '',
      description: '',
      hasTemplates: false,
      isStartUserRootPath: true,
      npmRootPath: null,
      addToBaseConfig: (npmRootPath, folderName, description, inAnyPath) => {
        CLI.loading.start(Lang.BUILDIN.ADD_CMD_CONFIG);
        let cmd = folderName.replaceAll(/-/g, ' ');
        let cliCfgPath = API.fs.join(npmRootPath, CLIConfig.packageName, 'config', 'commands.json');
        let config = Object.assign({}, CLIConfig);

        config.commands.push({
          command: cmd,
          description: description,
          custom: false
        });
        config.commands = API.data.arraySort(config.commands, 'command');
        if (!inAnyPath && config.inAnyPath.indexOf(cmd) === -1) {
          config.inAnyPath.push(cmd);
          config.inAnyPath = API.data.arraySort(config.inAnyPath);
        }

        API.fs.writeFile(cliCfgPath, config, true)
        CLI.loading.succeed(Lang.BUILDIN.ADD_CMD_CONFIG_SUCCESS);
      },
      addToExtensions: function (npmRootPath, folderName, hasTemplates) {
        CLI.loading.start(Lang.BUILDIN.ADD_CMD_EXTENSIONS);
        const cmdFolderPath = API.fs.join(npmRootPath, CLIConfig.packageName, 'extensions', folderName);
        const cmdIndexPath = API.fs.join(cmdFolderPath, 'index.js');
        const cmdTmplPath = API.fs.join(cmdFolderPath, 'tmpl');
        const baseIndexTmpl = API.fs.join(npmRootPath, CLIConfig.packageName, 'generator', 'cmd-create', 'tmpl', 'index.js');

        API.fs.createFloder(cmdFolderPath);
        API.fs.copyFile(baseIndexTmpl, cmdIndexPath);
        if (hasTemplates) {
          API.fs.createFloder(cmdTmplPath);
        }
        CLI.loading.succeed(Lang.BUILDIN.ADD_CMD_EXTENSIONS_SUCCESS);
      },
      addToPkgBin: function (npmRootPath, folderName) {
        const temp = folderName.split('-') || folderName.split('_');
        const cmd = `${CLIConfig.name} ${temp.join(' ')}`;
        CLI.loading.start(Lang.BUILDIN.ADD_CMD_PACKAGE);
        const pkg = API.fs.join(npmRootPath, CLIConfig.packageName, 'package.json');
        const pkgJson = API.fs.readFile(pkg, true);
        pkgJson.scripts[`debug_${folderName}`] = `cross-env DEBUG_ENV=true ${cmd}`;
        API.fs.writeFile(pkg, pkgJson, true);
        CLI.loading.succeed(Lang.BUILDIN.ADD_CMD_PACKAGE_SUCCESS);
      },
    };

    Wait.next();
  },
  async prompt() {
    const { data } = await API.cmd.asyncCmdExecuteResult('npm root -g', process.cwd());
    Base.state.npmRootPath = data;
    const questions = [
      {
        type: 'input',
        name: 'folderName',
        message: Lang.BUILDIN.CMD_NAME,
        default: Base.state.folderName,
        validate: input => {
          let commonValidate = Util.volidateFileName(input);

          if (commonValidate === true) {
            let tempPath = API.fs.join(Base.state.npmRootPath, CLIConfig.packageName, 'extensions', input);

            if (API.fs.hasPath(tempPath)) {
              return `${input} ${Lang.BUILDIN.EXSITED}`
            }

            return true;
          } else {
            return commonValidate;
          }
        }
      },
      {
        type: 'input',
        name: 'description',
        message: Lang.BUILDIN.CMD_DESCRIPTION,
        default: Base.state.description,
        validate: input => {
          if (input.length !== 0) {
            return true;
          } else {
            return false;
          }
        }
      },
      {
        type: 'confirm',
        name: 'hasTemplates',
        message: Lang.BUILDIN.IS_CREATD_TMPL_FOLDER,
        default: false
      },
      {
        type: 'confirm',
        name: 'isStartUserRootPath',
        message: Lang.BUILDIN.IS_RUN_ANNY_PATH,
        default: true
      }
    ];

    const answers = await CLI.addQuestions(questions);
    Base.state.folderName = answers.folderName;
    Base.state.description = answers.description;
    Base.state.hasTemplates = answers.hasTemplates;
    Base.state.isStartUserRootPath = answers.isStartUserRootPath;

    Wait.next();
  },
  default() {
    Wait.next();
  },

  writing() {
    Base.state.addToBaseConfig(Base.state.npmRootPath, Base.state.folderName, Base.state.description, Base.state.isStartUserRootPath);
    Base.state.addToExtensions(Base.state.npmRootPath, Base.state.folderName, Base.state.hasTemplates);
    Base.state.addToPkgBin(Base.state.npmRootPath, Base.state.folderName);
    Wait.next();
  },
  install() {
    Wait.next();
  },
  end() {
    CLI.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.CMD_CREATE_SUCCESS);
    Wait.next();
  }
});