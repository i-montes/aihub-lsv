interface StatisticsProps {
  readabilityScore: number
  grammarScore: number
  styleScore: number
}

export function Statistics({ readabilityScore, grammarScore, styleScore }: StatisticsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    if (score >= 60) return "text-orange-500"
    return "text-red-600"
  }

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return "Muy fácil de leer"
    if (score >= 80) return "Fácil de leer"
    if (score >= 70) return "Moderadamente fácil"
    if (score >= 60) return "Estándar"
    if (score >= 50) return "Moderadamente difícil"
    return "Difícil de leer"
  }

  return null
}
