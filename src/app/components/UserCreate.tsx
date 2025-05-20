"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const UserForm: React.FC<Props> = ({ onSuccess, onError }) => {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(true);

  useEffect(() => {
    const isFormFilled =
      user.firstname && user.lastname && user.email && user.password && user.confirmpassword;
    setButtonDisable(!isFormFilled);
  }, [user]);

  const validateForm = () => {
    const newErrors: any = {};
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;

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
      newErrors.password = "Password must include 1 uppercase, 1 lowercase, 1 special character.";
    }
    if (user.password !== user.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name: string, value: string) => {
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;

    setErrors((prevErrors: any) => {
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

        case "password":
          if (!passwordRegex.test(value))
            newErrors.password =
              "Password must include 1 uppercase, 1 lowercase, 1 special character.";
          else delete newErrors.password;

          // Re-validate confirm password
          if (user.confirmpassword && value !== user.confirmpassword) {
            newErrors.confirmpassword = "Passwords do not match.";
          } else {
            delete newErrors.confirmpassword;
          }
          break;

        case "confirmpassword":
          if (value !== user.password) {
            newErrors.confirmpassword = "Passwords do not match.";
          } else {
            delete newErrors.confirmpassword;
          }
          break;
      }

      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onError("Please fix the errors in the form.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Signup failed.");
        return;
      }

      toast.success("User created successfully!");
      onSuccess();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        onChange={(e) => {
          setUser({ ...user, email: e.target.value });
          validateField("email", e.target.value);
        }}
        className="w-full border rounded px-4 py-2"
      />
      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

      <input
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) => {
          setUser({ ...user, password: e.target.value });
          validateField("password", e.target.value);
        }}
        className="w-full border rounded px-4 py-2"
      />
      {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}

      <input
        type="password"
        placeholder="Confirm Password"
        value={user.confirmpassword}
        onChange={(e) => {
          setUser({ ...user, confirmpassword: e.target.value });
          validateField("confirmpassword", e.target.value);
        }}
        className="w-full border rounded px-4 py-2"
      />
      {errors.confirmpassword && (
        <p className="text-red-600 text-sm">{errors.confirmpassword}</p>
      )}

      <button
        type="submit"
        disabled={buttonDisable || loading}
        className={`w-full py-2 rounded text-white ${
          loading || buttonDisable ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
};

export default UserForm;
