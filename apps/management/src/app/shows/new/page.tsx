import { ShowForm } from "@/components/shows/ShowForm";

// Note: No 'use client' here - this is a server component
export default function NewShowPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Show</h1>
      <ShowForm />
    </div>
  );
}