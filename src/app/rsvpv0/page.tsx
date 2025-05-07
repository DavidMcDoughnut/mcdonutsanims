'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Define the form schema with proper types
const formSchema = z.object({
  name: z.string(),
  attending: z.enum(["yes", "no"] as const, {
    required_error: "Please select whether you're attending.",
  }),
  events: z.object({
    allEvents: z.boolean(),
    welcomeParty: z.boolean(),
    wedding: z.boolean(),
    beachClub: z.boolean(),
    boatDay: z.boolean(),
  }),
  dietaryRestrictions: z.string().optional(),
});

// Extract the inferred type
type FormValues = z.infer<typeof formSchema>;

export default function RSVPPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attending: "yes",
      events: {
        allEvents: true,
        welcomeParty: true,
        wedding: true,
        beachClub: true,
        boatDay: false,
      },
      dietaryRestrictions: "",
    },
  });

  // Handle allEvents changes
  const handleAllEventsChange = (checked: boolean) => {
    form.setValue('events.welcomeParty', checked);
    form.setValue('events.wedding', checked);
    form.setValue('events.beachClub', checked);
  };

  // Handle individual event changes
  const updateAllEventsState = () => {
    const values = form.getValues('events');
    const allChecked = values.welcomeParty && values.wedding && values.beachClub;
    form.setValue('events.allEvents', allChecked);
  };

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue mb-8 text-center">
          RSVP Form
        </h1>
        <div className="bg-card rounded-lg shadow-xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Guest #1</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Formal name" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue  px-0"
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
                    <FormLabel className="text-lg text-blue tracking-wider">Attending?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2">

                        <div className="flex flex-col gap-4 w-1/2 justify-startmx-auto">
                            <Button 
                              variant="radpos" 
                              className={cn(
                                "flex-1 w-full",
                                field.value === "yes" && "bg-green border-green text-white"
                              )}
                              onClick={() => field.onChange("yes")}
                            >
                              <Check className="" />
                              <span className="font-bold">OUI</span> Allons-y! YOLO! Can't Wait!
                            </Button>
                            <Button 
                              variant="radneg" 
                              className={cn(
                                "flex-1 w-full",
                                field.value === "no" && "bg-pink border-pink text-white"
                              )}
                              onClick={() => field.onChange("no")}
                            >
                              <X className="" />
                              <span className="font-bold">NON</span> I'm ok living a life of regret
                            </Button>
                        </div>

                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="events.allEvents"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg text-blue tracking-wider">Which Events?</FormLabel>
                    <div className="flex flex-col gap-4">
                      <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleAllEventsChange(Boolean(checked));
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={cn(
                            "font-bold transition-colors",
                            field.value && "text-green"
                          )}>
                            All Events! Whooh!
                          </FormLabel>
                        </div>
                      </FormItem>

                      <FormField
                        control={form.control}
                        name="events.welcomeParty"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  updateAllEventsState();
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "transition-colors",
                                field.value && "text-green"
                              )}>
                                <span className="font-bold">Welcome Party</span> &nbsp;Thurs 6/19
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="events.wedding"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  updateAllEventsState();
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "transition-colors",
                                field.value && "text-green"
                              )}>
                                <span className="font-bold">Wedding</span> &nbsp;Fri 6/20
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="events.beachClub"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  updateAllEventsState();
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "transition-colors",
                                field.value && "text-green"
                              )}>
                                <span className="font-bold">Beach Club</span> &nbsp;Sat 6/21
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    <div className="text-sm text-muted-foreground mt-4">
                    100% Optional
                    </div>
                      <FormField
                        control={form.control}
                        name="events.boatDay"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "transition-colors",
                                field.value && "text-green"
                              )}>
                                <span className="font-bold">Yes, I want to join Sunday boat trip to St Tropez</span> 
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Dietary Restrictions?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Allergies, preferences, etc" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
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