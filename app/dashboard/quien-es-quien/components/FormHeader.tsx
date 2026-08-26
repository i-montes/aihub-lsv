import type React from "react";
import { UserSearch } from "lucide-react";

/**
 * Encabezado de la herramienta. Mismo patrón visual que el detector.
 */
export const FormHeader: React.FC = () => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
          <UserSearch className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quién es quién</h1>
          <p className="text-gray-600 mt-1">
            Perfiles con fuentes citadas a partir de un nombre
          </p>
        </div>
      </div>
    </div>
  );
};
