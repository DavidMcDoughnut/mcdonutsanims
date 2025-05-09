'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema with proper types
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  attending: z.enum(["yes", "no"] as const, {
    required_error: "Please select whether you're attending.",
  }),
  dietaryRestrictions: z.boolean(),
});

// Extract the inferred type
type FormValues = z.infer<typeof formSchema>;

export default function RSVPPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      attending: "yes",
      dietaryRestrictions: false,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue mb-8 text-center">
          RSVP Form
        </h1>
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                        className="border-blue focus-visible:ring-1 focus-visible:ring-blue"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field}
                        className="border-blue focus-visible:ring-1 focus-visible:ring-blue"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attending"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">Will you be attending?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="yes" 
                              className="border-blue text-blue focus:ring-blue focus:ring-offset-2"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-base">
                            Yes, I will attend
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="no" 
                              className="border-blue text-blue focus:ring-blue focus:ring-offset-2"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-base">
                            No, I cannot attend
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-blue data-[state=checked]:bg-blue data-[state=checked]:border-blue focus:ring-1 focus:ring-blue"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base">
                        I have dietary restrictions
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full bg-blue hover:bg-pink text-white font-semibold py-2 px-4"
              >
                Submit RSVP
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
} 