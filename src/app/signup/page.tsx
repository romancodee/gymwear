"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    // role: "user",
    // isActive: true,
  });
  const [berror,bsetError]=useState("");
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const [buttonDisable, setButtonDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (berror) {
      const timer = setTimeout(() => {
        bsetError('');
      }, 2000);
      return () => clearTimeout(timer); 
    }
  }, [berror]);

 
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 2000);
      return () => clearTimeout(timer); 
    }
  }, [success]);
  const validateForm = () => {
    const newErrors: any = {};

    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;

    if (!nameRegex.test(user.firstname)) {
      newErrors.firstname = "First name must contain only letters.";
    }

    if (!nameRegex.test(user.lastname)) {
      newErrors.lastname = "Last name must contain only letters.";
    }

    if (!emailRegex.test(user.email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!passwordRegex.test(user.password)) {
      newErrors.password =
        "Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 special character.";
    }

    if (user.password !== user.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: user.password,
          // role: user.role,
          // isActive: user.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
       
        toast.error("Signup failed: " + (data.error || "Unknown error"));
        bsetError(data.error);
        setSuccess("");
      } else {
      setSuccess(data.message);
      bsetError("");
        toast.success("Signed up successfully!");

        router.push("/login");

      }
    } catch (err: any) {
      toast.error("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isFormFilled =
      user.firstname &&
      user.lastname &&
      user.email &&
      user.password &&
      user.confirmpassword;
    setButtonDisable(!isFormFilled);
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {loading ? "Loading..." : "Sign Up"}
        </h2>
        <form className="space-y-4" onSubmit={handle}>
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={user.firstname}
              onChange={(e) => setUser({ ...user, firstname: e.target.value })}
              className="w-full border rounded px-4 py-2"
            />
            {errors.firstname && (
              <p className="text-red-600 text-sm mt-1">{errors.firstname}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Last Name"
              value={user.lastname}
              onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              className="w-full border rounded px-4 py-2"
            />
            {errors.lastname && (
              <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full border rounded px-4 py-2"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full border rounded px-4 py-2"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={user.confirmpassword}
              onChange={(e) =>
                setUser({ ...user, confirmpassword: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />
            {errors.confirmpassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmpassword}
              </p>
            )}
          </div>

          {/* Role Dropdown
          <div>
            <label className="block mb-1 text-sm text-gray-600">Role</label>
            <select
              
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              className="w-full border rounded px-4 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div> */}

          {/* isActive Dropdown */}
          {/* <div>
            <label className="block mb-1 text-sm text-gray-600">Account Status</label>
            <select
              value={String(user.isActive)}
              onChange={(e) =>
                setUser({ ...user, isActive: e.target.value === "true" })
              }
              className="w-full border rounded px-4 py-2"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div> */}

<button
  type="submit"
  disabled={buttonDisable || loading}
  className={`w-full py-2 rounded text-white ${
    loading || buttonDisable ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
  }`}
>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

\
        {berror && (
  <p className="text-red-600 text-center mt-2 text-sm font-semibold">
    {berror}
  </p>
)}
{success && (
  <p className="text-green-600 text-center mt-2 text-sm font-semibold">
    {success}
  </p>
)}




        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
