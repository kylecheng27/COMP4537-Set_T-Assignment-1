import mongoose from "mongoose";

export const setupUserLoginDB = _ => {

    // Setup the schema
    const {Schema} = mongoose;
    const userLoginSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            min: 3,
            max: 20
        },
        password: {
            type: String,
            required: true,
            trim: true,
            min: 6,
            max: 1000
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            min: 3
        },
        date: {
            type: Date,
            default: Date.now
        }
    });

    // Create collection for user login info
    const collectionEntryName = 'pokeuser';
    const userLoginModel = mongoose.model(collectionEntryName, userLoginSchema);

    return userLoginModel;
}