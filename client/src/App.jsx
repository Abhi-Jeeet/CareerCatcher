import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJobs from './pages/ApplyJobs'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import 'quill/dist/quill.snow.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import CoverLetter from './pages/CoverLetter'

const App = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext)
  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJobs />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/resume-analyzer' element={<ResumeAnalyzer />} />
        <Route path='/cover-letter' element={<CoverLetter/>}/>
        <Route path='/dashboard' element={<Dashboard />}>
          {
            companyToken ? <>
              <Route path='add-job' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} />
            </> : null
          }

        </Route>
      </Routes>
    </div>
  )
}

export default App