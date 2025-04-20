import { User } from "@/lib/supabase/services/user-service";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Ban, CheckCircle2 } from "lucide-react";

interface UserTableProps {
  users: User[];
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onSuspend?: (user: User) => void;
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // yyyy-mm-dd hh:mi (24h)
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function UserTable({ users, onView, onEdit, onDelete, onSuspend }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-blue-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Date Joined</th>
            <th className="px-6 py-3 text-right font-bold text-blue-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/50 hover:bg-blue-100/60 transition"}>
              <td className="px-6 py-4 font-semibold text-blue-900">{user.name}</td>
              <td className="px-6 py-4 text-gray-700">{user.email}</td>
              <td className="px-6 py-4 text-amber-700 font-medium capitalize">{user.role}</td>
              <td className={
                `px-6 py-4 font-medium capitalize ` +
                (user.status === "active" ? "text-green-700" : user.status === "suspended" ? "text-red-600" : "text-gray-500")
              }>
                {user.status}
              </td>
              <td className="px-6 py-4 text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button size="icon" variant="ghost" aria-label="View User" className="hover:bg-blue-100" onClick={() => onView?.(user)} title="View User">
                  <Eye className="w-5 h-5 text-blue-700" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Edit User" className="hover:bg-blue-100" onClick={() => onEdit?.(user)} title="Edit User">
                  <Edit className="w-5 h-5 text-blue-700" />
                </Button>
                <Button size="icon" variant="destructive" aria-label="Delete User" className="hover:bg-amber-100" onClick={() => onDelete?.(user)} title="Delete User">
                  <Trash2 className="w-5 h-5 text-amber-700" />
                </Button>
                {user.status === 'suspended' ? (
                  <Button size="icon" variant="ghost" aria-label="Re-enable User" className="hover:bg-green-100" onClick={() => onSuspend?.(user)} title="Re-enable User">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </Button>
                ) : (
                  <Button size="icon" variant="ghost" aria-label="Suspend User" className="hover:bg-red-100" onClick={() => onSuspend?.(user)} title="Suspend User">
                    <Ban className="w-5 h-5 text-red-600" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 