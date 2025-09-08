import type React from "react";
/**
 * Componente header del formulario del detector de mentiras
 * Contiene el título, descripción y botón de análisis
 */
export const FormHeader: React.FC = () => {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 pb-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detector de mentiras
          </h1>
          <p className="text-gray-600 mt-1">
            Analiza y verifica información para detectar desinformación
          </p>
        </div>
      </div>
    </div>
  );
};