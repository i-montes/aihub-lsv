"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart,
  FileCheck,
  FileText,
  ChevronRight,
  ChevronLeft,
  Settings,
  RssIcon,
  BookOpen,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

// Componente para el icono de X/Twitter
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0.254 0.25 500 451.954"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  const { profile, user } = useAuth();

  // Lista de correos autorizados para acceso de admin
  const adminEmails = [
    "kdelahoz@lasillavacia.com",
    "imontes@lasillavacia.com",
    "jromero@lasillavacia.com"
  ];

  // Verificar si el usuario es admin
  const isAdmin = () => {
    const userEmail = user?.email || profile?.email;
    return userEmail && adminEmails.includes(userEmail);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`h-full py-4 sm:py-6 transition-all duration-300 ml-2 ${
        isExpanded ? "w-[200px]" : "w-[70px]"
      }`}
    >
      <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm py-4 px-2 relative justify-between">
        {/* Contenido superior */}
        <div className="flex flex-col">
          {/* Logo del dashboard con botón integrado */}
          <div className={`flex items-center mb-6 px-2 transition-all duration-300 ${
            isExpanded ? "justify-between" : "justify-center"
          }`}>
            {/* Título */}
            {isExpanded && (
              <span className="font-bold text-lg transition-opacity duration-200 text-gray-800">
                KIT.AI
              </span>
            )}
            
            {/* Botón para expandir/contraer integrado */}
            <button
              onClick={toggleSidebar}
              className="group relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm flex-shrink-0"
              title={isExpanded ? "Contraer sidebar" : "Expandir sidebar"}
            >
              {isExpanded ? (
                <ChevronLeft size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              ) : (
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              )}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {isExpanded ? "Contraer" : "Expandir"}
              </div>
            </button>
          </div>

          {/* Iconos de navegación */}
          <div className="flex flex-col items-center gap-4 mt-4">
            <NavItem
              icon={<Home className="size-5" />}
              label="Inicio"
              href="/dashboard"
              isActive={pathname === "/dashboard"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<FileCheck className="size-5" />}
              label="Corrector"
              href="/dashboard/corrector"
              isActive={pathname === "/dashboard/corrector"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<XIcon className="size-5" />}
              label="Hilos"
              href="/dashboard/generador-hilos"
              isActive={pathname === "/dashboard/generador-hilos"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<FileText className="size-5" />}
              label="Resúmenes"
              href="/dashboard/generador-resumen"
              isActive={pathname === "/dashboard/generador-resumen"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<RssIcon className="size-5" />}
              label="Newsletter"
              href="/dashboard/boletin"
              isActive={pathname === "/dashboard/boletin"}
              isExpanded={isExpanded}
            />

            {/* <NavItem
              icon={<BarChart className="size-5" />}
              label="Analiticas"
              href="/dashboard/analiticas"
              isActive={pathname === "/dashboard/analiticas"}
              isExpanded={isExpanded}
            /> */}
            {/* <NavItem
              icon={<FileText className="size-5" />}
              label="Boletín"
              href="/dashboard/generador-boletin"
              isActive={pathname === "/dashboard/generador-boletin"}
              isExpanded={isExpanded}
            />
            <NavItem
              icon={<BarChart className="size-5" />}
              label="Analítica"
              href="/dashboard/analiticas"
              isActive={pathname === "/dashboard/analiticas"}
              isExpanded={isExpanded}
            /> */}
          </div>
        </div>

        {/* Contenido inferior - Settings */}
        <div className="mt-4">
          {profile?.role == "OWNER" && (
            <NavItem
              icon={<BarChart className="size-5" />}
              label="Analiticas"
              href="/dashboard/analiticas"
              isActive={pathname === "/dashboard/analiticas"}
              isExpanded={isExpanded}
            />
          )}
          {isAdmin() && (
            <NavItem
              icon={<Shield className="size-5" />}
              label="Admin"
              href="/dashboard/admin/organizaciones"
              isActive={pathname.startsWith("/dashboard/admin")}
              isExpanded={isExpanded}
            />
          )}
          <NavItem
            icon={<Settings className="size-5" />}
            label="Ajustes"
            href="/dashboard/configuracion"
            isActive={pathname.startsWith("/dashboard/configuracion")}
            isExpanded={isExpanded}
          />
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  isActive = false,
  isExpanded = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isExpanded?: boolean;
}) {
  return (
    <Link href={href} className="w-full">
      <div
        className={`flex items-center py-3 px-3 rounded-xl cursor-pointer transition-all duration-200
          ${
            isActive
              ? "bg-primary-600 text-white"
              : "text-gray-500 hover:text-primary-600 hover:bg-gray-100"
          }
          ${isExpanded ? "justify-start" : "justify-center"}
        `}
      >
        <div className="flex-shrink-0">{icon}</div>
        {isExpanded && (
          <span className={`ml-3 font-medium transition-opacity duration-200`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}
