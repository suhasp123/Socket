const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");


const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Razorpay = require("razorpay");

const crypto = require("crypto");
const Key_ID = "rzp_test_L1JPeGnZbS2ffv";
const Secret = "kM3HWuzLYF6xiljfsJmi0mir";


const CartNomodel = require("./models/CartNoModel.js");
const CustomerModel = require("./models/Customer.jsx");
const CartModel = require("./models/Items.jsx");
const CartItems = require("./models/CartItems.jsx");
const History = require("./models/History.jsx");
const Inventory = require("./models/Inventory.jsx");
const TemporaryTable = require("./models/Temporarytable.jsx");
const TransactionModel = require("./models/Transaction.jsx");
const TagModel = require("./models/TagId.jsx");

const CustomerModel2 = require("./models/Inventory2.jsx");
const mongoURI =
  "mongodb+srv://suhas123p:Suhas%40123@doctorappointment.xlmvnb7.mongodb.net/Customer";




const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://reactfrontend-fgww.onrender.com/",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});



app.get("/test", (req, res) => {
  res.json({ message: "working" });
});

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.json());


io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("message", (data) => {
    console.log("message received:", data);
    socket.broadcast.emit("received", data);
    
  });

  socket.on("joinCartRoom", (cart_no) => {
    console.log("joined room");
    socket.join(cart_no);
    console.log(`User joined cart room: ${cart_no}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});



 app.post("/addItemsToCart", async (req, res) => {
   console.log("items");
   try {
     const { cart_no, tag_id, sessionid } = req.body;

     let Tagid = await TagModel.findOne({ TagId: tag_id });

     let existingCart = await TemporaryTable.findOne({ cartNumber: cart_no });

     if (!existingCart) {
       existingCart = await TemporaryTable.create({
         cartNumber: cart_no,
         items: [],
         sessionId: sessionid,
       });
     }

     // Check if existingCart.items is null and initialize it as an empty array
     if (!existingCart.items) {
       existingCart.items = [];
     }

     // Filter out null values from existingCart.items array
     existingCart.items = existingCart.items.filter((item) => item !== null);

     const product_id = Tagid.product_id;

     const existingTagIndex = existingCart.items.findIndex((existingItem) =>
       existingItem.tag_id.includes(tag_id)
     );

     if (existingTagIndex !== -1) {
       // If tag_id is present, remove it from tag_id array and decrement quantity
       existingCart.items[existingTagIndex].tag_id = existingCart.items[
         existingTagIndex
       ].tag_id.filter((tag) => tag !== tag_id);

       existingCart.items[existingTagIndex].Quantity--;

       if (existingCart.items[existingTagIndex].Quantity === 0) {
         // If quantity becomes 0, remove the item from the array
         existingCart.items.splice(existingTagIndex, 1);
       }
     } else {
       const itemIndex = existingCart.items.findIndex(
         (existingItem) => existingItem.product_id === Number(product_id)
       );

       if (itemIndex !== -1) {
         // If product_id is present, increment the quantity
         existingCart.items[itemIndex].tag_id.push(tag_id);
         existingCart.items[itemIndex].Quantity++;
       } else {
         console.log("hello");

         const newItem = await Inventory.findOne({ product_id: product_id });

         if (!newItem || newItem.length === 0) {
           return res.status(404).json({ error: "Item not found" });
         }

         const Quantity = 1;

         // Add only tag_id to the tag_id array and decrement quantity by 1
         existingCart.items.push({
           ...newItem.toObject(),
           tag_id: [tag_id],
           Quantity,
           sessionId: sessionid,
         });
       }
     }

     await existingCart.save();
     console.log("socket update");
     io.in(cart_no).emit("cartUpdated", existingCart);

     res.json(existingCart);
   } catch (error) {
     console.log(error);
     res.status(500).json({ error: "Internal server error" });
   }
 });



const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
