@echo off
echo Recriando banco de dados limpo...
cd backend
node recreate_database.js
pause