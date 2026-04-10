$projectPath = "C:\Users\jay\civiceye"
$frontendUrl = "http://localhost:5173"

function Test-PortListening {
  param([int]$Port)

  try {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
    return [bool]$connection
  } catch {
    return $false
  }
}

function Start-BackendWindow {
  Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath && npm.cmd run server" -WindowStyle Minimized
}

function Start-FrontendWindow {
  Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $projectPath && npm.cmd run dev" -WindowStyle Minimized
}

if (-not (Test-PortListening -Port 5000)) {
  Start-BackendWindow
}

for ($i = 0; $i -lt 10; $i++) {
  if (Test-PortListening -Port 5000) {
    break
  }
  Start-Sleep -Seconds 2
}

if (-not (Test-PortListening -Port 5000)) {
  Start-BackendWindow
}

if (-not (Test-PortListening -Port 5173)) {
  Start-FrontendWindow
}

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}

if ($ready) {
  Start-Process $frontendUrl
}
