import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'

const Settings = () => {
    const [formData, setFormData] = useState({
        office_latitude: '',
        office_longitude: '',
        office_radius_meters: '',
        telegram_bot_token: '',
        telegram_group_id: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()
  
    useEffect(() => {
      const fetchSettings = async () => {
        try {
          const token = localStorage.getItem("authToken")
          const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const result = await response.json()
          if (response.ok) {
            const data = result.data || result
            setFormData({
                office_latitude: data.office_latitude || '',
                office_longitude: data.office_longitude || '',
                office_radius_meters: data.office_radius_meters || '',
                telegram_bot_token: data.telegram_bot_token || '',
                telegram_group_id: data.telegram_group_id || ''
            })
          } else {
            throw new Error(result.error || "Failed to fetch settings")
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchSettings()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem("authToken")
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData)
            })
            
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update settings')
            }

            setSuccess('Settings updated successfully!')
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    office_latitude: position.coords.latitude,
                    office_longitude: position.coords.longitude
                }))
                setSuccess('Current location retrieved!')
            },
            (err) => {
                setError('Unable to retrieve location: ' + err.message)
            }
        )
    }

    const handleGetGroupId = async () => {
        if (!formData.telegram_bot_token) {
            setError('Please enter a Bot Token first to find the Group ID')
            return
        }

        try {
            setError('')
            setSuccess('Fetching updates...')
            const token = localStorage.getItem("authToken")
            const response = await fetch(`${API_BASE_URL}/admin/get-telegram-updates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ token: formData.telegram_bot_token })
            })
            const data = await response.json()

            if (data.ok && data.result && data.result.length > 0) {
                const last = data.result[data.result.length - 1]
                const groupId = last.message?.chat?.id || last.my_chat_member?.chat?.id || last.channel_post?.chat?.id
                if (groupId) {
                    setFormData(prev => ({ ...prev, telegram_group_id: groupId }))
                    setSuccess('Group ID found and applied!')
                } else setError('Group ID not found in recent updates.')
            } else setError('No updates found. Send a message to your bot first.')
        } catch (err) {
            setError(err.message)
        }
    }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Settings Page</h2>
      
      {loading && <div className="p-4">Loading settings...</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Office Latitude</label>
                        <button 
                            type="button"
                            onClick={handleGetCurrentLocation}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Get Current Location
                        </button>
                    </div>
                    <input
                        type="number"
                        step="any"
                        name="office_latitude"
                        value={formData.office_latitude}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Office Longitude</label>
                    <input
                        type="number"
                        step="any"
                        name="office_longitude"
                        value={formData.office_longitude}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Office Radius (Meters)</label>
                <input
                    type="number"
                    name="office_radius_meters"
                    value={formData.office_radius_meters}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Telegram Configuration</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bot Token</label>
                        <input
                            type="text"
                            name="telegram_bot_token"
                            value={formData.telegram_bot_token}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Group ID</label>
                            <button 
                                type="button"
                                onClick={handleGetGroupId}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Auto-fetch Group ID
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                            * Send a message (e.g., "Hello") to your bot on Telegram first.
                        </p>
                        <input
                            type="text"
                            name="telegram_group_id"
                            value={formData.telegram_group_id}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
      )}

    </div>
  )
}

export default Settings
