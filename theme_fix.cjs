const fs = require('fs');
const path = require('path');

const dirs = [
  'c:/Users/DELL/Desktop/qra/qra/src/pages/admin/',
  'c:/Users/DELL/Desktop/qra/qra/src/pages/admin/sections/',
  'c:/Users/DELL/Desktop/qra/qra/src/components/admin/'
];

const patterns = [
  // Backgrounds
  { s: /bg-\[#0a0a0f\]\/80/g, r: 'bg-background/80' },
  { s: /bg-\[#0a0a0f\]/g, r: 'bg-background' },
  { s: /bg-\[#12121a\]/g, r: 'bg-card' },
  { s: /bg-\[#0d0d14\]/g, r: 'bg-card' },
  { s: /bg-\[#1a1a28\]/g, r: 'bg-popover' },

  // Transparent Whites/Accents
  { s: /bg-white\/\[0\.\d+\]/g, r: 'bg-accent/50' },
  { s: /hover:bg-accent\/50/g, r: 'hover:bg-accent' },
  
  // Borders
  { s: /border-white\/\[0\.\d+\]/g, r: 'border-border' },
  
  // Primary colors
  { s: /bg-(?:violet|indigo|admin|cyan)-\d+\/\d+/g, r: 'bg-primary/20' },
  { s: /bg-(?:violet|indigo|admin|cyan)-\d+/g, r: 'bg-primary' },
  { s: /text-(?:violet|indigo|admin|cyan)-\d+/g, r: 'text-primary' },
  { s: /border-(?:violet|indigo|admin|cyan)-\d+\/\d+/g, r: 'border-primary/50' },
  { s: /border-(?:violet|indigo|admin|cyan)-\d+/g, r: 'border-primary' },
  { s: /ring-(?:violet|indigo|admin|cyan)-\d+\/\d+/g, r: 'ring-primary/50' },
  { s: /ring-(?:violet|indigo|admin|cyan)-\d+/g, r: 'ring-primary' },
  { s: /shadow-(?:violet|indigo|admin|cyan)-\d+\/\d+/g, r: 'shadow-primary/20' },
  { s: /from-(?:violet|indigo|admin|cyan)-\d+/g, r: 'from-primary' },
  { s: /to-(?:violet|indigo|admin|cyan)-\d+/g, r: 'to-primary' },
  
  // Fix gradients if they are now exactly the same
  { s: /bg-gradient-to-(?:r|br) from-primary to-primary/g, r: 'bg-primary' },
  
  // Text
  { s: /text-white\/[0-9]+/g, r: 'text-foreground/80' },
  { s: /text-white/g, r: 'text-foreground' },
  { s: /text-zinc-\d+/g, r: 'text-muted-foreground' },
  { s: /hover:text-muted-foreground/g, r: 'hover:text-foreground' },
  
  // SVG Recharts
  { s: /#8b5cf6|#6366f1/g, r: 'hsl(var(--primary))' }
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const p = path.join(d, f);
      let c = fs.readFileSync(p, 'utf8');
      patterns.forEach(({s, r}) => c = c.replace(s, r));
      fs.writeFileSync(p, c);
    }
  });
});
console.log('Theme integrated successfully.');
