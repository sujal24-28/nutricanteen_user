const localtunnel = require('localtunnel');
const fs = require('fs');

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 5000, subdomain: 'nutricanteen-sujal-dev' });
    console.log('TUNNEL_URL=' + tunnel.url);
    fs.writeFileSync('C:\\Users\\sujal\\tunnel_url.txt', tunnel.url);
    tunnel.on('close', () => {
      console.log('Tunnel closed, restarting...');
      setTimeout(startTunnel, 3000);
    });
    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err);
    setTimeout(startTunnel, 3000);
  }
}
startTunnel();
