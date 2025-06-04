'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps, FieldValues } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, Plus, PartyPopper, ChevronDown, ArrowDown, ChevronUp, HeartCrack, Frown, ThumbsDown } from "lucide-react";
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
import { SelectHotel } from '@/components/ui/select-hotel';

// Update form schema to match database
const formSchema = z.object({
  name1: z.string().min(1, "Name is required"),
  name2: z.string().optional(),
  name3: z.string().optional(),
  name4: z.string().optional(),
  name5: z.string().optional(),
  attending: z.enum(["yes", "no", ""] as const),
  events: z.object({
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
  const [showResponse, setShowResponse] = React.useState(false);
  const [nextClicked, setNextClicked] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [showBabysittingInfo, setShowBabysittingInfo] = React.useState(false);

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

  // Check if any names have been entered
  const hasAnyNames = !!(name1Value || name2Value || name3Value || name4Value || name5Value);

  async function onSubmit(values: FormValues) {
    try {
      setSubmitStatus('idle');
      
      // Check if we have valid Supabase credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase credentials not found');
        setSubmitStatus('error');
        return;
      }

      // Validate that attending is selected
      if (values.attending === "") {
        setSubmitStatus('error');
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
        setSubmitStatus('error');
        return;
      }

      setSubmitStatus('success');
      console.log('Submission successful:', data);
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
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
        <div className={cn(
          "fixed inset-0 transition-opacity duration-500",
          showForm && "opacity-20"
        )}>
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
            "absolute left-1/2 -translate-x-1/2 top-[40%] -translate-y-1/2 w-full max-w-md px-8 md:px-4",
            showForm ? "animate-fade-out-up pointer-events-none" : "transition-opacity duration-500 opacity-100"
        )}>
          {/* Background div for shadow and border effect */}
          <div
            id="buttonbg"
            className={cn(
              "absolute top-0 left-8 right-8 md:left-4 md:right-4 h-16", // Positioned within navbtns padding, matches button height
              "rounded-xl border-1.5 border-white shadow-intense", // Matches button's xl size radius, rsvp border, and desired shadow
              "opacity-0 animate-content-fade-in -z-10 pointer-events-none" // Animation for delayed appearance, behind button, non-interactive
            )}
          />
          <Button
            variant="rsvp"
            size="xl"
            onClick={() => setShowForm(true)}
            className="w-full text-lg md:text-2xl py-4 tracking-widest font-normal relative"
          >
            <Image
              src="/favicon-32x32.png"
              alt=""
              width={32}
              height={32}
              className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 animate-content-fade-in"
            />
            <span className="opacity-0 animate-content-fade-in font-bold">
              RSVP!
            </span>
            <span className="opacity-0 animate-content-fade-in">
              Allons-y!
            </span>
            <Image
              src="/favicon-32x32.png"
              alt=""
              width={32}
              height={32}
              className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 animate-content-fade-in"
            />
          </Button>
          {/* Future buttons can be added here */}
        </div>

        {/* Success Message */}
        <div className={cn(
          "fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-all duration-300",
          submitStatus === 'success' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div className="bg-white/90 backdrop-blur-md border-2 border-green rounded-2xl px-4 py-6 max-w-md mx-4 text-center transform transition-all duration-300 scale-100">
            <div className="flex justify-center items-center mb-4">
              <PartyPopper className="w-16 h-16 text-green" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-blue mb-2">Merci beaucoup!</h2>
            <p className="text-green font-medium mb-6">We've received your RSVP!</p>
            <p className="text-blue mb-6 text-sm">Now, lets all do our part to spend our way out of this trade war so the stocks go back up</p>
            <Button
              onClick={() => window.location.href = 'https://themcdonuts.com'}
              className="bg-green text-white hover:bg-blue"
            >
              Home
            </Button>
          </div>
        </div>

        {/* Error Message */}
        <div className={cn(
          "fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-all duration-300",
          submitStatus === 'error' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div className="bg-white/90 backdrop-blur-md border-2 border-pink rounded-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-300 scale-100">
            <X className="w-16 h-16 text-pink mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue mb-2">Oops!</h2>
            <p className="text-blue/80 mb-6">Something went wrong. Please try again or contact us directly.</p>
            <Button
              onClick={() => setSubmitStatus('idle')}
              className="bg-pink text-white hover:bg-blue"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className={cn(
          "h-full flex items-center justify-center fixed inset-0",
          !showForm && "pointer-events-none"
        )}>
          {/* This inner div is to ensure the scrollbar/overflow handling for the content doesn't interfere with the centering and fixed positioning of the card itself */}
          <div id="form-scroll-container" className="relative flex justify-center w-full h-full overflow-y-auto custom-scrollbar overflow-y-auto px-4 md:px-8 py-4">
            <div 
              id="formcard" 
              className={cn(
                "w-full max-w-2xl p-4 md:px-12 md:pb-12 md:pt-4 border-2 border-blue rounded-3xl shadow-paper bg-white/80 backdrop-blur-md relative overflow-hidden my-auto transform-gpu",
                "transition-all duration-1000 ease-[cubic-bezier(0.2,0,0,1)]",
                !showForm && "opacity-0 translate-y-40",
                showForm && "opacity-100 translate-y-0"
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
                <div className="w-full mb-8 flex items-center justify-between">
                  {/* Home Button */}
                  <a 
                    href="https://themcdonuts.com" 
                    className="flex flex-col items-center cursor-pointer group/btn mb-24 md:mb-12 w:16 md:w-24"
                  >
                    <Image
                      src="/villa-icon-1k.png"
                      alt="Home"
                      width={80}
                      height={80}
                      className="w-16 md:w-20 h-16 md:h-20 transform-gpu origin-center transition-transform duration-300 ease-out group-hover/btn:scale-[1.15]"
                    />
                    <span className="text-blue group-hover/btn:text-green text-xs md:text-sm tracking-widest group-hover/btn:tracking-[.25em] font-semibold uppercase transition-all duration-300 ease-out text-center">
                      Home
                    </span>
                  </a>

                  {/* Center Image */}
                  <div className="flex-1 mx-2 md:mx-8 flex justify-center">
                    <Image
                      src="/rsvp-head-clean.png"
                      alt="RSVP"
                      width={450}
                      height={60}
                      className="w-[320px] md:w-auto h-auto"
                      priority
                    />
                  </div>

                  {/* Updates Button */}
                  <a 
                    href="/updates" 
                    className="flex flex-col items-center cursor-pointer group/btn mb-24 md:mb-12 w:16 md:w-24"
                  >
                    <Image
                      src="/brella-icon-1k.png"
                      alt="Updates"
                      width={80}
                      height={80}
                      className="w-16 md:w-20 h-16 md:h-20 transform-gpu origin-center transition-transform duration-300 ease-out group-hover/btn:scale-[1.15]"
                    />
                    <span className="text-blue group-hover/btn:text-green text-xs md:text-sm tracking-widest group-hover/btn:tracking-[.25em] font-semibold uppercase transition-all duration-300 ease-out text-center">
                      Updates
                    </span>
                  </a>
                </div>

                <div className="rounded-lg isolate">
                  <Form {...form}>
                    <form 
                      id="rsvp-form" 
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-12"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {/* Names Section */}
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name1"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <div className="flex flex-row items-baseline gap-2">
                                <FormLabel className="text-lg text-blue tracking-wider font-bold">Names</FormLabel>
                                <span className="text-sm text-blue/80 italic">plz include nobility title if relevant</span>
                              </div>
                              <FormControl>
                                <Input
                                  placeholder="Guest 1"
                                  {...field}
                                  variant="form"
                                  hasValue={!!name1Value}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
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
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {!showAdditionalGuests ? (
                          <div className="flex justify-between gap-4 items-center">
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="default"
                                className={cn(
                                  "text-blue/60 hover:text-blue border-blue/40 hover:border-green [&_svg]:!size-5 !bg-transparent !gap-1 px-0",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
                                )}
                                onClick={addGuests}
                              >
                                <Plus />
                                Add more guests
                              </Button>

                              <Button
                                type="button"
                                variant="next"
                                size="default"
                                className={cn(
                                  "text-green bg-white font-semibold tracking-widest disabled:text-blue/60 hover:text-green hover:bg-green/15 hover:border-green transition-all duration-100 gap-2 group px-4 py-2 text-lg",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                                  hasAnyNames && !nextClicked ? "opacity-100" : "opacity-0"
                                )}
                                onClick={() => {
                                  setNextClicked(true);
                                  setTimeout(() => {
                                    const attendingSection = document.getElementById('attending-section');
                                    const scrollContainer = document.getElementById('form-scroll-container');

                                    if (attendingSection && scrollContainer) {
                                      const attendingSectionTop = attendingSection.offsetTop - scrollContainer.offsetTop;
                                      const desiredScrollTop = attendingSectionTop - 100;
                                      
                                      console.log('Calculated scrollContainer scrollTop:', desiredScrollTop);
                                      scrollContainer.scrollTo({
                                        top: desiredScrollTop,
                                        behavior: 'smooth'
                                      });
                                    }
                                    setTimeout(() => {
                                      console.log('Setting showResponse after calculated scroll');
                                      setShowResponse(true);
                                    }, 800); // Content reveal after scroll logic
                                  }, 100); // Delay after click
                                }}
                              >
                                NEXT
                                <ArrowDown className="w-4 h-4 group-hover:text-green transition-colors" />
                              </Button>
                            </>
                          </div>
                        ) : (
                          <>
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
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                        }
                                      }}
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
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                        }
                                      }}
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
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-start">
                              <Button
                                type="button"
                                variant="next"
                                size="default"
                                className={cn(
                                  "text-green bg-white font-semibold tracking-widest disabled:text-blue/60 hover:text-green hover:bg-green/15 hover:border-green transition-all duration-100 gap-2 group px-4 py-2 text-lg",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                                  hasAnyNames && !nextClicked ? "opacity-100" : "opacity-0"
                                )}
                                onClick={() => {
                                  setNextClicked(true);
                                  setTimeout(() => {
                                    const attendingSection = document.getElementById('attending-section');
                                    const scrollContainer = document.getElementById('form-scroll-container');

                                    if (attendingSection && scrollContainer) {
                                      const attendingSectionTop = attendingSection.offsetTop - scrollContainer.offsetTop;
                                      const desiredScrollTop = attendingSectionTop - 100;
                                      
                                      console.log('Calculated scrollContainer scrollTop (2nd button):', desiredScrollTop);
                                      scrollContainer.scrollTo({
                                        top: desiredScrollTop,
                                        behavior: 'smooth'
                                      });
                                    }
                                    setTimeout(() => {
                                      console.log('Setting showResponse after calculated scroll (2nd button)');
                                      setShowResponse(true);
                                    }, 500); // Content reveal after scroll logic
                                  }, 100); // Delay after click
                                }}
                              >
                                NEXT
                                <ArrowDown className="w-4 h-4 group-hover:text-green transition-colors" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Attending Section */}
                      <div 
                        id="attending-section"
                        className={cn(
                          "transition-all duration-500 pt-4 md:pt-0",
                          !showResponse && "opacity-0 pointer-events-none translate-y-2",
                          showResponse && "opacity-100 translate-y-0"
                        )}
                      >
                        <FormField
                          control={form.control}
                          name="attending"
                          render={({ field }: { field: FieldType }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-lg text-blue tracking-wider font-bold">Response?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex flex-col md:flex-row gap-4 w-full justify-start mx-auto">
                                    <div className={cn("group w-full order-2 md:order-1", field.value === "no" && "selected")}>
                                      <Button
                                        type="button"
                                        variant="radneg"
                                        size="sm"
                                        className={cn(
                                          "w-full h-10",
                                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                                          field.value === "no" && "bg-orange border-orange text-white"
                                        )}
                                        onClick={() => field.onChange("no")}
                                      >
                                        <X className="mr-0" />
                                        <div className="flex items-baseline">
                                          <span className="font-bold text-lg tracking-widest">Non</span>&nbsp;&nbsp;
                                          <span >I'm ok living a life of regret</span>
                                        </div>
                                      </Button>
                                    </div>
                                    <div className={cn("group w-full order-1 md:order-2", field.value === "yes" && "selected")}>
                                      <Button
                                        type="button"
                                        variant="radpos"
                                        size="sm"
                                        className={cn(
                                          "w-full h-10",
                                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                                          field.value === "yes" && "bg-green border-green text-white"
                                        )}
                                        onClick={() => {
                                          field.onChange("yes");
                                          form.setValue('events.welcomeParty', true);
                                          form.setValue('events.wedding', true);
                                          form.setValue('events.beachDay', true);
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
                      </div>

                      {/* Reaction Icons and Text for "Non" response */}
                      {showResponse && attendingValue === 'no' && (
                        <div className="flex flex-col items-center w-full">
                          <div className="flex flex-col items-center gap-y-4 py-4 px-0">
                            <div className="text-center text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[150ms]">
                              It looks like you're trying to RSVP "Non" &nbsp;...are you sure?!?!
                            </div>
                          </div>
                          <div className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 px-0">
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[150ms]">
                              <HeartCrack className="w-6 h-6" />
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[850ms]">
                              <span className="text-3xl">😱</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[250ms]">
                              <span className="text-xl">Sacrébleu!</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[1050ms]">
                              <span className="text-3xl">🫣</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[350ms]">
                              <Frown className="w-6 h-6" />
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[950ms]">
                              <span className="text-3xl">😭</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[650ms]">
                              <span className="text-2xl font-bold">NON!</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[550ms]">
                              <ThumbsDown className="w-6 h-6" />
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[950ms]">
                              <span className="text-3xl">🤮</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[750ms]">
                              <span className="text-lg">Mon Dieu!</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[950ms]">
                              <span className="text-3xl">😢</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[450ms]">
                              <span className="text-xl pl-1">C'est la vie...</span>
                            </div>
                            <div className="text-orange font-semibold animate-in fade-in-0 zoom-in-95 duration-400 ease-out delay-[950ms]">
                              <span className="text-3xl">💔</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message for "Non" response */}
                      {showResponse && attendingValue === 'no' && (
                        <>
                          <div className="text-center py-4 transition-opacity duration-500 ease-in-out opacity-100">
                            <p className="text-lg text-blue font-semibold">On a serious note, we're so sorry to hear you can't make it</p>
                            <p className="mt-3 text-md text-blue">
                              Your presence would mean the world to us, but of course we understand the size of the ask. 
                            </p>
                            <p className="mt-3 text-md text-blue">
                              Still, as a last-ditch effort if logistics are keeping you away, please know we've pre-booked Airbnbs to make things as easy as possible <span className="italic text-sm font-semibold">(our treat!) </span> and we are masters with miles <span className="italic text-sm font-semibold">(which we have to use anyways!)</span></p>
                            <p className="mt-3 text-sm text-blue">
                              Don't hesitate to reach out to us directly. If there's anything we can do to be able to celebrate with you, we will make it happen!
                            </p>
                          </div>
                          {/* Submit button for 'no' case */}
                          <div className="mt-8">
                            <Button
                              type="submit"
                              form="rsvp-form"
                              className="w-full bg-blue hover:bg-green text-white font-bold py-4 px-4 text-lg tracking-wider rounded-lg"
                            >
                              Submit RSVP
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Events Section */}
                      <div className={cn(
                        "transition-all duration-500",
                        {
                          "opacity-0 pointer-events-none translate-y-2": !showResponse || (showResponse && attendingValue === 'no'),
                          "opacity-40": showResponse && attendingValue === "",
                          "opacity-100": showResponse && attendingValue === 'yes'
                        }
                      )}>
                        <FormItem className="space-y-3">
                          <div className="flex flex-col gap-4">
                            <FormField
                              control={form.control}
                              name="events.welcomeParty"
                              render={({ field }: { field: FieldType }) => (
                                <FormItem className="flex items-center justify-between w-full space-y-0 group hover:cursor-pointer">
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={cn(
                                      "text-blue transition-colors group-hover:text-green",
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
                                      }}
                                      className="group-hover:border-green"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="events.wedding"
                              render={({ field }: { field: FieldType }) => (
                                <FormItem className="flex items-center justify-between w-full space-y-0 group hover:cursor-pointer">
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={cn(
                                      "text-blue transition-colors group-hover:text-green",
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
                                      }}
                                      className="group-hover:border-green"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="events.beachDay"
                              render={({ field }: { field: FieldType }) => (
                                <FormItem className="flex items-center justify-between w-full space-y-0 group hover:cursor-pointer">
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={cn(
                                      "text-blue transition-colors group-hover:text-green",
                                      field.value && "text-green"
                                    )}>
                                      <span className="font-bold">La Vie en Rosé - Beach Clüb</span> &nbsp;Sat 6/21
                                    </FormLabel>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked: boolean) => {
                                        field.onChange(checked);
                                      }}
                                      className="group-hover:border-green"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="text-sm text-pink font-medium pt-5">
                              Optional Add-On:
                            </div>

                            {/* Commenting out boat day option temporarily
                            <FormField
                              control={form.control}
                              name="events.boatDay"
                              render={({ field }: { field: FieldType }) => (
                                <FormItem className="flex items-center justify-between w-full space-y-0 group hover:cursor-pointer">
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={cn(
                                      "text-blue transition-colors group-hover:text-green",
                                      field.value && "text-green"
                                    )}>
                                      <span className="font-bold">Sunday boat to St Tropez? Heck Oui!</span>
                                    </FormLabel>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked: boolean) => {
                                        field.onChange(checked);
                                      }}
                                      className="group-hover:border-green"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            */}

                            <FormField
                              control={form.control}
                              name="events.babysitting"
                              render={({ field }: { field: FieldType }) => (
                                <FormItem className="space-y-2">
                                  <div className="flex items-center justify-between w-full group hover:cursor-pointer">
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className={cn(
                                        "text-blue transition-colors group-hover:text-green",
                                        field.value && "text-green"
                                      )}>
                                        <span className="font-bold">Childcare help? Oui Oui!</span>
                                      </FormLabel>
                                    </div>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked: boolean) => {
                                          field.onChange(checked);
                                        }}
                                        className="group-hover:border-green"
                                      />
                                    </FormControl>
                                  </div>
                                  {/* Babysitting Info Toggle Button */}
                                  <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setShowBabysittingInfo(!showBabysittingInfo)}
                                    className="text-pink hover:text-green px-0 h-auto py-1 text-sm flex items-center gap-1 no-underline hover:no-underline focus-visible:ring-0 focus-visible:ring-offset-0"
                                  >
                                    Babysitting info
                                    {showBabysittingInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </Button>
                                  {/* Babysitting Description - Conditional with Transition */}
                                  <div
                                    className={cn(
                                      "transition-all duration-500 ease-out overflow-hidden",
                                      showBabysittingInfo ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                                    )}
                                  >
                                    <FormDescription className="text-sm font-normal text-blue italic pl-0 pr-0 md:pr-0">
                                      We've hired a professional babysitting agency from Paris to be onsite Friday & Saturday if it makes things easier for parents. The agency is <a href="https://www.baby-prestige.com/en" target="_blank" className="text-pink font-semibold underline hover:text-green">Baby Prestige</a> and is very highly recommended. They handle all ages, including boomers, and your babies will be fluent in French by the flight home.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormItem>
                      </div>

                      {/* Travel Logistics Section */}
                      <div className={cn(
                        "transition-all duration-500",
                        {
                          "opacity-0 pointer-events-none translate-y-2": !showResponse || attendingValue !== 'yes',
                          "opacity-100 translate-y-0": showResponse && attendingValue === 'yes'
                        }
                      )}>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="staying"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-lg text-blue tracking-wider font-bold">Staying?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col gap-2"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full justify-items-start md:justify-items-stretch">
                                      {[
                                        "Royal Riviera",
                                        "Hotel Carlton",
                                        "La Reserve de Beaulieu",
                                        "Boutique Hotel Cap Ferrat",
                                        "Four Seasons Grand Hotel",
                                        "Versailles Hotel",
                                        "Hotel La Provencal",
                                        "Welcome Hotel",
                                        "AirBnB",
                                        "Haven't booked yet"
                                      ].map((hotel) => (
                                        <div key={hotel} className={cn("group w-fit md:w-full", field.value === hotel && "selected")}>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="default"
                                            className={cn(
                                              "w-auto md:w-full h-8 border-blue/30 text-blue/80 hover:bg-blue/10 hover:text-blue hover:border-blue px-4",
                                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                                              field.value === hotel && "bg-green border-green text-white hover:bg-green hover:text-white hover:border-green"
                                            )}
                                            onClick={() => field.onChange(hotel)}
                                          >
                                            {hotel}
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                    <Input
                                      placeholder="Other (family estate, megayacht, etc)"
                                      variant="form"
                                      className="col-span-full mt-1"
                                      value={!field.value || field.value.startsWith("other:") ? field.value?.replace("other:", "") : ""}
                                      onChange={(e) => field.onChange(e.target.value ? `other:${e.target.value}` : "")}
                                    />
                                  </RadioGroup>
                                </FormControl>
                                <FormDescription className="text-sm font-normal text-blue italic pt-4">
                                  <span className="font-bold text-pink">NOTE: </span> We have several hotel rooms and Airbnbs available, let us know if you'd like to claim one. There's nothing wrong with doing things last minute!
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          {/* Temporarily removed travel input
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
                          */}
                        </div>
                      </div>

                      {/* Allergies Section */}
                      <div className={cn(
                        "transition-all duration-500",
                        {
                          "opacity-0 pointer-events-none translate-y-2": !showResponse || attendingValue !== 'yes',
                          "opacity-100 translate-y-0": showResponse && attendingValue === 'yes'
                        }
                      )}>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="allergies1"
                            render={({ field }: { field: FieldType }) => (
                              <FormItem>
                                <FormLabel className="text-lg text-blue tracking-wider">Allergies </FormLabel>
                                <span className="text-sm text-blue/80 italic"> Skip if none</span>
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
                {/* Conditional rendering for submit button if NOT 'no' */}
                {attendingValue !== 'no' && (
                  <div className="mt-12">
                    <Button
                      type="submit"
                      form="rsvp-form"
                      className="w-full bg-blue hover:bg-green text-white font-bold py-6 px-4 text-xl tracking-wider rounded-lg"
                    >
                      Submit RSVP!
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 