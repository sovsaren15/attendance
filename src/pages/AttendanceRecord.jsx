import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../services/api"

const AttendanceRecord = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Default to 'week'
  const [filterType, setFilterType] = useState("week") 
  
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
    } else {
      fetchAttendanceHistory(filterType)
    }
  }, [navigate, filterType])

  // --- HELPER: Force Timezone to Cambodia ---
  const formatCambodiaTime = (dateString, options = {}) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  const formatCambodiaDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const fetchAttendanceHistory = async (range) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      
      const response = await fetch(`${API_BASE_URL}/employee/attendance-history?range=${range}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let result
      try {
        result = await response.json()
      } catch (err) {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        throw new Error("Invalid JSON response")
      }

      if (response.ok) {
        const mappedData = (result.data || []).map((record) => ({
          id: record.id,
          employeeName: result.employee ? `${result.employee.first_name} ${result.employee.last_name}` : "You",
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          // Calculate status based on specific Cambodia time, not browser local time
          timeStatus: determineTimeStatus(record.check_in_time),
          status: record.status,
        }))
        setAttendanceRecords(mappedData)
        setError(null)
      } else {
        throw new Error(result.error || "Failed to fetch attendance data")
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      setError(error.message)
      setAttendanceRecords([])
    } finally {
      setLoading(false)
    }
  }

  const determineTimeStatus = (checkInTime) => {
    if (!checkInTime) return "N/A";
    
    const date = new Date(checkInTime);
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    // Logic: Late if after 9:15 AM
    if (hour < 9) return "On Time";
    if (hour === 9 && minute <= 15) return "On Time";
    return "Late";
  }

  const getInitials = (name) => {
    if (!name) return "NA"
    const parts = name.split(" ")
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d3e50] via-[#34495e] to-[#3e6268] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-center md:text-left">
          
          {/* Left Side Group: Logo | Divider | Text */}
          <div className="flex flex-col md:flex-row items-center ">
            
            {/* Logo */}
            <div className="p-2">
               <Link to="/">
                 <img src="/attendance_logo.png" alt="Logo" style={{width:180}} className="w-20 md:w-24 h-auto" />
               </Link>
            </div>

            {/* Vertical Line */}
            <div className='hidden md:block w-px h-12 bg-white/20 mx-4'></div>

            {/* Text Title */}
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-white'>Attendance Records</h1>
              <p className='text-white/70 text-sm'>Real-time employee tracking dashboard</p>
            </div>
          </div>

          {/* Right Side: Filter Dropdown */}
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <div className="w-full md:w-auto">
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full md:w-48 appearance-none bg-[#3e6268] text-white border border-white/20 rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer font-medium shadow-lg"
                    >
                        <option value="today" className="bg-[#2d3e50] text-white py-2">Today</option>
                        <option value="week" className="bg-[#2d3e50] text-white py-2">This Week</option>
                        <option value="month" className="bg-[#2d3e50] text-white py-2">This Month</option>
                        <option value="year" className="bg-[#2d3e50] text-white py-2">This Year</option>
                    </select>
                    
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/10 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3e6268] border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading records...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 inline-block border border-red-500/30">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 font-semibold">{error}</p>
                <button 
                  onClick={() => fetchAttendanceHistory(filterType)}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : attendanceRecords && attendanceRecords.length > 0 ? (
            <div>
              {/* --- DESKTOP TABLE --- */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[768px]">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-[#3e6268] to-[#4a7680] px-6 py-4">
                    <div className="grid grid-cols-6 gap-4 text-white font-semibold text-sm">
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Employee</div>
                      <div className="col-span-1">Check In</div>
                      <div className="col-span-1">Check Out</div>
                      <div className="col-span-1">Time Status</div>
                      <div className="col-span-1">Status</div>
                    </div>
                  </div>
                  {/* Table Body */}
                  <div className="divide-y divide-white/10">
                    {attendanceRecords.map((record, index) => (
                      <div 
                        key={record.id || index}
                        className="px-6 py-4 hover:bg-white/5 transition-colors duration-200"
                      >
                        <div className="grid grid-cols-6 gap-4 items-center">
                          {/* Date Column */}
                          <div className="text-white/80 font-medium text-sm">
                            {formatCambodiaDate(record.checkIn)}
                          </div>

                          {/* Employee Name */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {getInitials(record.employeeName)}
                            </div>
                            <div className="text-white font-semibold text-sm truncate">{record.employeeName || 'N/A'}</div>
                          </div>

                          {/* Check In */}
                          <div>
                            <div className={`text-sm font-semibold ${record.checkIn ? 'text-emerald-400' : 'text-white/50'}`}>
                              {record.checkIn ? formatCambodiaTime(record.checkIn) : "N/A"}
                            </div>
                          </div>

                          {/* Check Out */}
                          <div>
                            <div className={`text-sm font-semibold ${record.checkOut ? 'text-orange-400' : 'text-white/50'}`}>
                              {record.checkOut ? formatCambodiaTime(record.checkOut) : "Active"}
                            </div>
                          </div>

                          {/* Time Status */}
                          <div>
                            <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              record.timeStatus === "On Time" ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : record.timeStatus === "Late" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}>
                              {record.timeStatus || "N/A"}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              record.checkOut ? "bg-gray-500/20 text-gray-300" : "bg-blue-500/20 text-blue-300 animate-pulse border border-blue-500/30"
                            }`}>
                              {record.checkOut ? "Offline" : "Working"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- MOBILE CARDS --- */}
              <div className="block md:hidden">
                <div className="px-4 py-4 space-y-4"> 
                  {attendanceRecords.map((record, index) => (
                    <div key={record.id || index} className="bg-white/10 rounded-2xl p-4 shadow-lg border border-white/5">
                      
                      {/* Date Header for Mobile Card */}
                      <div className="text-xs text-white/50 mb-2 uppercase tracking-wider font-bold">
                        {formatCambodiaDate(record.checkIn)}
                      </div>

                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getInitials(record.employeeName)}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{record.employeeName || 'N/A'}</div>
                          </div>
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          record.checkOut ? "bg-gray-500/20 text-white" : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}>
                          {record.checkOut ? "Offline" : "Working"}
                        </span>
                      </div>

                      <hr className="border-white/10 mb-4" />

                      {/* Card Body */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Check In */}
                        <div>
                          <div className="text-white/50 text-xs mb-1">Check In</div>
                          <div className={`font-semibold ${record.checkIn ? 'text-emerald-400' : 'text-white/50'}`}>
                            {record.checkIn ? formatCambodiaTime(record.checkIn) : "N/A"}
                          </div>
                        </div>
                        {/* Check Out */}
                        <div>
                          <div className="text-white/50 text-xs mb-1">Check Out</div>
                          <div className={`font-semibold ${record.checkOut ? 'text-orange-400' : 'text-white/50'}`}>
                            {record.checkOut ? formatCambodiaTime(record.checkOut) : "Active"}
                          </div>
                        </div>
                        {/* Time Status */}
                        <div className="col-span-2">
                          <div className="text-white/50 text-xs mb-1">Time Status</div>
                          <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            record.timeStatus === "On Time" ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : record.timeStatus === "Late" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-gray-500/20 text-white"
                          }`}>
                            {record.timeStatus || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 inline-block">
                <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-white/60 text-lg">No attendance records found for this period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceRecord