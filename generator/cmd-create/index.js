const { Base, Wait, npmRootPath, fs, cli } = require('software-cli-api');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');

Base.extends({
  init() {
    Base.state = {
      folderName: '',
      description: '',
      hasTemplates: false,
      isStartUserRootPath: true,
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

    const answers = await cli.addQuestions(questions);
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
    Util.addToBaseConfig(npmRootPath, Base.state.folderName, Base.state.description, Base.state.isStartUserRootPath);
    Util.addToExtensions(npmRootPath, Base.state.folderName, Base.state.hasTemplates);
    Util.addToPkgBin(npmRootPath, Base.state.folderName);
    Wait.next();
  },
  install() {
    Wait.next();
  },
  end() {
    cli.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.CMD_CREATE_SUCCESS);
    Wait.next();
  }
});