const fs = require('fs');
const http = require('http');
const url = require('url');

const jsonData = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const poductsData = JSON.parse(jsonData);

// SERVER
const server = http.createServer((req, resp) => {
  const pathname = url.parse(req.url, true).pathname;
  const query = url.parse(req.url, true).query;
  console.log(`...new request=${pathname}`);

  // PRODUCTS OVERVIEW
  if (pathname === '/' || pathname === '/products') {
    // OVERVIEW HTML
    fs.readFile(
      `${__dirname}/templates/overview-tpt.html`,
      'utf-8',
      (err, overTpt) => {
        if (err) Error(err);

        // CARDS HTML
        fs.readFile(
          `${__dirname}/templates/card-tpt.html`,
          'utf-8',
          (err, cardTpt) => {
            if (err) Error(err);

            // REPLACE PLACEHOLDERS
            const cardsOutput = poductsData
              .map((prod, idx) =>
                replaceTemplate(cardTpt, Object.entries(prod))
              )
              .join('');
            const overOutput = overTpt.replace('%%cards%', cardsOutput);

            // SEND RESPONSE
            resp.writeHead(200, { 'Content-type': 'text/html' });
            resp.end(overOutput);
          }
        );
      }
    );

    // LAPTOP VIEW
  } else if (pathname === '/laptop' && query.id < poductsData.length) {
    // LAPTOP HTML
    fs.readFile(
      `${__dirname}/templates/laptop-tpt.html`,
      'utf-8',
      (err, fileData) => {
        if (err) Error(err);

        // REPLACE PLACEHOLDERS
        const output = replaceTemplate(
          fileData,
          Object.entries(poductsData[query.id])
        );

        // SEND RESPONSE
        resp.writeHead(200, { 'Content-type': 'text/html' });
        resp.end(output);
      }
    );

    // IMAGE REQUEST
  } else if (/\.(png|gif|jpe?g)/.test(pathname)) {
    // SEND IMAGE FILE
    fs.readFile(`${__dirname}${pathname}`, (err, data) => {
      resp.writeHead(200, { 'Content-type': 'image/jpg' });
      resp.end(data);
    });

    // NOT FOUND
  } else {
    resp.writeHead(404, { 'Content-type': 'text/html' });
    resp.end('404: Page Not Found');
  }
});

// REPLACE TEMPLATE FUNCTION
function replaceTemplate(template, product) {
  let output = template;

  product.forEach((property) => {
    const propName = property[0];
    const propValue = property[1];

    const placeholder = new RegExp(`%%${propName}%`, 'g');

    // replace placeholder with property value
    output = output.replace(placeholder, propValue);
  });

  return output;
}

// START SERVER
server.listen(3000, 'localhost', () => {
  console.log('Server on');
});
