const { Base, Wait, cli, fs, npmRootPath } = require('software-cli-api');

Base.extends({
  init() {
    Base.state = {
      //TODO define global state and methods.
    };

    cli.log.debug('run 1 init done');
    Wait.next();
  },
  async prompt() {
    const questions = [];
    const answers = await cli.addQuestions(questions);
    //TODO set global state value  by "answers".
    cli.log.debug('run 2 prompt done');
    Wait.next();
  },
  async default() {
    //TODO deal some need calculate process.
    cli.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    //TODO write files.
    cli.log.debug('run 4 writing done');
    Wait.next();
  },
  async install() {
    //TODO install need libraries from NPM.
    cli.log.debug('run 5 install done');
    Wait.next();
  },
  end() {
    //TODO show message of this command execute successed.
    cli.log.debug('run 6 end done');
    Wait.next();
  }
});