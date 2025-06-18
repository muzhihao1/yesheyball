import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export function RouteDebugger() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50 max-w-xs">
      <div>Location: {location}</div>
      <div>Loading: {isLoading.toString()}</div>
      <div>Authenticated: {isAuthenticated.toString()}</div>
      <div>User ID: {user?.id || 'none'}</div>
    </div>
  );
}