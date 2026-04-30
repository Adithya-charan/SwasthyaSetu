@echo off
echo Cleaning up secrets and fixing git history...
git reset --soft HEAD~1
if exist test_mysql_final.js del test_mysql_final.js
if exist update_git.bat del update_git.bat
if exist push_diag.bat del push_diag.bat
if exist push_final_opt.bat del push_final_opt.bat
if exist push_pom.bat del push_pom.bat
if exist restore_src.bat del restore_src.bat
git add .
git commit -m "Finalize full-stack authentication fixes and centralized authFetch implementation"
echo Now trying to push...
git push
pause
