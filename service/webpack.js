const Handler = require('software-cli-api');
const config = require('../config/project.json');
const { Lang } = require('../service/lang');

const webpackRoot = Handler.fs.join(Handler.npmRootPath, 'software-cli', 'node_modules', 'software-template');

const copyWebpackConfig = (projStack, rootPathName, root) => {
  const wpUtil = Handler.fs.join(webpackRoot, 'webpack', 'webpack.util.js');
  const wpConfig = Handler.fs.join(webpackRoot, 'webpack', 'webpack.config.js');

  const wpConfigCustom = Handler.fs.join(webpackRoot, 'webpack', `webpack.config.${projStack}.js`);
  const baseService = Handler.fs.join(root, rootPathName, config.serviceName);
  const webpackRootProj = Handler.fs.join(baseService, 'webpack');
  const wpUtilProj = Handler.fs.join(webpackRootProj, 'webpack.util.js');
  const wpConfigProj = Handler.fs.join(webpackRootProj, 'webpack.config.js');
  const wpConfigCustomProj = Handler.fs.join(root, rootPathName, `webpack.config.${projStack}.js`);

  if (!Handler.fs.hasPath(wpConfigCustom)) {
    Handler.cli.log.error(Lang.MSG_ERROR, Lang.EXTENSION.TMPL_NOT_EXSITED);
    process.exit(0);
  }
  Handler.fs.createFloder(baseService);
  Handler.fs.createFloder(webpackRootProj);
  Handler.fs.copyFile(wpUtil, wpUtilProj);
  Handler.fs.copyFile(wpConfig, wpConfigProj);
  Handler.fs.copyFile(wpConfigCustom, wpConfigCustomProj);
  Handler.cli.loading.info(Lang.EXTENSION.CREATE_WEBPACK_DONE);
};

const createWebpack = (root, projStack, projName) => {
  copyWebpackConfig(projStack, projName, root);
};

module.exports = { createWebpack };