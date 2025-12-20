import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, LogIn, LogOut, Clock, RefreshCw, CheckCircle } from "lucide-react"

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://express-api-eight-brown.vercel.app").replace(/\/$/, "")

export default function AttendanceScanner() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [checkInType, setCheckInType] = useState("checkin")
  const navigate = useNavigate()

  const MAIN_COLOR = "#3e6268"

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user", 
          width: { ideal: 480 }, 
          height: { ideal: 360 } 
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      alert("Camera Error: Unable to access camera. Please allow camera permissions.")
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
      if (video.videoWidth === 0 || video.videoHeight === 0) return

      // Optimized resolution: 400px balances speed (upload size) and accuracy
      const targetWidth = 400
      const aspectRatio = video.videoHeight / video.videoWidth
      canvas.width = targetWidth
      canvas.height = targetWidth * aspectRatio

      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.5)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const handleCheckIn = async () => {
    if (!capturedImage) return

    setIsLoading(true)
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
      return
    }

    const endpoint = checkInType === "checkin" ? "checkin" : "checkout"

    try {
      const response = await fetch(`${API_BASE_URL}/employee/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: capturedImage.split(",")[1] }),
      })

      if (response.status === 401) {
        alert("Session expired. Please login again.")
        localStorage.removeItem("authToken")
        navigate("/")
        return
      }

      let data
      try {
        data = await response.json()
      } catch (err) {
        throw new Error(`Server Error: ${response.status}`)
      }

      if (response.ok) {
        alert(`${checkInType === "checkin" ? "Check-In" : "Check-Out"} Successful!`)
        setTimeout(() => {
          navigate("/records")
        }, 1000)
      } else {
        alert(`Failed: ${data.error || data.message || "Verification failed"}`)
        setCapturedImage(null)
        startCamera()
      }
    } catch (error) {
      console.error(error)
      alert("Error: Connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 md:justify-center">
      <main className="w-full max-w-md mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#3e6268]">
            Attendance
          </h1>
          <p className="text-gray-500 text-sm">
            Scan your face to verify identity
          </p>
        </div>

        {/* Toggle Check In/Out */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex gap-1">
          <button
            onClick={() => setCheckInType("checkin")}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all duration-200 ${
              checkInType === "checkin"
                ? "bg-[#3e6268] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Check In
          </button>
          <button
            onClick={() => setCheckInType("checkout")}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all duration-200 ${
              checkInType === "checkout"
                ? "bg-[#3e6268] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        </div>

        {/* Camera Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Card Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3e6268] font-semibold">
              <Clock className="w-5 h-5" />
              <span>{checkInType === "checkin" ? "Morning Entry" : "Evening Exit"}</span>
            </div>
            {isStreaming && (
              <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>

          {/* Video Area */}
          <div className="relative bg-gray-900 aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
            {!isStreaming && !capturedImage && (
              <div className="text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">Camera is currently off</p>
              </div>
            )}

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transform scale-x-[-1] ${
                isStreaming && !capturedImage ? "block" : "hidden"
              }`}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Buttons */}
          <div className="p-4 md:p-6 space-y-3">
            {!isStreaming && !capturedImage && (
              <button
                onClick={startCamera}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#3e6268] text-white font-semibold shadow-lg shadow-[#3e6268]/20 hover:bg-[#324f54] active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            )}

            {isStreaming && !capturedImage && (
              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-[2] h-12 flex items-center justify-center gap-2 rounded-xl bg-[#3e6268] text-white font-semibold shadow-lg shadow-[#3e6268]/20 hover:bg-[#324f54] active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  Capture
                </button>
              </div>
            )}

            {capturedImage && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#3e6268] text-white font-semibold shadow-lg shadow-[#3e6268]/20 hover:bg-[#324f54] disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Verifying...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm {checkInType === "checkin" ? "Check In" : "Check Out"}
                    </>
                  )}
                </button>
                <button
                  onClick={retake}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 text-gray-600 font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Photo
                </button>
              </div>
            )}
          </div>
        </div>
        
      </main>
    </div>
  )
}