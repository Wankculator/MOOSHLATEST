@echo off
echo.
echo ===================================
echo PUSHING TO GITHUB NOW
echo ===================================
echo.
echo You will be prompted for:
echo Username: Wankculator
echo Password: [Your Token]
echo.
echo Pushing backup branch...
git push -u origin backup-2025-01-16-complete-working-state

echo.
echo Pushing main work branch...
git checkout comprehensive-fixes-and-docs
git push -u origin comprehensive-fixes-and-docs

echo.
echo Pushing tags...
git push origin --tags

echo.
echo ===================================
echo PUSH COMPLETE!
echo ===================================
echo.
echo IMPORTANT: Now go to GitHub and REVOKE that token!
echo https://github.com/settings/tokens
echo.
pause