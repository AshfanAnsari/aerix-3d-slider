@echo off
cd /d %~dp0
if not exist node_modules (
  echo Installing dependencies, one time only...
  call npm install
)
npm run dev
pause
