"use client"
import React, { useState } from 'react'
import { ProfileForm } from '~/components/Forms/getvideoForm'
import ChatForm from '~/components/Forms/ChatForm';

function Page() {
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleVideoIdUpdate = (id: string) => {
    setVideoId(id);
};

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <ProfileForm onVideoIdUpdate={handleVideoIdUpdate} />
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        {videoId && <ChatForm videoId={videoId} />}
      </div>
    </div>
  )
}

export default Page