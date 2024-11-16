export default function Home() {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Welcome to the Improv Team Management App
        </h2>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Manage shows, rehearsals, and team availability all in one place.</p>
        </div>
        <div className="mt-5">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-900">Quick Actions</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <a
                  href="/shows/new"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Show
                </a>
                <a
                  href="/rehearsals/new"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Schedule Rehearsal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
