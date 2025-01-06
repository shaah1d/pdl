"use client"
import React, { useState } from 'react'
import { ProfileForm } from '~/components/Forms/getvideoForm'
import ChatForm from '~/components/Forms/ChatForm';

function page() {
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleVideoIdUpdate = (id: string) => {
    setVideoId(id);
};

  return (
    <div className="flex w-full min-h-screen">
      <div className="w-1/2 flex items-center justify-center">
      <ProfileForm onVideoIdUpdate={handleVideoIdUpdate} />
      </div>
      
      <div className="w-1/2 flex items-center justify-center">
      {videoId && <ChatForm videoId={videoId} />}
      </div>
    </div>
  )
}

export default page