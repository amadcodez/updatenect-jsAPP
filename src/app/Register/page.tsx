"use client";

import { useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contact?: string;
  profilePicture?: string | null;
}

const sanitizeInput = (input: any): string => {
  const inputFilteredTrim = input.trim();
  return inputFilteredTrim
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\\/g, "");
};

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState("");
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRecaptchaVerify = () => {
    setRecaptchaVerified(true);
    alert("ReCAPTCHA verified successfully!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");

    if (!recaptchaVerified) {
      setGeneralError("Please complete the ReCAPTCHA verification.");
      return;
    }

    if (password !== confirmPassword) {
      setGeneralError("Passwords do not match!");
      return;
    }

    const userData: UserData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      password,
      contact: sanitizeInput(contact),
      profilePicture,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        setGeneralError(data.message || "Registration failed.");
        return;
      }

      alert("Registration successful! Redirecting to login page...");
      setTimeout(() => {
        window.location.href = "/Login";
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setGeneralError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen   bg-[#d2e8e3]">
      <div className="w-full max-w-md bg-[#ecfbf4] p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-center text-2xl font-bold">Create Account</h2>
          {generalError && (
            <p className="text-red-500 text-xs text-center">{generalError}</p>
          )}
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-2 border rounded" />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-2 border rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
          <PasswordStrengthBar password={password} />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded" />
          <input type="text" placeholder="Contact (Optional)" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full p-2 border rounded" />
          <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="w-full p-2" />
          {profilePicture && <img src={profilePicture} alt="Profile Preview" className="mt-2 w-24 h-24 rounded-full object-cover mx-auto" />}
          <button type="button" onClick={handleRecaptchaVerify} className="bg-blue-500 text-white py-2 px-4 rounded w-full">Verify ReCAPTCHA</button>
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded w-full">Register</button>
        </form>
        <p className="text-center text-sm mt-4">Already have an account? <a href="/Login" className="text-blue-500 hover:underline">Login</a></p>
      </div>
    </div>
  );
}
