"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type {
  LandingCapability,
  LandingClientConfig,
  LandingClientTestimonial,
  LandingMethodStep,
  LandingService,
} from "@/components/LandingClient";
import { 
  Save, RefreshCw, Eye, Layout, Plus, Trash2, Quote, 
  Target, Dumbbell, Star, Image as ImageIcon, Video,
  Zap, ArrowRight, CheckCircle2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EditableLandingContent = LandingClientConfig & {
  hero: NonNullable<LandingClientConfig["hero"]>;
  methodology: {
    title?: string;
    steps: LandingMethodStep[];
  };
  coach: NonNullable<LandingClientConfig["coach"]>;
  testimonials: LandingClientTestimonial[];
  capabilities: {
    title?: string;
    items: LandingCapability[];
  };
  services: {
    items: LandingService[];
  };
};

function normalizeContent(content?: LandingClientConfig | null): EditableLandingContent {
  return {
    ...content,
    hero: content?.hero ?? {},
    methodology: {
      title: content?.methodology?.title,
      steps: content?.methodology?.steps ?? [],
    },
    coach: content?.coach ?? {},
    testimonials_title: content?.testimonials_title,
    testimonials: content?.testimonials ?? [],
    capabilities: {
      title: content?.capabilities?.title,
      items: content?.capabilities?.items ?? [],
    },
    services: {
      items: content?.services?.items ?? [],
    },
  };
}

export default function AdminCMSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [content, setContent] = useState<EditableLandingContent | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("landing_config")
        .select("content")
        .eq("key", "main")
        .single();

      if (data) {
        setContent(normalizeContent((data.content as LandingClientConfig | null) ?? null));
      } else if (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load CMS content.");
      }
      setFetching(false);
    }
    fetchContent();
  }, [supabase]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("landing_config")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("key", "main");

    if (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save changes.");
    } else {
      toast.success("Landing page configuration updated successfully!");
    }
    setLoading(false);
  };

  const updateContent = (section: "hero" | "coach", field: string, value: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const updateMethodStep = (index: number, field: keyof LandingMethodStep, value: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      const steps = [...prev.methodology.steps];
      steps[index] = { ...steps[index], [field]: value };
      return {
        ...prev,
        methodology: {
          ...prev.methodology,
          steps,
        },
      };
    });
  };

  const addMethodStep = () => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        methodology: {
          ...prev.methodology,
          steps: [...prev.methodology.steps, { title: "New Step", description: "Step detail..." }],
        },
      };
    });
  };

  const removeMethodStep = (index: number) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        methodology: {
          ...prev.methodology,
          steps: prev.methodology.steps.filter((_, i) => i !== index),
        },
      };
    });
  };

  const updateCapability = (index: number, field: keyof LandingCapability, value: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      const items = [...prev.capabilities.items];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        capabilities: {
          ...prev.capabilities,
          items,
        },
      };
    });
  };

  const addCapability = () => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        capabilities: {
          ...prev.capabilities,
          items: [...prev.capabilities.items, { title: "New Capability", description: "Detail...", icon: "Target" }],
        },
      };
    });
  };

  const removeCapability = (index: number) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        capabilities: {
          ...prev.capabilities,
          items: prev.capabilities.items.filter((_, i) => i !== index),
        },
      };
    });
  };

  const updateService = (index: number, field: keyof LandingService, value: string) => {
    setContent((prev) => {
      if (!prev) return prev;
      const items = [...prev.services.items];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        services: {
          items,
        },
      };
    });
  };

  const addService = () => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        services: {
          items: [...prev.services.items, { title: "New Plan", description: "Plan detail...", image: "" }],
        },
      };
    });
  };

  const removeService = (index: number) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        services: {
          items: prev.services.items.filter((_, i) => i !== index),
        },
      };
    });
  };

  const updateTestimonial = (
    index: number,
    field: keyof LandingClientTestimonial,
    value: string | number | null
  ) => {
    setContent((prev) => {
      if (!prev) return prev;
      const testimonials = [...prev.testimonials];
      testimonials[index] = { ...testimonials[index], [field]: value };
      return {
        ...prev,
        testimonials,
      };
    });
  };

  const addTestimonial = () => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: [
          ...prev.testimonials,
          {
            id: `featured-${Date.now()}`,
            name: "Client",
            location: null,
            result_label: null,
            role: "Client",
            quote: "Success story...",
            rating: 5,
          },
        ],
      };
    });
  };

  const removeTestimonial = (index: number) => {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: prev.testimonials.filter((_, i) => i !== index),
      };
    });
  };

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-xs text-muted-foreground font-medium">Loading CMS configuration...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col h-full bg-muted/20">
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Layout className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">CMS Editor</h1>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">Interface Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider" onClick={() => window.open("/", "_blank")}>
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Live Preview
            </Button>
            <Button onClick={handleSave} disabled={loading} size="sm" className="h-8 bg-foreground text-background hover:bg-foreground/90 font-bold text-[11px] uppercase tracking-wider px-4">
              {loading ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Publish Changes
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="hero" className="w-full">
              <div className="mb-8 border-b border-border">
                <TabsList className="bg-transparent h-12 p-0 gap-8 justify-start">
                  <TabsTrigger value="hero" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Hero</TabsTrigger>
                  <TabsTrigger value="methodology" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Process</TabsTrigger>
                  <TabsTrigger value="capabilities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Features</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Services</TabsTrigger>
                  <TabsTrigger value="coach" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Profile</TabsTrigger>
                  <TabsTrigger value="testimonials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12">Social Proof</TabsTrigger>
                </TabsList>
              </div>

              {/* ── HERO SECTION ─────────────────────────────────── */}
              <TabsContent value="hero" className="mt-0 space-y-6 outline-none">
                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Hero Section</CardTitle>
                        <CardDescription className="text-[11px] font-medium">Main value proposition and primary call-to-actions.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 py-8">
                    <div className="grid gap-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Main Headline</Label>
                      <Input 
                        value={content?.hero?.title || ""} 
                        onChange={(e) => updateContent("hero", "title", e.target.value)}
                        className="h-11 text-base font-bold focus-visible:ring-orange-500" 
                        placeholder="The System For True Momentum."
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Sub-headline Description</Label>
                      <Textarea 
                        value={content?.hero?.subtitle || ""} 
                        onChange={(e) => updateContent("hero", "subtitle", e.target.value)}
                        className="min-h-[100px] text-sm font-medium leading-relaxed focus-visible:ring-orange-500" 
                        placeholder="Real coaching. Real results. Based in Dubai..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="grid gap-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Primary Action Button</Label>
                        <Input 
                          value={content?.hero?.cta_primary || ""} 
                          onChange={(e) => updateContent("hero", "cta_primary", e.target.value)}
                          className="h-10 text-sm font-semibold" 
                          placeholder="Launch Your Plan"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Secondary Action Button</Label>
                        <Input 
                          value={content?.hero?.cta_secondary || ""} 
                          onChange={(e) => updateContent("hero", "cta_secondary", e.target.value)}
                          className="h-10 text-sm font-semibold" 
                          placeholder="See Inside"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── METHODOLOGY SECTION ──────────────────────────── */}
              <TabsContent value="methodology" className="mt-0 space-y-6 outline-none">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Step-by-Step Methodology</h2>
                   <Button onClick={addMethodStep} size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest">
                     <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Stage
                   </Button>
                </div>
                <div className="grid gap-4">
                  {content?.methodology?.steps?.map((step, i: number) => (
                    <Card key={i} className="shadow-sm border-border bg-background relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeMethodStep(i)}>
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                      <CardContent className="p-6 flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg shadow-orange-500/20">0{i+1}</div>
                        <div className="flex-1 space-y-4">
                          <div className="grid gap-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage Title</Label>
                             <Input 
                               value={step.title} 
                               onChange={(e) => updateMethodStep(i, "title", e.target.value)}
                               className="h-9 font-bold text-sm bg-muted/20" 
                             />
                          </div>
                          <div className="grid gap-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Intent</Label>
                             <Textarea 
                               value={step.description} 
                               onChange={(e) => updateMethodStep(i, "description", e.target.value)}
                               className="min-h-[80px] text-sm bg-muted/20 resize-none" 
                             />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── CAPABILITIES SECTION ─────────────────────────── */}
              <TabsContent value="capabilities" className="mt-0 space-y-6 outline-none">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature Matrix</h2>
                   <Button onClick={addCapability} size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest">
                     <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Capability
                   </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content?.capabilities?.items?.map((cap, i: number) => (
                    <Card key={i} className="shadow-sm border-border bg-background relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCapability(i)}>
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="p-2.5 bg-muted rounded-lg"><Target className="w-4 h-4 text-orange-600" /></div>
                           <Input 
                             value={cap.title} 
                             onChange={(e) => updateCapability(i, "title", e.target.value)}
                             className="h-8 font-bold text-sm border-none bg-transparent p-0 focus-visible:ring-0" 
                           />
                        </div>
                        <Textarea 
                          value={cap.description} 
                          onChange={(e) => updateCapability(i, "description", e.target.value)}
                          className="min-h-[60px] text-xs font-medium bg-muted/20 border-border" 
                          placeholder="Capability description..."
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── SERVICES SECTION ─────────────────────────────── */}
              <TabsContent value="services" className="mt-0 space-y-6 outline-none">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Program Offerings</h2>
                   <Button onClick={addService} size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest">
                     <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Program
                   </Button>
                </div>
                <div className="grid gap-6">
                  {content?.services?.items?.map((srv, i: number) => (
                    <Card key={i} className="shadow-sm border-border bg-background relative group overflow-hidden">
                      <div className="absolute top-4 right-4 z-10">
                         <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive" onClick={() => removeService(i)}>
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="w-full md:w-48 bg-muted flex items-center justify-center border-r border-border min-h-[120px]">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="flex-1 p-6 space-y-4 bg-background">
                           <Input 
                             value={srv.title} 
                             onChange={(e) => updateService(i, "title", e.target.value)}
                             className="h-9 font-bold text-base focus-visible:ring-orange-500" 
                             placeholder="Program Title..."
                           />
                           <Textarea 
                             value={srv.description} 
                             onChange={(e) => updateService(i, "description", e.target.value)}
                             className="min-h-[80px] text-sm font-medium leading-relaxed resize-none" 
                             placeholder="Program description..."
                           />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── COACH SECTION ────────────────────────────────── */}
              <TabsContent value="coach" className="mt-0 space-y-6 outline-none">
                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white italic">MS</div>
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Coach Biography</CardTitle>
                        <CardDescription className="text-[11px] font-medium">Personal branding and professional expertise.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                         <div className="grid gap-3">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                           <Input 
                             value={content?.coach?.name || ""} 
                             onChange={(e) => updateContent("coach", "name", e.target.value)}
                             className="h-10 font-bold focus-visible:ring-orange-500" 
                           />
                         </div>
                         <div className="grid gap-3">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Years of Experience</Label>
                           <Input 
                             value={content?.coach?.experience || ""} 
                             onChange={(e) => updateContent("coach", "experience", e.target.value)}
                             className="h-10 font-bold focus-visible:ring-orange-500" 
                           />
                         </div>
                         <div className="grid gap-3">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Primary Specialty</Label>
                           <Input 
                             value={content?.coach?.specialty || ""} 
                             onChange={(e) => updateContent("coach", "specialty", e.target.value)}
                             className="h-10 font-bold focus-visible:ring-orange-500" 
                           />
                         </div>
                       </div>
                       <div className="space-y-6 flex flex-col">
                         <div className="grid gap-3 flex-1">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Mission Statement / Quote</Label>
                           <Textarea 
                             value={content?.coach?.quote || ""} 
                             onChange={(e) => updateContent("coach", "quote", e.target.value)}
                             className="flex-1 min-h-[220px] text-sm font-medium italic leading-relaxed focus-visible:ring-orange-500" 
                           />
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TESTIMONIALS SECTION ─────────────────────────── */}
              <TabsContent value="testimonials" className="mt-0 space-y-6 outline-none">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Testimonials</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Manage featured success stories for the landing page.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => router.push("/admin/testimonials")}>
                      Manage Advanced Data
                    </Button>
                    <Button onClick={addTestimonial} size="sm" className="h-8 bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Featured
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content?.testimonials?.map((t, i: number) => (
                    <Card key={i} className="shadow-sm border-border bg-background relative overflow-hidden group">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTestimonial(i)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                             <Quote className="w-4 h-4 text-muted-foreground" />
                           </div>
                           <div className="flex-1 space-y-1">
                             <Input 
                               value={t.name} 
                               onChange={(e) => updateTestimonial(i, "name", e.target.value)}
                               placeholder="Client Name"
                               className="h-7 text-sm font-bold p-0 border-none bg-transparent focus-visible:ring-0" 
                             />
                             <Input 
                               value={t.role ?? ""} 
                               onChange={(e) => updateTestimonial(i, "role", e.target.value)}
                               placeholder="e.g. Entrepreneur"
                               className="h-5 text-[10px] p-0 border-none bg-transparent text-muted-foreground font-bold uppercase tracking-wider focus-visible:ring-0" 
                             />
                           </div>
                        </div>
                        <Textarea 
                          value={t.quote} 
                          onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                          placeholder="Transformation narrative..."
                          className="min-h-[100px] text-xs font-medium italic resize-none bg-muted/20" 
                        />
                      </CardContent>
                    </Card>
                  ))}
                  {(content?.testimonials?.length === 0) && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center bg-background rounded-3xl border border-dashed border-border">
                      <Quote className="w-10 h-10 text-muted/20 mb-4" />
                      <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">No featured testimonials</p>
                      <Button onClick={addTestimonial} variant="link" className="text-orange-600 text-xs mt-2 font-bold uppercase tracking-widest">Initialize First Asset</Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
