/**
 * PasswordInput component with visibility toggle
 *
 * Features:
 * - Show/hide password toggle with eye icons
 * - All standard input props (placeholder, autoComplete, etc.)
 * - Consistent styling with other UI components
 * - Accessible with proper ARIA labels
 *
 * Usage:
 * ```tsx
 * <PasswordInput
 *   id="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   placeholder="Enter your password"
 *   autoComplete="current-password"
 * />
 * ```
 */

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pr-10", // Add padding-right for the icon button
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          tabIndex={-1}
          aria-label={showPassword ? "隐藏密码" : "显示密码"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
