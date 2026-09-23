const fs = require('fs');
const https = require('https');
const path = require('path');

https.get('https://threeui.com/source-code/sylva-living-world.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    json.files.forEach(file => {
      const filePath = path.join(__dirname, file.path);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.code, 'utf8');
      console.log('Wrote', file.path);
    });
  });
}).on('error', (err) => {
  console.error(err);
});
