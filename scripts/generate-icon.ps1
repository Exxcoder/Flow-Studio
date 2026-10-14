# Generates app-icon.png (1024x1024) for `npx tauri icon`.
Add-Type -AssemblyName System.Drawing

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$out = Join-Path $root "app-icon.png"

$bmp = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 9, 13, 22))

$cyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$violet = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 139, 92, 246))
$emerald = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 6, 182, 212), 18)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$g.DrawBezier($pen, 320, 512, 480, 512, 420, 320, 640, 320)
$g.DrawBezier($pen, 320, 512, 480, 512, 420, 704, 640, 704)
$g.FillEllipse($cyan, 220, 412, 200, 200)
$g.FillEllipse($violet, 640, 220, 200, 200)
$g.FillEllipse($emerald, 640, 604, 200, 200)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Wrote $out"
