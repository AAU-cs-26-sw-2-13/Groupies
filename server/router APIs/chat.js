import { da } from "@faker-js/faker"
import { query } from "../../database/pool.js";

export async function chatSocket(socket, io){
    //Join chat event
    socket.on('join-chat', async (data)=>{
        let roomId = [data.userId, data.targetId].sort().join("_")
        console.log(socket.rooms.has(roomId))
        if(socket.rooms.has(roomId)){
            return
        }else{
            let contactUserInfo = await query(`SELECT CONCAT(name_first, " ",name_last) AS full_name, picture FROM users WHERE id = ?;`,data.targetId)
            socket.emit('updateChatInfo', contactUserInfo)
            socket.join(roomId)
        }
    })

    //Send message
    socket.on('message', data=>{
        query(`
            INSERT INTO chat_users (sender_id, target_id, chat_text)
            VALUES(?, ?, ?)
        `,[data.userId, data.targetId, data.message] )
        let roomId = [data.userId, data.targetId].sort().join("_")
        io.to(roomId).emit('messageClient', {sender: data.userId, message: data.message})

        
    })
}