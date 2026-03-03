# API Tích Hợp Bài Viết cho Web Client

## 📋 Tổng Quan

Sau khi backend được deploy, web client có thể lấy bài viết đã publish thông qua **Public Article API**.

### Kiến trúc hệ thống:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Admin Panel   │────────▶│  Backend Server  │◀────────│   Web Client    │
│ (Quản lý Admin) │  Auth   │   (Spring Boot)  │  Public │ (Người dùng)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                             │
        │ /api/admin/news           │ /api/articles              │
        │ (Cần Authentication)      │ (Không cần Auth)           │
        │                            │                             │
        ▼                            ▼                             ▼
   CRUD Articles            MongoDB Database           Read Published Only
   (DRAFT/PUBLISHED)         (Lưu tất cả)             (Chỉ PUBLISHED)
```

---

## 🔑 Hai API Riêng Biệt

### 1️⃣ Admin API (Yêu cầu Authentication)

**Base URL:** `http://your-domain.com/api/admin/news`

**Dùng cho:** Admin Panel để quản lý bài viết

**Chức năng:**
- ✅ GET tất cả bài viết (bao gồm DRAFT, PENDING, PUBLISHED)
- ✅ POST tạo bài viết mới
- ✅ PUT cập nhật bài viết
- ✅ DELETE xóa bài viết

**Yêu cầu:** JWT Token trong header `Authorization: Bearer <token>`

---

### 2️⃣ Public API (Không cần Authentication) ⭐

**Base URL:** `http://your-domain.com/api/articles`

**Dùng cho:** Web Client (Frontend người dùng)

**Chức năng:**
- ✅ Chỉ trả về bài viết có status = `PUBLISHED`
- ✅ Không cần đăng nhập
- ✅ CORS enabled cho tất cả origins

---

## 📡 Public API Endpoints

### 1. Lấy tất cả bài viết đã publish

```http
GET /api/articles
```

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6789",
    "title": "Cách tìm việc làm hiệu quả",
    "shortDescription": "Hướng dẫn chi tiết cách tìm việc làm phù hợp...",
    "content": "<p>Nội dung bài viết đầy đủ với HTML...</p>",
    "thumbUrl": "http://your-domain.com/api/images/12345",
    "status": "PUBLISHED",
    "menu": "handbook",
    "tags": "tìm việc, career, skills",
    "seoTitle": "Cách tìm việc làm hiệu quả 2026",
    "seoDescription": "Hướng dẫn toàn diện về cách tìm việc...",
    "createdDate": "2026-01-15T10:30:00",
    "publishedDate": "2026-01-15T14:00:00"
  }
]
```

---

### 2. Lấy bài viết theo chuyên mục (menu)

```http
GET /api/articles/menu/{menu}
```

**Ví dụ:**
```javascript
// Lấy bài viết trang chủ
GET /api/articles/menu/homepage

// Lấy bài viết tin tức
GET /api/articles/menu/news

// Lấy bài viết cẩm nang
GET /api/articles/menu/handbook

// Lấy bài viết hot
GET /api/articles/menu/hot
```

---

### 3. Lấy chi tiết một bài viết

```http
GET /api/articles/{id}
```

**Ví dụ:**
```http
GET /api/articles/65a1b2c3d4e5f6789
```

**Lưu ý:** Nếu bài viết chưa publish (DRAFT/PENDING) → trả về `404 Not Found`

---

### 4. Lấy bài viết mới nhất (Latest)

```http
GET /api/articles/latest?limit={số_lượng}
```

**Ví dụ:**
```javascript
// Lấy 10 bài mới nhất
GET /api/articles/latest?limit=10

// Lấy 5 bài mới nhất
GET /api/articles/latest?limit=5
```

**Response:** Danh sách bài viết được sắp xếp theo `publishedDate` giảm dần.

---

### 5. Tìm kiếm bài viết

```http
GET /api/articles/search?q={từ_khóa}
```

**Ví dụ:**
```javascript
GET /api/articles/search?q=tuyển dụng

// Tìm trong: title, content, tags
```

---

## 💻 Cách Tích Hợp vào Web Client

### Ví dụ với React/Next.js

```typescript
// services/articleApi.ts
import axios from 'axios';

const API_BASE = 'http://your-domain.com/api';

export const articleApi = {
  // Lấy tất cả bài viết đã publish
  getAllPublished: async () => {
    const res = await axios.get(`${API_BASE}/articles`);
    return res.data;
  },

  // Lấy bài viết theo chuyên mục
  getByMenu: async (menu: string) => {
    const res = await axios.get(`${API_BASE}/articles/menu/${menu}`);
    return res.data;
  },

  // Lấy chi tiết bài viết
  getById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/articles/${id}`);
    return res.data;
  },

  // Lấy bài viết mới nhất
  getLatest: async (limit: number = 10) => {
    const res = await axios.get(`${API_BASE}/articles/latest?limit=${limit}`);
    return res.data;
  },

  // Tìm kiếm
  search: async (keyword: string) => {
    const res = await axios.get(`${API_BASE}/articles/search?q=${keyword}`);
    return res.data;
  },

  // Helper: Lấy URL ảnh
  getImageUrl: (imageId: number) => {
    return `${API_BASE}/images/${imageId}`;
  }
};
```

### Sử dụng trong Component

```tsx
// pages/blog/index.tsx
import { useEffect, useState } from 'react';
import { articleApi } from '@/services/articleApi';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await articleApi.getAllPublished();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  return (
    <div className="blog-container">
      <h1>Bài Viết Mới Nhất</h1>
      {articles.map(article => (
        <article key={article.id}>
          <img src={article.thumbUrl} alt={article.title} />
          <h2>{article.title}</h2>
          <p>{article.shortDescription}</p>
          <a href={`/blog/${article.id}`}>Đọc thêm →</a>
        </article>
      ))}
    </div>
  );
}
```

```tsx
// pages/blog/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { articleApi } from '@/services/articleApi';

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (id) {
      articleApi.getById(id as string)
        .then(setArticle)
        .catch(() => router.push('/404'));
    }
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <article>
      <img src={article.thumbUrl} alt={article.title} />
      <h1>{article.title}</h1>
      <div className="meta">
        <span>{article.menu}</span>
        <time>{new Date(article.publishedDate).toLocaleDateString()}</time>
      </div>
      <div 
        className="content" 
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
      <div className="tags">
        {article.tags?.split(',').map(tag => (
          <span key={tag}>#{tag.trim()}</span>
        ))}
      </div>
    </article>
  );
}
```

---

## 🎯 Quy Trình Hoạt Động

### Khi Admin tạo/sửa bài viết:

1. **Admin Panel** → Tạo/sửa bài viết qua `/api/admin/news`
2. **Backend** → Lưu vào MongoDB
3. **Status** được set:
   - `DRAFT` → Chỉ admin thấy
   - `PUBLISHED` → Admin + Web Client đều thấy
   - `PENDING` → Chỉ admin thấy

4. **Web Client** → Gọi `/api/articles` → Chỉ nhận được bài `PUBLISHED`

### Real-time Update:

Khi admin **publish** một bài viết:
- Bài viết ngay lập tức có trong response của `/api/articles`
- Web client chỉ cần **refresh** hoặc **gọi lại API** để có dữ liệu mới
- **Không cần restart server hay deploy lại**

---

## 🖼️ Xử Lý Hình Ảnh

### Upload ảnh (Admin only):
```http
POST /api/images
Content-Type: multipart/form-data

FormData: { file: <binary> }
```

**Response:**
```json
{
  "data": 12345  // Image ID
}
```

### Lấy ảnh (Public):
```http
GET /api/images/{imageId}
```

**Ví dụ:**
```html
<img src="http://your-domain.com/api/images/12345" alt="Article image" />
```

---

## 🔒 Bảo Mật

| Endpoint | Authentication | Accessible By |
|----------|---------------|---------------|
| `/api/admin/news` | ✅ Required (JWT) | Admin only |
| `/api/articles` | ❌ Not required | Everyone |
| `/api/images` (GET) | ❌ Not required | Everyone |
| `/api/images` (POST) | ✅ Required | Admin only |

---

## 🚀 Deployment Checklist

Khi deploy backend lên production:

- [ ] Thay đổi `CORS origins` nếu cần (hiện tại là `*`)
- [ ] Cập nhật `API_BASE` URL trong web client
- [ ] Test các endpoints public
- [ ] Đảm bảo database connection stable
- [ ] Enable HTTPS cho production

---

## 📞 Liên Hệ & Support

Nếu có vấn đề khi tích hợp, kiểm tra:

1. **CORS errors** → Backend đã enable CORS cho domain của bạn chưa?
2. **404 errors** → Kiểm tra URL có đúng không?
3. **Empty response** → Có bài viết nào status = `PUBLISHED` chưa?
4. **Image not loading** → URL ảnh có đúng format không?

---

## 🎉 Tóm Tắt

✅ **Backend đã sẵn sàng:**
- Admin có thể tạo/sửa/xóa bài viết
- Upload ảnh lưu trực tiếp vào database
- Tự động filter chỉ trả về bài PUBLISHED cho web client

✅ **Web Client chỉ cần:**
- Gọi API `/api/articles` để lấy bài viết
- Không cần authentication
- Nhận real-time updates khi admin publish bài mới

🎯 **Khi Admin publish bài viết → Web Client fetch API → Hiển thị ngay!**
