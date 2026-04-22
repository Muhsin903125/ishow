"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, RefreshCw, Eye, Layout } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCMSPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [content, setContent] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("landing_config")
        .select("content")
        .eq("key", "main")
        .single();

      if (data) {
        setContent(data.content);
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

  const updateContent = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateStep = (index: number, field: string, value: string) => {
    setContent((prev: any) => {
      const newSteps = [...prev.methodology.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return {
        ...prev,
        methodology: {
          ...prev.methodology,
          steps: newSteps
        }
      };
    });
  };

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <div className="p-10 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Layout className="w-8 h-8 text-orange-500" />
              Landing Page <span className="text-orange-500">CMS</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Manage public-facing content and marketing copy.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" asChild>
              <a href="/" target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Preview Site
              </a>
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Deploy Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-8">
            <TabsTrigger value="hero" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500 uppercase text-[10px] font-black tracking-widest italic">Hero Section</TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500 uppercase text-[10px] font-black tracking-widest italic">Methodology</TabsTrigger>
            <TabsTrigger value="coach" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-orange-500 uppercase text-[10px] font-black tracking-widest italic">Coach Info</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase italic tracking-wider">Hero Configuration</CardTitle>
                <CardDescription className="text-zinc-500">The first thing visitors see. Keep it punchy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Main Headline</Label>
                  <Input 
                    value={content?.hero?.title || ""} 
                    onChange={(e) => updateContent("hero", "title", e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Subheadline</Label>
                  <Textarea 
                    value={content?.hero?.subtitle || ""} 
                    onChange={(e) => updateContent("hero", "subtitle", e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white min-h-[100px] focus:border-orange-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Primary CTA</Label>
                    <Input 
                      value={content?.hero?.cta_primary || ""} 
                      onChange={(e) => updateContent("hero", "cta_primary", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Secondary CTA</Label>
                    <Input 
                      value={content?.hero?.cta_secondary || ""} 
                      onChange={(e) => updateContent("hero", "cta_secondary", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase italic tracking-wider">Platform Methodology</CardTitle>
                <CardDescription className="text-zinc-500">Define the 3-step process of the iShow system.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-2 mb-4">
                  <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Section Headline</Label>
                  <Input 
                    value={content?.methodology?.title || ""} 
                    onChange={(e) => updateContent("methodology", "title", e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                  />
                </div>
                {content?.methodology?.steps?.map((step: any, i: number) => (
                  <div key={i} className="space-y-4 pt-6 border-t border-zinc-800 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-[10px] font-black text-white">0{i+1}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Step 0{i+1}</span>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-zinc-500 text-[9px] font-bold uppercase">Title</Label>
                      <Input 
                        value={step.title} 
                        onChange={(e) => updateStep(i, "title", e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-zinc-500 text-[9px] font-bold uppercase">Description</Label>
                      <Textarea 
                        value={step.description} 
                        onChange={(e) => updateStep(i, "description", e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500 min-h-[80px]" 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
             <Card className="bg-zinc-900 border-zinc-800 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase italic tracking-wider">Head Coach Profile</CardTitle>
                <CardDescription className="text-zinc-500">Manage coach details and mission statement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Name</Label>
                  <Input 
                    value={content?.coach?.name || ""} 
                    onChange={(e) => updateContent("coach", "name", e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quote</Label>
                  <Textarea 
                    value={content?.coach?.quote || ""} 
                    onChange={(e) => updateContent("coach", "quote", e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white min-h-[100px] focus:border-orange-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                    <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Experience</Label>
                    <Input 
                      value={content?.coach?.experience || ""} 
                      onChange={(e) => updateContent("coach", "experience", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Specialty</Label>
                    <Input 
                      value={content?.coach?.specialty || ""} 
                      onChange={(e) => updateContent("coach", "specialty", e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white focus:border-orange-500" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
