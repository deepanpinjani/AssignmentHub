import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, GraduationCap, CheckCircle, Clock, ArrowRight, BookOpen, Building2 } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Campus Image with Elegant Layered Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/campus_hero_bg.jpg"
          alt="Prof Ram Meghe College of Engineering and Management, Badnera Campus"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-95"
        />
        {/* Multilayered Gradient scrim for text readability and light-theme card integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950/85 backdrop-blur-[2px]" />
      </div>

      {/* Hero Content Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full">
        {/* College & Project Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-slate-800 text-xs font-semibold mb-5 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Prof Ram Meghe College of Engineering and Management, Badnera</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            AssignmentHub
          </h1>
          <p className="text-lg sm:text-xl font-medium text-blue-100 mt-2 drop-shadow-sm">
            College Assignment Management & Automated Timeliness System
          </p>

          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            Streamlining coursework delivery for professors and students with secure role authorization and server-authoritative deadline validation.
          </p>

          {/* Active Session Ribbon */}
          {isAuthenticated && (
            <div className="mt-6 p-4 bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl shadow-xl inline-flex items-center gap-4 text-left">
              <div>
                <p className="text-xs text-gray-500 font-medium">Logged in as {user.name} ({user.role})</p>
                <p className="text-sm font-semibold text-gray-800">
                  {user.role === 'admin' ? 'Manage assignments in your Admin Dashboard' : 'View active assignments in your Student Dashboard'}
                </p>
              </div>
              <button
                onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dual Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin / Professor Card */}
          <div className="card-hero-glass rounded-2xl p-7 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-5 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Professor / Admin Portal</h2>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Faculty Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Create coursework with strict deadlines, inspect student submissions, view submitted repository links & write-ups, and review automated On-Time vs. Late marks.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Create assignments with title, description & deadline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Inspect submissions per assignment with student metadata</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Strict role authorization preventing student access</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Link
                to="/admin/login"
                className="flex-1 text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Admin Login
              </Link>
              <Link
                to="/admin/register"
                className="flex-1 text-center py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 transition-colors"
              >
                Admin Register
              </Link>
            </div>
          </div>

          {/* Student Card */}
          <div className="card-hero-glass rounded-2xl p-7 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Student Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Browse published assignments, submit your deliverables as a project URL or written text response, and receive immediate server-verified timeliness verification.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Browse active assignments & deadline timers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Submit project link OR formatted text write-up</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automated server timestamp check (On Time vs Late)</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Link
                to="/student/login"
                className="flex-1 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Student Login
              </Link>
              <Link
                to="/student/register"
                className="flex-1 text-center py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 transition-colors"
              >
                Student Register
              </Link>
            </div>
          </div>
        </div>

        {/* Assessment Test Credentials Quick Reference */}
        <div className="mt-10 card-hero-glass rounded-2xl p-6 max-w-4xl mx-auto shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Assessment Test Credentials (Quick Evaluation)</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">Auto-seeded in database</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <p className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Admin / Professor Account
              </p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> prof.turing@assignmenthub.edu</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Password:</span> AdminPass123!</p>
            </div>
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <p className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Student Account
              </p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> rahul.sharma@assignmenthub.edu</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Password:</span> StudentPass123!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-slate-950/80 backdrop-blur-md py-5 text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-300">
          AssignmentHub &copy; 2026. Prof Ram Meghe College of Engineering and Management, Badnera (PRMCEAM) — Software Engineering Assessment (B2).
        </div>
      </footer>
    </div>
  );
};

export default Home;
