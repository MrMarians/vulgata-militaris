@echo off
REM publish.cmd - Mirror the vault's wiki/ into content/, then commit & push so
REM GitHub Pages rebuilds the live site.
REM Usage: double-click this file, or from a terminal:  publish.cmd optional message
setlocal
cd /d "%~dp0"

echo(
echo === Militaria in Vulgata - pubblicazione sito ===
echo(
echo [1/4] Sincronizzo i contenuti dal vault...
node sync-content.mjs
if errorlevel 1 (
  echo(
  echo ERRORE: sincronizzazione fallita. La cartella del vault e' al suo posto?
  goto end
)

echo(
echo [2/4] Preparo le modifiche...
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo(
  echo Nessuna modifica da pubblicare: il sito e' gia' aggiornato.
  goto end
)

set "MSG=%*"
if not "%MSG%"=="" goto have_msg
for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set "STAMP=%%i"
set "MSG=Update site (%STAMP%)"
:have_msg

echo(
echo [3/4] Commit: %MSG%
git commit -m "%MSG%"
if errorlevel 1 (
  echo(
  echo ERRORE: commit fallito.
  goto end
)

echo(
echo [4/4] Invio a GitHub...
git push origin v5
if errorlevel 1 (
  echo(
  echo ERRORE: push fallito. Controlla la connessione o l'accesso a GitHub.
  goto end
)

echo(
echo FATTO. GitHub sta ricostruendo il sito.
echo Sara' online tra ~1-2 minuti su:
echo    https://mrmarians.github.io/vulgata-militaris/

:end
echo(
pause
