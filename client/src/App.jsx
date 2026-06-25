import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'

export const ServerUrl  = "https://ai-interveiw-agent-mern-stack.onrender.com"
// export const ServerUrl = "http://localhost:8000"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    // Configure axios default auth header for subsequent protected requests
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }

    // Auto-login on refresh (no Firebase, no cookies)
    if (token && storedUser) {
      try {
        dispatch(setUserData(JSON.parse(storedUser)))
      } catch {
        dispatch(setUserData(null))
      }
    } else {
      dispatch(setUserData(null))
    }

    // Optional: keep server-verified user fresh if possible
    const getUser = async () => {
      if (!token) return
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user")
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        delete axios.defaults.headers.common["Authorization"]
        dispatch(setUserData(null))
      }
    }

    getUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/history' element={<InterviewHistory />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/report/:id' element={<InterviewReport />} />
    </Routes>
  )
}

export default App
