import { Link } from "react-router-dom";
import Terminal from "../components/ui/Terminal";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Terminal title="404.log">
        <p className="text-[var(--color-neon-red)] font-mono">ERROR 404: ROUTE_NOT_FOUND</p>
        <p className="text-text-dim mt-2">This module doesn't exist in the CampusAI system yet.</p>
      </Terminal>
      <Link to="/" className="btn-primary inline-block mt-6">
        Return to base
      </Link>
    </div>
  );
}
