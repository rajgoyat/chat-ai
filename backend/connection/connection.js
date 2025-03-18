const mongoose=require("mongoose")
mongoose.connect(process.env.DB_URL)
.then(()=>{console.log("database connected successfulley")})
.catch((err)=>{console.log("database not connected",err)})