# Hire Host - Hosting Rental Platform

**Hello!** I am **Bui Nhut Duy**, a student at **Can Tho University**, majoring in **Computer Networks and Data Communications**.  
This project is built to share my personal server resources with the community, allowing everyone to rent hosting to build and deploy their websites.  
I am in the process of completing this project and look forward to your follow-up and collaboration.

---

## Technologies Used

### Backend

| Technology | Description |
|---|---|
| Java 21 | Core programming language |
| Spring Boot 4.0.7 | Backend framework |
| Spring Security | Authentication & authorization (JWT + OAuth2) |
| Spring Data JPA | ORM - database queries |
| MySQL 8.0 | Relational database |
| JWT (jjwt 0.12.6) | Token-based authentication |
| Lombok | Reduce boilerplate code |
| MapStruct 1.6.3 | DTO mapping |
| SpringDoc OpenAPI 3.0.3 | API documentation (Swagger) |
| Google OAuth2 | Login with Google account |
| MoMo Payment (Sandbox) | MoMo payment gateway |

### Frontend

| Technology | Description |
|---|---|
| React 19 | UI library |
| Vite 8 | Build tool |
| Ant Design 6 | UI Component Library |
| React Router DOM 7 | SPA navigation |
| Axios | HTTP Client |
| Node.js 20 | Frontend runtime |

### Infrastructure & Deployment

| Technology | Description |
|---|---|
| Docker & Docker Compose | Containerization & orchestration |
| Nginx | Reverse proxy & static file server |
| Cloudflare | CDN, DNS, SSL |

---

## System Architecture

`
User -> Cloudflare -> Nginx -> Docker Compose
                               |- /oauth2/authorization/* -> Backend (Spring Boot :8081)
                               |- /api/*                  -> Backend (Spring Boot :8081)
                               |- /login/oauth2/*         -> Backend (Spring Boot :8081)
                               |- /*                      -> Frontend (React SPA - Nginx :80)
                               Backend -> MySQL 8.0 (:3306)
                               Backend -> Google OAuth2 API
                               Backend -> MoMo Payment Gateway
`

### Main Processing Flows

**1. JWT Authentication:**
`
Request -> Nginx -> Backend -> JwtAuthenticationFilter
                              |- Validate token
                              |- Load user from DB
                              |- Set AuthenticationContext
`

**2. Google OAuth2 Login:**
`
User -> /oauth2/authorization/google -> redirect to Google Login
Google callback -> /login/oauth2/code/google -> authenticate
-> redirect /oauth2/callback?accessToken=...&refreshToken=...
-> React saves token -> calls getProfile -> navigates to Dashboard
`

**3. MoMo Payment:**
`
User selects plan -> creates order -> redirect to MoMo sandbox
MoMo callback -> POST /api/v1/payments/momo/ipn -> update status
Redirect frontend -> /payment/callback -> display result
`

---

## Contact

- **Email:** buinhutduy040506@gmail.com
- **Website:** [https://hosting.duycode.id.vn](https://hosting.duycode.id.vn)

---

*This project is under development. All contributions and feedback are welcome!*
