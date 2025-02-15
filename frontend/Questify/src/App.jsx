import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Code2, Trophy, Terminal } from 'lucide-react';
import Leetcode from './pages/Leetcode';
import Codeforces from './pages/Codeforces';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex justify-center flex-1">
                <div className="flex space-x-8">
                  <Link
                    to="/leetcode"
                    className="inline-flex items-center px-4 py-2 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Code2 className="w-5 h-5 mr-2" />
                    LeetCode
                  </Link>

                  <Link
                    to="/codeforces"
                    className="inline-flex items-center px-4 py-2 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Codeforces
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          <Routes>
            <Route path="/leetcode" element={<Leetcode />} />
            <Route path="/codeforces" element={<Codeforces />} />
            <Route path="/" element={<Leetcode />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
