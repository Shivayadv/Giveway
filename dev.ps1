# Start both frontend and backend dev servers
# Usage: .\dev.ps1

Write-Host ""
Write-Host "  GiveAwayLead — Dev Servers"
Write-Host "  ==========================="
Write-Host "  Frontend : http://localhost:3000"
Write-Host "  Backend  : http://localhost:8000"
Write-Host "  API Docs : http://localhost:8000/docs"
Write-Host ""

# Start backend in a new terminal window
Start-Process powershell -ArgumentList '-NoExit', '-Command', `
  'Set-Location "backend"; .\venv\Scripts\uvicorn main:app --reload --port 8000' `
  -WorkingDirectory $PSScriptRoot

# Start frontend in current terminal
Set-Location "$PSScriptRoot\frontend"
npm run dev
