const fs = require('fs');

const data = [];
const filePath = './public/mtg-card-database.json';

if (!fs.existsSync(filePath)) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('An error occurred while creating the file:', err);
      return;
    }
    console.log('The file has been created successfully with an empty array.');
  });
} else {
  console.log('The file already exists.');
}
