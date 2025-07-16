// src/pages/admin/AdminDashboard.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
    class: "",
    subjects: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // Add user data in Firestore
      await setDoc(doc(db, "users", uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        class: formData.class,
        subjects:
          formData.role === "teacher"
            ? formData.subjects.split(",").map((s) => s.trim())
            : [],
      });

      setMessage(`✅ ${formData.role} account created successfully!`);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "teacher",
        class: "",
        subjects: "",
      });
    } catch (error) {
      console.error("Error creating user:", error.message);
      setMessage("❌ Failed to create user. " + error.message);
    }
  };

  return (
    <div className="admin-container">
      <h2>Create Teacher or Student</h2>
      <form onSubmit={handleCreate} className="admin-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Temporary Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
        <input
          type="text"
          name="class"
          placeholder="Class (e.g. 10-A)"
          value={formData.class}
          onChange={handleChange}
          required
        />
        {formData.role === "teacher" && (
          <input
            type="text"
            name="subjects"
            placeholder="Subjects (comma separated)"
            value={formData.subjects}
            onChange={handleChange}
          />
        )}
        <button type="submit">Create User</button>
        {message && <p className="message">{message}</p>}
      </form>
      <div style={{ marginTop: "30px" }}>
      <Link to="/admin/review">
        <button className="review-btn">Review Attendance</button>
      </Link>
    </div>
    </div>
  );
}

export default AdminDashboard;
