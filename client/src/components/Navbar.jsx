import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar
 = () => {

    const {openSignIn} = useClerk();
    const{user} = useUser();
    const navigate = useNavigate();
    const {setShowRecruiterLogin}  = useContext(AppContext)
  return (
    <div className='shadow py-4'>
        <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
            <img onClick={()=>navigate("/")} className='cursor-pointer h-12 w-auto' src={assets.logo} alt="" />
            {
                user
                ? <div className='flex items-center gap-3'>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        "px-3 py-1 rounded-md font-semibold transition " +
                        (isActive
                          ? "bg-orange-100 text-orange-700"
                          : "text-orange-600 hover:bg-orange-100")
                      }
                    >
                      Home
                    </NavLink>
                    <p></p>
                    <NavLink
                      to="/applications"
                      className={({ isActive }) =>
                        "px-3 py-1 rounded-md font-semibold transition " +
                        (isActive
                          ? "bg-orange-100 text-orange-700"
                          : "text-orange-600 hover:bg-orange-100")
                      }
                    >
                      Applied Jobs
                    </NavLink>
                    <p></p>
                    <NavLink
                      to="/resume-analyzer"
                      className={({ isActive }) =>
                        "px-3 py-1 rounded-md font-semibold transition " +
                        (isActive
                          ? "bg-orange-100 text-orange-700"
                          : "text-orange-600 hover:bg-orange-100")
                      }
                    >
                      Resume Analyzer
                    </NavLink>
                    <p></p>
                    <NavLink
                      to="/cover-letter"
                      className={({ isActive }) =>
                        "px-3 py-1 rounded-md font-semibold transition " +
                        (isActive
                          ? "bg-orange-100 text-orange-700"
                          : "text-orange-600 hover:bg-orange-100")
                      }
                    >
                      Cover Letter Creator
                    </NavLink>
                    <p></p>
                    <p className='max-sm:hidden'>Hii, {user.firstName +" "+user.lastName }</p>
                    <UserButton/>
                </div>
                :<div className='flex gap-4 max:sm:text-xs'>
                <button onClick={e=> setShowRecruiterLogin(true)} className='text-gray-600'>Recruiter Login</button>
                <button onClick={e=>openSignIn()} className='bg-orange-600 text-white px-6 sm:px-9 py-2 rounded-full'>Login</button>
            </div>
            }
            
        </div>
    </div>
  )
}

export default Navbar
