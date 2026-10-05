const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Find all Ã followed by any char
      content = content.replace(/Ã./g, (match) => {
        try {
           const decoded = Buffer.from(match, 'latin1').toString('utf8');
           // Remove accents to ensure completely safe plain text as permitted by the user
           return decoded.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        } catch(e) { return match; }
      });
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
