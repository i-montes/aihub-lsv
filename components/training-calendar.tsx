export function TrainingCalendar() {
  // Datos de ejemplo para el calendario
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  const currentMonth = "June"

  // Generar números del 1 al 30 para los días del mes
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)

  // Días con actividades
  const activeDays = [1, 5, 17, 23, 28]
  const completedDays = [1, 5]
  const scheduledDays = [17, 23, 28]

  return (
    <div className="bg-sidebar rounded-3xl p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Training Days</h2>
        <div className="flex items-center space-x-2">
          <span>{currentMonth}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-down"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, index) => (
          <div key={index} className="text-center text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          const isActive = activeDays.includes(day)
          const isCompleted = completedDays.includes(day)
          const isScheduled = scheduledDays.includes(day)

          return (
            <div
              key={day}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-sm
                ${isCompleted ? "bg-yellow text-black" : ""}
                ${isScheduled ? "border border-gray-600" : ""}
                ${isActive && !isCompleted && !isScheduled ? "bg-gray-700" : ""}
                ${!isActive ? "text-gray-500" : ""}
              `}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="flex items-center space-x-6 mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full border border-gray-400"></div>
          <span className="text-sm text-gray-400">Current day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow"></div>
          <span className="text-sm text-gray-400">Done</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full border border-gray-400"></div>
          <span className="text-sm text-gray-400">Scheduled</span>
        </div>
      </div>
    </div>
  )
}
