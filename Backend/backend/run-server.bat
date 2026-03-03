@echo off
echo Starting Backend Server...
echo.

REM Set CLASSPATH to include compiled classes and all dependencies
set CLASSPATH=target\classes

REM Add all jar dependencies
for %%i in (target\lib\*.jar) do call :addcp %%i
for /R %USERPROFILE%\.m2\repository do @if exist "%%i" call :addcp "%%i"

REM Run the application
java -cp "%CLASSPATH%" com.hlgtech.api.HlgtechApiApplication

goto :eof

:addcp
set CLASSPATH=%CLASSPATH%;%1
goto :eof
