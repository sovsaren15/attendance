import React, { useState, useEffect, useMemo } from 'react'
import { Search, Calendar, User, Clock } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const AttendancePage = () => {
  const [allRecords, setAllRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const result = await dashboardAPI.getAllAttendanceHistory()
        if (result.error) throw new Error(result.error)
        if (result.data) {
          const mappedData = result.data.map((record) => ({
            id: record.id,
            employeeName: record.employees ? `${record.employees.first_name || ''} ${record.employees.last_name || ''}`.trim() : "Unknown",
            checkIn: record.check_in_time,
            checkOut: record.check_out_time,
            timeStatus: record.status_time || "N/A",
            status: record.status,
          }))
          setAllRecords(mappedData)
        } else {
          throw new Error('Failed to fetch attendance data')
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAllAttendance()
  }, [])

  useEffect(() => {
    let records = allRecords

    // Filter by search term
    if (searchTerm) {
      records = records.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      records = records.filter(record => {
        const checkInDate = new Date(record.checkIn)
        return checkInDate.getMonth() === parseInt(selectedMonth)
      })
    }

    setFilteredRecords(records)
  }, [searchTerm, selectedMonth, allRecords])

  const monthOptions = useMemo(() => {
    const months = new Set()
    allRecords.forEach(record => {
      if (record.checkIn) {
        months.add(new Date(record.checkIn).getMonth())
      }
    })
    return Array.from(months).map(monthIndex => ({
      value: monthIndex,
      label: new Date(0, monthIndex).toLocaleString('default', { month: 'long' }),
    })).sort((a, b) => a.value - b.value)
  }, [allRecords])

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "NA"
    const parts = name.split(" ")
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen  flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-[#3e6268]/10 rounded-full p-6 animate-pulse">
                <svg className="w-16 h-16 text-[#3e6268]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="absolute inset-0 border-4 border-[#3e6268]/20 border-t-[#3e6268] rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">Loading Attendance Records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
          <div className="bg-red-100 rounded-2xl p-6 mb-6">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">All Attendance Records</h1>
          <p className="text-gray-600 text-lg">Search and filter employee attendance history</p>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3e6268] focus:border-transparent transition-all"
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3e6268] focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
              >
                <option value="all">All Months</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* --- REFACTORED RECORDS TABLE --- */}
        <div className=" rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Set a min-width for horizontal scrolling on mobile */}
            <div className="min-w-[900px]">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="font-semibold text-gray-600 text-sm">Employee</div>
                <div className="font-semibold text-gray-600 text-sm">Date</div>
                <div className="font-semibold text-gray-600 text-sm">Check In</div>
                <div className="font-semibold text-gray-600 text-sm">Check Out</div>
                <div className="font-semibold text-gray-600 text-sm">Time Status</div>
                <div className="font-semibold text-gray-600 text-sm">Status</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <div key={record.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                      
                      {/* Column 1: Employee */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3e6268] to-[#4a7680] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(record.employeeName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{record.employeeName}</div>
                        </div>
                      </div>

                      {/* Column 2: Date */}
                      <div className="text-gray-600 text-sm">
                        {new Date(record.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      {/* Column 3: Check In */}
                      <div className="font-semibold text-green-700">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>

                      {/* Column 4: Check Out */}
                      <div className="font-semibold text-red-700">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                      </div>

                      {/* Column 5: Time Status */}
                      <div>
                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                          record.timeStatus === "Late" ? "bg-red-100 text-red-700"
                          : record.timeStatus === "On Time" ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {record.timeStatus || 'N/A'}
                        </span>
                      </div>

                      {/* Column 6: Status */}
                      <div>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                          record.checkOut ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"
                        }`}>
                          {record.checkOut ? "Offline" : "Online"}
                        </span>
                      </div>

                    </div>
                  ))
                ) : (
                  // "No Results" state now sits inside the table structure
                  <div className="p-16 text-center">
                    <div className="bg-gray-50 rounded-2xl p-8 inline-block mb-6">
                      <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Records Found</h3>
                    <p className="text-gray-500 text-lg">No attendance records match your selected filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* --- END OF REFACTORED TABLE --- */}
        
      </div>
    </div>
  )
}

export default AttendancePage