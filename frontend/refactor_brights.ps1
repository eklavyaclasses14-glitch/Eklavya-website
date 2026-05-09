$files = Get-ChildItem -Path src/styles -Include *.css -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace purple and bright blues in gradients with theme vars
    $content = $content -replace '(?i)#7c3aed', 'var(--color-primary-hover)'
    $content = $content -replace '(?i)#0ea5e9', 'var(--color-primary)'
    $content = $content -replace '(?i)#38bdf8', 'var(--color-primary-hover)'
    
    # Replace indigo explicitly hardcoded in AdminManageSubjects or others
    $content = $content -replace '(?i)#6366f1', 'var(--color-primary)'
    $content = $content -replace '(?i)#818cf8', 'var(--color-primary-hover)'
    
    # Sky blue rgba(14, 165, 233, 0.1) -> rgba(155, 168, 171, 0.1)
    $content = $content -replace '14,\s*165,\s*233', '155, 168, 171'

    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Output "Bright colors refactored."
