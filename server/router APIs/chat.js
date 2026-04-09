import { da } from "@faker-js/faker"
import { query } from "../../database/pool.js";
/* 
All the code inside of this doesnt correspond to the router or the page routing.
All of this code is from the server.js, where it correspond to socket requests
The fetch requests from chat can be found in the pageRouting. :)
*/

export async function chatSocket(socket, io){
    //Join chat event
    socket.on('join-chat', async (data)=>{
        let roomId = [data.userId, data.targetId].sort().join("_")+data.chatType[0] //Makes a room id, like 2_797u(This means chat between user 2 and 797)
        if(socket.rooms.has(roomId)){
            return
        }else{
            if(data.chatType==="users"){
                let contactUserInfo = await query(`SELECT CONCAT(name_first, " ",name_last) AS title, picture FROM users WHERE id = ?;`,data.targetId)
                socket.emit('updateChatInfo', contactUserInfo)
            }else{
                let contactGroupInfo = await query(`SELECT title, picture FROM \`groups\` WHERE id = ?;`,data.targetId)
                socket.emit('updateChatInfo', contactGroupInfo)
            }
            socket.join(roomId)
        }
    })

    //Send message
    socket.on('message', data=>{
        if(data.chatType === "users"){
            query(`
            INSERT INTO chat_users (sender_id, target_id, chat_text)
            VALUES(?, ?, ?)
            `,[data.userId, data.targetId, data.message] )
        }else{
            query(`
            INSERT INTO chat_groups (sender_id, target_id, chat_text)
            VALUES(?, ?, ?)
            `,[data.userId, data.targetId, data.message] )
        }
        let roomId = [data.userId, data.targetId].sort().join("_")+data.chatType[0]
        console.log(roomId)
        io.to(roomId).emit('messageClient', {sender: data.userId, message: data.message})
    })
}