"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { METHODS } from "http";

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  useEffect(()=>{
    const fetchuser = async () => { 
     const response = await fetch('/api/user/profile/address', {
  method: "GET",
  headers: {
    'Content-Type': 'application/json',
  }
});
const data =await response.json();
if(data.success){
  setUser(data.user);
  console.log(data.user)

}
setLoading(false)
    }
    fetchuser()
  },[])
  const deleteAddress = async (id: string) => {
    const response = await fetch(`/api/user/profile/address/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addressId: id }), // ✅ send in body
  });
    
    const data = await response.json();
    if(data.success){
      setUser(data.user);
      }


  }
const setDefault = async (id: string) => {
  console.log("id from front end ", id);
  try{

  const res = await fetch("/api/user/profile/address/default", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addressId: id }),
  });

  const data = await res.json();

    if (!res.ok) {
      console.error("Error setting default address:", data.message || data.error);
      return;
    }

    if (data.success) {
      setUser(data.user); // Update user state with new default address
      console.log("Default address updated successfully:", data.user);
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
};

  const handleAddAddress = async () => {
    const res = await fetch("/api/user/profile/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    if (data.success) {
      console.log("user data ",data)
//      setUser({
//   ...user,
//   addresses: newAddress.isDefault
//     ? [newAddress, ...(user.addresses ?? []).map((a: any) => ({ ...a, isDefault: false }))]
//     : [...(user.addresses ?? []), newAddress],
// });
setUser(data.user)
      setShowForm(false);
      setNewAddress({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        isDefault: false,
      });
    }
  };

  if (loading) return <p>Loading...</p>;
return (
  <div className="p-6 max-w-4xl mx-auto space-y-8">
  {/* Profile Header */}
  <div className="text-center">
    <h2 className="text-3xl font-bold">{user?.firstname} {user?.lastname}</h2>
    <p className="text-gray-500 text-sm">{user?.email}</p>
  </div>

  {/* Add Address Button */}
  {!showForm && (
    <div className="text-center">
      <button
        onClick={() => setShowForm(true)}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition duration-300"
      >
        + Add New Address
      </button>
    </div>
  )}

  {/* Address Form */}
  {showForm && (
    <div className="bg-white p-6 rounded-xl shadow-lg border space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Add New Address</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="First Name" className="input" value={newAddress.firstName}
          onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })} />
        <input type="text" placeholder="Last Name" className="input" value={newAddress.lastName}
          onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })} />
        <input type="email" placeholder="Email" className="input" value={newAddress.email}
          onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })} />
        <input type="text" placeholder="Phone" className="input" value={newAddress.phone}
          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
        <input type="text" placeholder="Street Address" className="input" value={newAddress.address}
          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} />
        <input type="text" placeholder="City" className="input" value={newAddress.city}
          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
        <input type="text" placeholder="Zip Code" className="input" value={newAddress.zipCode}
          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
        <input type="text" placeholder="Country" className="input" value={newAddress.country}
          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newAddress.isDefault}
            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
          />
          Set as default
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleAddAddress}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Save
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Saved Addresses */}
  <div>
    <h3 className="text-xl font-semibold mb-4 text-gray-800">Saved Addresses</h3>

    {user?.addresses?.length > 0 ? (
      <div className="grid gap-6">
        {user.addresses.map((addr: any, index: number) => (
          <div key={index} className="border rounded-xl p-5 shadow-sm bg-white relative">
            {addr.isDefault && (
              <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                Default
              </span>
            )}

            <div className="space-y-1">
              <p className="font-semibold text-lg">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-gray-700">{addr.email}</p>
              <p className="text-sm text-gray-700">{addr.phone}</p>
              <p className="text-sm text-gray-800">{addr.address}, {addr.city}, {addr.zipCode}, {addr.country}</p>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr._id)}
                  className="text-sm px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => deleteAddress(addr._id)}
                className="text-sm px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">No addresses available.</p>
    )}
  </div>
</div>


  );
};

export default UserProfile;
