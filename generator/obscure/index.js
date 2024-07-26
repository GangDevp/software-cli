const { Base, Wait, cli, fs } = require('software-cli-api');
const { Lang } = require('../../service/lang');
const { Util } = require('../../service/util');
const obscureCode = require('../../service/obscure');

Base.extends({
  init() {
    Base.state = {
      error: '',
      inputFolder: '',
      originTargetRoot: '',
      originSourceRoot: ''
    };

    cli.log.debug('run 1 init done');
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
          if (fs.hasPath(inputFolder)) {
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
    const answers = await cli.addQuestions(questions);
    Base.state.originSourceRoot = answers.inputFolder;
    Base.state.originTargetRoot = answers.outputFolder;
    Base.state.inputFolder = fs.join(fs.destinationRootPath(), answers.inputFolder);
    Base.state.outputFolder = fs.join(fs.destinationRootPath(), answers.outputFolder);

    cli.log.debug('run 2 prompt done');
    Wait.next();
  },
  async default() {
    cli.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    cli.loading.start(Lang.BUILDIN.OBSCURING_CODE);
    obscureCode(Base.state.inputFolder, Base.state.originSourceRoot, Base.state.originTargetRoot);
    cli.loading.succeed(Lang.BUILDIN.OBSCURE_CODE_DONE);

    cli.log.debug('run 4 writing done');
    Wait.next();
  },
  end() {
    if (Base.state.error !== '') {
      cli.log.error(Lang.MSG_ERROR, Base.state.error);
    } else {
      cli.log.success(Lang.MSG_SUCCESS, Lang.BUILDIN.OBSCURE_FLOW_DONE);
    }

    cli.log.debug('run 6 end done');
    Wait.next();
  }
});