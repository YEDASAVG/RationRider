import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'

const Loading = () => {
    const {navigate} = useAppContext()
    let {search} = useLocation()
    const querry = new URLSearchParams(search)
    const nextUrl = querry.get('next')

    useEffect(() => {
        if(nextUrl) {
            setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 5000)
        }
    }, [nextUrl, navigate])

  return (
    <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary'>

        </div>
    </div>
  )
}

export default Loading