export function WeightLossPlan() {
  // Valores de ejemplo
  const currentWeight = 55.2
  const startWeight = 58
  const goalWeight = 50
  const progress = 68

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">Weight Loss Plan</h2>
        <div className="text-right">
          <span className="text-lg font-bold">{progress}%</span>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-sidebar rounded-full"
            style={{ width: `${((startWeight - currentWeight) / (startWeight - goalWeight)) * 100}%` }}
          ></div>
          <div
            className="absolute top-0 left-0 h-full w-2 bg-white rounded-full border-2 border-sidebar"
            style={{ left: `${((startWeight - currentWeight) / (startWeight - goalWeight)) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm">
          <span>{startWeight} kg</span>
          <span className="font-medium">{currentWeight} kg</span>
          <span>{goalWeight} kg</span>
        </div>
      </div>
    </div>
  )
}
