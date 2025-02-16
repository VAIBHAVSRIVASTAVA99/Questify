import React, { useState } from "react";
import axios from "axios";
import { Code2, Send } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/store-email`, { 
        email, 
        platform: "LeetCode" 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Code2 size={32} className="text-blue-200" />
              <h2 className="text-2xl font-bold">LeetCode Daily</h2>
            </div>
            <p className="text-blue-100 text-center">
              Level up your coding skills with daily LeetCode challenges delivered straight to your inbox
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium 
                  ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'} 
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
}

export default App;
