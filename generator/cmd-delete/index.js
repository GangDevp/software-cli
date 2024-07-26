const { Base, Wait, npmRootPath, fs, cli } = require('software-cli-api');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');

Base.extends({
  init() {
    Base.state = {
      folderName: '',
      canDelete: false,
      deleteFolder: ''
    };

    Wait.next();
  },
  async prompt() {
    const questions = [
      {
        type: 'input',
        name: 'folderName',
        message: Lang.BUILDIN.CMD_NAME,
        default: Base.state.folderName,
        validate: input => {
          let commonValidate = Util.volidateFileName(input);

          if (commonValidate === true) {
            let tempPath = fs.join(npmRootPath, 'software-cli', 'extensions', input);

            if (fs.hasPath(tempPath)) {
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

    const answers = await cli.addQuestions(questions);
    Base.state.folderName = answers.folderName;
    Wait.next();
  },
  writing() {
    if (Base.state.canDelete) {
      cli.loading.start(Lang.BUILDIN.DELETE_COMMAND_TIPS);
      fs.deleteFolder(Base.state.deleteFolder, true);

      const CLIConfigPath = fs.join(npmRootPath, 'software-cli', 'config', 'commands.json');
      let CLIConfig = fs.readFile(CLIConfigPath, true);
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

      fs.writeFile(CLIConfigPath, CLIConfig, true);

      const pkgPath = fs.join(npmRootPath, 'software-cli', 'package.json');
      let pkgConfig = fs.readFile(pkgPath, true);
      const scripts = pkgConfig.scripts;
      let debugName = `debug_${Base.state.folderName}`;
      delete scripts[debugName];
      fs.writeFile(pkgPath, pkgConfig, true);
      cli.loading.succeed(Lang.BUILDIN.DELETE_COMMAND_SUCCESS);
    }

    Wait.next();
  },
  end() {
    if (!Base.state.canDelete) {
      cli.log.error(Lang.BUILDIN.NO_THIS_FOLDER);
    } else {
      cli.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.DELETE_COMMAND_FLOW_SUCCESS);
    }
    Wait.next();
  }
});