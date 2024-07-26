const Handler = require('software-cli-api');
const config = require('../config/project.json');
const { Lang } = require('../service/lang');

const getPackageConfig = (projStack, projectName) => {
    const webpackRoot = Handler.fs.join(Handler.npmRootPath, 'software-cli', 'node_modules', 'software-template');
    let pkg = Handler.fs.readFile(Handler.fs.join(webpackRoot, 'webpack', 'package.json'), true);
    pkg.name = projectName;
    pkg.description = '';

    const setScripts = (env) => {
        return `cross-env NODE_ENV=${env} webpack-dev-server --config ${config.serviceName}/webpack/webpack.config.js`;
    };
    pkg.scripts = {
        dev: setScripts('development'),
        build: setScripts('production'),
        analyzer: setScripts('none')
    };

    const libVersion = config.libVersion;

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
};

const createPackageJSON = (projStack, projectName, root) => {
    let pkgJson = getPackageConfig(projStack, projectName);
    pkgJson.projStack = projStack;
    pkgJson.mode = 'development';
    const ProjFolder = Handler.fs.join(root, projectName);
    const ProjPkg = Handler.fs.join(ProjFolder, 'package.json');

    Handler.fs.createFloder(ProjFolder);
    Handler.fs.createFile(ProjPkg);
    Handler.fs.writeFile(ProjPkg, pkgJson, true);
    Handler.cli.loading.info(Lang.EXTENSION.CREATE_PKG_DONE);
};

const createOtherConfig = (projStack, projectName, root) => {
    const projectRoot = Handler.fs.join(root, projectName);
    const tmplRoot = Handler.fs.join(Handler.npmRootPath, 'software-cli', 'extensions', 'add-project', 'tmpl');

    const gitinnore = Handler.fs.join(tmplRoot, 'gitignore');
    Handler.fs.copyFile(gitinnore, Handler.fs.join(projectRoot, '.gitignore'));
};

const createProjectConfig = (projStack, projectName, root) => {
    createPackageJSON(projStack, projectName, root);
    createOtherConfig(projStack, projectName, root);
};

module.exports = { createProjectConfig };