const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('Please specify the component name like this: npm run create-component YourComponentName');
  process.exit(1);
}
const componentName = name + "C";
const className = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLocaleLowerCase();

const dirPath = path.join(__dirname, 'src', 'Components', name);
const tsxFilePath = path.join(dirPath, `${componentName}.tsx`);
const scssFilePath = path.join(dirPath, `${componentName}.scss`);
const modelFilePath = path.join(__dirname, 'src', 'Models', 'Components', `${className}-props.model.tsx`);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const tsxContent = `import React from "react";
import './${componentName}.scss';
import { ${name}PropsM } from "../../Models/Components/${className}-props.model";

export function ${componentName}(props: ${name}PropsM): JSX.Element {
  return <div className="${className}"></div>;
}
`;
const scssContext = `.${className} {}
`;
const modelContext = `export interface ${name}PropsM {}
`

fs.writeFileSync(tsxFilePath, tsxContent);
fs.writeFileSync(scssFilePath, scssContext);
fs.writeFileSync(modelFilePath, modelContext);

console.log(`Component ${name} created successfully.`);
