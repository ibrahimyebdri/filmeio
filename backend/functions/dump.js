const fs = require('fs');
fetch('https://qeseh.net/?s=yeralti').then(r=>r.text()).then(html => {
  fs.writeFileSync('search_dump.html', html);
})
