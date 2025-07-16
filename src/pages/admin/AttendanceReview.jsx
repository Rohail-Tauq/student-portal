import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import "./AttendanceReview.css";

function AttendanceReview() {
  const [records, setRecords] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all student names
  const fetchStudentNames = async () => {
    const userSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "student"))
    );
    const map = {};
    userSnapshot.forEach((doc) => {
      map[doc.id] = doc.data().name;
    });
    setStudentMap(map);
  };

  // 🔹 Fetch attendance records
  useEffect(() => {
    const fetchData = async () => {
      // 1. Get attendance submissions
      const q = query(collection(db, "attendance"), where("approved", "==", false));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(list);

      // 2. Get student names
      await fetchStudentNames();

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "attendance", id), {
      approved: true,
    });
    setRecords(records.filter((rec) => rec.id !== id));
  };

  const handleReject = async (id) => {
    await deleteDoc(doc(db, "attendance", id));
    setRecords(records.filter((rec) => rec.id !== id));
  };

  return (
    <div className="review-container">
      <h2>Attendance Submissions (Pending Approval)</h2>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No pending records.</p>
      ) : (
        records.map((rec) => (
          <div key={rec.id} className="record-card">
            <h3>Class: {rec.class} | Date: {rec.date}</h3>
            <p><strong>Submitted by:</strong> {rec.teacher}</p>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rec.status).map(([studentId, status]) => (
                  <tr key={studentId}>
                    <td>{studentMap[studentId] || studentId}</td>
                    <td>{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="btn-group">
              <button className="approve-btn" onClick={() => handleApprove(rec.id)}>Approve</button>
              <button className="reject-btn" onClick={() => handleReject(rec.id)}>Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AttendanceReview;
