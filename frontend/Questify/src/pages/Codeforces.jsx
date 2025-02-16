import React, { useState } from "react";
import axios from "axios";
import { Code2, Send } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Codeforces = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/store-email`, { 
        email, 
        platform: "Codeforces" 
      });

      toast.success(response.data.message || "Successfully subscribed!");
      setEmail("");
    } catch (error) {
      toast.error("Error subscribing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Code2 size={32} className="text-red-200" />
              <h2 className="text-2xl font-bold">Codeforces Daily</h2>
            </div>
            <p className="text-red-100 text-center">
              Get a new Codeforces challenge in your inbox every day!
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium 
                  ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'} 
                  transition-all duration-200 transform hover:scale-[1.02]`}
              >
                <span>{isLoading ? 'Subscribing...' : 'Subscribe Now'}</span>
                {!isLoading && <Send size={18} className="ml-2" />}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By subscribing, you agree to receive daily coding challenges. 
              You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Codeforces;
