import React, { useRef, useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Camera, ArrowLeft, CheckCircle, Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function EmployeeRegistration() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    employee_id: "",
    password: "",
    is_admin: false,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach((track) => track.stop())
      setIsStreaming(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 240)
        const imageData = canvas.toDataURL("image/jpeg", 0.7)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const scale = Math.min(1, 400 / img.width)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const compressedData = canvas.toDataURL("image/jpeg", 0.7)
          setCapturedImage(compressedData)
          stopCamera()
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const registerFace = async () => {
    if (!capturedImage) {
      toast.error("Please capture or upload a face image")
      return
    }
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.employee_id) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    const token = localStorage.getItem("authToken")

    try {
      // Extract base64 data if it contains the prefix
      const imageBase64 = capturedImage.includes(",") ? capturedImage.split(",")[1] : capturedImage

      if (!imageBase64) throw new Error("Invalid image data")

      // 1. Create Employee
      const createResponse = await fetch("http://localhost:5000/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim(),
          image: imageBase64,
        }),
      })

      const createData = await createResponse.json()
      if (!createResponse.ok) throw new Error(createData.error || "Failed to create employee")

      if (!createData.employee || !createData.employee.id) {
        throw new Error("Employee created but ID is missing")
      }

      toast.success("Employee and face registered successfully!")
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      toast.error(error.message || "Unable to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  const retake = () => {
    setCapturedImage(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Register New Employee</h1>
            <p className="text-gray-500">Enter details and capture face for attendance tracking</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Employee Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="employee_id"
                  placeholder="Employee ID (e.g. EMP001)"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_admin"
                    id="is_admin"
                    checked={formData.is_admin}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_admin" className="text-sm text-gray-700">Is Admin?</label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Face Capture</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {!isStreaming && !capturedImage && (
                  <div className="text-center p-8">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Camera not active</p>
                  </div>
                )}

                {capturedImage && (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${isStreaming && !capturedImage ? "block" : "hidden"}`}
                />

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                {!isStreaming && !capturedImage && (
                  <>
                    <button onClick={startCamera} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center transition-colors">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}

                {isStreaming && !capturedImage && (
                  <>
                    <button onClick={capturePhoto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center transition-colors">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </button>
                    <button onClick={stopCamera} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                      Cancel
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <button onClick={registerFace} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50 transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isLoading ? "Registering..." : "Create Employee"}
                    </button>
                    <button onClick={retake} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                      Retake
                    </button>
                  </>
                )}
              </div>

              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium text-gray-900">Tips for best results:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Face the camera directly</li>
                  <li>Ensure good lighting on your face</li>
                  <li>Remove glasses if possible</li>
                  <li>Keep a neutral expression</li>
                  <li>Make sure your entire face is visible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
