import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

// 正则轻量修复
export function fixAICode(content: string): string {
  if (!content) return content;
  let code = content;

  // ==============================================
  // 0. 先统一换行，避免正则跨行失效
  // ==============================================
  code = code.replace(/\r\n?/g, '\n');

  // ==============================================
  // 1. 删除残缺的 ?: 类型行
  // ==============================================
  code = code.replace(/^\s*\?:\s*(string|boolean|number|any|'[^']+').*$/gm, '');

  // ==============================================
  // 2. 修复解构赋值漏写变量名：= 'default', → key: 'default',
  //    覆盖：const { = 'xxx' } = obj;
  // ==============================================
  code = code.replace(/^\s*=\s*('.*?'),/gm, 'key: $1,');
  code = code.replace(/\{\s*=\s*('.*?')\s*\}/g, '{ key: $1 }');

  // ==============================================
  // 3. 修复对象属性漏冒号：alignItems 'center', → alignItems: 'center',
  // ==============================================
  code = code.replace(/(\w+)\s+('.*?'),/g, '$1: $2,');

  // ==============================================
  // 4. 修复扩展运算符后漏逗号：...baseStyle backgroundColor → ...baseStyle, backgroundColor
  // ==============================================
  code = code.replace(/(\.\.\.\w+)\s+(\w+:)/g, '$1, $2');

  // ==============================================
  // 5. 修复 border / background 漏引号：border:2px solid → border: '2px solid'
  // ==============================================
  code = code.replace(/(border|background)\s*:\s*([\w\s#]+)(?=,|\n)/g, "$1: '$2'");

  // ==============================================
  // 6. 修复对象属性之间漏逗号：key:'val' key2:'val2'
  // ==============================================
  code = code.replace(/(['"])\s+(\w+):/g, '$1, $2:');

  // ==============================================
  // 7. 修复 CSS 样式：border:1px solid' → border: '1px solid'
  // ==============================================
  code = code.replace(/(\w+):\s*([^:'";]+?)'/g, (_, key, val) => {
    return `${key}: '${val.trim()}'`;
  });

  // ==============================================
  // 8. 修复 CSS 样式少冒号：padding 'xxx' → padding: 'xxx'
  // ==============================================
  const styleKeys = [
    'padding', 'margin', 'width', 'height', 'border', 'transition',
    'fontSize', 'alignItems', 'justifyContent', 'gap', 'borderRadius',
    'opacity', 'cursor', 'animation', 'lineHeight', 'color', 'background',
    'backgroundColor', 'borderColor', 'userSelect', 'display'
  ];
  styleKeys.forEach(key => {
    code = code.replace(new RegExp(`\\b${key}\\s+'`, 'g'), `${key}: '`);
  });

  // ==============================================
  // 9. 修复 React 错误类型：React.MEvent → React.MouseEvent
  // ==============================================
  code = code.replace(/React\.MEvent/g, 'React.MouseEvent');

  // ==============================================
  // 10. 修复比较符少引号：===large' → === 'large'
  // ==============================================
  code = code.replace(/===([a-zA-Z0-9]+)'/g, "=== '$1'");

  // ==============================================
  // 11. 修复 JSX 条件表达式缺 {：loading && ( → {loading && (
  // ==============================================
  code = code.replace(/(\n\s*)([a-zA-Z_]+)\s*&&\s*\(/g, '$1{$2 && (');

  // ==============================================
  // 12. 修复字符串未闭合：'pointer → 'pointer',
  // ==============================================
  code = code.replace(/'([a-z-]+)\s*(opacity|color|background)/gi, "'$1', $2:");

  // ==============================================
  // 13. 修复 React Hooks 少 const
  // ==============================================
  code = code.replace(/^(\s*)\[(\w+),\s*(\w+)\]\s*=\s*useState/gm, '$1const [$2, $3] = useState');

  // ==============================================
  // 14. 修复 TS 泛型未闭合：Record<string, Type = → Record<string, Type> =
  // ==============================================
  code = code.replace(/(Record<string,\s*[a-zA-Z]+)\s*=/g, '$1> =');

  // ==============================================
  // 15. 修复裸标签：span style → <span style
  // ==============================================
  const tags = 'span|div|p|h1|h2|h3|h4|h5|h6|button|img|input|section|form|label|ul|ol|li';
  code = code.replace(new RegExp(`(\\s+)(${tags})\\s+style=`, 'g'), '$1<$2 style=');

  // ==============================================
  // 16. 清理多余空行
  // ==============================================
  code = code.replace(/\n\s*\n+/g, '\n');

  // ==============================================
  // 17. 兜底：所有 << <<< → <
  // ==============================================
  code = code.replace(/<+/g, '<');

  return code;
}

// ast语法树精修
export function fixByAST(code: string): string {
  try {
    const ast = parser.parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module'
    });

    traverse(ast, {
      // 所有 JSX 属性修复，统一放这里
      JSXAttribute(path) {
        const node = path.node;
        // 断言为 string，解决 TS 类型报错
        const name = node.name.name as string;
        if (!name) return;

        // 1. 修复重复属性名：disableddisabled → disabled
        if (name.length > 1) {
          const half = Math.floor(name.length / 2);
          if (name === name.slice(0, half).repeat(2)) {
            const fixedName = name.slice(0, half);
            node.name.name = fixedName;
          }
        }

        // 2. 修复属性名带空格：class Name → className
        const trimmedName = name.replace(/\s+/g, '');
        node.name.name = trimmedName;

        // 3. 修复无值属性：<button disabled> → <button disabled={true}>
        if (!node.value) {
          node.value = t.jsxExpressionContainer(t.booleanLiteral(true));
        }

        // 4. 修复 style="color:red" → style={{ color: 'red' }}
        if (trimmedName === 'style' && node.value?.type === 'StringLiteral') {
          const styleStr = node.value.value;
          try {
            const styleObj = styleStr
              .split(';')
              .filter(Boolean)
              .reduce((acc, rule) => {
                const [k, v] = rule.split(':').map(s => s.trim());
                if (k && v) acc[k] = v;
                return acc;
              }, {} as Record<string, string>);
            const expr = parser.parseExpression(
              JSON.stringify(styleObj).replace(/"/g, "'")
            );
            node.value = t.jsxExpressionContainer(expr);
          } catch (e) {
            // 失败不处理
          }
        }
      },

      // 自动补 import React（避免旧项目报错）
      Program(path) {
        const hasReactImport = path.node.body.some(
          n => n.type === 'ImportDeclaration' && n.source.value === 'react'
        );
        if (!hasReactImport) {
          const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('React'))],
            t.stringLiteral('react')
          );
          path.node.body.unshift(importDecl);
        }
      }
    });

    return generate(ast, { retainLines: true }, code).code;
  } catch (e) {
    // 解析失败就返回原代码，不崩溃
    console.error('AST 修复失败:', e);
    return code;
  }
}