import http from "http";
//import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public",express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer  = http.createServer(app); // 코드를 약간 수정해, 서버에 접근하기
// express에서는 http를 다루지만 이젠 ws를 다룰거기 때문에 
// express로 같은 서버에 ws기능을 설치

// http 서버 위에 ws서버를 만들 수 있다

const wsServer = new Server(httpServer);


//const wss = new WebSocket.Server({server}); // http 서버위에 websocket 서버를 만들 수 있도록 함 
//socket은 연결된 브라우저와의 연락 라인
//on method에서는 event가 발동하는 걸 기다린다
//wss는 서버 전체를 위한 것

/*const sockets = [];
wss.on("connection", (socket) => {
    //console.log(socket);
    sockets.push(socket);
    socket["nickname"] = "Anonymous"; // 익명 socket (nickname 정해지지 않은 user)
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    //socket.on("message", message => {console.log(message.toString());});
    socket.on("message",(message)=>{
    //console.log(message.toString());

    const parsed = JSON.parse(message.toString());

    switch (parsed.type){
        case "new_message":
            sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${parsed.payload.toString()}`))
            break;
            case "nickname":
            //console.log(parsed.payload.toString());
            socket["nickname"] = parsed.payload.toString();
            //console.log(socket);
            break;
    };
    });
});*/


function publicRooms(){
const {sockets:{adapter:{sids, rooms}}} = wsServer;
const publicRooms = [];
rooms.forEach((_,key) => {
if(sids.get(key) === undefined){
    publicRooms.push(key);
}
});
return publicRooms;

};

function countRoom(roomName){
return wsServer.sockets.adapter.rooms.get(roomName)?.size; // roomName을 찾거나 못찾거나 할수 있다
};

wsServer.on("connection", (socket) => {
//console.log(socket)
//wsServer.socketsJoin("All Room");
//socket["nickname"] = "Anonymous"
socket.onAny((event) => {
  // console.log(wsServer.sockets.adapter);
    console.log(`Socket Events: ${event}`);
});

socket.on("enter_room", (roomName,nickName)=>{
    //console.log(roomName);
    //console.log(socket.id);
    //console.log(socket.rooms);
    // console.log(socket.rooms);
    socket["nickname"] = nickName;
    socket.join(roomName);

    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // --> 유저가 "welcome"을 유저 제외한 방안 모두에게 메세지를 보낸다
    // 방안에 참가한다는 건 같은 방 이름으로 들어가는 것이다
    wsServer.sockets.emit("room_change", publicRooms()); // 메세지를 모든 socket에 전송
});

socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
});

socket.on("answer", (answer, roomName) =>{
socket.to(roomName).emit("answer", answer);
});

socket.on("ice", (ice, roomName) => {
socket.to(roomName).emit("ice", ice);
})
/*setTimeout(() => {
    done({hello:"hi"});
}, 1000);*/
/*setTimeout(()=>{
    done("hi");
},2000) 
--> 한개의 함수만 벡엔드에서 호출가능 프론트엔드에서 실행가능
*/ 
socket.on("disconnecting", () =>{
    // disconnecting 이벤트는 socket이 방을 떠나기 바로 직전에 발생
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
});
socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
    // socket 중에 퇴장하는 socket이 있다면 Socket.IO가 그 방을 삭제한다
  });
socket.on("new_message", (msg,room,done)=>{
    socket.to(room).emit("other_new_message", `${socket.nickname}:${msg}`);
    done(); // -> 벡엔드에서 실행 안함, 프론트엔드에서 실행
});
// 서버는 벡엔드에서 함수를 호출하지만 함수는 프론트엔트에서 실행 이렇게 안하면 
//보안문제( 예) 누군가 데이터베이스를 지우는 코드를 작성할수있다)가 생길 수 있다
// 즉, 신뢰하지 못하는 코드를 벡엔드에서 실행하면 안된다

//socket.on("nickname", (nickname) => (socket["nickname"]=nickname);

/*socket.on("onemore", (aa,bb,cc,dd,ff) => {
    console.log(aa);
    setTimeout(()=>{
        bb();
    }, 2000);
})*/
});



httpServer.listen(3000, handleListen); // http protocol, ws protocol 같은 port 공유(서버는 http, ws 2개의 protocol 이해)
// 즉, localhost에서는 동일 port에서 http request ws request 두 개 다 처리 가능