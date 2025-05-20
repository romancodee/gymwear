"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface EdituserProps {
    userId: string;
    onSuccess: (updatedUser: any) => Promise<void>;
    onError: (msg: string) => void;
  }
  
  const Edituser: React.FC<EdituserProps> = ({ userId, onSuccess, onError }) => {
  const [user, setUser] = useState<UserData>({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    isActive: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
  useEffect(()=>{
    const fetchuser=async()=>{
try{
    const response = await fetch(`/api/admin/user/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const res= await response.json()
      if(!response.ok){
        console.log("failed to fetch user")
        throw new Error("Failed to fetch user details.");
      }
      setUser(res)
      console.log("Edit succusfully")


}
catch(error:any){
    setErrors(error.message||"failed to fetch user")

}

    }
    fetchuser()
  },[userId, onError])

  useEffect(() => {
    const isFormFilled =
      user.firstname && user.lastname && user.email && user.role;
    setButtonDisable(!isFormFilled);
  }, [user]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(user.firstname)) {
      newErrors.firstname = "First name must contain only letters.";
    }
    if (!nameRegex.test(user.lastname)) {
      newErrors.lastname = "Last name must contain only letters.";
    }
    if (!emailRegex.test(user.email)) {
      newErrors.email = "Invalid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name: keyof UserData, value: string) => {
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      switch (name) {
        case "firstname":
        case "lastname":
          if (!nameRegex.test(value)) newErrors[name] = "Must contain only letters.";
          else delete newErrors[name];
          break;
        case "email":
          if (!emailRegex.test(value)) newErrors.email = "Invalid email address.";
          else delete newErrors.email;
          break;
      }

      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");  // Clear previous messages
    setErrorMessage("");
    if (!validateForm()) {
      const errorText = "Please fix the errors in the form.";
      setErrorMessage(errorText);
      onError(errorText);
      onError("Please fix the errors in the form.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "PUT", // Use PUT or PATCH for updating resources
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user), // Pass the updated user data in the body
      });
      const data = await res.json();
      if (!res.ok) {
        const errorText = data.message || "Update failed.";
        setErrorMessage(errorText);
        onError(data.error || "Update failed.");
        return;
      }
      setUser(data)
      setSuccessMessage("User updated successfully!");
      toast.success("User updated successfully!");
      onSuccess(data);
    } catch (err: any) {
      const errorText = err.message || "Something went wrong.";
      setErrorMessage(errorText);
      onError(errorText)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {successMessage && (
  <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2">
    {successMessage}
  </div>
)}
{errorMessage && (
  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">
    {errorMessage}
  </div>
)}

      <input
        type="text"
        placeholder="First Name"
        value={user.firstname}
        onChange={(e) => {
          setUser({ ...user, firstname: e.target.value });
          validateField("firstname", e.target.value);
        }}
        className="w-full border rounded px-4 py-2"
      />
      {errors.firstname && <p className="text-red-600 text-sm">{errors.firstname}</p>}

      <input
        type="text"
        placeholder="Last Name"
        value={user.lastname}
        onChange={(e) => {
          setUser({ ...user, lastname: e.target.value });
          validateField("lastname", e.target.value);
        }}
        className="w-full border rounded px-4 py-2"
      />
      {errors.lastname && <p className="text-red-600 text-sm">{errors.lastname}</p>}

      <input
        type="text"
        placeholder="Email"
        value={user.email}
        // // onChange={(e) => {
        // //   setUser({ ...user, email: e.target.value });
        // //   validateField("email", e.target.value);
        // }}
        readOnly
        className="w-full border rounded px-4 py-2"
      />
      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

      <select
        value={user.role}
        onChange={(e) => {
          const newRole = e.target.value;
          setUser({ ...user, role: newRole });
          console.log("Updated role:", newRole);
        }}
        className="w-full border rounded px-4 py-2"
      >
        <option value="">Select Role</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="flex gap-2 items-center">
      <p className="text-bold mr-4 ">Status</p>
      {user.isActive&&
  <label className="flex items-center gap-1">
  
    <input
      type="radio"
      name={`status-${userId}`}
      className={user.isActive ? "accent-green-600" : "accent-gray-300"}
      // onChange={() => setUser({ ...user, isActive: true })}
      checked={user.isActive}
      disabled={!user.isActive}
      readOnly
    />
   <span>Active</span>
    
  </label>}
  {!user.isActive&&
  
  <label className="flex items-center gap-1">
    <input
      type="radio"
      name={`status-${userId}`}
      className={!user.isActive ? "accent-red-600" : "accent-gray-300"}
      // onChange={() => setUser({ ...user, isActive: false })}
      checked={!user.isActive}
      disabled={user.isActive}
      readOnly
    />
    
    <span>In Active</span>
  
    </label>}
    
  
</div>


      {/* <div className="flex items-center gap-2">
        <label className="text-sm">Status:</label>
        <button
          type="button"
          onClick={() => setUser({ ...user, isActive: !user.isActive })}
          className={`px-4 py-2 rounded text-white ${
            user.isActive ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </button>
      </div> */}

      <button
        type="submit"
        disabled={buttonDisable || loading}
        className={`w-full py-2 rounded text-white ${
          loading || buttonDisable ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Submitting..." : "Submitt"}
      </button>
    </form>
  );
};

export default Edituser;
