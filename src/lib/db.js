import mongoose from "mongoose";


const connectDb = async () => {

    try {
        await mongoose.connect(process.env.URI);
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("Failed to connect to MongoDB Atlas:", error);

        throw error;
    }
};

export default connectDb;