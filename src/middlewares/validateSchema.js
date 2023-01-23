export default function validateSchema(schema) {
    return (req, res, next) => {
        const { value, error } = schema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.sendStatus(422)
        }

        res.locals.value = value

        next()
    }
}