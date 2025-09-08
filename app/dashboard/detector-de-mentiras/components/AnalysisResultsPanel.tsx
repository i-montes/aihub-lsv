import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, Users, Calendar, Globe } from "lucide-react";

/**
 * Interfaz para los resultados del análisis
 */
interface AnalysisResult {
  overall_assessment: {
    credibility_score: number;
    risk_level: string;
    summary: string;
  };
  detailed_analysis: {
    content_analysis: {
      factual_accuracy: number;
      source_reliability: number;
      bias_detection: number;
      emotional_manipulation: number;
    };
    context_analysis: {
      historical_context: string;
      current_relevance: string;
      potential_impact: string;
    };
    verification_results: {
      cross_referenced_sources: number;
      contradictory_information: string[];
      supporting_evidence: string[];
    };
  };
  recommendations: {
    action_items: string[];
    further_investigation: string[];
    confidence_level: number;
  };
}

/**
 * Props para el componente AnalysisResultsPanel
 */
interface AnalysisResultsPanelProps {
  results: AnalysisResult | null;
  isVisible: boolean;
}

/**
 * Panel de resultados del análisis de desinformación
 * Muestra los resultados detallados del análisis de IA
 */
export const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  results,
  isVisible,
}) => {
  if (!isVisible || !results) {
    return null;
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "bajo":
        return "text-green-600 bg-green-100";
      case "medio":
        return "text-yellow-600 bg-yellow-100";
      case "alto":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "bajo":
        return <CheckCircle className="w-4 h-4" />;
      case "medio":
        return <AlertTriangle className="w-4 h-4" />;
      case "alto":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-1/2 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Resultados del análisis de IA
      </h2>

      {/* Evaluación general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evaluación general</span>
            <Badge className={getRiskColor(results.overall_assessment.risk_level)}>
              {getRiskIcon(results.overall_assessment.risk_level)}
              Riesgo {results.overall_assessment.risk_level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Puntuación de credibilidad</span>
              <span className="text-sm font-bold">
                {results.overall_assessment.credibility_score}%
              </span>
            </div>
            <Progress value={results.overall_assessment.credibility_score} className="h-2" />
          </div>
          <p className="text-gray-700">{results.overall_assessment.summary}</p>
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis detallado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Análisis de contenido */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Análisis de contenido
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Precisión factual</span>
                  <span className="text-sm font-medium">
                    {results.detailed_analysis.content_analysis.factual_accuracy}%
                  </span>
                </div>
                <Progress value={results.detailed_analysis.content_analysis.factual_accuracy} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Confiabilidad de fuentes</span>
                  <span className="text-sm font-medium">
                    {results.detailed_analysis.content_analysis.source_reliability}%
                  </span>
                </div>
                <Progress value={results.detailed_analysis.content_analysis.source_reliability} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Detección de sesgo</span>
                  <span className="text-sm font-medium">
                    {results.detailed_analysis.content_analysis.bias_detection}%
                  </span>
                </div>
                <Progress value={results.detailed_analysis.content_analysis.bias_detection} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Manipulación emocional</span>
                  <span className="text-sm font-medium">
                    {results.detailed_analysis.content_analysis.emotional_manipulation}%
                  </span>
                </div>
                <Progress value={results.detailed_analysis.content_analysis.emotional_manipulation} className="h-1" />
              </div>
            </div>
          </div>

          {/* Análisis de contexto */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Análisis de contexto
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" />
                  Contexto histórico
                </span>
                <p className="text-sm text-gray-600">
                  {results.detailed_analysis.context_analysis.historical_context}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Relevancia actual
                </span>
                <p className="text-sm text-gray-600">
                  {results.detailed_analysis.context_analysis.current_relevance}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3" />
                  Impacto potencial
                </span>
                <p className="text-sm text-gray-600">
                  {results.detailed_analysis.context_analysis.potential_impact}
                </p>
              </div>
            </div>
          </div>

          {/* Resultados de verificación */}
          <div>
            <h4 className="font-semibold mb-3">Resultados de verificación</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Fuentes consultadas:</span>
                <span className="ml-2 text-sm">
                  {results.detailed_analysis.verification_results.cross_referenced_sources}
                </span>
              </div>
              
              {results.detailed_analysis.verification_results.supporting_evidence.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-green-700">Evidencia de apoyo:</span>
                  <ul className="mt-1 space-y-1">
                    {results.detailed_analysis.verification_results.supporting_evidence.map((evidence, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.detailed_analysis.verification_results.contradictory_information.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-red-700">Información contradictoria:</span>
                  <ul className="mt-1 space-y-1">
                    {results.detailed_analysis.verification_results.contradictory_information.map((contradiction, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        {contradiction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recomendaciones</span>
            <Badge variant="outline">
              Confianza: {results.recommendations.confidence_level}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.recommendations.action_items.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Acciones recomendadas:</h4>
              <ul className="space-y-2">
                {results.recommendations.action_items.map((item, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {results.recommendations.further_investigation.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Investigación adicional:</h4>
              <ul className="space-y-2">
                {results.recommendations.further_investigation.map((item, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <Info className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};