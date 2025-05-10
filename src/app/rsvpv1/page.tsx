'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps, FieldValues } from "react-hook-form";
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
import { supabase } from '@/lib/supabase';

// Update form schema to match database
const formSchema = z.object({
  name1: z.string().min(1, "Name is required"),
  name2: z.string().optional(),
  attending: z.enum(["yes", "no"] as const, {
    required_error: "Please select whether you're attending.",
  }),
  events: z.object({
    allEvents: z.boolean().optional(),
    welcomeParty: z.boolean(),
    wedding: z.boolean(),
    beachDay: z.boolean(),
    boatDay: z.boolean(),
  }),
  allergies1: z.string().optional(),
  allergies2: z.string().optional(),
  name3: z.string().optional(),
  allergies3: z.string().optional(),
  name4: z.string().optional(),
  allergies4: z.string().optional(),
  staying: z.string().optional(),
  travel: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Update the field type
type FieldType = ControllerRenderProps<FieldValues, string>;

export default function RSVPPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name1: "",
      name2: "",
      attending: "yes",
      events: {
        allEvents: true,
        welcomeParty: true,
        wedding: true,
        beachDay: true,
        boatDay: false,
      },
      allergies1: "",
      allergies2: "",
      name3: "",
      allergies3: "",
      name4: "",
      allergies4: "",
      staying: "",
      travel: "",
    },
  });

  // Watch form values for styling
  const name1Value = form.watch('name1');
  const name2Value = form.watch('name2');
  const name3Value = form.watch('name3');
  const name4Value = form.watch('name4');

  // Handle allEvents changes
  const handleAllEventsChange = (checked: boolean) => {
    form.setValue('events.welcomeParty', checked);
    form.setValue('events.wedding', checked);
    form.setValue('events.beachDay', checked);
  };

  // Handle individual event changes
  const updateAllEventsState = () => {
    const values = form.getValues('events');
    const allChecked = values.welcomeParty && values.wedding && values.beachDay;
    form.setValue('events.allEvents', allChecked);
  };

  async function onSubmit(values: FormValues) {
    try {
      // Check if we have valid Supabase credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase credentials not found');
        alert('Unable to submit form. Please contact the site administrator.');
        return;
      }

      const { data, error } = await supabase
        .from('donut_rsvps')
        .insert([
          {
            name1: values.name1,
            name2: values.name2 || null,
            name3: values.name3 || null,
            name4: values.name4 || null,
            attending: values.attending === "yes",
            welcome_party: values.events.welcomeParty,
            wedding: values.events.wedding,
            beach_day: values.events.beachDay,
            boat_day: values.events.boatDay,
            allergies1: values.allergies1 || null,
            allergies2: values.allergies2 || null,
            allergies3: values.allergies3 || null,
            allergies4: values.allergies4 || null,
            staying: values.staying || null,
            travel: values.travel || null,
          }
        ])
        .select();

      if (error) {
        console.error('Error submitting RSVP:', error);
        alert('Error submitting RSVP. Please try again.');
        return;
      }

      alert('RSVP submitted successfully!');
      console.log('Submission successful:', data);
      
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <main className="min-h-screen py-4 px-4 bg-background">
      <div className="max-w-3xl mx-auto p-4 border-2 border-blue/15 rounded-lg shadow-xl">
        <h1 className="text-xl font-light text-blue mb-8 text-left md:text-3xl md:text-center tracking-widest">
          RSVP for Lauren & David
        </h1>
        <div className="bg-card rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <FormField
                control={form.control}
                name="name1"
                render={({ field }: { field: FieldType }) => (
                  <FormItem className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                      <FormLabel className="text-lg text-blue tracking-wider">Formal Name</FormLabel>
                      <span className="text-xs font-light text-blue/80 italic mt-1 md:mt-0">please include nobility titles or CFA level if relevant</span>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="Guest 1"
                        {...field} 
                        variant="form"
                        hasValue={!!name1Value}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name2"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>

                    {/* <FormLabel className="text-lg text-blue tracking-wider">Guest 2</FormLabel> */}
                    
                    <FormControl>
                      <Input 
                        placeholder="Guest 2" 
                        {...field} 
                        variant="form"
                        hasValue={!!name2Value}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attending"
                render={({ field }: { field: FieldType }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg text-blue tracking-wider">Attending?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2">

                        <div className="flex flex-col md:flex-row gap-4 w-full justify-start mx-auto">
                            <div className={cn("group w-full", field.value === "yes" && "selected")}>
                              <Button 
                                variant="radpos" size="sm"
                                className={cn(
                                  "w-full h-10",
                                  field.value === "yes" && "bg-green border-green text-white"
                                )}
                                onClick={() => field.onChange("yes")}
                              >
                                <Check className="mr-2" />
                                <div className="flex items-baseline">
                                  <span className="font-bold text-lg tracking-widest">Oui!</span>&nbsp;&nbsp;
                                  <span>Allons-y! YOLO! Can't Wait!</span>
                                </div>
                              </Button>
                            </div>
                            <div className={cn("group w-full", field.value === "no" && "selected")}>
                              <Button 
                                variant="radneg" size="sm"
                                className={cn(
                                  "w-full h-10",
                                  field.value === "no" && "bg-pink border-pink text-white "
                                )}
                                onClick={() => field.onChange("no")}
                              >
                                <X className="mr-2" />
                                <div className="flex items-baseline">
                                  <span className="font-bold text-lg tracking-widest">Non</span>&nbsp;&nbsp;
                                  <span>I'm ok living a life of regret</span>
                                </div>
                              </Button>
                            </div>
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
                render={({ field }: { field: FieldType }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg text-blue tracking-wider">Events?</FormLabel>
                    <div className="flex flex-col gap-4">
                      <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked: boolean) => {
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
                        render={({ field }: { field: FieldType }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
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
                        render={({ field }: { field: FieldType }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
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
                        name="events.beachDay"
                        render={({ field }: { field: FieldType }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
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
                                <span className="font-bold">Beach Day</span> &nbsp;Sat 6/21
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="text-sm text-blue/60 mt-0 italic">
                        Optional
                      </div>

                      <FormField
                        control={form.control}
                        name="events.boatDay"
                        render={({ field }: { field: FieldType }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
                                  field.onChange(checked);
                                }}
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
                name="name3"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Guest 3</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Guest 3" 
                        {...field} 
                        variant="form"
                        hasValue={!!name3Value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            <FormField
                control={form.control}
                name="name4"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Guest 4</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Guest 4" 
                        {...field} 
                        variant="form"
                        hasValue={!!name4Value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies1"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Allergies</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Guest 1" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies2"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    
                    <FormControl>
                      <Input 
                        placeholder="Guest 2" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="allergies3"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    
                    <FormControl>
                      <Input 
                        placeholder="Guest 3" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              

              <FormField
                control={form.control}
                name="allergies4"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Guest 4" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staying"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Staying?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Hotel, Airbnb, etc" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="travel"
                render={({ field }: { field: FieldType }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-blue tracking-wider">Travel?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Flight, train, etc" 
                        {...field} 
                        className="rounded-none border-b-2 border-blue px-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full bg-blue hover:bg-green text-white font-bold py-4 px-4 text-lg tracking-wider"
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