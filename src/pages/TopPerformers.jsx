import React, { useState, useEffect } from "react"
import { User } from "lucide-react"
import { dashboardAPI } from "../services/api"

const TopPerformers = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardAPI.getTopPerformers()
        if (result.success) {
          setData(result)
        } else {
          throw new Error("Failed to fetch top performers data")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderList = (title, items, valueKey, unit) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      {items && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span
                  className={`font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full mr-4 ${
                    index === 0 ? "bg-yellow-400 text-white" : index === 1 ? "bg-gray-400 text-white" : "bg-yellow-600 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-semibold text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold text-indigo-600">
                {valueKey === 'overtimeHours' ? item[valueKey].toFixed(2) : item[valueKey]} {unit}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No data available.</p>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen  flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-[#3e6268]/10 rounded-full p-6 animate-pulse">
                <User className="w-16 h-16 text-[#3e6268]" /> 
              </div>
              <div className="absolute inset-0 border-4 border-[#3e6268]/20 border-t-[#3e6268] rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">Loading Top Performers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Top Performers</h2>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderList("Top 3 Late", data.topLate, "lateCount", "times")}
          {renderList("Top 3 Early", data.topEarly, "earlyCount", "times")}
          {renderList("Top 3 Most Present", data.topAttendance, "attendanceCount", "days")}
          {renderList("Top 3 Overtime", data.topOvertime, "overtimeHours", "hours")}
        </div>
      )}
    </div>
  )
}

export default TopPerformers