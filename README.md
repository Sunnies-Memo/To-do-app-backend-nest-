# NestJS Kanban Board API

## 프로젝트 개요

이 프로젝트는 NestJS를 사용하여 구현된 칸반 보드 API 서버입니다. 사용자 인증, 보드 관리, 카드(할 일) 관리 기능을 제공합니다.

## 주요 기능

- 사용자 인증 (JWT 기반)
  - 회원가입
  - 로그인/로그아웃
  - 토큰 갱신
- 보드 관리
  - 보드 생성/조회/수정/삭제
  - 보드 순서 관리
- 카드(할 일) 관리
  - 카드 생성/조회/수정/삭제
  - 카드 순서 관리
- S3 이미지 업로드

## 기술 스택

- Framework: NestJS
- Database: MySQL
- ORM: TypeORM
- Authentication: JWT, Passport
- File Upload: Multer
- Cloud Storage: AWS S3
- Validation: class-validator
- Configuration: @nestjs/config

## 프로젝트 구조

```
src/
├── auth/ # 인증 관련 모듈
│ ├── dto/ # 데이터 전송 객체
│ ├── entities/ # 엔티티 정의
│ └── service/ # 인증 서비스
├── boards/ # 보드 관련 모듈
│ ├── dto/ # 데이터 전송 객체
│ ├── entities/ # 엔티티 정의
│ └── service/ # 보드 서비스
├── s3/ # S3 이미지 업로드 모듈
├── user/ # 사용자 관련 모듈
└── global/ # 전역 설정 및 유틸리티
```

## API 엔드포인트

### 인증 관련

```
POST /auth/register     # 회원가입
POST /auth/login       # 로그인
POST /auth/refresh     # 토큰 갱신
GET  /auth/logout      # 로그아웃
```

### 보드 관련

```
GET    /boards         # 보드 목록 조회
POST   /boards         # 보드 생성
PUT    /boards         # 보드 수정
DELETE /boards         # 보드 삭제
```

### 카드 관련

```
POST   /boards/todo    # 카드 생성
PUT    /boards/todo    # 카드 수정
DELETE /boards/todo    # 카드 삭제
```

### 환경 변수 설정

```
DB_USER=데이터베이스_사용자이름
DB_PWD=데이터베이스_비밀번호
DB=데이터베이스_이름
JWT_ACCESSTOKEN_SECRET=접근토큰_시크릿키
JWT_REFRESHTOKEN_SECRET=리프레시토큰_시크릿키
AWS_ACCESS_KEY_ID=AWS_액세스키
AWS_SECRET_ACCESS_KEY=AWS_시크릿키
AWS_REGION=AWS_리전
AWS_S3_BUCKET=S3_버킷이름
```

## 데이터베이스 스키마

### User

- username (PK): string
- password: string

### Board

- boardId (PK): number
- orderIndex: number
- title: string
- username (FK): string

### Card

- todoId (PK): number
- orderIndex: number
- text: string
- boardId (FK): number

### RefreshToken

- tokenId (PK): string
- refreshToken: string
- username (FK): string

## 보안 고려사항

- 모든 비밀번호는 bcrypt로 해시화되어 저장됩니다
- JWT 토큰은 Access Token(15분)과 Refresh Token(7일)으로 구분됩니다
- 모든 API 요청은 JWT 인증이 필요합니다 (공개 엔드포인트 제외)
