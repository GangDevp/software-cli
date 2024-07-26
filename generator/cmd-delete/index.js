const { Base, Wait, CLI, API } = require('software-cli-core');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');
const CLIConfig = require('../../config/commands.json');

Base.extends({
  init() {
    Base.state = {
      folderName: '',
      canDelete: false,
      deleteFolder: '',
      npmRootPath: null
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
              Base.state.canDelete = true;
              Base.state.deleteFolder = tempPath;
              return true;
            }

            return true;
          } else {
            return commonValidate;
          }
        }
      },
    ];

    const answers = await CLI.addQuestions(questions);
    Base.state.folderName = answers.folderName;
    Wait.next();
  },
  writing() {
    if (Base.state.canDelete) {
      CLI.loading.start(Lang.BUILDIN.DELETE_COMMAND_TIPS);
      API.fs.deleteFolder(Base.state.deleteFolder, true);

      const commands = CLIConfig.commands;
      const inAnyPath = CLIConfig.inAnyPath;
      let newCommands = [];
      let newInAnyPath = [];
      let cmdName = Base.state.folderName.split('-').join(' ');
      commands.map(item => {
        if (item.command !== cmdName) {
          newCommands.push(item);
        }
      });
      inAnyPath.map(item => {
        if (item !== cmdName) {
          newInAnyPath.push(item);
        }
      });
      CLIConfig.commands = newCommands;
      CLIConfig.inAnyPath = newInAnyPath;

      const CLIConfigPath = API.fs.join(Base.state.npmRootPath, CLIConfig.packageName, 'config', 'commands.json');
      API.fs.writeFile(CLIConfigPath, CLIConfig, true);

      const pkgPath = API.fs.join(Base.state.npmRootPath, CLIConfig.packageName, 'package.json');
      let pkgConfig = API.fs.readFile(pkgPath, true);
      const scripts = pkgConfig.scripts;
      let debugName = `debug_${Base.state.folderName}`;
      delete scripts[debugName];
      API.fs.writeFile(pkgPath, pkgConfig, true);
      CLI.loading.succeed(Lang.BUILDIN.DELETE_COMMAND_SUCCESS);
    }

    Wait.next();
  },
  end() {
    if (!Base.state.canDelete) {
      CLI.log.error(Lang.BUILDIN.NO_THIS_FOLDER);
    } else {
      CLI.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.DELETE_COMMAND_FLOW_SUCCESS);
    }
    Wait.next();
  }
});