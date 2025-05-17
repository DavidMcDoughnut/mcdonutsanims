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
    babysitting: z.boolean(),
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
  const [showForm, setShowForm] = React.useState(false);

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
        babysitting: false,
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
            babysitting: values.events.babysitting,
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
    <>
      {/* SVG Filter Definition */}
      <svg className="fixed w-0 h-0 z-[9999]">
        <defs>
          <filter id='roughpaper' x='0%' y='0%' width='100%' height="100%">
            <feTurbulence type="fractalNoise" baseFrequency='0.12' result='noise' numOctaves="4" />
            <feDiffuseLighting in='noise' lightingColor='white' surfaceScale='8'>
              <feDistantLight azimuth='45' elevation='40' />
            </feDiffuseLighting>
          </filter>
        </defs>
      </svg>

      <main className="h-[100dvh] overflow-hidden">
        <div className="fixed inset-0">
          <Image
            src="/optimized/formbgarr2.webp"
            alt="Background"
            fill
            priority
            quality={100}
            className="object-cover"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              imageRendering: "crisp-edges"
            }}
            unoptimized={true}
          />
        </div>

        {/* Start RSVP Button */}
        <div 
          id="navbtns" 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-[40%] -translate-y-1/2 w-full max-w-md px-4 transition-all duration-500",
            showForm && "opacity-0 pointer-events-none"
        )}>
          {/* Background div for shadow and border effect */}
          <div
            id="buttonbg"
            className={cn(
              "absolute top-0 left-4 right-4 h-16", // Positioned within navbtns padding, matches button height
              "rounded-xl border-1.5 border-white shadow-intense", // Matches button's xl size radius, rsvp border, and desired shadow
              "opacity-0 animate-content-fade-in -z-10 pointer-events-none" // Animation for delayed appearance, behind button, non-interactive
            )}
          />
          <Button
            variant="rsvp"
            size="xl"
            onClick={() => setShowForm(true)}
            className="w-full text-xl md:text-2xl py-8 tracking-widest font-normal relative"
          >
            <Image
              src="/favicon-32x32.png"
              alt=""
              width={32}
              height={32}
              className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 animate-content-fade-in"
            />
            <span className="opacity-0 animate-content-fade-in">
              RSVP, allons-y!
            </span>
            <Image
              src="/favicon-32x32.png"
              alt=""
              width={32}
              height={32}
              className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 animate-content-fade-in"
            />
          </Button>
          {/* Future buttons can be added here */}
        </div>

        {/* Form Section */}
        <div className={cn(
          "h-full flex items-center justify-center fixed inset-0",
          !showForm && "pointer-events-none"
        )}>
          <div className="relative flex justify-center w-full h-full max-h-[calc(100dvh-80px)] md:max-h-none overflow-y-auto custom-scrollbar overflow-y-auto px-4 md:px-8 py-4">
            <div 
              id="formcard" 
              className={cn(
                "w-full max-w-2xl p-4 md:px-12 md:pb-12 md:pt-6 border-2 border-blue rounded-3xl shadow-paper bg-white/80 backdrop-blur-md relative overflow-hidden my-auto transform-gpu",
                "transition-all duration-1000 ease-[cubic-bezier(0.2,0,0,1)]",
                !showForm && "opacity-0 translate-y-8",
                showForm && "opacity-100 translate-y-0 delay-500"
              )}
            >
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  filter: 'url(#roughpaper)',
                  opacity: 0.04,
                  zIndex: 1
                }}
              />
              {/* Content container */}
              <div className="relative z-10">
                <div className="w-full mb-8">
                  <Image
                    src="/rsvp-head.png"
                    alt="RSVP for Lauren & David"
                    width={800}
                    height={100}
                    className="w-full h-auto"
                    priority
                  />
                </div>
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
                                <FormLabel className="text-lg text-blue tracking-wider font-bold">Names</FormLabel>
                                <span className="text-xs font-light text-blue/80 italic mt-1 md:mt-0">plz include nobility title if relevant</span>
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
                            <FormLabel className="text-lg text-blue tracking-wider font-bold">Attending?</FormLabel>
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
                      <div className={cn("transition-opacity duration-300", attendingValue !== 'yes' && "opacity-15")}>
                        <FormField
                          control={form.control}
                          name="events.allEvents"
                          render={({ field }: { field: FieldType }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-lg text-blue tracking-wider font-bold">Events?</FormLabel>
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
                                          <span className="font-bold">La Vie en Rose Beach Club</span> &nbsp;Sat 6/21
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

                                <div className="text-sm text-green mt-0 italic">
                                 Optional Add-Ons
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
                                          <span className="font-bold">I'm in for Sunday boat to St Tropez</span>
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

                                <FormField
                                  control={form.control}
                                  name="events.babysitting"
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
                                <FormLabel className="text-lg text-blue tracking-wider font-bold">Logistics</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Other" 
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
          </div>
        </div>
      </main>
    </>
  );
} 