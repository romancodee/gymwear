'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import UserForm from '../../components/UserCreate'
import { usePathname } from 'next/navigation';
import Edituser from '../../components/EditUser'

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  role: string;
  password: string;
}

export default function AdminUserPage() {
  const [userDetail, setUserDetail] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message,setMessage]=useState('')
  const [Page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLogout, setShowLogout] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
const [editMessage, setEditMessage] = useState('');
  const [errorB,setBError]=useState("")
  const router = useRouter();
  const pathname=usePathname()
  const limit = 2;
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const openEditPopup = (userId: string) => setEditingUserId(userId);
  const closeEditPopup = () => setEditingUserId(null);
  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const handleUpdateUser = (updatedUser: User) => {
    // Update the user in the state
    setUserDetail(prevUsers =>
      prevUsers.map(user => (user._id === updatedUser._id ? updatedUser : user))
    );
  };

  const deletetheuser = async (userId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: "DELETE",
      });
  
      if (!res.ok) {
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (err) {
          // If response is not valid JSON, ignore
        }
        throw new Error(errorMessage);
      }
  
      toast.success("User deleted successfully");
  
      // Update UI state
      setUserDetail((prev) => prev.filter((user) => user._id !== userId));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong while deleting user");
    }
  };
  

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    setMessage("")
    try {

      // setUserDetail((prev) =>
      //   prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
      // );
      const res = await fetch(`/api/admin/user/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if(!res.ok){
        const errorData = await res.json();
      setMessage(errorData);
      throw new Error(errorData.message || 'Failed to update status');
      }
  
     toast.success("update Status successfully")
     setMessage("update Status successfully")
  
      // Update frontend state
      setUserDetail((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
      );
    } catch (err:any) {
      // console.error(err);

      toast.error(err.message || "Something went wrong while updating status");
    }
  };
  

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/user/detail?page=${Page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch users');
      }

      const res = await response.json();
      setUserDetail(res.users || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (createMessage || editMessage) {
      const timer = setTimeout(() => {
        setCreateMessage('');
        setEditMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [createMessage, editMessage]);
  useEffect(() => {
    fetchUsers();
  }, [Page]);

  const logouts = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Logout failed');
      }

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 ml-4px">
      {/* Sidebar */}
      {/* <aside className="fixed top-0 left-0 z-40 h-full bg-black text-white w-20 sm:w-26 md:w-24 lg:w-44">
      <div className="flex flex-col p-4 space-y-2">
        <Link
          href="/admin/dashboard"
          className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin/dashboard" ? "bg-gray-700" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/usermanagment"
          className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin" ? "bg-gray-700" : ""}`}
        >
          User Management
        </Link>
         <Link
          href="/admin/product"
          className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin" ? "bg-gray-700" : ""}`}
        >
          Products
        </Link>
      </div>
    </aside> */}

    
      <main className="flex-1 p-6 ml-20 sm:ml-[104px] md:ml-24 lg:ml-44">
        {/* Header */}
        <header className="mb-6 border-b pb-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
          <div
            className="relative inline-block"
            onMouseEnter={() => setShowLogout(true)}
            onMouseLeave={() => setShowLogout(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="currentColor"
              className="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path
                fillRule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
              />
            </svg>
            {showLogout && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0 bg-white rounded-lg shadow-lg w-25">
                <ul className="text-gray-700 font-medium">
                  <li>
                    <button
                      onClick={logouts}
                      className="w-25 text-left px-4 py-2 mt-0 hover:bg-gray-100 rounded-tl-lg rounded-tr-lg font-bold"
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* User Table */}
        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg mb-6 bg-blue-600">
              <div className="flex justify-between items-center px-4 py-2">
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <button
                  className="bg-white text-blue-600 font-bold px-3 py-1 rounded-lg hover:bg-gray-100"
                  onClick={handleOpenPopup}
                >
                  Create
                </button>
              </div>

              <Popup open={showPopup} onClose={handleClosePopup} modal>
                <div className="flex justify-center items-center ">
                <div className=" bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-end">
  
</div>
<div className='text-2xl font-semibold text-center mb-3 bg-blue-600 text-white py-2 rounded flex justify-between items-center '>
<h2 className=" mx-4">
  Create New User
</h2>
      
<button
    onClick={handleClosePopup}
    className="bg-red-100 text-red-700 py-1 px-3 mb-1  rounded-lg font-medium hover:bg-red-200 transition mx-4"
  >
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
</svg>
  </button>
  </div>
               <UserForm
                    onSuccess={async () => {
                      setEditMessage("user Created Successfully")
                      handleClosePopup();
                      toast.success('User created successfully!');
                      
                      await fetchUsers();
                    }}
                    onError={(msg) => {
                      toast.error(msg || 'Failed to create user.');
                      setCreateMessage(`Failed to create user: ${msg}`);
                    }}
                  />
                   {createMessage&& (
      <p className="mt-3 text-sm text-red-600 font-medium text-center bg-red-100 rounded-lg p-2">
        {createMessage}
      </p>)}
 
                </div>
                </div>
              </Popup>
              {/* {message} */}

              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border p-3 text-left">#</th>
                    <th className="border p-3 text-left">First Name</th>
                    <th className="border p-3 text-left">Last Name</th>
                    <th className="border p-3 text-left">Email</th>
                    <th className="border p-3 text-left">Is Active</th>
                    <th className="border p-3 text-left">Role</th>
                    <th className="border p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="border p-3 text-gray-400 italic">{user._id}</td>
                      <td className="border p-3">{user.firstname}</td>
                      <td className="border p-3">{user.lastname}</td>
                      <td className="border p-3">{user.email}</td>
                     <td className="border p-3">
  <div className="flex items-center gap-2">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={user.isActive}
        onChange={() => handleStatusChange(user._id, !user.isActive)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-all duration-300"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
    </label>
    <span className="ml-2 text-sm text-gray-700">
      {user.isActive ? "Active" : "Inactive"}
    </span>
  </div>
</td>




                      <td className="border p-3 capitalize">{user.role}</td>
                      <td className="border p-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditPopup(user._id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
</svg>
                          </button>
                         



                          <button onClick={() => deletetheuser(user._id)}
                             className="text-red-600 hover:text-red-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                disabled={Page <= 1}
                onClick={() => setPage(1)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  Page <= 1 ? 'bg-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                &lt;&lt;
              </button>
              <button
                disabled={Page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  Page <= 1 ? 'bg-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(Page - 3, 0), Math.min(Page + 2, totalPages))
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      page === Page ? 'bg-indigo-600 text-white' : 'bg-indigo-200 hover:bg-indigo-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                disabled={Page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  Page >= totalPages ? 'bg-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                &gt;
              </button>
              <button
                disabled={Page >= totalPages}
                onClick={() => setPage(totalPages)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  Page >= totalPages ? 'bg-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                &gt;&gt;
              </button>
            </div>
          </>
        )}
         {editingUserId && (
<Popup open={!!editingUserId} onClose={closeEditPopup} closeOnDocumentClick={false}>
  <div 
    className="flex justify-center items-center " 
    onClick={(e) => e.stopPropagation()} // Prevent click bubbling
  >
    <div 
      className="bg-white rounded-lg p-6 shadow-lg" 
      onClick={(e) => e.stopPropagation()} // Also stop bubbling here
    >
      <div className="flex justify-end">
      </div>
      <div className="flex items-center justify-between mb-3 text-2xl font-semibold bg-blue-600 text-white py-2 px-4 rounded">
  <h2 className="mx-2">
    Edit User
  </h2>
  <button
    onClick={closeEditPopup}
    className="bg-red-100 text-red-700 py-1 px-3 rounded-lg font-medium hover:bg-red-200 transition mx-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      className="bi bi-x-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
    </svg>
  </button>
</div>

       
      
      
      <Edituser
        userId={editingUserId}
        onSuccess={async (updatedUser) => {
          setEditMessage("User edited successfully");
          closeEditPopup();
          toast.success("User edited successfully!");
          handleUpdateUser(updatedUser);
  
          await fetchUsers();
        }}
        onError={(msg) => {
          toast.error(msg || "Failed to edit user.");
          setEditMessage (`Failed to edit user: ${msg}`);
        }}
      />
      {editMessage && (
        <p className="mt-3 text-sm text-red-600 font-medium text-center bg-red-100 rounded-lg p-2">
          {editMessage}
        </p>
      )}
    </div>
  </div>
</Popup>

)}

      </main>
    </div>
  );
}
