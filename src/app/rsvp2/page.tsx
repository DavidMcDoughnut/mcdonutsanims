'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps, FieldValues } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Plus } from "lucide-react";
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
import Image from 'next/image';

// Update form schema to match database
const formSchema = z.object({
  name1: z.string().min(1, "Name is required"),
  name2: z.string().optional(),
  name3: z.string().optional(),
  name4: z.string().optional(),
  name5: z.string().optional(),
  attending: z.enum(["yes", "no", ""] as const),
  events: z.object({
    allEvents: z.boolean().optional(),
    welcomeParty: z.boolean(),
    wedding: z.boolean(),
    beachDay: z.boolean(),
    boatDay: z.boolean(),
  }),
  allergies1: z.string().optional(),
  allergies2: z.string().optional(),
  allergies3: z.string().optional(),
  allergies4: z.string().optional(),
  allergies5: z.string().optional(),
  staying: z.string().optional(),
  travel: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Update the field type
type FieldType = ControllerRenderProps<FieldValues, string>;

export default function RSVPPage() {
  const [showAdditionalGuests, setShowAdditionalGuests] = React.useState(false);

  const addGuests = () => {
    setShowAdditionalGuests(true);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name1: "",
      name2: "",
      name3: "",
      name4: "",
      name5: "",
      attending: "",
      events: {
        allEvents: false,
        welcomeParty: false,
        wedding: false,
        beachDay: false,
        boatDay: false,
      },
      allergies1: "",
      allergies2: "",
      allergies3: "",
      allergies4: "",
      allergies5: "",
      staying: "",
      travel: "",
    },
  });

  // Watch form values for styling
  const name1Value = form.watch('name1');
  const name2Value = form.watch('name2');
  const name3Value = form.watch('name3');
  const name4Value = form.watch('name4');
  const name5Value = form.watch('name5');

  // Watch the attending field value for opacity changes
  const attendingValue = form.watch('attending');

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

      // Validate that attending is selected
      if (values.attending === "") {
        alert('Please select whether you are attending.');
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
            name5: values.name5 || null,
            attending: values.attending === "yes",
            welcome_party: values.events.welcomeParty,
            wedding: values.events.wedding,
            beach_day: values.events.beachDay,
            boat_day: values.events.boatDay,
            allergies1: values.allergies1 || null,
            allergies2: values.allergies2 || null,
            allergies3: values.allergies3 || null,
            allergies4: values.allergies4 || null,
            allergies5: values.allergies5 || null,
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
    <main className="min-h-[100dvh] relative">
      <div className="fixed inset-0">
        <Image
          src="/optimized/vebg-static.webp"
          alt="Background"
          fill
          priority
          className="object-cover opacity-50"
        />
      </div>
      <div className="relative flex justify-center py-4 md:py-8 px-4 md:px-8">
        <div id="formcard" className="w-full max-w-2xl p-4 md:p-12 border-2 border-blue rounded-lg shadow-xl bg-white/80 backdrop-blur-md flex flex-col">
          <h1 className="text-xl font-light text-blue mb-8 text-left md:text-3xl md:text-center tracking-widest flex-shrink-0">
            RSVP for Lauren & David
          </h1>
          <div className="rounded-lg isolate">
            <Form {...form}>
              <form id="rsvp-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                {/* Names Section */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name1"
                    render={({ field }) => (
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
                        <FormControl>
                          <Input 
                            placeholder="Guest 2" 
                            {...field} 
                            variant="form"
                            hasValue={!!name2Value}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!showAdditionalGuests && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue/60 hover:text-blue border-blue/40 hover:border-green mt-1 [&_svg]:!size-5 !bg-transparent !gap-1"
                      onClick={addGuests}
                    >
                      <Plus />
                      Add Guests
                    </Button>
                  )}

                  {showAdditionalGuests && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name3"
                        render={({ field }: { field: FieldType }) => (
                          <FormItem>
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
                        name="name5"
                        render={({ field }: { field: FieldType }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Guest 5" 
                                {...field} 
                                variant="form"
                                hasValue={!!name5Value}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Attending Section */}
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
                              <div className={cn("group w-full", field.value === "no" && "selected")}>
                                <Button
                                  type="button"
                                  variant="radneg" size="sm"
                                  className={cn(
                                    "w-full h-10",
                                    field.value === "no" && "bg-pink border-pink text-white "
                                  )}
                                  onClick={() => field.onChange("no")}
                                >
                                  <X className="mr-0" />
                                  <div className="flex items-baseline">
                                    <span className="font-bold text-lg tracking-widest">Non</span>&nbsp;&nbsp;
                                    <span>I'm ok living a life of regret</span>
                                  </div>
                                </Button>
                              </div>
                              <div className={cn("group w-full", field.value === "yes" && "selected")}>
                                <Button
                                  type="button"
                                  variant="radpos" size="sm"
                                  className={cn(
                                    "w-full h-10",
                                    field.value === "yes" && "bg-green border-green text-white"
                                  )}
                                  onClick={() => {
                                    field.onChange("yes");
                                    form.setValue('events.allEvents', true);
                                    form.setValue('events.welcomeParty', true);
                                    form.setValue('events.wedding', true);
                                    form.setValue('events.beachDay', true);
                                    // boatDay remains as per its independent checkbox state
                                  }}
                                >
                                  <Check className="mr-0" />
                                  <div className="flex items-baseline">
                                    <span className="font-bold text-lg tracking-widest">Oui!</span>&nbsp;&nbsp;
                                    <span>Allons-y! YOLO! Can't Wait!</span>
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

                {/* Events Section */}
                <div className={cn("transition-opacity duration-300", attendingValue !== 'yes' && "opacity-30")}>
                  <FormField
                    control={form.control}
                    name="events.allEvents"
                    render={({ field }: { field: FieldType }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-lg text-blue tracking-wider">Events?</FormLabel>
                        <div className="flex flex-col gap-4">
                          <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "font-bold transition-colors",
                                field.value && "text-green"
                              )}>
                                All Events! Whooh!
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
                                  field.onChange(checked);
                                  handleAllEventsChange(Boolean(checked));
                                }}
                              />
                            </FormControl>
                          </FormItem>

                          <FormField
                            control={form.control}
                            name="events.welcomeParty"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={cn(
                                    "transition-colors",
                                    field.value && "text-green"
                                  )}>
                                    <span className="font-bold">Welcome Party</span> &nbsp;Thurs 6/19
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                      updateAllEventsState();
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="events.wedding"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={cn(
                                    "transition-colors",
                                    field.value && "text-green"
                                  )}>
                                    <span className="font-bold">Wedding</span> &nbsp;Fri 6/20
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                      updateAllEventsState();
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="events.beachDay"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={cn(
                                    "transition-colors",
                                    field.value && "text-green"
                                  )}>
                                    <span className="font-bold">Beach Day</span> &nbsp;Sat 6/21
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                      updateAllEventsState();
                                    }}
                                  />
                                </FormControl>
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
                              <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={cn(
                                    "transition-colors",
                                    field.value && "text-green"
                                  )}>
                                    <span className="font-bold">Yes, I want to join Sunday boat trip to St Tropez</span>
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="text-sm text-blue/60 mt-0 italic">
                            Childcare
                          </div>

                          <FormField
                            control={form.control}
                            name="events.boatDay"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem className="flex items-center justify-between w-full space-y-0 hover:text-green hover:cursor-pointer transition-colors">
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={cn(
                                    "transition-colors",
                                    field.value && "text-green"
                                  )}>
                                    <span className="font-bold">Yes, we'd love childcare help</span>
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Travel Logistics Section */}
                <div className={cn("transition-opacity duration-300", attendingValue !== 'yes' && "opacity-30")}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="staying"
                      render={({ field }: { field: FieldType }) => (
                        <FormItem>
                          <FormLabel className="text-lg text-blue tracking-wider">Travel Logistics</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Hotel, Airbnb, etc" 
                              {...field} 
                              variant="form"
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
                          <FormControl>
                            <Input 
                              placeholder="Flight, train, etc" 
                              {...field} 
                              variant="form"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Allergies Section */}
                <div className={cn("transition-opacity duration-300", attendingValue !== 'yes' && "opacity-30")}>
                  <div className="space-y-6">
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
                              variant="form"
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
                              variant="form"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {showAdditionalGuests && (
                      <>
                        <FormField
                          control={form.control}
                          name="allergies3"
                          render={({ field }: { field: FieldType }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  placeholder="Guest 3" 
                                  {...field} 
                                  variant="form"
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
                                  variant="form"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allergies5"
                          render={({ field }: { field: FieldType }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  placeholder="Guest 5" 
                                  {...field} 
                                  variant="form"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <div className="mt-12">
            <Button 
              type="submit"
              form="rsvp-form"
              className="w-full bg-blue hover:bg-green text-white font-bold py-4 px-4 text-lg tracking-wider"
            >
              Submit RSVP
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 