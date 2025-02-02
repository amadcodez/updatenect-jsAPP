"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<any>({});
  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("email");

      if (!email) {
        alert("You must be logged in to access this page.");
        router.push("/Login"); // Redirect to Login page
        return;
      }

      try {
        // Fetch profile data
        const response = await fetch(`/api/profile?email=${email}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load profile data.");
        } else {
          setUserData(data);
          setUpdatedData(data); // Set editable data
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("An unexpected error occurred while fetching profile data.");
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  const handleProfilePictureUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdatedData({
        ...updatedData,
        profilePicture: reader.result as string,
      });
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        if (updatedData.password) {
          alert("Password updated. Please log in again.");
          localStorage.clear();
          router.push("/Login");
        }
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving profile data:", err);
      alert("An error occurred while saving profile data.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/Login");
  };

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!userData) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <div className="profileContainer p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-center text-[#0F6466]">
        Welcome, {userData.firstName} {userData.lastName}
      </h1>
      <div className="mt-4 text-center bg-white p-6 rounded shadow-lg max-w-lg mx-auto">
        {isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block font-medium">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={updatedData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block font-medium">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={updatedData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-medium">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  value={updatedData.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label htmlFor="profilePicture" className="block font-medium">
                  Profile Picture:
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="w-full p-2"
                />
                {profilePicturePreview && (
                  <img
                    src={profilePicturePreview}
                    alt="Preview"
                    className="mt-4 w-24 h-24 rounded-full object-cover mx-auto"
                  />
                )}
              </div>

              <div className="space-x-2 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {userData.profilePicture && (
              <img
                src={userData.profilePicture}
                alt="Profile"
                className="rounded-full w-32 h-32 mx-auto"
              />
            )}
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> {userData.email}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Contact Number:</strong>{" "}
              {userData.contactNumber || "Not provided"}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-500 text-white py-2 px-4 rounded mt-4"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded mt-2 block mx-auto"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
