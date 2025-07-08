"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2, Share, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ThreadPreviewProps {
  tweets: {
    content: string;
    imageUrl?: string;
  }[];
  profileName: string;
  profileUsername: string;
  profileImage?: string;
}

export function ThreadPreview({
  tweets,
  profileName,
  profileUsername,
  profileImage,
}: ThreadPreviewProps) {
  const [copiedStates, setCopiedStates] = useState<Record<number | 'all', boolean>>({} as Record<number | 'all', boolean>);

  const handleCopy = async (text: string, key: number | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyAll = () => {
    const allContent = tweets.map(tweet => tweet.content).join('\n\n');
    handleCopy(allContent, 'all');
  };

  const handleCopyTweet = (index: number) => {
    handleCopy(tweets[index].content, index);
  };

  if (!tweets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="rounded-full bg-muted p-6 mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Vista previa del hilo</h3>
        <p className="text-muted-foreground max-w-sm">
          Genera un hilo para ver cómo se verá en Twitter. Puedes ajustar el
          contenido y las opciones según tus necesidades.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">      
      {tweets.map((tweet, index) => (
        <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Tweet {index + 1}/{tweets.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCopyTweet(index)}
              className="gap-2 h-8"
            >
              {copiedStates[index] ? (
                <>
                  <Check className="h-3 w-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {tweet.content}
          </div>

          {tweet.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              <img
                src={tweet.imageUrl || "/placeholder.svg"}
                alt="Tweet media"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
