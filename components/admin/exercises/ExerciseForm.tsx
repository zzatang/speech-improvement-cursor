import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

// Flat type for form values
export type ExerciseFormValues = {
  title: string;
  exercise_type: string;
  difficulty_level: number;
  age_group: string;
  description: string;
  content: string; // always as string for the form
};

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseFormValues>;
  onSubmit: (values: ExerciseFormValues) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function ExerciseForm({ initialValues, onSubmit, isLoading, onCancel }: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExerciseFormValues>({
    defaultValues: initialValues || {
      title: '',
      exercise_type: 'repeat',
      difficulty_level: 1,
      age_group: '',
      description: '',
      content: '{}',
    },
  });

  // Watch exercise_type for content hint
  const exerciseType = watch('exercise_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block font-medium mb-1">Exercise Type</label>
        <select
          {...register('exercise_type', { required: true })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="repeat">Repeat</option>
          <option value="reading">Reading</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Difficulty Level (1-5)</label>
        <input
          type="number"
          min={1}
          max={5}
          {...register('difficulty_level', { required: true, valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Age Group</label>
        <select
          {...register('age_group')}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="">-- Select Age Group --</option>
          <option value="5-7">5-7 years</option>
          <option value="8-13">8-13 years</option>
          <option value="14-18">14-18 years</option>
          <option value="adult">Adult</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Content (JSON)</label>
        <textarea
          {...register('content', { required: 'Content is required' })}
          rows={5}
          className="w-full px-3 py-2 border rounded-md font-mono focus:outline-none focus:ring focus:border-blue-300"
        />
        <div className="text-xs text-gray-500 mt-1">
          {exerciseType === 'repeat'
            ? 'Format: {"phrases": ["Example phrase 1"], "focus": "R Sounds"}'
            : 'Format: {"text": "Example reading text", "focus": "Vowel Sounds"}'}
        </div>
        {errors.content && <p className="text-red-600 text-xs mt-1">{errors.content.message}</p>}
      </div>
      <div className="pt-2 flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Exercise'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
} 