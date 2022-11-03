import axios from 'axios';
import mongoose from 'mongoose';

export const fillPokemonDB = _ => {

    // Setup the schema
    const {Schema} = mongoose;
    const pokemonSchema = new Schema({
        'id': {type: Number, unique: true},
        'name': {
            'english': {type: String, maxLength: 20, required: true},
            'japanese': String,
            'chinese': String,
            'french': String
        },
        'type': [String],
        'base': {
            'HP': Number,
            'Attack': Number,
            'Defense': Number,
            'Speed': Number,
            "Special Attack": Number,
            "Special Defense": Number
        },
    });

    // create pokedex collection with the schema
    const collectionEntryName = 'pokemon'
    const pokemonModel = mongoose.model(collectionEntryName, pokemonSchema);
    

    // Get the Pokemon stuff from github repo
    async function getPokemonDocs() {
        try {
        const pokedexJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
        const pokemonTypeJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json';
        const pokedexResponse = await axios.get(pokedexJsonUrl);
        const pokemonTypeResponse = await axios.get(pokemonTypeJsonUrl);

        let pokedex = pokedexResponse.data;
        let pokemonType = pokemonTypeResponse.data;
        
        Object.keys(pokedex).forEach( key => {
            pokedex[key].base["Special Attack"] = pokedex[key].base["Sp. Attack"];
            pokedex[key].base["Special Defense"] = pokedex[key].base["Sp. Defense"];
        });

        return [pokedex, pokemonType];
        } catch (error) {
        console.error(error);
        }
    }

    // Insert Pokemon stuff into Atlas db on promise fulfilled
    // An async function returns a promise, access the promise to get the stuff
    // Within the promise, update Mongo Atlas db
    getPokemonDocs().then(([pokedex, pokemonType]) => {
  
        // Fill cloud db
        pokemonModel.insertMany(pokedex, error => {
            console.log(error);
        });
    }, error => console.log(error));

    return pokemonModel;
};