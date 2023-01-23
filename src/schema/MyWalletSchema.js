import joi from "joi";

const inputSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().valid("input", "output").required()
})