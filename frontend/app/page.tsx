import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        English Learning Platform
      </h1>
      <p className="max-w-md text-muted-foreground">
        Foundation setup complete. Product features are not implemented yet.
      </p>
      <Button asChild>
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          View API Docs
        </a>
      </Button>
    </div>
  );
}
