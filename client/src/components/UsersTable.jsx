import { Search, UserCheck, ShieldAlert, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersTable({
  users,
  pagination,
  search,
  setSearch,
  page,
  setPage,
  onRoleChange,
  onDelete,
}) {
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
      {/* Search Bar */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name or email..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-600 transition outline-none"
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Total Users: {pagination?.total || 0}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/20">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6 text-center">Role</th>
              <th className="py-4 px-6 text-center">Stats (Resumes/Interviews/Tests)</th>
              <th className="py-4 px-6 text-center">Avg ATS</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-100">{user.name}</td>
                  <td className="py-4 px-6 text-slate-400">{user.email}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-semibold border ${
                        user.role === "admin"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400">
                    {user.stats?.resumesCount ?? 0} / {user.stats?.interviewsCount ?? 0} /{" "}
                    {user.stats?.codingTestsCount ?? 0}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-slate-200">
                    {user.stats?.avgAtsScore ?? 0}%
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onRoleChange(user._id, user.role === "admin" ? "user" : "admin")}
                      className={`p-1.5 rounded border transition-colors cursor-pointer inline-flex items-center ${
                        user.role === "admin"
                          ? "text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/20"
                          : "text-rose-400 hover:bg-rose-500/10 border-rose-500/20"
                      }`}
                      title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                    >
                      {user.role === "admin" ? <UserCheck size={14} /> : <ShieldAlert size={14} />}
                    </button>
                    <button
                      onClick={() => onDelete(user._id)}
                      className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center"
                      title="Deactivate Account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No users found matching query
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
