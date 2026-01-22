# Toggle-DockerStack.ps1

# ======== CONFIGURE THESE ========
# Your WSL distro name (as shown by `wsl -l -v`)
$WslDistro = "Ubuntu"

# Folders (not the file itself) where your docker-compose.yml files live, as WSL paths:
$ComposeDir1 = "/mnt/c/Path/To/First/ComposeFolder"
$ComposeDir2 = "/mnt/c/Path/To/Second/ComposeFolder"
# =================================

function Test-WSLRunning {
    try {
        $output = wsl -l -v 2>$null
        if ($output -match "Running") {
            return $true
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

function Run-InWSL([string]$command) {
    # Runs a bash command inside your chosen distro
    wsl -d $WslDistro -- bash -lc "$command"
}

Write-Host "Checking WSL state..." 

if (Test-WSLRunning) {
    Write-Host "WSL is running. Assuming stack is UP -> bringing it DOWN..."

    Write-Host "docker compose down in $ComposeDir1"
    Run-InWSL "cd $ComposeDir1 && docker compose down"

    Write-Host "docker compose down in $ComposeDir2"
    Run-InWSL "cd $ComposeDir2 && docker compose down"

    Write-Host "Done. Docker stack is now OFF."
} else {
    Write-Host "WSL is NOT running. Starting WSL and bringing stack UP..."

    # First command automatically starts WSL if it's stopped
    Write-Host "docker compose up -d in $ComposeDir1"
    Run-InWSL "cd $ComposeDir1 && docker compose up -d"

    Write-Host "docker compose up -d in $ComposeDir2"
    Run-InWSL "cd $ComposeDir2 && docker compose up -d"

    Write-Host "Done. Docker stack is now ON."
}

Start-Sleep -Seconds 3
