/* const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app'));
let modifiedCount = 0;
let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Fix typos
  newContent = newContent.replace(/text-\(--color-primary\)nk-0/g, 'text-(--color-primary) shrink-0');
  newContent = newContent.replace(/text-\(--color-text-primary\)cate/g, 'text-(--color-text-primary) truncate');
  
  // Replace all prefix-[var(--varname)] with prefix-(--varname)
  const regex = /([a-zA-Z0-9\-]+)-\[var\((--[a-zA-Z0-9\-]+)\)\]/g;
  
  newContent = newContent.replace(regex, (match, prefix, varname) => {
    totalReplaced++;
    return `${prefix}-(${varname})`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedCount++;
  }
});

console.log(`Updated ${modifiedCount} files. Replaced ${totalReplaced} occurrences.`);
 */