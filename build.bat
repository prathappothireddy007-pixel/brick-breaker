@echo off
echo Compiling BrickBlitz...
if not exist bin mkdir bin
javac -d bin -sourcepath src src\com\brickblitz\BrickBlitzApp.java
if %errorlevel% == 0 (
    echo BUILD SUCCESSFUL
) else (
    echo BUILD FAILED
    pause
)
