import React, { useState } from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Auth({ isModel = false }) {
  const dispatch = useDispatch()

  const [mode, setMode] = useState("login") // login | register
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const submit = async () => {
    setLoading(true)
    setErrorMsg("")
    try {
      const payload = mode === "register"
        ? { name, email, password }
        : { email, password }

      const url = mode === "register"
        ? ServerUrl + "/api/auth/register"
        : ServerUrl + "/api/auth/login"

      const result = await axios.post(url, payload)

      const { token, user } = result.data || {}

      if (!token || !user) {
        throw new Error("Invalid auth response")
      }

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      dispatch(setUserData(user))
    } catch (error) {
      console.log(error)
      dispatch(setUserData(null))
      setErrorMsg(error?.response?.data?.message || error?.message || "Auth failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`
      w-full
      ${isModel ? "py-4" : "min-h-screen bg-[#05060a] flex items-center justify-center px-6 py-20"}
    `}>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className={`
        w-full
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
        bg-[rgba(10,12,20,0.92)] shadow-2xl border border-[#1a2cff33] 
        backdrop-blur-md
      `}>
        <div className='flex items-center justify-center gap-3 mb-6'>
          <div className='bg-[#0b0fff] text-white p-2 rounded-lg shadow-[0_0_18px_rgba(0,150,255,0.35)]'>
            <BsRobot size={18} />
          </div>
          <h2 className='font-semibold text-lg text-white'>InterviewIQ.AI</h2>
        </div>

        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 text-white'>
          {mode === "login" ? "Sign in to continue" : "Create your account"}
          <span className='ml-2 bg-[#00ffb433] text-[#00ffb4] px-3 py-1 rounded-full inline-flex items-center gap-2 text-sm align-middle'>
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className='text-[#7a86a8] text-center text-sm md:text-base leading-relaxed mb-8'>
          {mode === "login"
            ? "Sign in to start AI-powered mock interviews, track your progress, and unlock insights."
            : "Sign up to get started. Your data stays on this app via JWT auth."}
        </p>

        <div className="flex gap-3 justify-center mb-7">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-full border text-sm ${mode === "login"
              ? "border-[#00ffb4] text-[#00ffb4] bg-[#00ffb411]"
              : "border-[#223] text-[#a0abcc] bg-transparent hover:bg-[#1a2cff22]"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-full border text-sm ${mode === "register"
              ? "border-[#00ffb4] text-[#00ffb4] bg-[#00ffb411]"
              : "border-[#223] text-[#a0abcc] bg-transparent hover:bg-[#1a2cff22]"}`}
          >
            Sign up
          </button>
        </div>

        {mode === "register" && (
          <div className="mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0f1a] border border-[#1a2cff44] text-white outline-none focus:border-[#00ffb4]"
            />
          </div>
        )}

        <div className="mb-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f1a] border border-[#1a2cff44] text-white outline-none focus:border-[#00ffb4]"
          />
        </div>

        <div className="mb-6">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f1a] border border-[#1a2cff44] text-white outline-none focus:border-[#00ffb4]"
          />
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-[#ff4d7d] bg-[#ff4d7d22] border border-[#ff4d7d55] rounded-xl px-4 py-2">
            {errorMsg}
          </div>
        )}

        <motion.button
          type="button"
          onClick={submit}
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
          disabled={loading}
          className='w-full flex items-center justify-center gap-3 py-3 bg-[#00ffb4] text-[#061018] rounded-full shadow-[0_0_28px_rgba(0,255,180,0.35)] disabled:opacity-60'
        >
          {loading ? "Please wait..." : (mode === "login" ? "Sign in" : "Create account")}
        </motion.button>

      </motion.div>
    </div>
  )
}

export default Auth
