import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

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

const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required()
})

const logInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})



server.post("/sign-up", async (req, res) => {
    const user = req.body
    const passwordHash = bcrypt.hashSync(user.password, 8)
    const validation = signUpSchema.validate(user, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    try {
        const isEmailAvailable = await database.collection("registeredUsers").findOne({ email: user.email })

        if (isEmailAvailable) {
            return res.status(409).send("E-mail já cadastrado")
        }

        await database.collection("registeredUsers").insertOne({ name: user.name, email: user.email, password: passwordHash })

        res.sendStatus(201)
    }

    catch (error) {
        res.status(500).send(error.message)
    }
})

server.post("/login", async (req, res) => {
    const { email, password } = req.body

    try {
        const checkUser = await database.collection("registeredUsers").findOne({ email })

        if (!checkUser) {
            return res.status(400).send("Usuário não cadastrado")
        }

        if (checkUser && bcrypt.compareSync(password, checkUser.password)) {
            const token = uuid()

            await database.collection("sessions").insertOne({ token, userId: checkUser._id })
            res.send(token)
        }

        else {
            res.status(404).send("Senha incorreta")
        }
    }

    catch (error) {
        res.status(500).send(error.message)
    }

})

const PORT = 5000
server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta: ${PORT}`)
})