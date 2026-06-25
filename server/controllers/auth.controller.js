import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

const sanitizeUser = (user) => {
    if (!user) return user
    // remove password from response if it's on the document
    const { password, ...rest } = user.toObject ? user.toObject() : user
    return rest
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required" })
        }

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(409).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        return res.status(200).json({
            token,
            user: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({ message: `Register error ${error}` })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = await genToken(user._id)

        return res.status(200).json({
            token,
            user: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({ message: `Login error ${error}` })
    }
}

// keep existing googleAuth route, but avoid setting cookies (JWT returned instead)
export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body

        if (!email) return res.status(400).json({ message: "email is required" })

        let user = await User.findOne({ email })

        if (!user) {
            // create user with a random password so required schema is satisfied
            const hashedPassword = await bcrypt.hash(
                `${email}-${Date.now()}`,
                SALT_ROUNDS
            )

            user = await User.create({
                name: name || "User",
                email,
                password: hashedPassword
            })
        }

        const token = await genToken(user._id)

        return res.status(200).json({
            token,
            user: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({ message: `Google auth error ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        // legacy cookie logout - safe no-op if no cookie
        await res.clearCookie?.("token")
        return res.status(200).json({ message: "LogOut Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Logout error ${error}` })
    }
}
