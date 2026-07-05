import { Link } from "react-router-dom";
import { Compass } from "@phosphor-icons/react";
import Button from "../components/common/Button.jsx"

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="text-center flex flex-col items-center gap-3 max-w-sm">
        <div className="h-16 w-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
          <Compass size={30} weight="duotone" />
        </div>
        <h1 className="text-3xl font-bold text-text">404</h1>
        <p className="text-sm text-text-muted">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/" className="mt-2 ">
          <Button variant="primary" size='lg'>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}

