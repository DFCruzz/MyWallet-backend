import { Router } from "express";
import { signUp, logIn } from "../controllers/AuthController.js"
import { signUpSchema, logInSchema } from "../schema/AuthSchema.js";
import validateSchema from "../middlewares/validateSchema.js";

const auth = Router()

auth.post("/login", validateSchema(logInSchema), logIn)
auth.post("/sign-up", validateSchema(signUpSchema), signUp)

export default auth