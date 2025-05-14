import { MoreHorizontal, Plus } from "lucide-react"
import Image from "next/image"

export function MyHabits() {
  // Datos de ejemplo
  const habits = [
    {
      id: 1,
      name: "Stretching",
      trainer: "Alice McCain",
      completed: 9,
      total: 12,
      image: "stretching",
    },
    {
      id: 2,
      name: "Yoga training",
      trainer: "Jennifer Lubin",
      completed: 6,
      total: 10,
      image: "yoga",
    },
    {
      id: 3,
      name: "Massage",
      trainer: "Johnson Cooper",
      completed: 4,
      total: 8,
      image: "massage",
    },
    {
      id: 4,
      name: "Ab exercises",
      trainer: "",
      completed: 8,
      total: 10,
      image: "abs",
    },
  ]

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Habits</h2>
        <button className="flex items-center space-x-2 text-sm font-medium">
          <span>Add New</span>
          <div className="w-6 h-6 bg-sidebar rounded-full flex items-center justify-center text-white">
            <Plus size={14} />
          </div>
        </button>
      </div>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center">
                <Image
                  src={`/placeholder.svg?height=40&width=40&query=${habit.image} fitness icon`}
                  alt={habit.name}
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h3 className="font-medium">{habit.name}</h3>
                {habit.trainer && <p className="text-sm text-gray-500">Trainer: {habit.trainer}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-right">
                  Sessions completed: {habit.completed}/{habit.total}
                </p>
                <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-coral rounded-full"
                    style={{ width: `${(habit.completed / habit.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button>
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
