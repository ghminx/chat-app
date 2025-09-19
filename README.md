## feat: 프로젝트 초기화 (FastAPI 백엔드 + Next.js 프론트엔드 구조 설정)

### 🔹 백엔드

* `.env` 파일 추가 (DB 연결, JWT 설정 포함)
* `.gitignore`에 `.env` 및 Python 캐시 파일 제외
* **core/config.py**: Pydantic 기반 설정 관리 추가
* **core/security.py**: 비밀번호 해싱 및 JWT 토큰 발급/검증 구현
* **database.py**: 데이터베이스 연결 및 세션 관리
* **models**: 사용자(User), 채팅방(Room), 메시지(Message), 리액션(Reaction) 모델 정의
* **routers**: 인증(auth), 사용자(users), 채팅방(rooms), WebSocket(ws) 라우터 생성
* **auth.py**: 회원가입, 로그인, 프로필 관리 기능 구현
* **rooms.py**: 방 생성, 참여, 나가기, 삭제 기능 구현
* **websocket.py, ws.py**: 실시간 메시징 및 Presence 관리 기능 추가
* **schemas**: 요청/응답 검증용 Pydantic 스키마 정의
* **utils/websocket\_manager.py**: WebSocket 연결 관리 유틸리티 추가

### 🔹 프론트엔드

* Next.js + TypeScript + TailwindCSS 기반 구조 세팅
* **contexts**: 인증(auth-context), 채팅(chat-context), 알림(notification-context) Context API 구현
* **components**:

  * sidebar.tsx: 채팅방 목록 / 사용자 목록 / 설정 패널 구현
  * chat-app.tsx: 전체 레이아웃 및 채팅 페이지 컨테이너 구성
  * chat-header.tsx: 채팅방 헤더, 온라인 인원 수, 멤버 패널 토글 버튼 추가
  * RoomMembersPanel.tsx: 방 참여자 목록 패널 구현 (토글 가능)
  * message-list.tsx, message-input.tsx: 메시지 출력 및 입력 UI 구현
  * typing-indicator.tsx: 입력중 사용자 표시
  * auth/: 로그인/회원가입 폼 및 인증 화면 구현
  * modals/: 채팅방 생성, 프로필 설정 등 모달 컴포넌트 추가
  * ui/: 버튼, 배지, 아바타, 드롭다운 등 UI 컴포넌트 구성 (shadcn/ui 기반)
* **lib/api.ts**: 인증, 채팅방, 사용자 관련 API 클라이언트 구현 (토큰 포함)
* 전역 상태 관리 및 WebSocket 연결 로직 추가 (실시간 메시지/Presence 반영)
