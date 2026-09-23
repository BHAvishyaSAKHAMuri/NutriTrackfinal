import React from "react";

export function ProgressPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-gray-800">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              Your Progress 📈
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track your journey. Celebrate your wins. Become your best self!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50">
              📅 This Year <span className="text-gray-400 text-xs">▼</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Streak */}
          <div className="bg-red-50 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🔥 Current Streak
            </p>
            <div className="mt-3">
              <span className="text-3xl font-bold text-red-500">14</span>
              <span className="text-sm font-bold text-gray-700 ml-1">Days</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Keep it up!</p>
          </div>

          {/* Longest Streak */}
          <div className="bg-emerald-50 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📅 Longest Streak
            </p>
            <div className="mt-3">
              <span className="text-3xl font-bold text-emerald-600">28</span>
              <span className="text-sm font-bold text-gray-700 ml-1">Days</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Your record!</p>
          </div>

          {/* Goals Achieved */}
          <div className="bg-amber-50 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🏆 Goals Achieved
            </p>
            <div className="mt-3">
              <span className="text-3xl font-bold text-amber-500">7</span>
              <span className="text-sm font-bold text-gray-700 ml-1">Days</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Amazing progress!</p>
          </div>

          {/* Total Active Days */}
          <div className="bg-purple-50 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📈 Total Active Days
            </p>
            <div className="mt-3">
              <span className="text-3xl font-bold text-purple-600">186</span>
              <span className="text-sm font-bold text-gray-700 ml-1">Days</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">You're on fire!</p>
          </div>
        </div>

        {/* Yearly Activity Heatmap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
            <div>
              <h2 className="text-lg font-bold">Yearly Activity Heatmap</h2>
              <p className="text-sm text-gray-500 mt-1">Darker the color, more consistent your habits!</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-4 md:mt-0">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                <div className="w-3 h-3 rounded-sm bg-pink-200"></div>
                <div className="w-3 h-3 rounded-sm bg-pink-400"></div>
                <div className="w-3 h-3 rounded-sm bg-pink-500"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid (Mocked) */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] space-y-1.5">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                <div key={month} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-8 font-medium">{month}</div>
                  <div className="flex gap-1.5 flex-1">
                    {/* Mocking random active days */}
                    {Array.from({ length: 31 }).map((_, i) => {
                      // Simple logic to mock the pattern seen in the screenshot
                      let activeClass = "bg-gray-100";
                      if (index > 1 && index < 10) {
                        if (Math.random() > 0.8) activeClass = "bg-pink-500";
                        else if (Math.random() > 0.85) activeClass = "bg-pink-400";
                        else if (Math.random() > 0.9) activeClass = "bg-pink-200";
                      }
                      return (
                        <div key={i} className={`w-3.5 h-3.5 rounded-sm ${activeClass}`}></div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 bg-pink-50 text-pink-700 text-center py-2.5 rounded-lg text-sm font-semibold">
            ✨ Consistency is better than perfection. You've been amazing this year!
          </div>
        </div>

        {/* Weekly & Monthly Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Weekly Streak */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2">🔥 Weekly Streak</h2>
            <p className="text-sm text-gray-500 mb-6">You're on a roll!</p>
            
            <div className="flex justify-between items-center mb-4">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${i < 6 ? 'bg-emerald-400' : 'bg-gray-200'}`}>
                    {i < 6 && '✓'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              <span className="font-bold text-emerald-500">14</span> day streak . 1 day to go for new record!
            </p>
          </div>

          {/* Monthly Consistency */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">📅 Monthly Consistency</h2>
                <p className="text-sm text-gray-500">Active days this month</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-3xl font-bold text-purple-600">77%</span>
                <p className="text-xs text-gray-500">consistency</p>
              </div>
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                + 24 of 31 days
              </div>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '77%' }}></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
              <div>
                <div className="text-xl font-bold text-purple-600">24</div>
                <div className="text-xs text-gray-500 mb-1">Active days</div>
                <div className="text-emerald-500">✔️</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-500">5</div>
                <div className="text-xs text-gray-500 mb-1">Rest days</div>
                <div>☕</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-500">2</div>
                <div className="text-xs text-gray-500 mb-1">Missed days</div>
                <div className="text-red-500">❌</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Over Time & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          
          {/* Progress Over Time Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">📈 Progress Over Time</h2>
              <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                Weight(kg) <span className="text-gray-400 text-xs">▼</span>
              </button>
            </div>

            {/* Mock Chart Area */}
            <div className="flex-1 relative min-h-[200px] w-full flex items-end pb-8">
              {/* Y Axis */}
              <div className="absolute left-0 top-0 bottom-8 w-6 flex flex-col justify-between text-xs text-gray-400">
                <span>70</span>
                <span>65</span>
                <span>60</span>
                <span>55</span>
                <span>50</span>
              </div>
              
              {/* Grid Lines */}
              <div className="absolute left-8 right-0 top-2 bottom-8 flex flex-col justify-between">
                 <div className="w-full border-t border-gray-100"></div>
                 <div className="w-full border-t border-gray-100"></div>
                 <div className="w-full border-t border-gray-100"></div>
                 <div className="w-full border-t border-gray-100"></div>
                 <div className="w-full border-t border-gray-100"></div>
              </div>

              {/* Line SVG */}
              <div className="absolute left-8 right-0 top-2 bottom-8 z-10">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path 
                    d="M 0 10 L 10 30 L 20 40 L 30 45 L 40 42 L 50 48 L 60 48 L 70 50 L 80 80 L 90 90 L 100 90" 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="1.5" 
                  />
                  {/* Dots */}
                  <circle cx="0" cy="10" r="1.5" fill="#a855f7" />
                  <circle cx="10" cy="30" r="1.5" fill="#a855f7" />
                  <circle cx="20" cy="40" r="1.5" fill="#a855f7" />
                  <circle cx="30" cy="45" r="1.5" fill="#a855f7" />
                  <circle cx="40" cy="42" r="1.5" fill="#a855f7" />
                  <circle cx="50" cy="48" r="1.5" fill="#a855f7" />
                  <circle cx="60" cy="48" r="1.5" fill="#a855f7" />
                  <circle cx="70" cy="50" r="1.5" fill="#a855f7" />
                  <circle cx="80" cy="80" r="1.5" fill="#a855f7" />
                  <circle cx="90" cy="90" r="1.5" fill="#a855f7" />
                  <circle cx="100" cy="90" r="1.5" fill="#a855f7" />
                </svg>
                {/* Tooltip mockup */}
                <div className="absolute left-[47%] top-[35%] bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold">
                  58.2 kg
                </div>
              </div>

              {/* X Axis */}
              <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-gray-400 px-2">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sept</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>

            <div className="mt-4 bg-purple-100 p-3 rounded-lg text-sm">
              <p className="font-bold text-gray-800">You've lost 6.5 kg this year! 💪</p>
              <p className="text-gray-600">You're 65% closer to your goal.</p>
            </div>
          </div>

          {/* Yearly Highlights */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">⭐ Yearly Highlights</h2>
            
            <div className="space-y-6">
              {/* Highlight 1 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-xl">
                  🏵️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Best Month</h3>
                  <p className="text-xs text-gray-500">May 2025</p>
                  <p className="text-xs text-gray-400">92% consistency</p>
                </div>
              </div>
              
              {/* Highlight 2 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
                  👟
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Most active day</h3>
                  <p className="text-xs text-gray-500">12,345 steps</p>
                  <p className="text-xs text-gray-400">18th may 2025</p>
                </div>
              </div>

              {/* Highlight 3 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-xl">
                  🎖️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Top achievement</h3>
                  <p className="text-xs text-gray-500">Completed 28-day streak in june</p>
                </div>
              </div>

              {/* Highlight 4 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-xl">
                  🔥
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Calories Balance</h3>
                  <p className="text-xs text-gray-500">-8,450 kcal</p>
                  <p className="text-xs text-gray-400">Total deficit this year</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}