const { Base, Wait, cli, fs, cmd } = require('software-cli-api');
const { createWebpack } = require('../../service/webpack');
const { createProjectConfig } = require('../../service/project-config');
const { createApp } = require('../../service/app');
const projectConf = require('../../config/project.json');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');

Base.extends({
  init() {
    Base.state = {
      projTypes: 'web',//项目类型
      projStack: 'react',//项目技术栈
      projLibs: [],//项目使用的主要框架，如UI库等
      projName: 'my-project',//项目名称
    };

    cli.log.debug('run 1 init done');
    Wait.next();
  },
  async prompt() {
    const answersProjType = await cli.addQuestions({
      type: 'list',
      name: 'projTypes',
      message: Lang.EXTENSION.CHOICE_PROJECT_TYPE,
      choices: projectConf.types,
      default: 'web'
    });
    Base.state.projTypes = answersProjType.projTypes;

    const answersProjStack = await cli.addQuestions({
      type: 'list',
      name: 'projStack',
      message: Lang.EXTENSION.CHOICE_PROJECT_STACK,
      choices: () => {
        let lib = projectConf.libs[Base.state.projTypes]
        if (lib.length === 0) {
          cli.log.error(Lang.MSG_ERROR, `${Base.state.projTypes} ${Lang.EXTENSION.SUPORT_LATER}`);
          process.exit(0);
        }
        return lib;
      },
      default: 'js'
    });
    Base.state.projStack = answersProjStack.projStack;
    if (!projectConf.libVersion[Base.state.projStack] &&
      Base.state.projStack !== 'js' && Base.state.projStack !== 'ts'
    ) {
      cli.log.error(Lang.MSG_ERROR, `${Base.state.projStack} ${Lang.EXTENSION.SUPORT_LATER}`);
      process.exit(0);
    }

    const answers = await cli.addQuestions([
      {
        type: 'input',
        name: 'projName',
        message: Lang.EXTENSION.PROJECT_NAME,
        default: Base.state.projName,
        validate: input => {
          return Util.validatePath(input);
        }
      },
    ]);
    Base.state.projName = answers.projName;

    cli.log.debug('run 2 prompt done');
    Wait.next();
  },
  default() {
    cli.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    let root = Util.getExecRootPath(process.env['DEBUG_ENV']);
    Base.state.root = root;
    cli.loading.start(Lang.EXTENSION.PROJECT_WILL_CREATE);
    let projName = Base.state.projName;
    let projStack = Base.state.projStack;
    createProjectConfig(projStack, projName, root);
    createWebpack(root, projStack, projName)
    createApp(projStack, root, projName);
    cli.loading.succeed(Lang.EXTENSION.PROJECT_CREATE_SUCCESS);

    cli.log.debug('run 4 writing done');
    Wait.next(true);//通知 install 进入延迟队列
  },
  install() {
    const dir = fs.join(Base.state.root, Base.state.projName);
    cli.log.warn(Lang.EXTENSION.PROJECT_INSTALL_TIPS);
    const task = 'npm install --parallel --loglevel info --timing';
    cmd.taskInNewWindow(task, dir, true);

    cli.log.debug('run 5 install done');
    Wait.next();
  },
  end() {
    const dir = fs.join(Base.state.root, Base.state.projName);
    cli.log.success(Lang.MSG_SUCCESS, `${Lang.EXTENSION.PROJECT_FOLDER_PATH} ${dir}`);
    cli.log.success(Lang.MSG_SUCCESS, Lang.EXTENSION.PROJECT_CREATE_FLOW_DONE);

    cli.log.debug('run 6 end done');
    Wait.next();
  }
});