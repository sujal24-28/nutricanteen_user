const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  const tunnel = await localtunnel({ port: 5000, subdomain: 'nutricanteen' });
  const url = tunnel.url;
  console.log('TUNNEL_URL=' + url);
  fs.writeFileSync('C:\\Users\\sujal\\tunnel_url.txt', url);
  tunnel.on('close', () => process.exit(0));
})();
