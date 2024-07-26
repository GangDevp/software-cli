

function obscureCode(srcRootPath, originSrc, originTar) {
  const Handler = require('software-cli-api');
  const UglifyJS = require('uglify-es');

  // 混淆代码
  let obscureCode = (code, config = { transformString: true, transformNumber: true, transformProperty: [] }) => {
    let regex = /!.*/;
    if (config.transformProperty.length > 0) {
      regex = new RegExp(mangle_properties.join('|'));
    }
    // 定义UglifyJS配置
    let options = {
      parse: {},
      compress: {
        warnings: false, // 在UglifyJS删除没有用到的js代码时，不输出警告
        drop_console: false, // 删除所有的console语句
        collapse_vars: true, // 内嵌已定义的仅用到一次的变量
        reduce_vars: true // 提取出现多次但没有定义成变量的静态值
      },
      mangle: {
        properties: {
          // mangle property options(需要混淆的属性)
          regex: regex
        }
      },
      output: {
        beautify: false, // 最紧凑的输出
        comments: true, // 删除所有注释
        ascii_only: true,
        ast: true,
        code: false,
      }
    };
    // console.log(code, 'code');
    let ast = UglifyJS.minify(code, options).ast;
    // 定义转换器
    let transformer = new UglifyJS.TreeTransformer(null, function (node) {
      if (node.key) {
        // console.log(node, 'key');
        if (!/[\n\t\0]/.test(node.value) && config.transformString) {
          // console.log(node.key, 'key');
          if (typeof node.key === 'string') {
            node.key = toHex(node.key);
          } else {
            if (node.key && typeof node.key.name === 'string') {
              node.key.name = toHex(node.key.name);
            }
          }
        }
        node.quote = '"';
        return node;
      }
      if (node instanceof UglifyJS.AST_Dot && config.transformString) {
        // console.log(node, 'AST_Dot');
        node.property = '["' + toHex(node.property) + '"]';
        return node;
      }
      if (node instanceof UglifyJS.AST_Number) { //查找需要修改的叶子节点
        // console.log(node.value);
        if (isInteger(node.value) && config.transformNumber) {
          node.value = '0x' + Number(parseInt(node.value)).toString(16);
        }
        // console.log(node.value);
        return node; //返回一个新的叶子节点 替换原来的叶子节点
      };
      if (node instanceof UglifyJS.AST_String) { //查找需要修改的叶子节点
        // console.log(node.value, 'value');
        if (!/[\n\t\0]/.test(node.value) && config.transformString) {
          node.value = toHex(node.value);
        }
        return node;
      }
    });
    ast.transform(transformer);
    code = ast.print_to_string({
      beautify: false, // 最紧凑的输出
      comments: true, // 删除所有注释
      ascii_only: true,
    });
    // .[''] => [''], '//x' => '/x'
    code = code.replace(/\.(\[){1}[^\]]*(\]{1})/g, function (str) {
      return str.substring(1);
    }).replace(/(\\\\x|\\\\u)/g, function (str) {
      // console.log(str.split('\\\\').join('\\'), '123');
      return str.split('\\\\').join('\\');
    });
    code = `/**` +
      `\n* @copyright Baseplus-CLI` +
      `\n* @description Your code has been obscured` +
      `\n*/ \t\n` +
      code;

    return code;
  };
  // 是否是整数
  let isInteger = (obj) => {
    return obj % 1 === 0
  };
  // 字符串转换为16进制形式
  let toHex = (val) => {
    var str = new Array();
    for (var i = 0; i < val.length; i++) {
      var c = val.charCodeAt(i);
      if (c >= 0 && c < 256) {
        str[str.length] = '\\x' + val.charCodeAt(i).toString(16);
      } else {
        str[str.length] = '\\u' + val.charCodeAt(i).toString(16);
      }
    }
    return str.join('');
  };
  let jsFiles = Handler.fs.getFiles(Handler.fs.join(srcRootPath, '**', '*.js'));
  jsFiles.map(async (filepath) => {
    let targetPath = filepath.replace(originSrc, originTar);
    let code = Handler.fs.readFile(filepath, false);
    code = obscureCode(code);
    Handler.fs.createFile(targetPath);
    Handler.fs.writeFile(targetPath, code);
    Handler.cli.log.success(`\tcompiled: ${targetPath}`);
  });
};

module.exports = obscureCode;