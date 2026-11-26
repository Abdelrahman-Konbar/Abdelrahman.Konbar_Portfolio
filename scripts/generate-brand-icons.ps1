param([Parameter(Mandatory = $true)][string]$Source)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot '..\public\branding'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -LiteralPath $Source -Destination (Join-Path $destination 'ak-logo-source.png')
$logo = [System.Drawing.Bitmap]::new($Source)
$crop = [System.Drawing.Rectangle]::new(190, 425, 850, 500)
$images = @{}
foreach ($size in @(16, 32, 48, 180, 256)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 12, 12, 16))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $width = $size * 0.9
  $height = $width * $crop.Height / $crop.Width
  $target = [System.Drawing.Rectangle]::new([int](($size - $width) / 2), [int](($size - $height) / 2), [int]$width, [int]$height)
  $graphics.DrawImage($logo, $target, $crop.X, $crop.Y, $crop.Width, $crop.Height, [System.Drawing.GraphicsUnit]::Pixel)
  $stream = [System.IO.MemoryStream]::new()
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $images[$size] = $stream.ToArray()
  if ($size -eq 16 -or $size -eq 32) {
    [System.IO.File]::WriteAllBytes((Join-Path $destination "favicon-${size}x${size}.png"), $images[$size])
  }
  if ($size -eq 180) {
    [System.IO.File]::WriteAllBytes((Join-Path $destination 'apple-touch-icon.png'), $images[$size])
  }
  $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
$logo.Dispose()
$ico = [System.IO.MemoryStream]::new()
$writer = [System.IO.BinaryWriter]::new($ico)
$writer.Write([UInt16]0); $writer.Write([UInt16]1); $writer.Write([UInt16]4)
$offset = 6 + 16 * 4
foreach ($size in @(16, 32, 48, 256)) {
  $writer.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
  $writer.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
  $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([UInt16]1); $writer.Write([UInt16]32)
  $writer.Write([UInt32]$images[$size].Length); $writer.Write([UInt32]$offset)
  $offset += $images[$size].Length
}
foreach ($size in @(16, 32, 48, 256)) { $writer.Write([byte[]]$images[$size]) }
[System.IO.File]::WriteAllBytes((Join-Path $destination 'favicon.ico'), $ico.ToArray())
$writer.Dispose(); $ico.Dispose()
