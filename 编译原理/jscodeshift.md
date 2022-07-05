## 利用 jscodeshift 进行 ast 遍历

## 转换前的代码
```js
import * as React from 'react';
import styles from './index.module.scss';
import { Button } from "@alifd/next";


const Button = () => {
  return (
    <div>
      <h2>转译前</h2>
      <div>
        <Button type="normal">Normal</Button>
        <Button type="primary">Prirmary</Button>
        <Button type="secondary">Secondary</Button>


        <Button type="normal" text>Normal</Button>
        <Button type="primary" text>Primary</Button>
        <Button type="secondary" text>Secondary</Button>


        <Button type="normal" warning>Normal</Button>
      </div>
    </div>
  );
};

export default Button;
```

## 转换操作
1、将js转换为ast
2、遍历代码中所有包含@alifd/next的引用模块，并做如下操作
3、改变该模块名为antd。
4、找到代码中标签名为h2的代码块，并修改该标签内的文案。
5、遍历代码中所有Button标签，并做如下操作
6、改变标签中type和size属性的值
7、改变标签中text属性变为 type = "link"
8、改变标签中warning属性为danger
9、返回由ast转换后的js。
```js
module.exports = (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);
    root
        .find(j.ImportDeclaration, { source: { value: "@alifd/next" } })
        .forEach((path) => {
            path.node.source.value = "antd";
        })
    root
        .find(j.JSXElement, {openingElement: { name: { name: 'h2' } }})
          .forEach((path) => {
            path.node.children = [j.jsxText('转译后')]
        })
    root
        .find(j.JSXOpeningElement, { name: { name: 'Button' } })
        .find(j.JSXAttribute)
        .forEach((path) => {
            const attr = path.node.name
            const attrVal = ((path.node.value || {}).expression || {}).value ? path.node.value.expression : path.node.value

            if (attr.name === "type") {
                if (attrVal.value === 'normal') {
                    attrVal.value = 'default'
                }
            }

            if (attr.name === "size") {
                if (attrVal.value === 'medium') {
                    attrVal.value = 'middle'
                }
            }

            if (attr.name === "warning") {
                attr.name = 'danger'
            }

            if (attr.name === "text") {
                const attrType = path.parentPath.value.filter(item => item.name.name === 'type')
                attr.name = 'type'
                if (attrType.length) {
                    attrType[0].value.value = 'link'
                    j(path).replaceWith('')
                } else {
                    path.node.value = j.stringLiteral('link')
                }

            }
        });

    return root.toSource();
}
```

## 转换之后
```js
```