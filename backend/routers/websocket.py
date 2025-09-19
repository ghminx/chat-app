from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from core.security import get_current_user_ws
from utils.websocket_manager import manager
from models.user import User
from models.message import Message
from database import get_db
from typing import Any, Dict
import json

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("")
async def websocket_endpoint(
    websocket: WebSocket,
    user: User = Depends(get_current_user_ws),
    db: Session = Depends(get_db)
):
    # 연결 수락 및 등록
    await manager.connect(user.user_id, websocket)
    # presence 브로드캐스트
    await manager.broadcast_all({"type": "presence", "userId": user.user_id, "status": "online"})

    try:
        while True:
            text = await websocket.receive_text()
            try:
                msg: Dict[str, Any] = json.loads(text)
            except Exception:
                continue

            mtype = msg.get("type")

            # 1) 상태 업데이트
            if mtype == "status_update":
                status_val = msg.get("status", "online")
                status_msg = msg.get("statusMessage", "")

                # 메모리에 업데이트
                manager.user_status[user.user_id] = status_val

                # DB에도 반영
                db_user = db.query(User).filter(User.user_id == user.user_id).first()
                if db_user:
                    db_user.status = status_val
                    db_user.status_message = status_msg
                    db.commit()
                    db.refresh(db_user)

                # 브로드캐스트
                await manager.broadcast_all({
                    "type": "presence",
                    "userId": user.user_id,
                    "status": status_val,
                    "statusMessage": status_msg
                })

            # 2) 방 참가
            elif mtype == "join_room":
                room_id = int(msg["roomId"])
                await manager.join_room(room_id, websocket)
                await manager.broadcast_room(room_id, {
                    "type": "system",
                    "roomId": room_id,
                    "message": f"{user.name} 님이 입장했습니다."
                })

            # 3) 방 퇴장
            elif mtype == "leave_room":
                room_id = int(msg["roomId"])
                manager.leave_room(room_id, websocket)
                await manager.broadcast_room(room_id, {
                    "type": "system",
                    "roomId": room_id,
                    "message": f"{user.name} 님이 퇴장했습니다."
                })

            # 4) 메시지 전송 (방 브로드캐스트)
            elif mtype == "message":
                room_id = int(msg["roomId"])
                content = msg["content"]

                # DB 저장
                new_msg = Message(
                    room_id=room_id,
                    user_id=user.user_id,
                    content=content,
                    message_type="text"
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                await manager.broadcast_room(room_id, {
                    "type": "message",
                    "roomId": room_id,
                    "messageId": new_msg.message_id,
                    "sender": {"id": user.user_id, "name": user.name},
                    "content": content,
                    "createdAt": str(new_msg.created_at)
                })

            # 5) 핑/퐁
            elif mtype == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(user.user_id, websocket)
        if manager.user_status.get(user.user_id) == "offline":
            await manager.broadcast_all({
                "type": "presence",
                "userId": user.user_id,
                "status": "offline"
            })
