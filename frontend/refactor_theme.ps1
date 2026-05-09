$files = Get-ChildItem -Path src -Include *.css,*.jsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Text colors
    $content = $content -replace '(?i)#0f172a', 'var(--color-text)'
    $content = $content -replace '(?i)#64748b', 'var(--color-text-muted)'
    
    # Backgrounds and Surfaces
    $content = $content -replace '(?i)#f1f5f9', 'var(--color-background)'
    $content = $content -replace '(?i)#ffffff', 'var(--color-surface)'
    $content = $content -replace '(?i)#f8fafc', 'var(--color-secondary)'
    $content = $content -replace '(?i)#f8faff', 'var(--color-secondary)'
    
    # Indigo Primary Colors
    $content = $content -replace '(?i)#4f46e5', 'var(--color-primary)'
    $content = $content -replace '(?i)#4338ca', 'var(--color-primary-hover)'
    $content = $content -replace '(?i)#818cf8', 'var(--color-primary-hover)'
    
    # Replace white backgrounds explicitly
    $content = $content -replace 'background:\s*white', 'background: var(--color-surface)'
    $content = $content -replace 'background-color:\s*white', 'background-color: var(--color-surface)'
    
    # RGB representations of primary color (79, 70, 229) -> (74, 92, 106)
    $content = $content -replace '79,\s*70,\s*229', '74, 92, 106'
    
    # Borders
    $content = $content -replace '(?i)#e2e8f0', 'var(--color-border)'

    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Output "Refactor complete."
