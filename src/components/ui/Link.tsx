"use client"
import {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

const formSchema = z.object({
  videoUrl: z.string().min(2, {
    message: "Video URL is required",
  }),
})

export default function Link() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscript = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      setError(null);
     
      const videoId = extractVideoId(values.videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      const response = await fetch(`/api/transcript?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const data = await response.json();
      setTranscript(data);
      form.reset();
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setTranscript(null);
      setLoading(false);
    }
  };

  // Helper function to extract video ID from various YouTube URL formats, used chatgpt for this
  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
     
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
   
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(fetchTranscript)} className="space-y-8">
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>
                  Paste your YouTube video URL here
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Generate"
            )}
          </Button>
        </form>
      </Form>

      {error && <p className="text-red-500">{error}</p>}
      {transcript && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">What the video is about:</h2>
          <pre className="whitespace-pre-wrap">{transcript}</pre>
        </div>
      )}
    </>
  )
}


