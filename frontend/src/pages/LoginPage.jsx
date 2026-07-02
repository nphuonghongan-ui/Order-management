import React from "react";
import { User, Lock } from "lucide-react";

export default function LoginCard() {
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 via-indigo-200 to-purple-300 relative overflow-hidden">
      
      {/* background hills */}

      {/* card */}
      <div className="w-[420px] rounded-2xl shadow-2xl overflow-hidden bg-white z-10">
        
        {/* top gradient header */}
        <div className="bg-gradient-to-b from-purple-900 via-indigo-700 to-sky-500 text-white text-center px-10 py-14">
          <h1 className="text-3xl font-light tracking-widest mb-6">
            HELLO & WELCOME
          </h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Mời bạn đăng nhập để tiếp tục sử dụng ứng dụng quản lý công việc của chúng tôi. 
          </p>
        </div>

        {/* form */}
        <div className="px-10 py-10">
          <h2 className="text-center text-gray-500 tracking-[6px] font-semibold mb-8">
            USER LOGIN
          </h2>

          {/* username */}
          <div className="flex items-center bg-slate-200 rounded-full px-4 py-3 mb-5">
            <User className="text-gray-500 mr-3" size={18} />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* password */}
          <div className="flex items-center bg-slate-200 rounded-full px-4 py-3 mb-4">
            <Lock className="text-gray-500 mr-3" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* remember + forgot */}
          <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember
            </label>
            <button className="hover:text-indigo-600">
              Forget Password?
            </button>
          </div>

          {/* login button */}
          <button className="w-full py-3 rounded-full text-white font-semibold tracking-widest bg-gradient-to-r from-purple-800 to-sky-500 hover:opacity-90 transition">
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}