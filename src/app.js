import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config()
const server = express()
server.use(express.json())
server.use(cors())



const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoClient.connect()
    console.log("API Connected Successfully!")
}

catch (error) {
    console.log(error.message)
}

const database = mongoClient.db()

const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required()
})



server.post("/sign-up", async (req, res) => {
    const user = req.body
    const passwordHash = bcrypt.hashSync(user.password, 8)
    const validation = userSchema.validate(user, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message)
        return res.status(422).send(errors)
    }

    try {
        const isEmailAvailable = await database.collection("registeredUsers").findOne({email: user.email})
        
        if(isEmailAvailable) {
            return res.status(409).send("E-mail já cadastrado")
        }

        await database.collection("registeredUsers").insertOne({name: user.name, email: user.email, password: passwordHash})
    }

    catch (error) {
        res.status(500).send(error.message)
    }
})

const PORT = 5000
server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta: ${PORT}`)
})