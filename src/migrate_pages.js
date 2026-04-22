const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const pagesDir = path.join(process.cwd(), 'src', 'pages');

walk(pagesDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace next/navigation with next/router
    let newContent = content.replace(/from ["']next\/navigation["']/g, 'from "next/router"');
    
    // Replace usePathname() with useRouter().pathname
    // This is tricky if useRouter is not already initialized.
    // For now, let's just do the import replacement.
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated: ${filePath}`);
    }
  }
});
