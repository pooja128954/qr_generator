const fs = require('fs');
const path = require('path');

const directories = [
  'c:/Users/DELL/Desktop/qra/qra/src/pages/admin/',
  'c:/Users/DELL/Desktop/qra/qra/src/pages/admin/sections/',
  'c:/Users/DELL/Desktop/qra/qra/src/components/admin/'
];

const replacements = [
  { s: /bg-\[#0a0a0f\]\/80/g, r: 'bg-background/80' },
  { s: /bg-\[#0a0a0f\]/g, r: 'bg-background' },
  { s: /bg-\[#12121a\]/g, r: 'bg-card' },
  { s: /bg-\[#0d0d14\]/g, r: 'bg-card' },
  { s: /bg-\[#1a1a28\]/g, r: 'bg-popover' },
  { s: /border-white\/\[0\.\d+\]/g, r: 'border-border' },
  { s: /hover:bg-white\/\[0\.\d+\]/g, r: 'hover:bg-accent' },
  { s: /bg-white\/\[0\.\d+\]/g, r: 'bg-accent' },
  { s: /text-white/g, r: 'text-foreground' },
  { s: /text-zinc-500/g, r: 'text-muted-foreground' },
  { s: /text-zinc-600/g, r: 'text-muted-foreground' },
  { s: /text-zinc-400/g, r: 'text-muted-foreground' },
  { s: /text-zinc-300/g, r: 'text-foreground' },
  { s: /text-zinc-200/g, r: 'text-foreground' },
  { s: /focus:ring-violet-500\/[0-9]+/g, r: 'focus:ring-ring' },
  { s: /focus:border-violet-500\/[0-9]+/g, r: 'focus:border-ring' },
  { s: /shadow-violet-500\/[0-9]+/g, r: 'shadow-primary/20' },
  { s: /text-violet-\d+/g, r: 'text-primary' },
  { s: /bg-violet-\d+\/\d+/g, r: 'bg-primary/20' },
  { s: /bg-violet-\d+/g, r: 'bg-primary' },
  { s: /hover:bg-violet-\d+/g, r: 'hover:bg-primary/90' },
  { s: /text-indigo-\d+/g, r: 'text-primary' },
  { s: /bg-indigo-\d+\/\d+/g, r: 'bg-primary/20' },
  { s: /bg-indigo-\d+/g, r: 'bg-primary' },
  { s: /hover:text-white/g, r: 'hover:text-foreground' },
  { s: /bg-gradient-to-r from-violet-600 to-indigo-600/g, r: 'bg-primary' },
  { s: /bg-gradient-to-br from-violet-600 to-indigo-600/g, r: 'bg-primary' },
  { s: /hover:from-violet-500 hover:to-indigo-500/g, r: 'hover:bg-primary/90' },
  { s: /#8b5cf6/g, r: 'hsl(var(--primary))' },
  { s: /from-violet-400 to-indigo-400/g, r: 'from-primary to-primary' },
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const p = path.join(dir, file);
      let content = fs.readFileSync(p, 'utf8');
      replacements.forEach(({s, r}) => {
        content = content.replace(s, r);
      });
      fs.writeFileSync(p, content);
      console.log(`Updated ${file}`);
    }
  });
});
