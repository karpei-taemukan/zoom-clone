/*const socket = new WebSocket(`ws://${window.location.host}`);
// 브라우저에서는 백엔드와 connection을 열어주고 있다
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm= document.querySelector("#message");
socket.addEventListener("open", () => {
console.log("Connected to Server ✅")
});

socket.addEventListener("message", (message) => {
 //console.log("New message: ", message.data);
 const li = document.createElement("li");
 li.innerText = message.data;
 messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});*/

/*setTimeout(()=>{
socket.send("hello from the browser!");
}, 1000);*/
/*
function handleSubmit(event){
event.preventDefault();
const input = messageForm.querySelector("input");
socket.send(makeMessage("new_message", input.value));
input.value="";
}
*/

/*function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");*/
    /*socket.send(input.value);
    input.value="";*/

    /*socket.send({
        type: "nickname",
        payload: input.value,
    }); 
    // --> 서버는 object를 [object Object] 와 같은 text로 만든다

    서버로 string만 보내야하는 이유: 연결하고 싶은 프론트엔드와 백엔드 서버가 
    JS서버가 아닌 Java서버, GO서버 등 일 수 있고
    서버가 JS서버인데 유저가 GO를 이용해 서버에 접속할 수 있기 때문에 
    
    특정 언어의 객체로 서버에 요청을 보내면 안된다 
    반드시 String으로 서버에 요청을 보내야한다 

    -----------------------------------------

    그럼 왜 object를 보낼 수가 없는가 또는 왜 object를 string으로 바꿔야하는가?
    websocket이 브라우저에 있는 API이기 때문이다
    벡엔드에서는 다양한 프로그래밍 언어를 사용할 수 있기때문에 API(websocket)는 어떠한 결정을 하면 안됌
    */

/*socket.send(makeMessage("nickname",input.value));
    input.value="";
    }

function makeMessage(type, payload){
const msg = {type, payload};
return JSON.stringify(msg);
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);*/





//브라우저에서 주는 websocket은 socket IO와 호환이 안된다
// 이유은 socket IO가 websocket보다 많은 기능을 제공하기 때문이다 
//그래서 socket IO를 브라우저에 설치해야된다


const socket = io(); //  socket IO를 브라우저에 설치하면 io함수가 있다
// io함수는 벡엔드와 socket.io를 연결해주는 함수
// io함수는 알아서 socket.io를 실핼하고 있는 서버를 찾는다
const body = document.querySelector("body");

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const enterForm = document.getElementById("roomname");

const call = document.getElementById("call");

const chating = document.getElementById("chating");

call.hidden = true;
chating.hidden = true;
room.hidden = true;

let roomName;
let nameInput;
let myPeerConnection;

function loading(){
    const body = document.querySelector("body");
   // body.style.background = "gray";
    const div = document.createElement("div");
    div.style.zIndex = 1;
    div.style.position = "absolute";
    div.style.top = "0%";
    div.style.left = "0%";
    div.style.right = "50%";
    div.style.bottom = "0%";
    div.style.width = "100vw";
    div.style.height = "100vh";
    div.style.background = "darkgray";
    body.appendChild(div);
    const span = document.createElement("span");
    span.style.zIndex = 2;
    span.style.position = "absolute";
    span.style.background = "pink";
    span.innerText = "Loading...";
    span.style.textAlign = "center";
    span.style.top="50%";
    span.style.left="50%";
    div.appendChild(span);
    setTimeout(()=>{div.style.opacity = 0.5;}, 500);
    setTimeout(()=>{div.style.opacity = 0;}, 1000);
    setTimeout(()=>{ div.hidden = true;
        span.hidden = true;}, 1500);
    };

function fadeout(elem){
  
   setTimeout(()=>{elem.style.opacity = 0.8;}, 500);
    setTimeout(()=>{elem.style.opacity = 0.5;}, 1000);
    setTimeout(()=>{elem.style.opacity = 0.3;}, 1500);
    setTimeout(()=>{elem.style.opacity = 0;}, 2000);
};


function addMessage(message){
    const chating = document.getElementById("chating");
    const ul = chating.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
   // loading();
    //fadeout(li);
};
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    //querySelector는 항상 첫번째 있는 것만 가져옴
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        // 1번째 argument는 백엔드에 new_message 이번트 보냄 
        // 2번째 argument는 백엔드에 input.value보냄 
        // 3번째 argument는 백엔드에 roomName보냄 --> 어떤 방으로 보내는 지 알기위함
        // 4번째 argument는 벡엔드에서 시작시킬수있는 함수대입
        addMessage(`You: ${value}`);
    });
    input.value = "";
};

/*function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
    input.value = "";
};*/



async function showRoom(){
    welcome.hidden = true;
    call.hidden = false;
    room.hidden = false;
    chating.hidden = false;
    const h1 = chating.querySelector("h1");
    h1.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
    loading();
    fadeout(h1);
    await getMedia();
    makeConnection();
};

async function handleRoomSubmit(event){
    event.preventDefault();
    const roomInput = document.getElementById("enter_room_name");
    //socket.emit("enter_room", {payload: input.value}, (msg) => {console.log(`The backend says: `, msg)});
    // 특정한 event를 emit해 줄 수 있다 어떤이름이든 상관없음 --> emit의 첫번째 argument
    // object도 전송가능 (보내고 싶은 payload가 들어감) --> emit의 두번째 argument
    //  argument에는 서버에서 호출하는 fuction(콜백함수)이 들어감--> emit의 세번째 argument
    roomName = roomInput.value;
    nameInput = document.getElementById("enter_room_nickname");
    await showRoom();
    socket.emit("enter_room", roomInput.value,nameInput.value);
    roomInput.value = ""; 
/*socket.emit("onemore", ["aa",11,"bb",22], "qqq", true, 123, ()=>{const btn=document.createElement("button");
welcome.append(btn);});
*/
};


socket.on("bye", (left,newCount) => {
    const h1 = chating.querySelector("h1"); 
    h1.innerText = `Room ${roomName} (${newCount})`;   
    addMessage(`${left}:left`);  
});

socket.on("other_new_message",addMessage); // === socket.on("new_message", (msg)=>{addMessage(msg)});

//socket.on("room_change", console.log) === socket.on("room_change", (msg) => console.log(msg));

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
});
}); 

/*function handleWelcomeSubmit(event){
event.preventDefault();
const input = welcomeForm.querySelector("input");
input.value
};*/


enterForm.addEventListener("submit", handleRoomSubmit);


// -----------------------------------------------------------------------------



const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
// stream은 비디오와 오디오가 결합된 것
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false; //음소거 여부를 추적할 변수(false인 이유는 초기상태는 소리가 나기때문)
let cameraOff = false; // 카메라가 켜져있거나 꺼진걸 추적할 변수(false인 이유는 초기상태는 카메라가 켜져있기때문)
let myDataChannel;
// offer를 보내는 Peer가 data channel을 생성하는 주체가 되야한다

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        //console.log(devices);
        const cameras = devices.filter((device) => device.kind === "videoinput");
        //console.log(myStream.getVideoTracks());
        const currentCamera = myStream.getVideoTracks()[0];
        //console.log(cameras);
      cameras.forEach((camera) => {
        const option = document.createElement("option");
        option.value = camera.deviceId;
        option.innerText = camera.label;
        if(currentCamera.label === camera.label){
            option.selected = true;
        }
        camerasSelect.appendChild(option);
      });
    } catch (e) {
      console.log(e);
    }
  }

async function getMedia(deviceId){
    const initialConstrains = {
    audio: true, video: { facingMode: "user" } 
    }; // deviceId가 없을때 실행
    const cameraConstrains = {
        audio: true,
        video: {
            deviceId: {exact: deviceId}
          },
    };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
       //console.log(myStream);
       myFace.srcObject = myStream;
       if(!deviceId){
       await getCameras();
       }
    } catch(e){
        console.log(e);
    };
};
//getMedia();

function handleMuteClick(){
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
   // console.log(myStream.getAudioTracks());
if(!muted){
    muteBtn.innerText = "Unmuted";
    muted = true;
}
else{
    muteBtn.innerText = "Muted";
    muted = false;
}
};

function handleCameraClick(){
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    //console.log(myStream.getVideoTracks());
if(cameraOff){
    cameraBtn.innerText = "Turn camera off";
    cameraOff = false;
}
else{
    cameraBtn.innerText = "Turn camera on";
    cameraOff = true;
}

};

async function handleCameraChange(){
//console.log(audiosSelect.value);
await getMedia(camerasSelect.value);
if(myPeerConnection){ 
    const videoTrack = myStream.getVideoTracks()[0];
    // console.log(videoTrack);
    /* [MediaStreamTrack]
    0: MediaStreamTrack {kind: 'video', id: 'c4e11eca-9c43-4725-8303-e2428632e71a', label: 'DroidCam Source 3', enabled: true, muted: false, …}
    length: 1
    */

 // Peer한테 줄 stream을 업데이트는 하나 Peer에게 보내는 track은 바꾸지 않고 있다
//console.log(myPeerConnection.getSenders());
const videoSender = myPeerConnection
.getSenders()
.find(sender => sender.track.kind === "video");
//console.log(videoSender);
// Sender는 우리의 Peer로 보내진 media stream track을 컨트롤하게 해준다
videoSender.replaceTrack(videoTrack);
}
};

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
      /*  컴퓨터와 폰이 같은 wifi가 아닐때 데스크탑은 내 폰으로부터 stream을 받지 않는다  
      STUN 서버(컴퓨터가 공용 IP주소를 찾게해준다

    (어떤 것을 request하면 인터넷에서 네가 누군지를 알려주는 서버))없기 때문이다 
        => 장치는 공용주소를 알아야 다른 네트워크에 있는 장치들이 서로를 찾을 수 있다
        폰으로 wifi가 아닌 데이터로 접속했다면 폰이 컴퓨터를 찾지 못한다 
        컴퓨터가 폰을 찾지 못한다 
        
        Peer-to-Peer 연결을 하지 못하기 때문 그래서 서로를 찾아야한다  */
        
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                  ],
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handlestream);
     //console.log(myStream.getTracks()); 
     // 브라우저 내의 카메라 마이크 데이터 Stream을 가져옴
     myStream.getTracks().forEach((track) => 
        myPeerConnection.addTrack(track,myStream));
    };

    socket.on("welcome", async (user,newCount) => {   

       myDataChannel = myPeerConnection.createDataChannel("chat");
       myDataChannel.addEventListener("message", (event) => console.log(event.data));
        console.log("made data channel");

        //   Peer A에서 실행할 코드
        const h1 = chating.querySelector("h1");   
        h1.innerText = `Room ${roomName} (${newCount})`;  
        addMessage(`${user}:Joined`);  
        
        const offer = await myPeerConnection.createOffer();
        //console.log(offer);
       // offer는 다른 브라우저가 참가할 수 있도록하는 초대장 
       // 이 offer로 연결을 구성해야된다
       myPeerConnection.setLocalDescription(offer);
       console.log("Sent the offer");
       socket.emit("offer", offer, roomName);
       // sokcet io 한테 어떤 방에 offer를 emit할 건지 알려줘야함
       // 즉, Peer A -> Peer B 로 offer를 보낸다 
    });

    // Peer A 와 Peer B 의 연결은 Peer A의 offer와 Peer B의 answer로 연결된다

    socket.on("offer", async (offer) => {

        myPeerConnection.addEventListener("datachannel", (event) => {
            myDataChannel = event.channel;
            myDataChannel.addEventListener("message", (event) => console.log(event.data))
        });
         //   Peer B에서 실행할 코드
        //console.log(offer);
        console.log("received the offer");
        myPeerConnection.setRemoteDescription(offer);
    // Web Socket의 속도는 media(video, audio)를 가져오는 속도와 연결을 만드는 속도보다 빠름
    // 해결책: 먼저 media를 가져오는 함수(getMedia)를 먼저 호출한다 
       const answer = await myPeerConnection.createAnswer();
       //console.log(answer);
       myPeerConnection.setLocalDescription(answer);
       // Peer A -> Peer B 로 offer를 보낸 것처럼  Peer B -> Peer A 로 answer를 보낸다
        socket.emit("answer", answer, roomName);
         // answer를 받으면 방에 있는 모든 사람들에게 알린다
         console.log("Sent the answer");
    });

socket.on("answer", (answer) => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

// offer와 answer를 가질때 그걸 받는 걸 모두 끝냈을때, p2p연결의 양쪽에서 
// icecandidate(브라우저들이 서로 소통할 수 있게 해주는 방법)라는 이벤트를 실행한다

function handleIce(event){
    //console.log(event);
    // candidate(브라우저에 의해 만들어짐, 브라우저의 소통방식을 알려주는 방식)
    //candidate를 받으면 Peer 끼리 공유를 해야된다

    // Peer A --(Peer A's candidate)--> Peer B (add Peer A's candidate) --(Peer'B candidate)--> Peer A (add Peer B's candidate)
    
    socket.emit("ice", event.candidate, roomName);
    console.log("sent the candidate");
};

socket.on("ice", (ice)=> {
    console.log("received the candidate");
    myPeerConnection.addIceCandidate(ice);
});

function handlestream(event){
const peerFace = document.getElementById("peerFace");

//console.log("got an event from my peer");
//console.log("Peer's stream", event.stream);

peerFace.srcObject = event.stream;
//console.log("My stream", myStream);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
