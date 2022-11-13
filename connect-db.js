import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async _ => {
    try {
        // Connect to the Mongo Atlas db
        // const mongoAtlasUsername = 'comp4537-assign1';
        // const mongoAtlasPassword = 'ZfFIAV6yrxYgiGSb';

        // await mongoose.connect('mongodb://localhost:27017/comp4537-lab4'); //name of my db
        // mongodb atlas connection url -> mongodb+srv://username:password@cluster....
        // await mongoose.connect(`mongodb+srv://${mongoAtlasUsername}:${mongoAtlasPassword}@cluster0.3ewe01h.mongodb.net/pokedex?retryWrites=true&w=majority`); //mongodb atlas remote cluster
        await mongoose.connect(process.env.DB_STRING);

        mongoose.connection.db.dropDatabase();
      } catch (error) {
        console.log('db error');
      }
};

