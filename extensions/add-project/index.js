const { Base, Wait, CLI, API } = require('software-cli-core');
const projectConf = require('../../config/project.json');
const { Util } = require('../../service/util');
const { Lang } = require('../../service/lang');
const CLIConfig = require('../../config/commands.json');

const methods = {
  createApp: (projStack, root, projName, npmRootPath) => {
    const tmplRoot = API.fs.join(npmRootPath, CLIConfig.packageName, 'node_modules', 'software-template');
    const app = API.fs.join(tmplRoot, `app-${projStack}`);
    const projRoot = API.fs.join(root, projName, `app-${projStack}`);
    API.fs.copyFile(app, projRoot, () => {
      CLI.loading.info(Lang.EXTENSION.CREATE_PROJECT_DONE);
    });
  },
  createWebpack: (projStack, root, projName, npmRootPath) => {
    const webpackRoot = API.fs.join(npmRootPath, CLIConfig.packageName, 'node_modules', 'software-template');
    const wpUtil = API.fs.join(webpackRoot, 'webpack', 'webpack.util.js');
    const wpConfig = API.fs.join(webpackRoot, 'webpack', 'webpack.config.js');

    const wpConfigCustom = API.fs.join(webpackRoot, 'webpack', `webpack.config.${projStack}.js`);
    const baseService = API.fs.join(root, projName, projectConf.serviceName);
    const webpackRootProj = API.fs.join(baseService, 'webpack');
    const wpUtilProj = API.fs.join(webpackRootProj, 'webpack.util.js');
    const wpConfigProj = API.fs.join(webpackRootProj, 'webpack.config.js');
    const wpConfigCustomProj = API.fs.join(root, projName, `webpack.config.${projStack}.js`);

    if (!API.fs.hasPath(wpConfigCustom)) {
      CLI.log.error(Lang.MSG_ERROR, Lang.EXTENSION.TMPL_NOT_EXSITED);
      process.exit(0);
    }
    API.fs.createFloder(baseService);
    API.fs.createFloder(webpackRootProj);
    API.fs.copyFile(wpUtil, wpUtilProj);
    API.fs.copyFile(wpConfig, wpConfigProj);
    API.fs.copyFile(wpConfigCustom, wpConfigCustomProj);
    CLI.loading.info(Lang.EXTENSION.CREATE_WEBPACK_DONE);
  },
  getExecRootPath(debug) {
    let root = process.cwd();
    if (debug && debug === 'true') {
      let testPath = '';
      if (process.platform === 'win32') {
        testPath = API.fs.join('D:', 'basedemo');
      } else {
        testPath = API.fs.join('/home', 'basedemo');
      }
      return testPath;
    } else {
      return root;
    }
  },
  getPackageConfig: (projStack, projectName) => {
    const tmplRoot = API.fs.join(Base.state.npmRootPath, CLIConfig.packageName, 'node_modules', 'software-template');
    let pkg = API.fs.readFile(API.fs.join(tmplRoot, 'webpack', 'package.json'), true);
    pkg.name = projectName;
    pkg.description = '';

    const setScripts = (env) => {
      return `cross-env NODE_ENV=${env} webpack-dev-server --config ${projectConf.serviceName}/webpack/webpack.config.js`;
    };
    pkg.scripts = {
      dev: setScripts('development'),
      build: setScripts('production'),
      analyzer: setScripts('none')
    };

    const libVersion = projectConf.libVersion;

    if (libVersion[projStack]) {
      let dependencies = libVersion[projStack].dependencies;
      let devDependencies = libVersion[projStack].devDependencies;

      if (dependencies) {
        for (const key in dependencies) {
          if (Object.hasOwnProperty.call(dependencies, key)) {
            const val = dependencies[key];
            pkg.dependencies[key] = val;
          }
        }
      }
      if (devDependencies) {
        for (const key in devDependencies) {
          if (Object.hasOwnProperty.call(devDependencies, key)) {
            const val = devDependencies[key];
            pkg.devDependencies[key] = val;
          }
        }
      }
    }

    return pkg
  },
  createPackageJSON: (projStack, root, projectName, pkgJson) => {
    pkgJson.projStack = projStack;
    pkgJson.mode = 'development';
    const ProjFolder = API.fs.join(root, projectName);
    const ProjPkg = API.fs.join(ProjFolder, 'package.json');

    API.fs.createFloder(ProjFolder);
    API.fs.createFile(ProjPkg);
    API.fs.writeFile(ProjPkg, pkgJson, true);
    CLI.loading.info(Lang.EXTENSION.CREATE_PKG_DONE);
  },
  createOtherConfig: (projStack, root, projectName, npmRootPath) => {
    const projectRoot = API.fs.join(root, projectName);
    const tmplsRoot = API.fs.join(npmRootPath, 'software-cli', 'extensions', 'add-project', 'tmpl');

    const gitinnore = API.fs.join(tmplsRoot, 'gitignore');
    API.fs.copyFile(gitinnore, API.fs.join(projectRoot, '.gitignore'));
  },
};

Base.extends({
  init() {
    Base.state = {
      projTypes: 'web',//项目类型
      projStack: 'react',//项目技术栈
      projLibs: [],//项目使用的主要框架，如UI库等
      projName: 'my-project',//项目名称
      npmRootPath: null,
    };

    CLI.log.debug('run 1 init done');
    Wait.next();
  },
  async prompt() {
    const { data } = await API.cmd.asyncCmdExecuteResult('npm root -g', process.cwd());
    Base.state.npmRootPath = data;
    const answersProjType = await CLI.addQuestions({
      type: 'list',
      name: 'projTypes',
      message: Lang.EXTENSION.CHOICE_PROJECT_TYPE,
      choices: projectConf.types,
      default: 'web'
    });
    Base.state.projTypes = answersProjType.projTypes;

    const answersProjStack = await CLI.addQuestions({
      type: 'list',
      name: 'projStack',
      message: Lang.EXTENSION.CHOICE_PROJECT_STACK,
      choices: () => {
        let lib = projectConf.libs[Base.state.projTypes]
        if (lib.length === 0) {
          CLI.log.error(Lang.MSG_ERROR, `${Base.state.projTypes} ${Lang.EXTENSION.SUPORT_LATER}`);
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
      CLI.log.error(Lang.MSG_ERROR, `${Base.state.projStack} ${Lang.EXTENSION.SUPORT_LATER}`);
      process.exit(0);
    }

    const answers = await CLI.addQuestions([
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

    CLI.log.debug('run 2 prompt done');
    Wait.next();
  },
  default() {
    CLI.log.debug('run 3 default done');
    Wait.next();
  },
  async writing() {
    let root = methods.getExecRootPath(process.env['DEBUG_ENV']);
    Base.state.root = root;
    CLI.loading.start(Lang.EXTENSION.PROJECT_WILL_CREATE);
    let projName = Base.state.projName;
    let projStack = Base.state.projStack;
    methods.createWebpack(projStack, root, projName, Base.state.npmRootPath)
    methods.createApp(projStack, root, projName, Base.state.npmRootPath);
    let pkgJson = methods.getPackageConfig(projStack, projName);
    methods.createPackageJSON(projStack, root, projName, pkgJson);
    methods.createOtherConfig(projStack, root, projName, Base.state.npmRootPath);
    CLI.loading.succeed(Lang.EXTENSION.PROJECT_CREATE_SUCCESS);

    CLI.log.debug('run 4 writing done');
    Wait.next(true);//通知 install 进入延迟队列
  },
  install() {
    const dir = API.fs.join(Base.state.root, Base.state.projName);
    CLI.log.warn(Lang.EXTENSION.PROJECT_INSTALL_TIPS);
    const task = 'npm install --parallel --loglevel info --timing';
    API.cmd.taskInNewWindow(task, dir, true);

    CLI.log.debug('run 5 install done');
    Wait.next();
  },
  end() {
    const dir = API.fs.join(Base.state.root, Base.state.projName);
    CLI.log.success(Lang.MSG_SUCCESS, `${Lang.EXTENSION.PROJECT_FOLDER_PATH} ${dir}`);
    CLI.log.success(Lang.MSG_SUCCESS, Lang.EXTENSION.PROJECT_CREATE_FLOW_DONE);

    CLI.log.debug('run 6 end done');
    Wait.next();
  }
});