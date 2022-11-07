import { MongoServerError } from 'mongodb';
import { mongoose } from 'mongoose';

/*
class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error"; // (different names for different built-in error classes)
    this.stack = <call stack>; // non-standard, but most environments support it
  }
};
*/

export class InvalidURL extends Error {
  constructor() {
    super("Endpoint does not exist! Please check spelling!");
    this.name = "InvalidURL";
  }
};

export class PokemonBadRequest extends Error {
  constructor(message) {
    super("Error! Bad Request! " + message);
    this.name = "PokemonBadRequest";
  };
};

export class PokemonBadRequestMissingID extends PokemonBadRequest {
  constructor() {
    super("Missing Pokemon ID!");
    this.name = "PokemonBadRequestMissingID";
  }
};

export class PokemonNotFound extends Error {
  constructor(invalidId) {
    super(`No Pokemon exists where the id is ${invalidId}`);
    this.name = "PokemonNotFound";
  };
};

/**
 * Accepts the Error object and Response object to be sent to client.
 *
 */
export const errorHandler = (err, res) => {
  
  let errorMsg = `11${err.name} 22${err.message}`;
  console.log(errorMsg);
  
  if (err instanceof mongoose.Error.ValidationError) {
    let preface = "DB validation failed. New pokemon violates schema rules. Note that all base statistics must be Numbers and the english name must not exceed 20 chars. Please see following message from database to fix the request --> ";
    res.status(400).send(preface + errorMsg);
  } else if (err instanceof MongoServerError) {
    res.status(409).send("Pokemon already exists. Cannot add duplicate pokemons!");
  } else if (err instanceof InvalidURL) {
    res.status(404).send(errorMsg);
  } else if (err instanceof PokemonNotFound) {
    res.status(404).send(errorMsg);
  } else {
    console.log('we have an unnaccounted error!')
    res.status(500).send(errorMsg + " Ask devs to address unaccounted error");
  }
};
