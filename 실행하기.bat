@echo off
chcp 65001 > nul
title 자율훈련법 편안한 음성안내 앱
echo [자율훈련법 편안한 음성안내 앱]을 시작합니다...
cd /d "%~dp0"

start http://localhost:3030
node server.js
pause
