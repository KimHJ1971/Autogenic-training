/**
 * Node.js 내장 경량 정적 웹 서버
 * 외부 npm 패키지 설치 없이 Node.js 기본 모듈로 동작합니다.
 * PC 브라우저는 물론, 같은 Wi-Fi에 연결된 스마트폰에서도 접속할 수 있도록 로컬 IP를 표시합니다.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3030;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(ROOT_DIR, decodeURIComponent(reqUrl));

  // 상위 경로 탐색 방지
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log('🌙 자율훈련법 안내 앱 (Autogenic Training App)');
  console.log('==================================================');
  console.log(`[PC 로컬 접속]  http://localhost:${PORT}`);
  const ips = getLocalIpAddresses();
  ips.forEach(ip => {
    console.log(`[스마트폰 접속] http://${ip}:${PORT}`);
  });
  console.log('--------------------------------------------------');
  console.log('누워서 편안하게 자율훈련법을 수행하세요.');
  console.log('서버 종료: Ctrl + C');
  console.log('==================================================');
});
