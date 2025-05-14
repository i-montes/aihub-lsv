export function WorkoutResults() {
  return (
    <div className="bg-card rounded-3xl p-6 relative overflow-hidden h-auto">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Your Workout</h2>
          <p className="text-gray-600">Results for Today</p>
        </div>
        <div className="w-10 h-10 bg-sidebar rounded-full flex items-center justify-center">
          <span className="text-yellow-400">📊</span>
        </div>
      </div>

      <div className="relative h-[180px]">
        {/* Círculos de visualización */}
        <div className="absolute right-10 top-0 w-[160px] h-[160px] rounded-full bg-yellow-light opacity-70"></div>
        <div className="absolute left-20 bottom-0 w-[130px] h-[130px] rounded-full bg-coral-light opacity-70"></div>

        {/* Datos superpuestos */}
        <div className="absolute left-10 top-10 w-[70px] h-[70px] rounded-full bg-sidebar flex flex-col items-center justify-center text-white">
          <span className="font-bold">2.30</span>
          <span className="text-xs">hours</span>
        </div>

        <div className="absolute right-20 top-20 text-right">
          <span className="font-bold text-lg">1,875</span>
          <p className="text-xs">kcal</p>
        </div>

        <div className="absolute left-40 bottom-10">
          <span className="font-bold text-lg">850</span>
          <p className="text-xs">kcal</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-2 bg-yellow rounded-full"></div>
          <span className="text-sm">Calories intake</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-2 bg-coral rounded-full"></div>
          <span className="text-sm">Calories burned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-2 bg-gray-600 rounded-full"></div>
          <span className="text-sm">Activity time</span>
        </div>
      </div>
    </div>
  )
}
