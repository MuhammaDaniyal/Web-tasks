import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get('session_user')?.value;

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Main Content Area */}
      <main className="flex-grow pt-10 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">
              Welcome, <span className="font-semibold text-indigo-600">{user}</span>
            </p>
          </div>
          <div className="mt-6 sm:mt-0">
            <LogoutButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 flex flex-col items-center justify-center mt-auto">
        <div className="mb-6">
          {/* Inline SVG Logo */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-400"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium tracking-wide">
          © 2024 {user} | AuthApp. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
