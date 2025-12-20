import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

const AttendanceRecord = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
    } else {
      fetchAttendanceHistory()
    }
  }, [navigate])

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/employee/attendance-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let result
      try {
        result = await response.json()
      } catch (err) {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Attendance endpoint not found (404). Check backend routes.")
          }
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        throw new Error("Invalid JSON response")
      }

      if (response.ok) {
        const mappedData = result.data.map((record) => ({
          id: record.id,
          employeeName: result.employee ? `${result.employee.first_name} ${result.employee.last_name}` : "You",
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          timeStatus: determineTimeStatus(record.check_in_time),
          status: record.status,
        }))
        setAttendanceRecords(mappedData)
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
    if (!checkInTime) return "N/A"
    const date = new Date(checkInTime)
    const hour = date.getHours()
    const minute = date.getMinutes()
    return hour < 9 || (hour === 9 && minute <= 15) ? "On Time" : "Late"
  }

  // Get initials from name
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
        {/* Header - Adjusted for responsive logo positioning */}
        <div className="text-center md:text-left mb-8">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className=" backdrop-blur-sm rounded-2xl p-3">
            <Link to="/" className="">
              {/* Corrected 'w-21' to 'w-24' to match your previous code */}
              <img src="/attendance_logo.png" alt="Logo" style={{width:200}} className=" md:w-28 h-auto" />
            </Link>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Attendance Records</h2>
            <p className="text-white/70 text-lg">Real-time employee tracking dashboard</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3e6268] border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading records...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 font-semibold">{error}</p>
              </div>
            </div>
          ) : attendanceRecords && attendanceRecords.length > 0 ? (
            <div>
              {/* --- DESKTOP TABLE (Hidden on Mobile) --- */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[768px]">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-[#3e6268] to-[#4a7680] px-6 py-4">
                    <div className="grid grid-cols-5 gap-4 text-white font-semibold text-sm">
                      <div>Employee Name</div>
                      <div>Check In</div>
                      <div>Check Out</div>
                      <div>Time Status</div>
                      <div>Status</div>
                    </div>
                  </div>
                  {/* Table Body */}
                  <div className="divide-y divide-white/10">
                    {attendanceRecords.map((record, index) => (
                      <div 
                        key={record.id || index}
                        className="px-6 py-4 hover:bg-white/5 transition-colors duration-200"
                      >
                        <div className="grid grid-cols-5 gap-4 items-center">
                          {/* Employee Name */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getInitials(record.employeeName)}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">{record.employeeName || 'N/A'}</div>
                            </div>
                          </div>
                          {/* Check In */}
                          <div>
                            <div className={`text-sm font-semibold ${record.checkIn ? 'text-emerald-400' : 'text-white/50'}`}>
                              {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </div>
                            <div className="text-white/40 text-xs">
                              {record.checkIn ? new Date(record.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}
                            </div>
                          </div>
                          {/* Check Out */}
                          <div>
                            <div className={`text-sm font-semibold ${record.checkOut ? 'text-orange-400' : 'text-white/50'}`}>
                              {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Active"}
                            </div>
                            <div className="text-white/40 text-xs">
                              {record.checkOut ? new Date(record.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Null"}
                            </div>
                          </div>
                          {/* Time Status */}
                          <div>
                            <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              record.timeStatus === "On Time" ? "bg-green-500/80 text-white"
                              : record.timeStatus === "Late" ? "bg-red-500/80 text-white"
                              : "bg-gray-500/80 text-white"
                            }`}>
                              {record.timeStatus || "N/A"}
                            </div>
                          </div>
                          {/* Status */}
                          <div>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              record.checkOut ? "bg-gray-500/80 text-white" : "bg-green-500/80 text-white"
                            }`}>
                              {record.checkOut ? "Offline" : "Online"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- MOBILE CARDS (Hidden on Desktop) --- */}
              <div className="block md:hidden">
                <div className="px-4 py-4 space-y-4"> {/* Container for cards */}
                  {attendanceRecords.map((record, index) => (
                    <div key={record.id || index} className="bg-white/10 rounded-2xl p-4 shadow-lg">
                      {/* Card Header: Avatar, Name, and Status */}
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
                          record.checkOut ? "bg-gray-500/80 text-white" : "bg-green-500/80 text-white"
                        }`}>
                          {record.checkOut ? "Offline" : "Online"}
                        </span>
                      </div>

                      <hr className="border-white/10 mb-4" />

                      {/* Card Body: Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Check In */}
                        <div>
                          <div className="text-white/50 text-xs mb-1">Check In</div>
                          <div className={`font-semibold ${record.checkIn ? 'text-emerald-400' : 'text-white/50'}`}>
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                          </div>
                        </div>
                        {/* Check Out */}
                        <div>
                          <div className="text-white/50 text-xs mb-1">Check Out</div>
                          <div className={`font-semibold ${record.checkOut ? 'text-orange-400' : 'text-white/50'}`}>
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Active"}
                          </div>
                        </div>
                        {/* Time Status */}
                        <div>
                          <div className="text-white/50 text-xs mb-1">Time Status</div>
                          <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            record.timeStatus === "On Time" ? "bg-green-500/80 text-white"
                            : record.timeStatus === "Late" ? "bg-red-500/80 text-white"
                            : "bg-gray-500/80 text-white"
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
                <p className="text-white/60 text-lg">No attendance records for today</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceRecord