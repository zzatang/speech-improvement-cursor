import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { UserInput } from "@/lib/supabase/services/user-service";
import { useEffect } from "react";
// Import toast from Shadcn UI if available
import { toast } from "sonner";

interface UserFormProps {
  initialValues?: UserInput;
  onSubmit: (values: UserInput) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export default function UserForm({ initialValues, onSubmit, isLoading, errorMessage, successMessage }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInput>({
    defaultValues: initialValues || {
      name: "",
      email: "",
      role: "user",
      status: "active",
    },
  });

  // Show toast notifications for error/success
  useEffect(() => {
    if (errorMessage) toast.error(errorMessage);
    if (successMessage) toast.success(successMessage);
  }, [errorMessage, successMessage]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Inline error alert as fallback if toast is not visible */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-2">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-2">
          {successMessage}
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "Invalid email address",
            },
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Role</label>
        <select
          {...register("role", { required: true })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Status</label>
        <select
          {...register("status", { required: true })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="pt-2">
        <Button type="submit" className="w-full flex items-center justify-center" disabled={isLoading}>
          {isLoading && (
            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {isLoading ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
} 