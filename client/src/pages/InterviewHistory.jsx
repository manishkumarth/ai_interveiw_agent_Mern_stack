import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { FaArrowLeft } from 'react-icons/fa'
function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview")
                setInterviews(result.data)
            } catch (error) {
                console.log(error)
            }
        }

        getMyInterviews()
    }, [])


    return (
        <div className='min-h-screen bg-[#05060a] py-10'>
            <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>

                <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>
                    <button
                        onClick={() => navigate("/")}
                        className='mt-1 p-3 rounded-full bg-[rgba(10,12,20,0.92)] border border-[#1a2cff33] shadow hover:shadow-md transition'>
                        <FaArrowLeft className='text-gray-200' />
                    </button>

                    <div>
                        <h1 className='text-3xl font-bold flex-nowrap text-gray-100'>
                            Interview History
                        </h1>
                        <p className='text-gray-300 mt-2'>
                            Track your past interviews and performance reports
                        </p>

                    </div>
                </div>


                {interviews.length === 0 ?
                    <div className='bg-[rgba(10,12,20,0.92)] border border-[#1a2cff33] p-10 rounded-2xl shadow text-center'>
                        <p className='text-gray-300'>
                            No interviews found. Start your first interview.
                        </p>
                    </div>

                    :

                    <div className='grid gap-6'>
                        {interviews.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className='bg-[rgba(10,12,20,0.92)] border border-[#1a2cff33] p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer'
                            >
                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-100">
                                            {item.role}
                                        </h3>

                                        <p className="text-gray-300 text-sm mt-1">
                                            {item.experience} • {item.mode}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-6'>

                                        {/* SCORE */}
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-[rgba(0,255,180,0.95)]">
                                                {item.finalScore || 0}/10
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Overall Score
                                            </p>
                                        </div>

                                        {/* STATUS BADGE */}
                                        <span
                                            className={`px-4 py-1 rounded-full text-xs font-medium ${
                                                item.status === "completed"
                                                    ? "bg-[rgba(0,255,180,0.15)] text-[rgba(0,255,180,0.95)] border border-[rgba(0,255,180,0.35)]"
                                                    : "bg-[rgba(255,200,0,0.15)] text-[rgba(255,200,0,0.95)] border border-[rgba(255,200,0,0.35)]"
                                            }`}
                                        >
                                            {item.status}
                                        </span>


                                    </div>
                                </div>

                            </div>

                        ))
                        }

                    </div>
                }
            </div>

        </div>
    )
}

export default InterviewHistory
