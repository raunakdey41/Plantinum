const fs = require('fs');
let content = fs.readFileSync('c:/Users/Raunak Dey/all_programs/Plantinum/Plantinum/frontend/src/data/products.ts', 'utf8');

const mixImg = '"https://images.pexels.com/photos/5040808/pexels-photo-5040808.jpeg?auto=compress&cs=tinysrgb&h=350"';
const fertImg = '"https://images.pexels.com/photos/7342672/pexels-photo-7342672.jpeg?auto=compress&cs=tinysrgb&h=350"';

for (let i = 1; i <= 12; i++) {
  let regex = new RegExp('id: "c' + i + '",[\\s\\S]*?category: "Care & Soil"', 'g');
  content = content.replace(regex, match => {
    let newImg = (i >= 8 && i <= 12) ? fertImg : mixImg;
    if (match.includes('image:')) {
      return match.replace(/image: ".*?"/, 'image: ' + newImg);
    } else {
      return match.replace(/category: "Care & Soil"/, 'image: ' + newImg + ',\n    category: "Care & Soil"');
    }
  });
}
fs.writeFileSync('c:/Users/Raunak Dey/all_programs/Plantinum/Plantinum/frontend/src/data/products.ts', content);
