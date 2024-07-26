# Baseplus-CLI

# 简介
Baseplus-CLI是前端工程化体系解决方案，旨在提高软件研发开发、测试、部署、运维四个阶段自动化程度，基于NodeJS命令行工具，提供一些列功能支持。
内置命令和API支持自定义扩展CLI功能。目前仅提供创建项目架构框架的功能，其他功能等待后续发布支持。

# 功能
Baseplus-CLI功能规划：
 1. 技术支持多端化
    1. WEB: React/Vue/Angular
    2. Mobile: 微信小程序/微信公众号/ReactNavite/Flutter
    3. PC: Electron
    4. Server: NodeJS/Python/Java
    5. Plugins: ChromeExtension/BabelPlugin/ESLintPlugin/VSCodeExtension
 2. 开发流程标准化
    1. 接管Git提交: CLI接管Git提交命令，push远程需要CLI内部身份令牌
    2. 统一各端项目开发流程: 同一端的技术栈统一标准开发流程
 3. 开发规范强制化
    1. git hook把控代码规范最后的防线
 4. 项目架构模板化
    1. 项目框架模板化: 各技术栈项目框架基于模板快速创建
    2. 项目页面模板化: 页面基于模板快速创建
    3. 项目配置自动化: 项目中重复且固定的操作进行自动化适配填充
 5. 功能测试自动化
 6. 单元测试自动化
 7. 代码混淆自动化
 8. 异常监控自动化
 9. 性能分析自动化

Baseplus-cli 本身最大程度做到CLI与技术栈分离，尽可能将功能实现放到CLI依赖包中实现，便于长期维护升级。

Baseplus-CLI升级分为CLI自身升级和CLI功能依赖包升级，Baseplus-CLI每次运行完命令后自动检测升级，优先升级CLI自身，若CLI本身无更新则再去检测更新CLI功能包。  

# 使用指南

## 安装

Windows： `npm install -g software-cli`

MacOS/Ubuntu：`sudo npm install -g software-cli`

# 运行命令
Usage: sw [command] 

例如运行帮助命令，`sw --h`

## 命令说明

1. --h: 帮助信息，显示全部可用命令
2. cmd create: 用于创建新命令，来扩展Baseplus-CLI功能
3. cmd delete: 用于删除Baseplus-CLI中扩展的命令
4. add project: 扩展功能，用于创建项目

# 开发指南

1. 下载源代码，https://github.com/GangDevp/software-cli
2. 安装依赖包，npm i
3. 与操作系统建立软连接，npm link
4. 添加新的命令，bp cmd create
5. 测试新的命令，开发工具以debug模式运行package.json中的scripts，即自己需要测试的命令
6. 代码加断点测试，在需要加断点的地方加入“debugger”即可，启动debug模式后自动停留在断点处

# Baseplus-cli API
Baseplus-cli API以NPM 包的形式发布，在NPM仓库中名为baseplus-cli-api。

引用方式一：按需引入需要的包， 
```
const {cmd} = require('software-cli');

cmd.cmdExecute(cmd, dir, false);
```

引用方式二：直接以对象名引入，
```
const handler = require('software-cli');

handler.cmd.cmdExecute(cmd, dir, false);
```

## cli

CLI命令行相关的API，通常用于控制台显示，如打印日志、动画加载、命令行交互提问

## cmd

执行子进程任务相关的API

## data

处理数据相关，如数组去重、排序、获取变量数据类型

## date

日期格式化处理

## fs

文件访问操作相关API

## git

Git常用命令相关API

## packages

检测CLI升级和依赖包升级相关API

## queue

等待队列相关API

## request

http请求相关API