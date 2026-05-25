$apiBase = "http://localhost:5113/api"
$user = $null
try {
    $b = "{`"fullName`":`"John Smith`",`"email`":`"john@gmail.com`",`"password`":`"123Qaz`",`"role`":`"Employer`"}"
    $user = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/register" -ContentType "application/json" -Body $b
    Write-Host "Registered OK" -ForegroundColor Green
} catch {
    Write-Host "User exists, logging in..." -ForegroundColor Yellow
    try {
        $b = "{`"email`":`"john@gmail.com`",`"password`":`"123Qaz`"}"
        $user = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/login" -ContentType "application/json" -Body $b
        Write-Host "Login OK (123Qaz)" -ForegroundColor Green
    } catch {
        $b = "{`"email`":`"john@gmail.com`",`"password`":`"123qaz`"}"
        $user = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/login" -ContentType "application/json" -Body $b
        Write-Host "Login OK (123qaz)" -ForegroundColor Green
    }
}
if (-not $user.token) { Write-Host "No token - is the API running?" -ForegroundColor Red; exit 1 }
$h = @{ Authorization = "Bearer $($user.token)" }
$jobs = Get-Content "E:\Job-Portal-main\jobs-data.json" -Raw | ConvertFrom-Json
Write-Host "Posting $($jobs.Count) jobs..." -ForegroundColor Cyan
$ok = 0; $fail = 0
foreach ($j in $jobs) {
    try {
        Invoke-RestMethod -Method Post -Uri "$apiBase/jobs" -Headers $h -ContentType "application/json" -Body ($j | ConvertTo-Json -Compress) | Out-Null
        $ok++
        Write-Host "[$ok] $($j.title) @ $($j.company)" -ForegroundColor Green
    } catch {
        $fail++
        Write-Host "FAIL: $($j.title)" -ForegroundColor Red
    }
}
Write-Host "Done: $ok created, $fail failed." -ForegroundColor Cyan
