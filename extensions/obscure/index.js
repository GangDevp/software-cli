const { Base, Wait, CLI, API } = require('software-cli-core');
const { Lang } = require('../../service/lang');
const { Util } = require('../../service/util');

Base.extends({
  init() {
    Base.state = {
      error: '',
      inputFolder: '',
      originTargetRoot: '',
      originSourceRoot: ''
    };

    CLI.log.debug('run 1 init done');
    Wait.next();
  },
  async prompt() {
    const questions = [
      {
        type: 'input',
        name: 'inputFolder',
        message: Lang.BUILDIN.OBSCURE_SOURCE_ROOT,
        default: '',
        validate(inputFolder) {
          if (API.fs.hasPath(inputFolder)) {
            return true;
          } else {
            return `${inputFolder} ${Lang.BUILDIN.NOT_EXSITED}`
          }
        }
      },
      {
        type: 'input',
        name: 'outputFolder',
        message: Lang.BUILDIN.OBSCURE_OUTPUT_ROOT,
        default: '',
        validate(outputFolder) {
          let res;
          if (outputFolder.indexOf('/') > 0) {
            res = outputFolder.split('/').every((item) => {
              return Util.volidateFileName(item);
            });
          } else if (outputFolder.indexOf('\\') > 0) {
            res = outputFolder.split('\\').every((item) => {
              return Util.volidateFileName(item);
            });
          } else {
            res = Util.volidateFileName(outputFolder);
          }
          return res;
        }
      }
    ];
    const answers = await CLI.addQuestions(questions);
    Base.state.originSourceRoot = answers.inputFolder;
    Base.state.originTargetRoot = answers.outputFolder;

    CLI.log.debug('run 2 prompt done');
    Wait.next();
  },
  async default() {
    CLI.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    CLI.loading.start(Lang.BUILDIN.OBSCURING_CODE);
    API.obscure(Base.state.originSourceRoot, Base.state.originTargetRoot, false);
    CLI.loading.succeed(Lang.BUILDIN.OBSCURE_CODE_DONE);

    CLI.log.debug('run 4 writing done');
    Wait.next();
  },
  end() {
    if (Base.state.error !== '') {
      CLI.log.error(Lang.MSG_ERROR, Base.state.error);
    } else {
      CLI.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.OBSCURE_FLOW_DONE);
    }

    CLI.log.debug('run 6 end done');
    Wait.next();
  }
});