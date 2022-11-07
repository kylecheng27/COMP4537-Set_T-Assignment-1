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
  
  let errorMsg = `${err.name} ${err.message}`;
  
  if (err instanceof mongoose.Error.ValidationError) {
    return ({ errMsg: "ValidationError: check your ..." })
  } else if (err instanceof mongoose.Error.CastError) {
    return ({ errMsg: "CastError: check your ..." })
  } else if (err instanceof InvalidURL) {
    console.log(errorMsg)
    res.status(404).send(errorMsg);
  } else if (err instanceof PokemonNotFound) {
    console.log(errorMsg)
    res.status(404).send(errorMsg);
  } else {
    console.log(err);
    res.status(500).send(errorMsg + " Ask devs to fix unaccounted error");
    // res.status(500).send(err.name + " " + err.message);
  }
};
