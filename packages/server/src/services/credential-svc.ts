import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import { Credential } from "../models/index.js";

const credentialSchema = new Schema<Credential>(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: true
    }
  },
  { collection: "user_credentials" }
);

const CredentialModel = model<Credential>("Credential", credentialSchema);

function create(username: string, password: string): Promise<Credential> {
  return CredentialModel.find({ username })
    .then((found: Credential[]) => {
      if (found.length) throw new Error(`Username exists: ${username}`);
    })
    .then(() => bcrypt.genSalt(10))
    .then((salt: string) => bcrypt.hash(password, salt))
    .then((hashedPassword: string) => {
      const creds = new CredentialModel({
        username,
        hashedPassword
      });
      return creds.save();
    });
}

function verify(username: string, password: string): Promise<string> {
  return CredentialModel.find({ username })
    .then((found) => {
      if (!found || found.length !== 1) {
        throw new Error("Invalid username or password");
      }
      return found[0];
    })
    .then((credsOnFile: Credential) =>
      bcrypt.compare(password, credsOnFile.hashedPassword).then((result) => {
        if (!result) throw new Error("Invalid username or password");
        return credsOnFile.username;
      })
    );
}

export default { create, verify };
