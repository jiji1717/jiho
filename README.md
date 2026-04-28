# ◆ Community App

Node.js + Express + MongoDB + React로 구현한 풀스택 커뮤니티 웹사이트.

---

## 📁 프로젝트 구조

```
community-app/
├── backend/
│   ├── models/
│   │   ├── Post.js          # 게시글 MongoDB 스키마
│   │   └── Comment.js       # 댓글 MongoDB 스키마
│   ├── routes/
│   │   ├── posts.js         # 게시글 REST API
│   │   └── comments.js      # 댓글 REST API
│   ├── middleware/
│   │   └── upload.js        # Multer 이미지 업로드 미들웨어
│   ├── uploads/             # 업로드된 이미지 저장 폴더 (자동 생성)
│   ├── server.js            # Express 앱 진입점
│   ├── .env.example         # 환경변수 예시
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   └── index.js     # Axios API 클라이언트
        ├── components/
        │   ├── Layout.js    # 공통 레이아웃 (헤더/푸터)
        │   └── Layout.css
        ├── pages/
        │   ├── HomePage.js         # 게시글 목록 + 검색
        │   ├── HomePage.css
        │   ├── PostDetailPage.js   # 게시글 상세 + 댓글 + 좋아요
        │   ├── PostDetailPage.css
        │   ├── NewPostPage.js      # 게시글 작성 + 이미지 업로드
        │   └── NewPostPage.css
        ├── App.js            # 라우팅
        ├── index.js
        └── index.css         # 글로벌 스타일
```

---

## 🗄️ DB 스키마

### Post (게시글)
```json
{
  "_id": "ObjectId",
  "title": "String (필수, 최대 200자)",
  "content": "String (필수)",
  "author": "String (기본값: 익명)",
  "images": [
    {
      "filename": "String (저장 파일명)",
      "originalname": "String (원본 파일명)",
      "url": "String (접근 URL)"
    }
  ],
  "likes": "Number (기본값: 0)",
  "commentCount": "Number (기본값: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment (댓글)
```json
{
  "_id": "ObjectId",
  "postId": "ObjectId (Post 참조, 필수)",
  "content": "String (필수, 최대 1000자)",
  "author": "String (기본값: 익명)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🔌 REST API 엔드포인트

### Posts
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/posts | 게시글 목록 (query: q, page, limit) |
| GET | /api/posts/:id | 게시글 상세 |
| POST | /api/posts | 게시글 작성 (multipart/form-data) |
| PATCH | /api/posts/:id/like | 좋아요 +1 |
| DELETE | /api/posts/:id | 게시글 삭제 |

### Comments
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/comments/:postId | 댓글 목록 (query: sort=newest/oldest) |
| POST | /api/comments/:postId | 댓글 작성 |
| DELETE | /api/comments/:id | 댓글 삭제 |

---

## 🚀 실행 방법

### 사전 요구사항
- Node.js 18+
- MongoDB 6+ (로컬 실행 or MongoDB Atlas)

### 1. MongoDB 실행 (로컬)
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 2. 백엔드 실행
```bash
cd community-app/backend
cp .env.example .env       # 환경변수 설정
npm install
npm run dev                # nodemon으로 개발 서버 실행
# → http://localhost:5000
```

### 3. 프론트엔드 실행
```bash
cd community-app/frontend
npm install
npm start
# → http://localhost:3000
```

프론트엔드 package.json에 `"proxy": "http://localhost:5000"` 이 설정되어 있어
별도 CORS 설정 없이 API 요청이 자동으로 백엔드로 프록시됩니다.

---

## 🌐 MongoDB Atlas 사용 시 (클라우드)

1. [MongoDB Atlas](https://cloud.mongodb.com) 가입 후 클러스터 생성
2. Connection String 복사
3. `backend/.env`에 적용:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/communitydb
```

---

## ✨ 구현된 기능

- ✅ 게시글 작성 (제목, 본문, 별명, 이미지 복수 업로드)
- ✅ 게시글 목록 (최신순, 페이지네이션)
- ✅ 제목 기반 실시간 검색 (디바운싱 적용)
- ✅ 게시글 상세 (이미지 라이트박스 포함)
- ✅ 좋아요(화제) 기능 — DB 저장, 새로고침 유지
- ✅ 댓글 작성/삭제 (최신순/오래된순 정렬)
- ✅ 이미지 업로드 (최대 10장, 10MB/장)
- ✅ 반응형 UI (모바일 대응)
