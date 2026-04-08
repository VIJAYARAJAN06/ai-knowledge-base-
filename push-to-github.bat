@echo off
echo Setting up Git repository...
cd /d "D:\New folder\saas-kb-generator"

"C:\Program Files\Git\cmd\git.exe" init
"C:\Program Files\Git\cmd\git.exe" config user.email "vijayarajan06@github.com"
"C:\Program Files\Git\cmd\git.exe" config user.name "VIJAYARAJAN06"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: Agentic AI Knowledge Base SaaS - 3D UI + Multi-Agent Pipeline"
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/VIJAYARAJAN06/ai-knowledge-base-.git
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo Done! Check your GitHub repo.
pause
