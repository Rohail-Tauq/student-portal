// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./StudentDashboard.css";

function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 1: Get student data from Firestore
  useEffect(() => {
    const fetchStudentData = async () => {
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setStudentData(data);
        fetchAttendance(data.class, snap.docs[0].id); // Pass class and UID
      }
    };

    const fetchAttendance = async (className, studentId) => {
      const q = query(
        collection(db, "attendance"),
        where("class", "==", className),
        where("approved", "==", true)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map((doc) => ({
        date: doc.data().date,
        status: doc.data().status[studentId] || "N/A", // Get this student's status
      }));
      setAttendanceRecords(records);
      setLoading(false);
    };

    fetchStudentData();
  }, [user]);

  return (
    <div className="student-container">
      <h2>Welcome, {studentData?.name}</h2>
      <h4>Class: {studentData?.class}</h4>

      <h3>Your Attendance</h3>
      {loading ? (
        <p>Loading...</p>
      ) : attendanceRecords.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((rec, index) => (
              <tr key={index}>
                <td>{rec.date}</td>
                <td>{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentDashboard;
