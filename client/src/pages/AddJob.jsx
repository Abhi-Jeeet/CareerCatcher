import React, { useEffect, useRef, useState } from 'react'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import axios from 'axios'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { toast } from 'react-toastify'

const AddJob = () => {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Bangalore')
  const[category, setCategory] = useState('Programming')
  const[level, setLevel] = useState('Beginner level')
  const [salary, setSalary] = useState(0)

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const {backendUrl, companyToken} = useContext(AppContext)

  const onSubmitHandler = async(e)=>{
    e.preventDefault()
    try {
      const description = quillRef.current.root.innerHTML

      const {data} = await axios.post(backendUrl+'/api/company/post-job',{title, description,location, salary, category, level},
        {headers:{token:companyToken}}
      )
      if (data.success) {
        toast.success(data.message)
        setTitle('')
        setSalary(0)
        quillRef.current.root.innerHTML = ""
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    //Initiate Quill only once
    if(!quillRef.current && editorRef.current){
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Job Description'
      })
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Job Title</p>
        <input type="text" placeholder='Type Here'
        onChange={e=> setTitle(e.target.value)} value={title}
        required
        className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'
        />
      </div>
      <div className='w-full max-w-lg'>
        <p className='my-2'>Job Description</p>
        <div ref={editorRef}>

        </div>
      </div>
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Job Category</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setCategory(e.target.value)}
            value={category}>
            {JobCategories.map((category, index)=>(
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Job Locations</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLocation(e.target.value)}
            value={location}>
            {JobLocations.map((location, index)=>(
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Job Level</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLevel(e.target.value)}
            value={level}>
            <option value="Beginner Level">Beginner Level</option>
            <option value="Intermediate Level">Intermediate Level</option>
            <option value="Senior Level">Senior Level</option>
          </select>
        </div>
      </div>
      <div>
        <p className='mb-2'>Job Salary</p>
        <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' onChange={e=>setSalary(e.target.value)} type="Number" placeholder='2500' />
      </div>

      <button className='w-28 py-3 mt-4 bg-orange-400 text-white rounded'>ADD</button>
    </form>
  )
}

export default AddJob