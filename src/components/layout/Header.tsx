import { DollarSign } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-gray-900">Clarity Finance</h1>
        </div>
      </div>
    </header>
  );
};