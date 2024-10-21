const fs = require('fs');
const path = require('path');
const proxies = require('./proxies.json');
const userAgents = require('./userAgents.json');

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Đọc thư mục profiles
const profilesDir = path.join(__dirname, '../../../profiles');
const profileFolders = fs.readdirSync(profilesDir).filter((file) => {
  return fs.statSync(path.join(profilesDir, file)).isDirectory(); // Chỉ lấy thư mục
});

// Tạo profiles dựa trên các thư mục
const profiles = profileFolders.map((folderName, index) => ({
  id: (index + 1).toString(),
  name: folderName, // Sử dụng tên folder làm name
  proxy: getRandomElement(proxies),
  userAgent: getRandomElement(userAgents),
}));

module.exports = { profiles };

