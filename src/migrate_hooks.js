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
    let original = content;
    
    // Replace usePathname import if it exists
    content = content.replace(/usePathname,\s*useRouter/g, 'useRouter');
    content = content.replace(/useRouter,\s*usePathname/g, 'useRouter');
    content = content.replace(/import\s*{\s*usePathname\s*}\s*from\s*["']next\/router["']/g, 'import { useRouter } from "next/router"');
    
    // Replace usePathname() with useRouter().pathname or similar
    // We need to check if useRouter is already called
    if (content.includes('usePathname()')) {
        if (content.includes('useRouter()')) {
            // router already exists
            content = content.replace(/const\s+pathname\s*=\s*usePathname\(\)/g, 'const pathname = router.pathname');
            content = content.replace(/usePathname\(\)/g, 'router.pathname');
        } else {
            // need to call useRouter
            content = content.replace(/const\s+pathname\s*=\s*usePathname\(\)/g, 'const router = useRouter();\n  const pathname = router.pathname');
            content = content.replace(/usePathname\(\)/g, 'useRouter().pathname');
        }
    }

    // Fix double imports or missing ones
    if (content.includes('useRouter') && !content.includes('import { useRouter }')) {
        // This is a bit complex to fix blindly, but let's try a simple addition if next/router is there
        if (content.includes('from "next/router"')) {
             content = content.replace(/import\s*{\s*/, 'import { useRouter, ');
        }
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated hooks: ${filePath}`);
    }
  }
});
