# 📚 API Service Guide - Admin Web

## 🎯 Overview

File `adminApi.ts` cung cấp **tất cả các API methods** để tương tác với **Java Spring Boot Backend** (port 8080).

---

## ⚙️ Setup

### 1. Khởi động Backend Java

```bash
# Ở thư mục gốc project
cd D:\Admin_WorkConnect\api

# Chạy backend (chọn 1 trong 2 cách)
mvn spring-boot:run
# HOẶC
./mvnw spring-boot:run

# Backend sẽ chạy tại: http://localhost:8080
```

### 2. Khởi động Frontend Admin

```bash
cd D:\Admin_WorkConnect\Frontend

npm install  # Chỉ chạy lần đầu
npm run dev

# Frontend sẽ chạy tại: http://localhost:5173 (hoặc 3000)
```

---

## 🔐 Authentication

### Login Admin

```typescript
import { adminApi } from '../services/adminApi';

// Đăng nhập
try {
  const response = await adminApi.auth.adminLogin('admin@example.com', 'password123');
  
  // Lưu token vào localStorage
  localStorage.setItem('admin_token', response.token);
  
  console.log('User:', response.user);
} catch (error) {
  console.error('Login failed:', error);
}
```

### Lấy thông tin Admin hiện tại

```typescript
const currentAdmin = await adminApi.auth.getCurrentAdmin();
console.log(currentAdmin);
```

**Lưu ý**: Tất cả API calls sau khi login sẽ **tự động gửi JWT token** trong header nhờ interceptor.

---

## 👥 User Management

### Quản lý trạng thái User

```typescript
// Cảnh báo user
await adminApi.users.warnUser('user_id_here');

// Vô hiệu hóa user
await adminApi.users.disableUser('user_id_here');

// Kích hoạt lại user
await adminApi.users.activateUser('user_id_here');

// Cấm (ban) user
await adminApi.users.banUser('user_id_here');
```

### Cập nhật thông tin User

```typescript
await adminApi.users.updateUser('user_id', {
  fullName: 'Nguyễn Văn A',
  bio: 'Developer',
  avatar: 'http://example.com/avatar.jpg',
});
```

---

## 🏢 Business Management

```typescript
// Lấy danh sách tất cả doanh nghiệp
const businesses = await adminApi.businesses.getAll();
console.log(businesses);

// Lấy chi tiết 1 doanh nghiệp
const business = await adminApi.businesses.getById('business_id');
```

---

## 💼 Job Management

```typescript
// Lấy tất cả công việc
const jobs = await adminApi.jobs.getAll();

// Lấy công việc theo business
const businessJobs = await adminApi.jobs.getByBusiness('business_id');

// Cập nhật công việc
await adminApi.jobs.update('job_id', {
  title: 'Senior Developer',
  salary: 3000,
  location: 'Hà Nội',
});

// Cập nhật trạng thái công việc
await adminApi.jobs.updateStatus('job_id', 'CLOSED');

// Xóa công việc
await adminApi.jobs.delete('job_id');
```

---

## 📝 Work Session Management

```typescript
// Lấy tất cả phiên làm việc
const sessions = await adminApi.workSessions.getAll();

// Lấy số lượng phiên
const count = await adminApi.workSessions.getCount();

// Lấy phiên theo công việc
const jobSessions = await adminApi.workSessions.getByJob('job_id');

// Cập nhật trạng thái phiên
await adminApi.workSessions.updateStatus('session_id', 'COMPLETED', 'Hoàn thành tốt');

// Xóa phiên
await adminApi.workSessions.delete('session_id');
```

---

## ⭐ Review Management

```typescript
// Lấy tất cả đánh giá (chỉ admin)
const reviews = await adminApi.reviews.getAll();

// Lấy đánh giá về 1 user
const userReviews = await adminApi.reviews.getByUser('user_id');

// Lấy đánh giá do 1 user viết
const authorReviews = await adminApi.reviews.getByAuthor('user_id');
```

---

## 🚨 Report Management

```typescript
// Lấy tất cả báo cáo (chỉ admin)
const reports = await adminApi.reports.getAll();
```

---

## 📰 Article/News Management

```typescript
// Lấy tất cả bài viết
const articles = await adminApi.articles.getAll();

// Lấy bài viết theo menu
const homeArticles = await adminApi.articles.getByMenu('homepage');

// Tạo bài viết mới
await adminApi.articles.create({
  title: 'Tin tức mới',
  content: 'Nội dung bài viết...',
  menu: 'homepage',
  status: 'PUBLISHED',
});

// Cập nhật bài viết
await adminApi.articles.update('article_id', {
  title: 'Tiêu đề mới',
});

// Xóa bài viết
await adminApi.articles.delete('article_id');
```

---

## 🎨 Banner Management

```typescript
// Lấy tất cả banner
const banners = await adminApi.banners.getAll();

// Tạo banner mới
await adminApi.banners.create({
  imageUrl: 'http://example.com/banner.jpg',
  title: 'Banner chính',
  link: 'http://example.com',
  menu: 'homepage',
  active: true,
  displayOrder: 1,
});

// Cập nhật banner
await adminApi.banners.update('banner_id', {
  active: false,
});

// Xóa banner
await adminApi.banners.delete('banner_id');
```

---

## 🖼️ Image Management

```typescript
// Upload hình ảnh
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const imageId = await adminApi.images.upload(file);
console.log('Image ID:', imageId);

// Lấy URL hình ảnh
const imageUrl = adminApi.images.getUrl(imageId);
console.log('Image URL:', imageUrl);
```

---

## 📋 Example: Sử dụng trong React Component

```typescript
import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.jobs.getAll();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    
    try {
      await adminApi.jobs.delete(jobId);
      loadJobs(); // Reload danh sách
    } catch (error) {
      alert('Xóa thất bại!');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Danh sách công việc</h2>
      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <button onClick={() => handleDeleteJob(job.id)}>Xóa</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS khi gọi API, cần cấu hình CORS trong Java backend:

```java
// Thêm @CrossOrigin vào Controller
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class YourController {
  // ...
}
```

### Lỗi 401 Unauthorized

- Kiểm tra xem bạn đã login chưa
- Kiểm tra token trong localStorage: `localStorage.getItem('admin_token')`
- Token có thể đã hết hạn, cần login lại

### Backend không chạy

```bash
# Kiểm tra MongoDB đã chạy chưa
# Kiểm tra port 8080 có bị chiếm chưa
netstat -ano | findstr :8080

# Xem log backend để debug
```

---

## 📞 Support

Nếu có vấn đề, hãy check:
1. Backend Java có đang chạy không? (`http://localhost:8080`)
2. Database có kết nối được không?
3. Token JWT có hợp lệ không?
4. API endpoint có đúng không?

---

**Happy Coding! 🚀**
