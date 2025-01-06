"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
    videoUrl: z.string().min(2, {
        message: "Video URL is required",
    }),
});

export function ProfileForm({ onVideoIdUpdate }: { onVideoIdUpdate: (id: string) => void }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoUrl: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const fetchTranscript = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            setError(null);
            const videoId = extractVideoId(values.videoUrl);
            setId(videoId);
            if (!videoId) {
                throw new Error("Invalid YouTube URL");
            }

            onVideoIdUpdate(videoId); // Pass videoId to parent

            const response = await fetch(`/api/transcript?videoId=${videoId}`);
            if (!response.ok) {
                const error = response.text();
                throw new Error(`Failed to fetch transcript: ${error}`);
            }

            const data = await response.json();
            setTranscript(data.summary || "No summary available.");
            form.reset();
        } catch (err: any) {
            setError(err.message);
            setTranscript(null);
        } finally {
            setLoading(false);
        }
    };

    const extractVideoId = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes("youtube.com")) {
                return urlObj.searchParams.get("v");
            }
            if (urlObj.hostname === "youtu.be") {
                return urlObj.pathname.slice(1);
            }
            return null;
        } catch {
            return null;
        }
    };

    return (
        <>
            {!transcript ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(fetchTranscript)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="videoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://youtube.com"
                                            autoComplete="off"
                                            {...field}
                                            disabled={loading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Paste your YouTube video URL here
                                    </FormDescription>
                                    <FormMessage>
                                        {form.formState.errors.videoUrl?.message || error}
                                    </FormMessage>
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
            ) : (
                <div className="m-8">
                    <iframe
                    className="rounded-lg overflow-hidden shadow-lg"
                        width="md:560 400"
                        height="md:315 auto"
                        src={`https://www.youtube.com/embed/${id}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                  
                    {/* <h2 className="text-xl font-bold">What the video is about:</h2>
                    <pre className="whitespace-pre-wrap">
                        {typeof transcript === "string"
                            ? transcript
                            : JSON.stringify(transcript, null, 2)}
                    </pre>
                    <Button onClick={() => setTranscript(null)} className="mt-4">
                        Generate Another
                    </Button> */}
                </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
        </>
    );
}

