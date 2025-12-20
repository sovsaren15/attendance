import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EmployeeList = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
        const response = await fetch(`${API_URL}/admin/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = await response.json()
        if (response.ok) {
          setEmployees(result.data || result)
        } else {
          throw new Error("Failed to fetch employees")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return

    try {
      await employeeAPI.delete(id)
      // Remove from local state to update UI without refetching
      setEmployees(employees.filter((emp) => emp.id !== id))
    } catch (err) {
      alert('Failed to delete employee')
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Employee List</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{employee.first_name} {employee.last_name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{employee.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="3" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeList