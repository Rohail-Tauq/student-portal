// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  // Get teacher's own data
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      const docSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email))
      );
      if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        setTeacherData(data);
        fetchStudents(data.class); // Load students of their class
      }
    };

    const fetchStudents = async (className) => {
      const q = query(
        collection(db, "users"),
        where("class", "==", className),
        where("role", "==", "student")
      );
      const querySnapshot = await getDocs(q);
      const studentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    };

    if (user) fetchTeacherInfo();
  }, [user]);

  // Mark attendance toggle
  const handleAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Submit attendance to Firestore
  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      // Check if attendance already submitted for this class today
      const q = query(
        collection(db, "attendance"),
        where("class", "==", teacherData.class),
        where("date", "==", today)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setMessage("⚠️ Attendance already submitted for today.");
        return;
      }

      await addDoc(collection(db, "attendance"), {
        teacher: user.email,
        class: teacherData.class,
        date: today,
        status: attendance,
        approved: false,
      });

      setMessage("✅ Attendance submitted for approval!");
    } catch (err) {
      console.error("Error submitting attendance", err);
      setMessage("❌ Failed to submit.");
    }
  };

  return (
    <div className="teacher-container">
      <h2>Welcome, {teacherData?.name}</h2>
      <h4>Class: {teacherData?.class}</h4>
      <h4>Subjects: {teacherData?.subjects?.join(", ")}</h4>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id}>
              <td>{stu.name}</td>
              <td>
                <input
                  type="radio"
                  name={stu.id}
                  onChange={() => handleAttendance(stu.id, "Present")}
                  checked={attendance[stu.id] === "Present"}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={stu.id}
                  onChange={() => handleAttendance(stu.id, "Absent")}
                  checked={attendance[stu.id] === "Absent"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="submit-btn" onClick={handleSubmit}>
        Submit Attendance
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TeacherDashboard;
