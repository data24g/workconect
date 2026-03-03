# Quick Start Backend Server
# This script runs the Spring Boot app using Maven dependency:build-classpath

Write-Host "=== Starting Backend Server ===" -ForegroundColor Cyan
Write-Host ""

# Build classpath
Write-Host "Building classpath..." -ForegroundColor Yellow
$cpOutput = & .\mvnw.cmd dependency:build-classpath -Dmdep.outputFile=cp.txt 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Classpath built successfully!" -ForegroundColor Green
    
    $classpath = Get-Content cp.txt -Raw
    $fullClasspath = "target\classes;$classpath"
    
    Write-Host ""
    Write-Host "Starting Spring Boot Application..." -ForegroundColor Cyan
    Write-Host "Main Class: com.hlgtech.api.HlgtechApiApplication"
    Write-Host "Port: 8086"
    Write-Host ""
    
    # Run the application
    java -cp $fullClasspath com.hlgtech.api.HlgtechApiApplication
}
else {
    Write-Host "Failed to build classpath!" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: use exec:java
    .\mvnw.cmd org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="com.hlgtech.api.HlgtechApiApplication"
}
