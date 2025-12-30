interface ActivityRowProps {
  title: string;
  detail: string;
  time: string;
  user: string;
}

export function ActivityRow({ title, detail, time, user }: ActivityRowProps) {
  return (
    <div className="group bg-white rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
      {/* Mobile Layout */}
      <div className="sm:hidden p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-transparent group-hover:text-gray-400 transition-colors shrink-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pl-8">
          <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {time}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
              {user.charAt(0)}
            </div>
            <span className="text-xs text-gray-700">{user}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-4 items-center">
        <div className="col-span-6 flex items-center gap-4">
          <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-transparent group-hover:text-gray-400 transition-colors">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
          </div>
        </div>
        <div className="col-span-3 text-sm text-gray-600 font-mono bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
          {time}
        </div>
        <div className="col-span-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
            {user.charAt(0)}
          </div>
          <span className="text-sm text-gray-700">{user}</span>
        </div>
      </div>
    </div>
  );
}
