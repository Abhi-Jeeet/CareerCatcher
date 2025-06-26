import React, { useContext, Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'quill/dist/quill.snow.css'

// Lazy load components
const Home = lazy(() => import('./pages/Home'))
const ApplyJobs = lazy(() => import('./pages/ApplyJobs'))
const Applications = lazy(() => import('./pages/Applications'))
const RecruiterLogin = lazy(() => import('./components/RecruiterLogin'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AddJob = lazy(() => import('./pages/AddJob'))
const ManageJobs = lazy(() => import('./pages/ManageJobs'))
const ViewApplications = lazy(() => import('./pages/ViewApplications'))
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'))
const CoverLetter = lazy(() => import('./pages/CoverLetter'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const App = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext)
  return (
    <div>
      {showRecruiterLogin && (
        <Suspense fallback={<LoadingSpinner />}>
          <RecruiterLogin />
        </Suspense>
      )}
      <ToastContainer />
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </div>
  )
}

export default App