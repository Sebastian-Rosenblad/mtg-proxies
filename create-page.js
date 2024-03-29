const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name) {
  console.error('Please specify the page name like this: npm run create-page YourPageName');
  process.exit(1);
}
const pageName = name + "P";
const className = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLocaleLowerCase();

const dirPath = path.join(__dirname, 'src', 'Pages', name);
const tsxFilePath = path.join(dirPath, `${pageName}.tsx`);
const scssFilePath = path.join(dirPath, `${pageName}.scss`);
const modelFilePath = path.join(__dirname, 'src', 'Models', 'Pages', `${className}-props.model.tsx`);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const tsxContent = `import React from "react";
import './${pageName}.scss';
import { ${name}PropsM } from "../../Models/Pages/${className}-props.model";

export function ${pageName}(props: ${name}PropsM): JSX.Element {
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

console.log(`Page ${name} created successfully.`);
