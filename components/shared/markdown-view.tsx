"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToString } from "react-dom/server";

/**
 * Render de markdown para los resultados de las herramientas.
 *
 * Hay dos juegos de estilos a propósito:
 *
 * - `MarkdownView` usa clases de Tailwind y es lo que se ve en pantalla.
 * - `markdownAHtml` usa estilos en línea, porque el HTML que va al portapapeles
 *   se pega en Word o Google Docs, donde las clases no significan nada.
 */

interface MarkdownViewProps {
  content: string;
  className?: string;
}

const componentesPantalla = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2 pb-1 border-b border-gray-200">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-[15px] text-gray-700 mb-3 leading-relaxed">{children}</p>
  ),
  a: ({ children, href }: any) => (
    <a
      className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="text-[15px] text-gray-700 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary-200 bg-primary-50 pl-4 py-2 mb-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-200" />,
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-800">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-gray-200 px-3 py-2 align-top text-gray-700">
      {children}
    </td>
  ),
  code: ({ children }: any) => (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3">
      {children}
    </pre>
  ),
};

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  className,
}) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentesPantalla}>
      {content}
    </ReactMarkdown>
  </div>
);

const componentesPortapapeles = {
  h1: ({ children }: any) => (
    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginTop: "1rem", marginBottom: "0.5rem" }}>
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p style={{ fontSize: "0.95rem", color: "#374151", marginBottom: "0.75rem", lineHeight: 1.6 }}>
      {children}
    </p>
  ),
  a: ({ children, href }: any) => (
    <a style={{ color: "#1b70e8", textDecoration: "underline" }} href={href}>
      {children}
    </a>
  ),
  ul: ({ children }: any) => (
    <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ listStyleType: "decimal", paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li style={{ fontSize: "0.95rem", color: "#374151", marginBottom: "0.25rem" }}>
      {children}
    </li>
  ),
  strong: ({ children }: any) => (
    <strong style={{ fontWeight: 600, color: "#111827" }}>{children}</strong>
  ),
  em: ({ children }: any) => (
    <em style={{ fontStyle: "italic", color: "#374151" }}>{children}</em>
  ),
  blockquote: ({ children }: any) => (
    <blockquote style={{ borderLeft: "4px solid #bddafd", paddingLeft: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", backgroundColor: "#f0f7ff", marginBottom: "0.75rem" }}>
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <table style={{ borderCollapse: "collapse", marginBottom: "1rem" }}>
      {children}
    </table>
  ),
  th: ({ children }: any) => (
    <th style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", padding: "0.5rem", textAlign: "left" }}>
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem" }}>{children}</td>
  ),
  code: ({ children }: any) => (
    <code style={{ backgroundColor: "#f3f4f6", padding: "0.125rem 0.25rem", borderRadius: "0.25rem", fontSize: "0.85rem", fontFamily: "monospace" }}>
      {children}
    </code>
  ),
};

/** Markdown a HTML con estilos en línea, listo para pegar fuera del navegador */
export function markdownAHtml(markdown: string): string {
  return renderToString(
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentesPortapapeles}>
      {markdown}
    </ReactMarkdown>
  );
}

/**
 * Copia el markdown al portapapeles en dos formatos: HTML con formato para
 * editores de texto y el markdown crudo como respaldo.
 */
export async function copiarMarkdown(markdown: string): Promise<boolean> {
  if (!markdown.trim()) return false;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([markdownAHtml(markdown)], { type: "text/html" }),
        "text/plain": new Blob([markdown], { type: "text/plain" }),
      }),
    ]);
    return true;
  } catch (error) {
    console.error("Error al copiar con formato:", error);

    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch (fallbackError) {
      console.error("Error al copiar como texto plano:", fallbackError);
      return false;
    }
  }
}
