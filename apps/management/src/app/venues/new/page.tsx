import { VenueForm } from "@/components/venues/VenueForm";

export default function NewVenuePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Add New Venue</h1>
        </div>

        <VenueForm />
      </div>
    </div>
  );
}