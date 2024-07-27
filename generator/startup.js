const path = require('path');
const cli = require('software-cli-core/src/cli');
const { Lang } = require('../service/lang');

const CLI = cli();

function getCLIConfig() {
    const CLIConfig = require("../config/commands.json");

    return {
        wordsLen: CLIConfig.wordsLen,
        name: CLIConfig.name,
        commands: CLIConfig.commands,
        inAnyPath: CLIConfig.inAnyPath,
        buildIn: CLIConfig.buildIn
    };
};

function showHelp(name, commands) {
    let helpList = [];
    commands.map(cmd => {
        helpList.push(`${name} ${cmd.command} : ${cmd.description}`);
    });

    helpList.push(name + ' ' + Lang.HELP_MESSAGE);
    const helps = `Usage: ${name} [command] \nCommands:\n\t${helpList.join('\n\t')}`;
    CLI.loading.succeed(Lang.BUILDIN.CLI_HAS_READY);
    CLI.log.info(helps);

    process.exit(0);
};

function hasLikeCommand(input, commands) {
    let exsited = false;
    let likeList = commands.filter(cmd => {
        if (cmd['command'] == input) {
            exsited = true;
        } else {
            let temp = input.split(' ');
            if (cmd['command'].includes(temp[0])) {
                return cmd
            }
        }
    });

    return {
        exsited,
        likeList
    }
};

function validateCommand(option, name, commands) {
    const { exsited, likeList } = hasLikeCommand(option, commands);

    if (!exsited) {
        let formatVal = option.toLowerCase();
        switch (formatVal) {
            case '--h':
                showHelp(name, commands);
                break;
            default:
                if (likeList.length !== 0) {
                    let likes = [];
                    likeList.map(cmd => {
                        likes.push(`${name} ${cmd.command}`);
                    });

                    if (likes.length !== 0) {
                        CLI.loading.succeed(Lang.BUILDIN.CLI_HAS_READY);
                        CLI.log.error(Lang.MSG_ERROR, `${Lang.BUILDIN.NO_COMMAND} "${name} ${option}"`, `${Lang.BUILDIN.MEAN_SUCH}\n\t${likes.join('\n\t')}`);
                        process.exit();
                    }
                } else {
                    CLI.loading.succeed(Lang.BUILDIN.CLI_HAS_READY);
                    CLI.log.error(Lang.MSG_ERROR, `${Lang.BUILDIN.NO_COMMAND} "${name} ${option}".`);
                    process.exit();
                }
                break;
        }
    }

    return {
        exsited,
        likeList
    };
};

async function guideCommand() {
    CLI.loading.start(Lang.BUILDIN.CLI_VOLIDATING_CMD);
    const { wordsLen, name, commands, inAnyPath, buildIn } = getCLIConfig();
    const currArgs = process.argv.slice(2);
    const cmdLen = currArgs.length;
    if (cmdLen === 0) {
        showHelp(name, commands);
    }

    if (cmdLen <= wordsLen) {
        let cmdOptions = currArgs.join(' ');

        let main = `../${path.join('extensions', currArgs.join('-'), 'index.js')}`;
        if (buildIn.indexOf(cmdOptions) > -1) {
            main = `../${path.join('generator', currArgs.join('-'), 'index.js')}`;
        }

        const { exsited } = validateCommand(cmdOptions, name, commands);

        if (exsited) {
            let baseEnvConfig = JSON.stringify({
                input: cmdOptions,
                commands,
                wordsLen,
                name,
                inAnyPath
            });
            process.env['CLI_ENV'] = baseEnvConfig;
            CLI.loading.succeed(Lang.BUILDIN.CLI_VOLIDATE_CMD_SUCCESS);
            require(main);
        } else {
            CLI.loading.succeed(Lang.BUILDIN.CLI_HAS_READY);
            CLI.log.error(Lang.MSG_ERROR, `${Lang.BUILDIN.NO_COMMAND} "${name} ${currArgs.join(' ')}"`);
            process.exit();
        }
    } else {
        CLI.loading.succeed(Lang.BUILDIN.CLI_HAS_READY);
        CLI.log.error(Lang.MSG_ERROR, Lang.BUILDIN.COMMAND_LENGTH_TOO_LONG);
        process.exit();
    }
};

guideCommand();