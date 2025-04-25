import { SpeechExercise } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ExerciseTableProps {
  exercises: SpeechExercise[];
  onView?: (exercise: SpeechExercise) => void;
  onEdit?: (exercise: SpeechExercise) => void;
  onDelete?: (exercise: SpeechExercise) => void;
}

export default function ExerciseTable({ exercises, onView, onEdit, onDelete }: ExerciseTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-blue-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Difficulty</th>
            <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Age Group</th>
            <th className="px-6 py-3 text-right font-bold text-blue-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise, idx) => (
            <tr key={exercise.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/50 hover:bg-blue-100/60 transition"}>
              <td className="px-6 py-4 font-semibold text-blue-900">{exercise.title}</td>
              <td className="px-6 py-4 text-gray-700 capitalize">{exercise.exercise_type}</td>
              <td className="px-6 py-4 text-amber-700 font-medium">{exercise.difficulty_level}</td>
              <td className="px-6 py-4 text-gray-500">{exercise.age_group || '-'}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button size="icon" variant="ghost" aria-label="View Exercise" className="hover:bg-blue-100" onClick={() => onView?.(exercise)} title="View Exercise">
                  <Eye className="w-5 h-5 text-blue-700" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Edit Exercise" className="hover:bg-blue-100" onClick={() => onEdit?.(exercise)} title="Edit Exercise">
                  <Edit className="w-5 h-5 text-blue-700" />
                </Button>
                <Button size="icon" variant="destructive" aria-label="Delete Exercise" className="hover:bg-amber-100" onClick={() => onDelete?.(exercise)} title="Delete Exercise">
                  <Trash2 className="w-5 h-5 text-amber-700" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 