# Thin wrapper — logic lives in repo-trust-scan.mjs
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Mjs = Join-Path $ScriptDir "repo-trust-scan.mjs"
& node $Mjs @Args
exit $LASTEXITCODE
