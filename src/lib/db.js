import mongoose from "mongoose";
export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database Connected ${mongoose.connection.host}`);}
        catch(error){
            console.log("Erroe connecting to the database", error);
            process.exit(1); // Exit the process with failure
       
        }
    
    }
