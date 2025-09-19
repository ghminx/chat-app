from typing import Dict, Set
from fastapi import WebSocket
from collections import defaultdict
import json

class WebSocketManager:
    def __init__(self):
        # 유저별 연결된 소켓
        self.active_connections: Dict[int, Set[WebSocket]] = defaultdict(set)
        # 방별 연결된 소켓
        self.room_connections: Dict[int, Set[WebSocket]] = defaultdict(set)
        # 유저 상태
        self.user_status: Dict[int, str] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id].add(websocket)
        self.user_status[user_id] = "online"
        # 접속 알림
        await self.broadcast_all({
            "type": "presence",
            "userId": user_id,
            "status": "online"
        })

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections and websocket in self.active_connections[user_id]:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                # 마지막 연결이 끊기면 offline 처리
                self.user_status[user_id] = "offline"

    async def broadcast_all(self, payload: dict):
        """전체 유저에게 메시지 브로드캐스트"""
        data = json.dumps(payload, ensure_ascii=False)
        for sockets in self.active_connections.values():
            for ws in list(sockets):
                try:
                    await ws.send_text(data)
                except Exception:
                    pass

    async def join_room(self, room_id: int, websocket: WebSocket):
        self.room_connections[room_id].add(websocket)

    def leave_room(self, room_id: int, websocket: WebSocket):
        if room_id in self.room_connections and websocket in self.room_connections[room_id]:
            self.room_connections[room_id].remove(websocket)

    async def broadcast_room(self, room_id: int, payload: dict):
        """특정 방에 브로드캐스트"""
        data = json.dumps(payload, ensure_ascii=False)
        for ws in list(self.room_connections.get(room_id, [])):
            try:
                await ws.send_text(data)
            except Exception:
                pass

manager = WebSocketManager()
