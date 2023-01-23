import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let database

try {
    await mongoClient.connect()
    database = mongoClient.db()
    console.log("API Connected Successfully!")
}

catch (error) {
    console.log(error.message)
}

export { database }
