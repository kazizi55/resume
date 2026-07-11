const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const inputArg = process.argv[2];
    if (!inputArg) {
      console.error('Please provide an input markdown file path as an argument.');
      process.exit(1);
    }
    const mdPath = path.resolve(inputArg);
    const parsedPath = path.parse(mdPath);
    const pdfPath = path.join(__dirname, 'pdf', `${parsedPath.name}.pdf`);

    // Read markdown
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    
    // Parse to HTML
    const htmlContent = marked.parse(mdContent);
    
    // Read CSS
    const cssPath = path.join(__dirname, 'node_modules', 'github-markdown-css', 'github-markdown.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    // Construct full HTML
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${cssContent}
          .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
        </style>
      </head>
      <body>
        <div class="markdown-body">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;
    
    // Generate PDF
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });
    
    await browser.close();
    console.log(`Successfully generated ${pdfPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
})();
