const { Base, Wait, CLI, API } = require('software-cli-core');

Base.extends({
  init() {
    Base.state = {
      //TODO define global state and methods.

    };

    CLI.log.debug('run 1 init done');
    Wait.next();
  },
  async prompt() {
    const questions = [];
    const answers = await CLI.addQuestions(questions);
    //TODO set global state value  by "answers".
    CLI.log.debug('run 2 prompt done');
    Wait.next();
  },
  async default() {
    //TODO deal some need calculate process.
    CLI.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    //TODO write files.
    CLI.log.debug('run 4 writing done');
    Wait.next(true);
  },
  async install() {
    //TODO install need libraries from NPM.
    CLI.log.debug('run 5 install done');
    Wait.next();
  },
  end() {
    //TODO show message of this command execute successed.
    CLI.log.debug('run 6 end done');
    Wait.next();
  }
});