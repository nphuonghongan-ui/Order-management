import React, { useState } from "react";
import {Toaster, toast} from 'sonner';

export default function PurchaseOrder() {
  const [products, setProducts] = useState([
    { code: "", desc: "", qty: 0, price: 0 }
  ]);

  // thêm dòng mới
  const addRow = () => {
    setProducts([...products, { code: "", desc: "", qty: 0, price: 0 }]);
  };

  // update input
  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  // tính tổng
  const grandTotal = products.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Product List</h1>

      {/* TABLE */}
      <table className="w-full border mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Product Code</th>
            <th className="p-2">Description</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Unit Price</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {products.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">
                <input
                  className="border p-1 w-full"
                  value={item.code}
                  onChange={(e) =>
                    updateProduct(index, "code", e.target.value)
                  }
                />
              </td>

              <td className="p-2">
                <input
                  className="border p-1 w-full"
                  value={item.desc}
                  onChange={(e) =>
                    updateProduct(index, "desc", e.target.value)
                  }
                />
              </td>

              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.qty}
                  onChange={(e) =>
                    updateProduct(index, "qty", Number(e.target.value))
                  }
                />
              </td>

              <td className="p-2">
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.price}
                  onChange={(e) =>
                    updateProduct(index, "price", Number(e.target.value))
                  }
                />
              </td>

              <td className="p-2 text-center">
                ${(item.qty * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BUTTON ADD */}
      <button
        onClick={addRow}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Add Product
      </button>

      {/* TOTAL */}
      <div className="text-right text-xl font-bold">
        Total: ${grandTotal.toFixed(2)}
      </div>
       
      <Toaster className = "text-right"/>
        <button onClick={() => toast('Order saved successfully!')} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Save Order
        </button>   
         </div>
    
  );
}
