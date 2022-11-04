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

/**
 * Accepts the Error object and Response object to be sent to client.
 *
 */
export const errorHandler = (err, res) => {
  // console.log("err.name: ", err.name);
  if (err instanceof mongoose.Error.ValidationError) {
    return ({ errMsg: "ValidationError: check your ..." })
  } else if (err instanceof mongoose.Error.CastError) {
    return ({ errMsg: "CastError: check your ..." })
  } else {
    console.log(err.name + " " + err.message);
    // res.status(500).send(err.name + " " + err.message);
  }
};
