"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"
import { useState } from "react"

interface ThreadPreviewProps {
  tweets: {
    content: string
    imageUrl?: string
  }[]
  profileName: string
  profileUsername: string
  profileImage?: string
}

export function ThreadPreview({ tweets, profileName, profileUsername, profileImage }: ThreadPreviewProps) {
  const [likes, setLikes] = useState<Record<number, boolean>>({})

  const handleLike = (index: number) => {
    setLikes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  if (!tweets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="rounded-full bg-muted p-6 mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Vista previa del hilo</h3>
        <p className="text-muted-foreground max-w-sm">
          Genera un hilo para ver cómo se verá en Twitter. Puedes ajustar el contenido y las opciones según tus
          necesidades.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1 pb-4">
      {tweets.map((tweet, index) => (
        <Card
          key={index}
          className={`border-muted ${index > 0 ? "border-t-0 rounded-t-none" : ""} ${index < tweets.length - 1 ? "border-b-0 rounded-b-none" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileImage || "/placeholder.svg"} />
                <AvatarFallback>{profileName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{profileName}</span>
                  <span className="text-muted-foreground">@{profileUsername}</span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full ml-1">
                      Hilo
                    </span>
                  )}
                </div>

                <div className="mt-1 whitespace-pre-wrap">{tweet.content}</div>

                {tweet.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border">
                    <img
                      src={tweet.imageUrl || "/placeholder.svg"}
                      alt="Tweet media"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between mt-3 text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">4</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Repeat2 className="h-4 w-4" />
                    <span className="text-xs">12</span>
                  </button>
                  <button
                    className={`flex items-center gap-1 transition-colors ${likes[index] ? "text-red-500" : "hover:text-red-500"}`}
                    onClick={() => handleLike(index)}
                  >
                    <Heart className={`h-4 w-4 ${likes[index] ? "fill-current" : ""}`} />
                    <span className="text-xs">{likes[index] ? "21" : "20"}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
