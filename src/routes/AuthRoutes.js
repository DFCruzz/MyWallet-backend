import { database } from "../db/db";
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"


export const signUp = (async (req, res) => {
    const user = req.body
    const passwordHash = bcrypt.hashSync(user.password, 8)


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

export const logIn = (async (req, res) => {
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