'use client';
import { Preahvihear } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EditProduct from '../../../components/EditProduct'
import product from '@/app/model/product';

type sizeOption={
    value: string,
      stock:string
}
type Product = {
  _id: string;
  name: string;
  price: number;
  decription:string;
  sizes:sizeOption[];
  category: string;
  isActive: boolean;
  countInStock: number;
  image?: string;
  stock:string
  
};

const Page = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [error, setError] = useState('');
  const [productData, setProductData] = useState<Product[]>([]);
  const [editingProduct,setEditingProduct]=useState<Product| null>(null)

  const openEditPopup=(product:Product)=>setEditingProduct(product)
  const limit=4

  const handleStatusChange = async (productId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/product/editproduct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product status');
      }
  setProductData((prev) =>
      prev.map((prod) =>
        prod._id === productId ? { ...prod, isActive: newStatus } : prod
      )
    );
    toast.success("status updated")
    } catch (error: any) {
      setError(error.message);
      console.error('Status update failed:', error.message);
    }
  };
  useEffect(() => {
  if (editingProduct) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, [editingProduct]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/admin/product/editproduct?page=${page}&limit=${limit}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product data');
        }

        const { products = [], totalPages = 1, page: currentPage = 1 } = data;
        setProductData(products);
        setTotalPages(totalPages);
        setPage(currentPage);
      } catch (error: any) {
        setError(error.message);
        console.log('Fetch failed:', error.message);
      }
    };

    fetchData();
  }, [page]);

  return (
    <div className="min-h-screen w-full px-4 py-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-6xl overflow-x-auto shadow-md rounded-lg mb-6 bg-blue-600">
        <div className="flex justify-between items-center px-4 py-2">
          <h2 className="text-xl font-bold text-white">Product List</h2>
        </div>
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-3 text-left">#</th>
              <th className="border p-3 text-left">Product Name</th>
              <th className="border p-3 text-left">Price</th>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Is Active</th>
              <th className="border p-3 text-left">Stock</th>
              <th className="border p-3 text-left">Image</th>
              <th className="border p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {productData.length > 0 ? (
              productData.map((product, index) => (
                <tr key={product._id}>
                  <td className="border p-3">{(page - 1) * limit + index + 1}</td>
                  <td className="border p-3">{product.name}</td>
                  <td className="border p-3">{product.price}</td>
                  <td className="border p-3">{product.category}</td>
                  <td className="border p-3">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={product.isActive}
                          // value={product.isActive}
                          onChange={() =>
                            handleStatusChange(product._id, !product.isActive)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-600 transition-all duration-300"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                      </label>
                      <span className="ml-2 text-sm text-gray-700">
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="border p-3">{product.countInStock}</td>
                  <td className="border p-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt="Product"
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td className="border p-3">
                    <div className="flex gap-2">
                      <button
                     onClick={() => openEditPopup(product)}
>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-pencil-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  {error ? error : 'No products found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(1)}
          className={`px-4 py-2 rounded-lg font-medium ${
            page <= 1
              ? 'bg-indigo-200 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          &lt;&lt;
        </button>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className={`px-4 py-2 rounded-lg font-medium ${
            page <= 1
              ? 'bg-indigo-200 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(page - 3, 0), Math.min(page + 2, totalPages))
          .map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg font-medium ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-200 hover:bg-indigo-300'
              }`}
            >
              {p}
            </button>
          ))}
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={`px-4 py-2 rounded-lg font-medium ${
            page >= totalPages
              ? 'bg-indigo-200 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          &gt;
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(totalPages)}
          className={`px-4 py-2 rounded-lg font-medium ${
            page >= totalPages
              ? 'bg-indigo-200 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          &gt;&gt;
        </button>
      </div>
   {editingProduct && (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto relative">
      <button
        onClick={() => setEditingProduct(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
      >
        ✖
      </button>

      <EditProduct productId={editingProduct._id} />
    </div>
  </div>
)}


    </div>
  );
};

export default Page;
