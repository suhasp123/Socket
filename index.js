const express=require("express");
const app=express();
const cors=require("cors")
const http=require("http");
const {Server} = require("socket.io")

app.use(cors());
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
      
    }
})


app.get('/',(req,res)=>{
    res.send("BAckend is Working")
})


io.on('connection',(socket)=>{

    
      socket.on("message",(data)=>{
           socket.broadcast.emit("recieved",data)
      })
})

server.listen(3001,()=>{
    console.log("server is running")
})

