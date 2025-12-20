import { useRef, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Camera, ArrowLeft, LogIn, LogOut, Clock } from "lucide-react"

const API_BASE_URL = "https://express-api-eight-brown.vercel.app"

export default function AttendanceScanner() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [checkInType, setCheckInType] = useState("checkin")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

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
      alert("Camera Error: Unable to access camera")
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
      // Ensure video is ready and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return
      }
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.7)
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

    console.log(`Sending ${endpoint} request. Image size: ${capturedImage.length}`)

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
        alert("Session expired or unauthorized. Please login again.")
        localStorage.removeItem("authToken")
        navigate("/")
        return
      }

      let data
      try {
        data = await response.json()
      } catch (err) {
        // If response is not JSON (e.g. 500 HTML error page), throw to catch block
        throw new Error(`Server Error: ${response.status} ${response.statusText}`)
      }

      if (response.ok) {
        alert(`${checkInType === "checkin" ? "Check-In" : "Check-Out"} Successful: ${data.message || "Attendance recorded"}`)
        setTimeout(() => {
          navigate("/records")
        }, 2000)
      } else {
        console.error("Server error:", data)
        alert(`Failed: ${data.error || data.message || "Unable to verify face"}`)
        setCapturedImage(null)
        startCamera()
      }
    } catch (error) {
      console.error(`Attendance error (${API_BASE_URL}):`, error)
      alert("Error: Unable to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Attendance Check</h1>
            <p className="text-muted-foreground">Verify your identity with face recognition</p>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setCheckInType("checkin")}
              className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 ${checkInType === "checkin" ? "bg-black text-white hover:bg-gray-800" : "border border-gray-200 bg-white hover:bg-gray-100 text-black"}`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Check In
            </button>
            <button
              onClick={() => setCheckInType("checkout")}
              className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 ${checkInType === "checkout" ? "bg-black text-white hover:bg-gray-800" : "border border-gray-200 bg-white hover:bg-gray-100 text-black"}`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out
            </button>
          </div>

          <div className="rounded-lg border bg-white text-black shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {checkInType === "checkin" ? "Check In" : "Check Out"}
              </h3>
              <p className="text-sm text-gray-500">Capture your face to mark attendance</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
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
                  <button onClick={startCamera} className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </button>
                )}

                {isStreaming && !capturedImage && (
                  <>
                    <button onClick={capturePhoto} className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </button>
                    <button onClick={stopCamera} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 h-10 px-4 py-2">
                      Cancel
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <button onClick={handleCheckIn} disabled={isLoading} className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2 disabled:opacity-50">
                      {isLoading ? "Verifying..." : `Confirm ${checkInType === "checkin" ? "Check In" : "Check Out"}`}
                    </button>
                    <button onClick={retake} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 h-10 px-4 py-2">
                      Retake
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
