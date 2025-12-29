import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const getCambodiaTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }));
};

const Home = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default to 'week'
  const [filterType, setFilterType] = useState("week");
  const [employeeName, setEmployeeName] = useState("You");
  const [currentTime, setCurrentTime] = useState(getCambodiaTime());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("--:--");
  const [checkOutTime, setCheckOutTime] = useState("--:--");
  const [timeStatus, setTimeStatus] = useState("Absent");
  const [stats, setStats] = useState({ present: 0, late: 0, early: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    } else {
      fetchAttendanceHistory(filterType);
    }
  }, [navigate, filterType]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCambodiaTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceHistory = async (range) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/employee/attendance-history?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (err) {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "Attendance endpoint not found (404). Check backend routes."
            );
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        throw new Error("Invalid JSON response");
      }

      if (response.ok) {
        if (result.employee) {
          setEmployeeName(
            `${result.employee.first_name} ${result.employee.last_name}`
          );
        }

        const mappedData = (result.data || []).map((record) => ({
          id: record.id,
          employeeName: result.employee
            ? `${result.employee.first_name} ${result.employee.last_name}`
            : "You",
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          timeStatus: determineTimeStatus(record.check_in_time, record.status_time),
          status: record.status,
          statusTime: record.status_time,
        }));

        const todayStr = getCambodiaTime().toDateString();
        const todayRecord = mappedData.find(
          (record) => new Date(record.checkIn).toDateString() === todayStr
        );

        if (todayRecord) {
          setIsClockedIn(!todayRecord.checkOut);
          setTimeStatus(todayRecord.timeStatus);
          setCheckInTime(
            new Date(todayRecord.checkIn).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          setCheckOutTime(
            todayRecord.checkOut
              ? new Date(todayRecord.checkOut).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"
          );
        } else {
          setIsClockedIn(false);
          setTimeStatus("Absent");
          setCheckInTime("--:--");
          setCheckOutTime("--:--");
        }

        setAttendanceRecords(mappedData);

        // Calculate Stats
        const uniqueDates = new Set();
        let lateCount = 0;
        let earlyCount = 0;

        const now = getCambodiaTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        mappedData.forEach((record) => {
          const recordDate = new Date(record.checkIn);
          if (recordDate >= startOfMonth && recordDate <= now) {
            if (record.status === 'present') {
              const dateStr = recordDate.toDateString();
              if (!uniqueDates.has(dateStr)) {
                uniqueDates.add(dateStr);
                // Check status from backend or derived timeStatus
                if (record.timeStatus === 'Late') {
                  lateCount++;
                } else if (record.timeStatus === 'Early') {
                  earlyCount++;
                }
              }
            }
          }
        });

        setStats({
          present: result.stats?.present || 0,
          late: lateCount,
          early: earlyCount
        });

        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(error.message);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const determineTimeStatus = (checkInTime, statusTime) => {
    if (!checkInTime) return "Absent";

    if (statusTime && ["Early", "Late", "On Time"].includes(statusTime)) {
      return statusTime;
    }

    const date = new Date(checkInTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    // Late if > 8:15 AM
    if (hour < 8) return "Early";
    return (hour > 8 || (hour === 8 && minute > 15)) ? "Late" : "On Time";
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden  text-slate-800">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#3e6268] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="absolute top-[-6%] right-[-20%] p-4 opacity-10 pointer-events-none rotate-16 opacity-0.1">
          <svg
            className="w-56 h-56 opacity-30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </div>
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div className=" items-center gap-4">
            {/* Logo Image */}
            <img
              src="/attendancenine-color.png"
              className="h-12 w-auto object-contain"
              style={{ height: 85, marginLeft: 20 }}
              alt="Logo"
            />
            <div className="hidden md:block w-px h-10 bg-slate-300"></div>
            <div className="mx-12 md:mx-4">
              <h1 className="text-2xl font-bold text-slate-800">
                Hello, {employeeName},
              </h1>
              <p className="text-slate-500 text-sm">
                Let's have a productive day.
              </p>
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-sans">
          {/* --- LEFT COLUMN: Attendance Status Widget (Takes 2/3 width) --- */}
          <div className="md:col-span-2 bg-gradient-to-r from-[#3e6268] to-slate-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group min-h-[340px]">
            {/* Decorative Background Icon */}

            {/* Top Section: Date & Status Badge */}
            <div className="relative z-10 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-teal-200 font-medium tracking-wide uppercase text-xs">
                    Today's Activity
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {formatDate(currentTime)}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isClockedIn
                      ? "bg-green-500/20 border-green-400 text-green-300"
                      : "bg-slate-500/30 border-slate-400 text-slate-300"
                  }`}
                >
                  {timeStatus}
                </div>
              </div>
            </div>

            {/* Middle Section: Check In / Check Out Grid */}
            <div className="grid grid-cols-2 gap-8 relative z-10 mb-8">
              {/* Check In Time */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-teal-200 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Check In
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white">{checkInTime}</h3>
              </div>

              {/* Check Out Time */}
              <div className="flex flex-col pl-8 border-l border-teal-500/30">
                <div className="flex items-center gap-2 text-teal-200 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ marginLeft: -5 }}
                  >
                    Check Out
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white opacity-50">
                  {checkOutTime}
                </h3>
              </div>
            </div>

            {/* Bottom Section: Full Width Button */}
            <div className="relative z-10 mt-auto">
              <button
                onClick={() => navigate("/AttendanceScanner")}
                className="w-full py-4 bg-white hover:bg-teal-50 text-[#3e6268] rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  ></path>
                </svg>
                Scan Attendance
              </button>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Stats Cards (Takes 1/3 width) --- */}
          <div className="flex flex-col gap-4">
            {/* Present Card (Emerald Tint) */}
            <div
              onClick={() => navigate("/records")}
              className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-100 flex items-center justify-between hover:bg-emerald-100/80 transition-colors h-full cursor-pointer"
            >
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                  Present
                </p>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  {stats.present}{" "}
                  <span className="text-sm text-slate-400 font-normal">
                    days
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Late Card (Amber Tint) */}
            <div
              onClick={() => navigate("/records")}
              className="bg-amber-50/80 p-5 rounded-3xl border border-amber-100 flex items-center justify-between hover:bg-amber-100/80 transition-colors h-full cursor-pointer"
            >
              <div>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                  Late Arrival
                </p>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  {stats.late}{" "}
                  <span className="text-sm text-slate-400 font-normal">
                    days
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Early Card (Blue Tint) */}
            <div
              onClick={() => navigate("/records")}
              className="bg-blue-50/80 p-5 rounded-3xl border border-blue-100 flex items-center justify-between hover:bg-blue-100/80 transition-colors h-full cursor-pointer"
            >
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Early
                </p>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  {stats.early}{" "}
                  <span className="text-sm text-slate-400 font-normal">
                    days
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
