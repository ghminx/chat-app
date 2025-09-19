const API_BASE_URL = 'http://localhost:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Room {
  room_id: number;
  name: string;
  description: string | null;
  room_type: 'public' | 'private';
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  room_type: 'public' | 'private';
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }) 
    }
  }

  // === 인증 관련 메서드 ===

  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '회원가입에 실패했습니다.');
    }

    return response.json();
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '로그인에 실패했습니다.');
    }

    const data = await response.json();

    // 토큰 저장
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // === 채팅방 관련 메서드 ===

  async getRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('채팅방 목록을 가져올 수 없습니다.');
    }

    return response.json();
  }

  async createRoom(roomData: CreateRoomData): Promise<Room> {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '채팅방 생성에 실패했습니다.');
    }

    return response.json();
  }

  async joinRoom(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('채팅방 참여에 실패했습니다.');
    }
  }

  async leaveRoom(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('채팅방 나가기에 실패했습니다.');
    }
  }

  // === 사용자 관련 메서드 ===

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('사용자 목록을 가져올 수 없습니다.');
    }

    return response.json();
  }

  async deleteRoom(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "채팅방 삭제에 실패했습니다.");
    }
  }

  async getRoomMembers(roomId: number): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/members`, {
    headers: this.getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("채팅방 멤버 목록을 가져올 수 없습니다.")
  }

  return response.json()
}

}


export const apiClient = new ApiClient();
