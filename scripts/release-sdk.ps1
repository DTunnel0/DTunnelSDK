param(
  [Parameter(Mandatory = $true)]
  [string]$Version,
  [string]$Branch = "main",
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

if ($Version -match "^\s*$") {
  throw "Version nao pode ser vazia."
}

$tag = if ($Version.StartsWith("v")) { $Version } else { "v$Version" }

if ($tag -notmatch "^v\d+\.\d+\.\d+([\-+][0-9A-Za-z\.\-]+)?$") {
  throw "Version invalida. Use o formato X.Y.Z (ex: 1.0.1) ou vX.Y.Z."
}

if (-not (Test-Path "sdk/dtunnel-sdk.js")) {
  throw "Arquivo sdk/dtunnel-sdk.js nao encontrado. Rode o script na raiz do repositorio."
}

$currentBranch = git branch --show-current
if ($currentBranch -ne $Branch) {
  throw "Branch atual e '$currentBranch'. Troque para '$Branch' antes de publicar."
}

$dirty = git status --porcelain
if ($dirty) {
  throw "Existem alteracoes locais nao commitadas. Commit/stash antes de criar release."
}

$existingTag = git tag --list $tag
if ($existingTag -eq $tag) {
  throw "A tag $tag ja existe."
}

Write-Host "Atualizando branch '$Branch'..."
git fetch origin $Branch
git pull --ff-only origin $Branch

Write-Host "Criando tag $tag..."
git tag -a $tag -m "release: $tag"

if ($NoPush) {
  Write-Host "Tag criada localmente: $tag"
  Write-Host "Para publicar depois, execute:"
  Write-Host "  git push origin $Branch"
  Write-Host "  git push origin $tag"
  exit 0
}

Write-Host "Enviando branch e tag para origin..."
git push origin $Branch
git push origin $tag

$remoteUrl = git config --get remote.origin.url
$repoPath = $null

if ($remoteUrl -match "github\.com[:/](.+?)(?:\.git)?$") {
  $repoPath = $Matches[1]
}

if ($repoPath) {
  Write-Host ""
  Write-Host "Release iniciada."
  Write-Host "Acompanhe o workflow: https://github.com/$repoPath/actions"
  Write-Host "Download da release: https://github.com/$repoPath/releases/tag/$tag"
} else {
  Write-Host "Tag enviada com sucesso. Verifique a aba Actions/Releases no seu remoto."
}
