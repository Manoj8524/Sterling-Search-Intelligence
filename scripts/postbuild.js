import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, '../dist/client');
const assetsDir = path.join(clientDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js')) || files.find(f => f.endsWith('.js'));
const mainCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css')) || files.find(f => f.endsWith('.css'));

console.log('Found main JS:', mainJs);
console.log('Found main CSS:', mainCss);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sterling Search Intelligence</title>
    <meta name="description" content="SEO, AEO and GEO visibility intelligence for the Sterling Holidays resort portfolio." />
    <meta name="author" content="Sterling Holidays" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="/assets/${mainJs}"></script>` : ''}
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), htmlContent);
console.log('Successfully generated dist/client/index.html');
