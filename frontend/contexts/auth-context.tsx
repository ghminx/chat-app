// contexts/auth-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthState, LoginData, RegisterData, User } from "@/types/chat"

// API 클라이언트 함수들
const API_BASE_URL = 'http://localhost:8000';

interface ApiLoginData {
  email: string;
  password: string;
}

interface ApiRegisterData {
  name: string;
  email: string;
  password: string;
  department?: string;
}

interface ApiUser {
  user_id: number;
  name: string;
  email: string;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ApiAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: ApiUser;
}

// API 호출 함수들
const apiLogin = async (data: ApiLoginData): Promise<ApiAuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '로그인에 실패했습니다.');
  }

  const result = await response.json();
  
  // 토큰 저장
  localStorage.setItem('access_token', result.access_token);
  localStorage.setItem('user', JSON.stringify(result.user));
  
  return result;
};

const apiRegister = async (data: ApiRegisterData): Promise<ApiUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '회원가입에 실패했습니다.');
  }

  return response.json();
};

const apiGetCurrentUser = async (): Promise<ApiUser> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('토큰이 없습니다.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('사용자 정보를 가져올 수 없습니다.');
  }

  return response.json();
};

// API User를 내부 User 타입으로 변환
const convertApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.user_id.toString(),
  name: apiUser.name,
  email: apiUser.email,
  avatar: apiUser.name.charAt(0).toUpperCase(), // 이름 첫 글자를 아바타로
  status: 'online',
  role: apiUser.role as 'user' | 'admin',
  department: apiUser.department || undefined,
  lastSeen: new Date(apiUser.updated_at),
});

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })
  const [loading, setLoading] = useState(true)

// contexts/auth-context.tsx에서 useEffect 부분 수정
useEffect(() => {
  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      console.log("Auth verification - token:", !!token, "savedUser:", !!savedUser) // 디버깅
      
      if (token && savedUser) {
        const apiUser = JSON.parse(savedUser) as ApiUser;
        const user = convertApiUserToUser(apiUser);
        
        console.log("Converted user:", user) // 디버깅
        
        // 토큰 유효성 검사는 일단 생략하고 로컬 데이터만 사용
        setAuthState({
          user,
          isAuthenticated: true,
        });
        
        console.log("Auth state set successfully") // 디버깅
      } else {
        console.log("No token or saved user found") // 디버깅
      }
    } catch (error) {
      console.error("Auth verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  verifyAuth()
}, [])
  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiLogin({
        email: data.email,
        password: data.password
      });
      
      const user = convertApiUserToUser(result.user);
      
      setAuthState({
        user,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, error: error.message || "로그인 중 오류가 발생했습니다" };
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. 회원가입
      await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department
      });
      
      // 2. 자동 로그인
      const loginResult = await login({
        email: data.email,
        password: data.password
      });
      
      return loginResult;
    } catch (error: any) {
      console.error("Register failed:", error);
      return { success: false, error: error.message || "회원가입 중 오류가 발생했습니다" };
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
  if (!authState.user) {
    return { success: false, error: "사용자가 로그인되어 있지 않습니다" }
  }

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return { success: false, error: "인증 토큰이 없습니다" };
    }

    // 백엔드 API로 프로필 업데이트 요청
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updates.name,
        department: updates.department,
        // 다른 업데이트 가능한 필드들 추가
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '프로필 업데이트에 실패했습니다.');
    }

    // 업데이트된 사용자 정보 받기
    const updatedApiUser: ApiUser = await response.json();
    
    // API User를 내부 User 타입으로 변환
    const updatedUser = convertApiUserToUser(updatedApiUser);

    // 상태 업데이트
    setAuthState({
      user: updatedUser,
      isAuthenticated: true,
    });

    // 로컬 스토리지의 사용자 정보도 업데이트
    localStorage.setItem('user', JSON.stringify(updatedApiUser));

    return { success: true };
  } catch (error: any) {
    console.error("Profile update failed:", error);
    
    // 토큰이 만료된 경우 로그아웃 처리
    if (error.message.includes('토큰') || error.message.includes('인증')) {
      await logout();
      return { success: false, error: "세션이 만료되었습니다. 다시 로그인해주세요." };
    }
    
    return { success: false, error: error.message || "프로필 업데이트 중 오류가 발생했습니다" };
  }
}


  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}