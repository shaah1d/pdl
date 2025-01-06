"use client"
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

interface ChatFormProps {
    videoId: string;

}

const formSchema = z.object({
    chat: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
})


function ChatForm({ videoId }: ChatFormProps) {

    const [question, setQuestion] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            chat: " "
        }

    })



    const handleAskQuestion = async () => {
        setLoading(true);
        if (!question) {
            console.log("Please enter a question!");
            return;
        }

        try {
            const res = await fetch(`/api/transcript?videoId=${videoId}`);

            if (!res.ok) {
                throw new Error(`Transcript API error: ${res.status}`);
            }

            const dataWithTranscript = await res.json();
            const { transcript } = dataWithTranscript;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ transcript, question }),
            });

            if (!response.ok) {
                throw new Error(`Chat API error: ${response.status}`);
            }

            const data = await response.json();
            setAnswer(data.answer);
        }
        catch (e) {
            console.error("Error in handleAskQuestion:", e);
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <>
            <section className="m-3">
                <main className="mb-3">
                    {question && question.trim() !== " " && (
                        <div className="chat chat-end">
                            <div className="chat-bubble">{question}</div>
                        </div>
                    )}
                    {(loading || answer) && (
                        <div className="chat chat-start">
                            <div className="chat-bubble chat-bubble-error">
                                {loading ? (
                                    <span className="loading loading-dots loading-md"></span>
                                ) : (
                                    <pre className="whitespace-pre-wrap">
                                        {answer}
                                    </pre>
                                )}
                            </div>
                        </div>

                    )}
                </main>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAskQuestion)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="chat"
                            render={({ field }) => (
                                <FormItem>

                                    <FormControl>
                                        <Input
                                            placeholder="what is an offside?"
                                            autoComplete="off"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setQuestion(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Write your question here
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>


            </section>
        </>
    )
}

export default ChatForm