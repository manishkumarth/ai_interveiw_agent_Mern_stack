import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        // Preferred: localStorage JWT sent via Authorization header
        // Format: Authorization: Bearer <token>
        let token = req?.headers?.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null

        // Fallback: existing cookie-based auth
        if (!token) {
            token = req.cookies?.token
        }

        if (!token) {
            return res.status(400).json({ message: "user does not have a token" })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            return res.status(400).json({ message: "user does not have a valid token" })
        }

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        return res.status(500).json({ message: `isAuth error ${error}` })
    }
}

export default isAuth
