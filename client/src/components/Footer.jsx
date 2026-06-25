import React from 'react'
import { BsRobot } from 'react-icons/bs'

function Footer() {
  return (
    <div className='bg-[#05060a] flex justify-center px-4 pb-10 py-4 pt-10'>
      <div className='w-full max-w-6xl bg-[rgba(10,12,20,0.92)] rounded-[24px] shadow-sm border border-[#1a2cff33] py-8 px-3 text-center'>
        <div className='flex justify-center items-center gap-3 mb-3'>
            <div className='bg-black text-white p-2 rounded-lg shadow-[0_0_20px_rgba(0,255,180,0.25)]'><BsRobot size={16}/></div>
            <h2 className='font-semibold text-gray-100'>InterviewIQ.AI</h2>
        </div>
        <p className='text-gray-400 text-sm max-w-xl mx-auto'>
  AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>


      </div>
    </div>
  )
}

export default Footer
