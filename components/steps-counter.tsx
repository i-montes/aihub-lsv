import { Plus } from "lucide-react"

export function StepsCounter() {
  // Valores de ejemplo
  const currentSteps = 5201
  const goalSteps = 8500
  const progress = (currentSteps / goalSteps) * 100

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">Steps for Today</h2>
          <p className="text-gray-500">Keep your body toned</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">Change Goal</span>
          <div className="w-8 h-8 bg-sidebar rounded-full flex items-center justify-center text-white">
            <Plus size={18} />
          </div>
        </div>

        <div className="relative w-[150px] h-[150px]">
          {/* Círculo de progreso */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f3f3" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ff6b6b"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500">Goal</span>
            <span className="text-2xl font-bold">{goalSteps.toLocaleString()}</span>
          </div>
          <div className="absolute top-0 right-0 bg-gray-100 rounded-full px-2 py-1 text-sm">
            {currentSteps.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
