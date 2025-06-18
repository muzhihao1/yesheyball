import { useLocation } from "wouter";

export default function TasksDebug() {
  const [location] = useLocation();
  
  return (
    <div className="p-4 space-y-4">
      <h1>Tasks Debug Page</h1>
      <p>Current location: {location}</p>
      <p>This component loaded successfully</p>
      <div className="bg-green-100 p-4 rounded">
        <p>If you can see this, the routing is working correctly.</p>
      </div>
    </div>
  );
}