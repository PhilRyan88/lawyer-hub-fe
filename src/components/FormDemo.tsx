import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';

export default function FormDemo() {
  const form = useForm({
    defaultValues: {
      firstName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
      alert(JSON.stringify(value, null, 2));
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 p-4 border rounded-lg"
    >
      <h2 className="text-xl font-bold">TanStack Form Demo</h2>
      <div>
        <form.Field
          name="firstName"
          children={(field) => (
            <>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                First Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-black"
                placeholder="Enter your first name"
              />
            </>
          )}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
