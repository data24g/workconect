# Admin Account Credentials for Testing

## Account Details
- **Email**: admin@workconnect.com
- **Password**: Admin@123
- **Role**: ADMIN
- **Username**: admin

## How to Use

### 1. Login to get token
```powershell
# Using PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:8086/api/auth/admin-login" -Method POST -ContentType "application/json" -Body '{"identifier":"admin@workconnect.com","password":"Admin@123"}'
$token = $response.token
```

### 2. Use token in API requests
```powershell
# Set headers
$headers = @{ "Authorization" = "Bearer $token" }

# Call admin endpoints
Invoke-RestMethod -Uri "http://localhost:8086/api/admin/stats" -Method GET -Headers $headers
```

### 3. Quick Test Script
Load token from file and test:
```powershell
$token = (Get-Content admin_token.txt -Raw).Replace("TOKEN=", "").Trim()
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8086/api/admin/users" -Method GET -Headers $headers
```

## Available Admin Endpoints
Based on your API, common admin endpoints include:
- GET /api/admin/stats - Dashboard statistics
- GET /api/admin/users - List all users
- GET /api/admin/businesses - List businesses
- GET /api/admin/jobs - List jobs
- GET /api/admin/articles - List articles
- PUT /api/admin/users/{id} - Update user
- POST /api/admin/businesses/{id}/verify - Verify business

## Notes
- Token is saved in `admin_token.txt`
- Token expires based on JWT configuration (default: 24 hours)
- For Postman/Insomnia: Use Bearer Token authentication
