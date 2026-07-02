import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PO from "@/components/PO";

const Addtask = () => {
  return (
    <Card className  = "w-full">
      <CardHeader>
        <CardTitle className = "text-lg font-bold">Add order +</CardTitle>
      </CardHeader>
      <CardContent>
        <p className = "text-lg font-bold">Customer info</p>
        <input
          type="text"
          placeholder="Nhập tên khách hàng..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />  
        <p className = "text-lg font-bold">Purchase Order</p>
        
        <p className = "text-lg font-bold">PO number</p>
        <input
          type="text"
          placeholder="Nhập số PO..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <p className = "text-lg font-bold">Order Date</p>
        
        
        <input
          type="text"
          placeholder="Nhập ngày đặt hàng..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <p className = "text-lg font-bold">Deliver date</p>
        <input
          type="text"
          placeholder="Nhập ngày giao hàng..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className = "text-lg font-bold">Order from</p>
        <input
          type="text"
          placeholder="Nhập địa chỉ..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <p className = "text-lg font-bold">Deliver to</p>
        <input
          type="text"
          placeholder="Nhập địa chỉ giao hàng..."
          className="w-half p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <PO/>
  
      </CardContent>
    </Card>
  );
};

export default Addtask;



