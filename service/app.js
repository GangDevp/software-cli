const Handler = require('software-cli-api');
const { Lang } = require('../service/lang');

const copyWebpackConfig = (projStack, root, projName) => {
  const webpackRoot = Handler.fs.join(Handler.npmRootPath, 'software-cli', 'node_modules', 'software-template');
  const app = Handler.fs.join(webpackRoot, `app-${projStack}`);
  const projRoot = Handler.fs.join(root, projName, `app-${projStack}`);
  Handler.fs.copyFile(app, projRoot, () => {
    Handler.cli.loading.info(Lang.EXTENSION.CREATE_PROJECT_DONE);
  });
};

const createApp = (projStack, root, projName) => {
  copyWebpackConfig(projStack, root, projName);
};

module.exports = { createApp };