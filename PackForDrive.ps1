$exclude = @("node_modules", ".git", "dist", "*.zip")
$source = Get-Location
$destination = "Allentines_For_Susie.zip"

Write-Host "Zipping project for Google Drive..."
Compress-Archive -Path * -DestinationPath $destination -Exclude $exclude -Force
Write-Host "Done! You can upload '$destination' to Google Drive."
