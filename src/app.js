import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import dayjs from "dayjs"

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

const inputSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().valid("input", "output").required()
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

server.post("/home", async (req, res) => {
    const { description, value, type } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer", "")

    const validation = inputSchema.validate({ description, value, type }, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message)
        return res.status(422).send(errors)
    }

    if (!token) return res.status(420).send("informe o token")

    try {
        const date = dayjs(Date.now()).format("DD/MM")

        const isUserLogged = await database.collection("sessions").findOne({ token })

        if (!token || !isUserLogged) {
            return res.send(401).send("Você não está logado!")
        }

        await database.collection("myWallet").insertOne({
            description,
            value,
            type,
            date: date,
            user: isUserLogged.userId
        })

        res.sendStatus(201)
    }

    catch (error) {
        res.status(500).send(error.message)
    }
})

server.get("/home", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer", "")

    if (!token) return res.status(420).send("informe o token")

    try {
        const isUserLogged = await database.collection("sessions").findOne({ token })

        if (!token || !isUserLogged) {
            return res.send(401).send("Você não está logado!")
        }

        const myWallet = await database.collection("myWallet").find({ userId: isUserLogged.userId }).toArray()

        return res.send(myWallet)

    }
    
    catch (error) {
        res.status(500).send(error.message)
    }
    
})


const PORT = 5000
server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta: ${PORT}`)
})