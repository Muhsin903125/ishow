"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardPageLoading } from "@/components/dashboard/PageState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type {
  BasicMarketingPage,
  ContactChannel,
  ContentArticle,
  EditableCMSContent,
  FaqItem,
  LandingCapability,
  LandingClientTestimonial,
  LandingMethodStep,
  LandingPackage,
  LandingProofModule,
  LandingService,
  SitePageHighlight,
  SitePageSection,
  SitePageStat,
} from "@/lib/cms/content";
import { getDefaultCMSContent } from "@/lib/cms/content";
import {
  BookOpen,
  Eye,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layout,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";

type CmsApiResponse = {
  ok: true;
  content: EditableCMSContent;
  updatedAt: string | null;
};

type MarketingPageKey = "about" | "contact" | "faq" | "services" | "content_hub";

export default function AdminCMSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [content, setContent] = useState<EditableCMSContent>(getDefaultCMSContent());

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch("/api/admin/cms");
        const payload = (await response.json()) as CmsApiResponse | { error: string };

        if (!response.ok || !("ok" in payload)) {
          throw new Error("error" in payload ? payload.error : "Failed to load CMS content.");
        }

        setContent(payload.content);
        setUpdatedAt(payload.updatedAt);
      } catch (error) {
        console.error("Error fetching CMS content:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load CMS content.");
      } finally {
        setFetching(false);
      }
    }

    fetchContent();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const payload = (await response.json()) as CmsApiResponse | { error: string };

      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to save changes.");
      }

      setContent(payload.content);
      setUpdatedAt(payload.updatedAt);
      toast.success("Website content updated successfully.");
    } catch (error) {
      console.error("Error saving CMS content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const updateHero = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const updateCoach = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      coach: {
        ...prev.coach,
        [field]: value,
      },
    }));
  };

  const updateMethodStep = (
    index: number,
    field: keyof LandingMethodStep,
    value: string
  ) => {
    setContent((prev) => {
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
    setContent((prev) => ({
      ...prev,
      methodology: {
        ...prev.methodology,
        steps: [
          ...prev.methodology.steps,
          { title: "New Step", description: "Step detail..." },
        ],
      },
    }));
  };

  const removeMethodStep = (index: number) => {
    setContent((prev) => ({
      ...prev,
      methodology: {
        ...prev.methodology,
        steps: prev.methodology.steps.filter((_, i) => i !== index),
      },
    }));
  };

  const updateCapability = (
    index: number,
    field: keyof LandingCapability,
    value: string
  ) => {
    setContent((prev) => {
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
    setContent((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        items: [
          ...prev.capabilities.items,
          { title: "New Capability", description: "Detail...", icon: "Target" },
        ],
      },
    }));
  };

  const removeCapability = (index: number) => {
    setContent((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        items: prev.capabilities.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateService = (
    index: number,
    field: keyof LandingService,
    value: string
  ) => {
    setContent((prev) => {
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
    setContent((prev) => ({
      ...prev,
      services: {
        items: [
          ...prev.services.items,
          { title: "New Plan", description: "Plan detail...", image: "" },
        ],
      },
    }));
  };

  const removeService = (index: number) => {
    setContent((prev) => ({
      ...prev,
      services: {
        items: prev.services.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updatePackage = (
    index: number,
    field: keyof LandingPackage,
    value: string | string[]
  ) => {
    setContent((prev) => {
      const items = [...prev.packages.items];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        packages: {
          ...prev.packages,
          items,
        },
      };
    });
  };

  const addPackage = () => {
    setContent((prev) => ({
      ...prev,
      packages: {
        ...prev.packages,
        items: [
          ...prev.packages.items,
          {
            title: "New Package",
            price: "AED 0",
            cadence: "per month",
            description: "Package description...",
            highlights: [],
          },
        ],
      },
    }));
  };

  const removePackage = (index: number) => {
    setContent((prev) => ({
      ...prev,
      packages: {
        ...prev.packages,
        items: prev.packages.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateProofField = (field: "title" | "intro", value: string) => {
    setContent((prev) => ({
      ...prev,
      proof: {
        ...prev.proof,
        [field]: value,
      },
    }));
  };

  const updateProofModule = (
    index: number,
    field: keyof LandingProofModule,
    value: string
  ) => {
    setContent((prev) => {
      const items = [...prev.proof.items];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        proof: {
          ...prev.proof,
          items,
        },
      };
    });
  };

  const addProofModule = () => {
    setContent((prev) => ({
      ...prev,
      proof: {
        ...prev.proof,
        items: [
          ...prev.proof.items,
          {
            eyebrow: "Proof Theme",
            title: "New proof module",
            description: "Describe the lived-in outcome this card should highlight.",
            metric: "1 milestone",
            detail: "Add the supporting detail here.",
            media: "",
          },
        ],
      },
    }));
  };

  const removeProofModule = (index: number) => {
    setContent((prev) => ({
      ...prev,
      proof: {
        ...prev.proof,
        items: prev.proof.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const updateTestimonial = (
    index: number,
    field: keyof LandingClientTestimonial,
    value: string | number | null
  ) => {
    setContent((prev) => {
      const testimonials = [...prev.testimonials];
      testimonials[index] = { ...testimonials[index], [field]: value };
      return {
        ...prev,
        testimonials,
      };
    });
  };

  const addTestimonial = () => {
    setContent((prev) => ({
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
    }));
  };

  const removeTestimonial = (index: number) => {
    setContent((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  };

  const updatePageField = (
    pageKey: MarketingPageKey,
    field: keyof BasicMarketingPage,
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        [pageKey]: {
          ...prev.site_content[pageKey],
          [field]: value,
        },
      },
    }));
  };

  const updatePageSections = (
    pageKey: MarketingPageKey,
    sections: SitePageSection[]
  ) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        [pageKey]: {
          ...prev.site_content[pageKey],
          sections,
        },
      },
    }));
  };

  const updatePageSection = (
    pageKey: MarketingPageKey,
    index: number,
    field: keyof SitePageSection,
    value: string
  ) => {
    const page = content.site_content[pageKey];
    const sections = [...(page.sections ?? [])];
    sections[index] = { ...sections[index], [field]: value };
    updatePageSections(pageKey, sections);
  };

  const addPageSection = (pageKey: MarketingPageKey) => {
    const page = content.site_content[pageKey];
    updatePageSections(pageKey, [
      ...(page.sections ?? []),
      { title: "New Section", body: "Section body..." },
    ]);
  };

  const removePageSection = (pageKey: MarketingPageKey, index: number) => {
    const page = content.site_content[pageKey];
    updatePageSections(
      pageKey,
      (page.sections ?? []).filter((_, i) => i !== index)
    );
  };

  const updatePageStats = (pageKey: MarketingPageKey, stats: SitePageStat[]) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        [pageKey]: {
          ...prev.site_content[pageKey],
          stats,
        },
      },
    }));
  };

  const updatePageStat = (
    pageKey: MarketingPageKey,
    index: number,
    field: keyof SitePageStat,
    value: string
  ) => {
    const page = content.site_content[pageKey];
    const stats = [...(page.stats ?? [])];
    stats[index] = { ...stats[index], [field]: value };
    updatePageStats(pageKey, stats);
  };

  const addPageStat = (pageKey: MarketingPageKey) => {
    const page = content.site_content[pageKey];
    updatePageStats(pageKey, [...(page.stats ?? []), { label: "Label", value: "Value" }]);
  };

  const removePageStat = (pageKey: MarketingPageKey, index: number) => {
    const page = content.site_content[pageKey];
    updatePageStats(
      pageKey,
      (page.stats ?? []).filter((_, statIndex) => statIndex !== index)
    );
  };

  const updatePageHighlights = (
    pageKey: MarketingPageKey,
    highlights: SitePageHighlight[]
  ) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        [pageKey]: {
          ...prev.site_content[pageKey],
          highlights,
        },
      },
    }));
  };

  const updatePageHighlight = (
    pageKey: MarketingPageKey,
    index: number,
    field: keyof SitePageHighlight,
    value: string
  ) => {
    const page = content.site_content[pageKey];
    const highlights = [...(page.highlights ?? [])];
    highlights[index] = { ...highlights[index], [field]: value };
    updatePageHighlights(pageKey, highlights);
  };

  const addPageHighlight = (pageKey: MarketingPageKey) => {
    const page = content.site_content[pageKey];
    updatePageHighlights(pageKey, [
      ...(page.highlights ?? []),
      {
        eyebrow: "Highlight",
        title: "New highlight",
        body: "Highlight body...",
        media: "",
      },
    ]);
  };

  const removePageHighlight = (pageKey: MarketingPageKey, index: number) => {
    const page = content.site_content[pageKey];
    updatePageHighlights(
      pageKey,
      (page.highlights ?? []).filter((_, highlightIndex) => highlightIndex !== index)
    );
  };

  const updateContactChannels = (channels: ContactChannel[]) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        contact: {
          ...prev.site_content.contact,
          channels,
        },
      },
    }));
  };

  const updateContactChannel = (
    index: number,
    field: keyof ContactChannel,
    value: string
  ) => {
    const channels = [...(content.site_content.contact.channels ?? [])];
    channels[index] = { ...channels[index], [field]: value };
    updateContactChannels(channels);
  };

  const addContactChannel = () => {
    updateContactChannels([
      ...(content.site_content.contact.channels ?? []),
      { label: "Channel", value: "Value", href: "/" },
    ]);
  };

  const removeContactChannel = (index: number) => {
    updateContactChannels(
      (content.site_content.contact.channels ?? []).filter((_, i) => i !== index)
    );
  };

  const updateServiceAreas = (value: string) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        contact: {
          ...prev.site_content.contact,
          service_areas: value
            .split("\n")
            .map((entry) => entry.trim())
            .filter(Boolean),
        },
      },
    }));
  };

  const updateContactField = (
    field:
      | "form_title"
      | "form_intro"
      | "form_button_label"
      | "form_success_message",
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        contact: {
          ...prev.site_content.contact,
          [field]: value,
        },
      },
    }));
  };

  const updateFaqItems = (items: FaqItem[]) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        faq: {
          ...prev.site_content.faq,
          items,
        },
      },
    }));
  };

  const updateFaqItem = (
    index: number,
    field: keyof FaqItem,
    value: string
  ) => {
    const items = [...(content.site_content.faq.items ?? [])];
    items[index] = { ...items[index], [field]: value };
    updateFaqItems(items);
  };

  const addFaqItem = () => {
    updateFaqItems([
      ...(content.site_content.faq.items ?? []),
      { question: "New question?", answer: "New answer." },
    ]);
  };

  const removeFaqItem = (index: number) => {
    updateFaqItems((content.site_content.faq.items ?? []).filter((_, i) => i !== index));
  };

  const updateArticles = (articles: ContentArticle[]) => {
    setContent((prev) => ({
      ...prev,
      site_content: {
        ...prev.site_content,
        content_hub: {
          ...prev.site_content.content_hub,
          articles,
        },
      },
    }));
  };

  const updateArticle = (
    index: number,
    field: keyof ContentArticle,
    value: string
  ) => {
    const articles = [...(content.site_content.content_hub.articles ?? [])];
    articles[index] = { ...articles[index], [field]: value };
    updateArticles(articles);
  };

  const addArticle = () => {
    updateArticles([
      ...(content.site_content.content_hub.articles ?? []),
      {
        slug: `new-article-${Date.now()}`,
        title: "New Article",
        category: "Coaching",
        excerpt: "Short article summary...",
        meta_title: "",
        meta_description: "",
        read_time: "5 min read",
        published_at: new Date().toISOString().slice(0, 10),
        body: "Write the article body here...",
      },
    ]);
  };

  const removeArticle = (index: number) => {
    updateArticles(
      (content.site_content.content_hub.articles ?? []).filter((_, i) => i !== index)
    );
  };

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <DashboardPageLoading
          role="admin"
          label="Loading website content, SEO pages, proof modules, and service framing."
        />
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
              <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
                Website CMS
              </h1>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">
                Landing, SEO pages, and content hub
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updatedAt ? (
              <p className="hidden lg:block text-[11px] font-semibold text-muted-foreground">
                Last updated {new Date(updatedAt).toLocaleString()}
              </p>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-bold uppercase tracking-wider"
              onClick={() => window.open("/", "_blank")}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Live Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              size="sm"
              className="h-8 bg-foreground text-background hover:bg-foreground/90 font-bold text-[11px] uppercase tracking-wider px-4"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Publish Changes
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="hero" className="w-full">
              <div className="mb-8 border-b border-border overflow-x-auto">
                <TabsList className="bg-transparent h-12 p-0 gap-8 justify-start min-w-max">
                  <TabsTrigger value="hero" className={tabTriggerClassName}>Hero</TabsTrigger>
                  <TabsTrigger value="methodology" className={tabTriggerClassName}>Process</TabsTrigger>
                  <TabsTrigger value="capabilities" className={tabTriggerClassName}>Features</TabsTrigger>
                  <TabsTrigger value="services" className={tabTriggerClassName}>Services</TabsTrigger>
                  <TabsTrigger value="coach" className={tabTriggerClassName}>Profile</TabsTrigger>
                  <TabsTrigger value="proof" className={tabTriggerClassName}>Proof</TabsTrigger>
                  <TabsTrigger value="testimonials" className={tabTriggerClassName}>Social Proof</TabsTrigger>
                  <TabsTrigger value="about" className={tabTriggerClassName}>About</TabsTrigger>
                  <TabsTrigger value="contact" className={tabTriggerClassName}>Contact</TabsTrigger>
                  <TabsTrigger value="faq" className={tabTriggerClassName}>FAQ</TabsTrigger>
                  <TabsTrigger value="content" className={tabTriggerClassName}>Content Hub</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="hero" className={tabContentClassName}>
                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                          Hero Section
                        </CardTitle>
                        <CardDescription className="text-[11px] font-medium">
                          Main value proposition and primary call-to-actions.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 py-8">
                    <Field label="Main Headline">
                      <Input
                        value={content.hero.title || ""}
                        onChange={(e) => updateHero("title", e.target.value)}
                        className="h-11 text-base font-bold focus-visible:ring-orange-500"
                        placeholder="The System For True Momentum."
                      />
                    </Field>
                    <Field label="Sub-headline Description">
                      <Textarea
                        value={content.hero.subtitle || ""}
                        onChange={(e) => updateHero("subtitle", e.target.value)}
                        className="min-h-[100px] text-sm font-medium leading-relaxed focus-visible:ring-orange-500"
                        placeholder="Real coaching. Real results. Based in Dubai..."
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Primary Action Button">
                        <Input
                          value={content.hero.cta_primary || ""}
                          onChange={(e) => updateHero("cta_primary", e.target.value)}
                          className="h-10 text-sm font-semibold"
                          placeholder="Launch Your Plan"
                        />
                      </Field>
                      <Field label="Secondary Action Button">
                        <Input
                          value={content.hero.cta_secondary || ""}
                          onChange={(e) => updateHero("cta_secondary", e.target.value)}
                          className="h-10 text-sm font-semibold"
                          placeholder="See Inside"
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methodology" className={tabContentClassName}>
                <SectionHeader
                  title="Step-by-Step Methodology"
                  actionLabel="Add Stage"
                  onAction={addMethodStep}
                />
                <div className="grid gap-4">
                  {content.methodology.steps.map((step, i) => (
                    <ArrayCard
                      key={`method-${i}`}
                      onRemove={() => removeMethodStep(i)}
                    >
                      <div className="grid gap-4">
                        <Field label="Stage Title">
                          <Input
                            value={step.title}
                            onChange={(e) => updateMethodStep(i, "title", e.target.value)}
                          />
                        </Field>
                        <Field label="Strategic Intent">
                          <Textarea
                            value={step.description}
                            onChange={(e) =>
                              updateMethodStep(i, "description", e.target.value)
                            }
                            className="min-h-[90px]"
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className={tabContentClassName}>
                <SectionHeader
                  title="Feature Matrix"
                  actionLabel="Add Capability"
                  onAction={addCapability}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {content.capabilities.items.map((item, i) => (
                    <ArrayCard
                      key={`capability-${i}`}
                      onRemove={() => removeCapability(i)}
                    >
                      <div className="grid gap-4">
                        <Field label="Capability Title">
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              updateCapability(i, "title", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Description">
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateCapability(i, "description", e.target.value)
                            }
                            className="min-h-[90px]"
                          />
                        </Field>
                        <Field label="Image URL">
                          <Input
                            value={item.image || ""}
                            onChange={(e) =>
                              updateCapability(i, "image", e.target.value)
                            }
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className={tabContentClassName}>
                <SectionHeader
                  title="Program Offerings"
                  actionLabel="Add Program"
                  onAction={addService}
                />
                <div className="grid gap-4">
                  {content.services.items.map((item, i) => (
                    <ArrayCard key={`service-${i}`} onRemove={() => removeService(i)}>
                      <div className="grid gap-4">
                        <Field label="Program Title">
                          <Input
                            value={item.title}
                            onChange={(e) => updateService(i, "title", e.target.value)}
                          />
                        </Field>
                        <Field label="Description">
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateService(i, "description", e.target.value)
                            }
                            className="min-h-[90px]"
                          />
                        </Field>
                        <Field label="Image URL">
                          <Input
                            value={item.image || ""}
                            onChange={(e) => updateService(i, "image", e.target.value)}
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>

                <SectionHeader
                  title="Package Framing"
                  actionLabel="Add Package"
                  onAction={addPackage}
                />
                <div className="grid gap-4">
                  {content.packages.items.map((item, i) => (
                    <ArrayCard key={`package-${i}`} onRemove={() => removePackage(i)}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Package Title">
                          <Input
                            value={item.title}
                            onChange={(e) => updatePackage(i, "title", e.target.value)}
                          />
                        </Field>
                        <Field label="Price">
                          <Input
                            value={item.price}
                            onChange={(e) => updatePackage(i, "price", e.target.value)}
                          />
                        </Field>
                        <Field label="Cadence">
                          <Input
                            value={item.cadence}
                            onChange={(e) => updatePackage(i, "cadence", e.target.value)}
                          />
                        </Field>
                        <Field label="Description" className="md:col-span-2">
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updatePackage(i, "description", e.target.value)
                            }
                            className="min-h-[100px]"
                          />
                        </Field>
                        <Field label="Highlights (one per line)" className="md:col-span-2">
                          <Textarea
                            value={item.highlights.join("\n")}
                            onChange={(e) =>
                              updatePackage(
                                i,
                                "highlights",
                                e.target.value
                                  .split("\n")
                                  .map((entry) => entry.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="min-h-[120px]"
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>

                <MarketingPageEditor
                  icon={<Layout className="w-5 h-5 text-muted-foreground" />}
                  title="Services Page"
                  description="Control the standalone public services page."
                  page={content.site_content.services}
                  onFieldChange={(field, value) =>
                    updatePageField("services", field, value)
                  }
                  onAddSection={() => addPageSection("services")}
                  onUpdateSection={(index, field, value) =>
                    updatePageSection("services", index, field, value)
                  }
                  onRemoveSection={(index) => removePageSection("services", index)}
                />
                <MarketingEnhancementsEditor
                  title="Services Page"
                  page={content.site_content.services}
                  onAddStat={() => addPageStat("services")}
                  onUpdateStat={(index, field, value) =>
                    updatePageStat("services", index, field, value)
                  }
                  onRemoveStat={(index) => removePageStat("services", index)}
                  onAddHighlight={() => addPageHighlight("services")}
                  onUpdateHighlight={(index, field, value) =>
                    updatePageHighlight("services", index, field, value)
                  }
                  onRemoveHighlight={(index) => removePageHighlight("services", index)}
                />
              </TabsContent>

              <TabsContent value="coach" className={tabContentClassName}>
                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                          Coach Biography
                        </CardTitle>
                        <CardDescription className="text-[11px] font-medium">
                          Personal branding and professional expertise.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 py-8 md:grid-cols-2">
                    <Field label="Full Name">
                      <Input
                        value={content.coach.name || ""}
                        onChange={(e) => updateCoach("name", e.target.value)}
                      />
                    </Field>
                    <Field label="Years of Experience">
                      <Input
                        value={content.coach.experience || ""}
                        onChange={(e) => updateCoach("experience", e.target.value)}
                      />
                    </Field>
                    <Field label="Primary Specialty">
                      <Input
                        value={content.coach.specialty || ""}
                        onChange={(e) => updateCoach("specialty", e.target.value)}
                      />
                    </Field>
                    <Field label="Mission Statement / Quote" className="md:col-span-2">
                      <Textarea
                        value={content.coach.quote || ""}
                        onChange={(e) => updateCoach("quote", e.target.value)}
                        className="min-h-[180px]"
                      />
                    </Field>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="proof" className={tabContentClassName}>
                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                          Proof Storytelling
                        </CardTitle>
                        <CardDescription className="text-[11px] font-medium">
                          Edit respectful landing proof cards. Media accepts direct URLs or
                          `cloudinary://folder/asset`.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 py-8">
                    <Field label="Section Headline">
                      <Input
                        value={content.proof.title || ""}
                        onChange={(e) => updateProofField("title", e.target.value)}
                      />
                    </Field>
                    <Field label="Section Intro">
                      <Textarea
                        value={content.proof.intro || ""}
                        onChange={(e) => updateProofField("intro", e.target.value)}
                        className="min-h-[110px]"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <SectionHeader
                  title="Proof Modules"
                  actionLabel="Add Module"
                  onAction={addProofModule}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {content.proof.items.map((item, index) => (
                    <ArrayCard
                      key={`proof-${index}`}
                      onRemove={() => removeProofModule(index)}
                    >
                      <div className="grid gap-4">
                        <Field label="Eyebrow">
                          <Input
                            value={item.eyebrow}
                            onChange={(e) =>
                              updateProofModule(index, "eyebrow", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Title">
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              updateProofModule(index, "title", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Description">
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateProofModule(index, "description", e.target.value)
                            }
                            className="min-h-[110px]"
                          />
                        </Field>
                        <Field label="Metric">
                          <Input
                            value={item.metric}
                            onChange={(e) =>
                              updateProofModule(index, "metric", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Detail">
                          <Textarea
                            value={item.detail}
                            onChange={(e) =>
                              updateProofModule(index, "detail", e.target.value)
                            }
                            className="min-h-[90px]"
                          />
                        </Field>
                        <Field label="Media URL">
                          <Input
                            value={item.media || ""}
                            onChange={(e) =>
                              updateProofModule(index, "media", e.target.value)
                            }
                            placeholder="cloudinary://folder/asset or https://..."
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="testimonials" className={tabContentClassName}>
                <SectionHeader
                  title="Featured Testimonials"
                  actionLabel="Add Featured"
                  onAction={addTestimonial}
                  secondaryActionLabel="Manage Advanced Data"
                  onSecondaryAction={() => router.push("/admin/testimonials")}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {content.testimonials.map((item, i) => (
                    <ArrayCard
                      key={`testimonial-${i}`}
                      onRemove={() => removeTestimonial(i)}
                    >
                      <div className="grid gap-4">
                        <Field label="Client Name">
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updateTestimonial(i, "name", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Role">
                          <Input
                            value={item.role || ""}
                            onChange={(e) =>
                              updateTestimonial(i, "role", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Location">
                          <Input
                            value={item.location || ""}
                            onChange={(e) =>
                              updateTestimonial(i, "location", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Result Label">
                          <Input
                            value={item.result_label || ""}
                            onChange={(e) =>
                              updateTestimonial(i, "result_label", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Rating">
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={item.rating}
                            onChange={(e) =>
                              updateTestimonial(i, "rating", Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field label="Quote">
                          <Textarea
                            value={item.quote}
                            onChange={(e) =>
                              updateTestimonial(i, "quote", e.target.value)
                            }
                            className="min-h-[120px]"
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className={tabContentClassName}>
                <MarketingPageEditor
                  icon={<FileText className="w-5 h-5 text-muted-foreground" />}
                  title="About Page"
                  description="Control the public About page from the admin portal."
                  page={content.site_content.about}
                  onFieldChange={(field, value) => updatePageField("about", field, value)}
                  onAddSection={() => addPageSection("about")}
                  onUpdateSection={(index, field, value) =>
                    updatePageSection("about", index, field, value)
                  }
                  onRemoveSection={(index) => removePageSection("about", index)}
                />
                <MarketingEnhancementsEditor
                  title="About Page"
                  page={content.site_content.about}
                  onAddStat={() => addPageStat("about")}
                  onUpdateStat={(index, field, value) =>
                    updatePageStat("about", index, field, value)
                  }
                  onRemoveStat={(index) => removePageStat("about", index)}
                  onAddHighlight={() => addPageHighlight("about")}
                  onUpdateHighlight={(index, field, value) =>
                    updatePageHighlight("about", index, field, value)
                  }
                  onRemoveHighlight={(index) => removePageHighlight("about", index)}
                />
              </TabsContent>

              <TabsContent value="contact" className={tabContentClassName}>
                <MarketingPageEditor
                  icon={<Mail className="w-5 h-5 text-muted-foreground" />}
                  title="Contact Page"
                  description="Manage consultation content and trust signals for contact routes."
                  page={content.site_content.contact}
                  onFieldChange={(field, value) => updatePageField("contact", field, value)}
                  onAddSection={() => addPageSection("contact")}
                  onUpdateSection={(index, field, value) =>
                    updatePageSection("contact", index, field, value)
                  }
                  onRemoveSection={(index) => removePageSection("contact", index)}
                />
                <MarketingEnhancementsEditor
                  title="Contact Page"
                  page={content.site_content.contact}
                  onAddStat={() => addPageStat("contact")}
                  onUpdateStat={(index, field, value) =>
                    updatePageStat("contact", index, field, value)
                  }
                  onRemoveStat={(index) => removePageStat("contact", index)}
                  onAddHighlight={() => addPageHighlight("contact")}
                  onUpdateHighlight={(index, field, value) =>
                    updatePageHighlight("contact", index, field, value)
                  }
                  onRemoveHighlight={(index) => removePageHighlight("contact", index)}
                />

                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                      Open Enquiry Form
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium">
                      Public form copy used on the contact page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 py-8 md:grid-cols-2">
                    <Field label="Form Title">
                      <Input
                        value={content.site_content.contact.form_title || ""}
                        onChange={(e) => updateContactField("form_title", e.target.value)}
                      />
                    </Field>
                    <Field label="Button Label">
                      <Input
                        value={content.site_content.contact.form_button_label || ""}
                        onChange={(e) =>
                          updateContactField("form_button_label", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Form Intro" className="md:col-span-2">
                      <Textarea
                        value={content.site_content.contact.form_intro || ""}
                        onChange={(e) => updateContactField("form_intro", e.target.value)}
                        className="min-h-[120px]"
                      />
                    </Field>
                    <Field label="Success Message" className="md:col-span-2">
                      <Textarea
                        value={content.site_content.contact.form_success_message || ""}
                        onChange={(e) =>
                          updateContactField("form_success_message", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <SectionHeader
                  title="Contact Channels"
                  actionLabel="Add Channel"
                  onAction={addContactChannel}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {(content.site_content.contact.channels ?? []).map((channel, index) => (
                    <ArrayCard
                      key={`channel-${index}`}
                      onRemove={() => removeContactChannel(index)}
                    >
                      <div className="grid gap-4">
                        <Field label="Label">
                          <Input
                            value={channel.label}
                            onChange={(e) =>
                              updateContactChannel(index, "label", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Value">
                          <Input
                            value={channel.value}
                            onChange={(e) =>
                              updateContactChannel(index, "value", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Href">
                          <Input
                            value={channel.href}
                            onChange={(e) =>
                              updateContactChannel(index, "href", e.target.value)
                            }
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>

                <Card className="shadow-sm border-border bg-background">
                  <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                      Service Areas
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium">
                      One area per line.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8">
                    <Textarea
                      value={(content.site_content.contact.service_areas ?? []).join("\n")}
                      onChange={(e) => updateServiceAreas(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className={tabContentClassName}>
                <MarketingPageEditor
                  icon={<HelpCircle className="w-5 h-5 text-muted-foreground" />}
                  title="FAQ Page"
                  description="Manage questions, answers, and CTA framing for the FAQ page."
                  page={content.site_content.faq}
                  onFieldChange={(field, value) => updatePageField("faq", field, value)}
                  onAddSection={() => addPageSection("faq")}
                  onUpdateSection={(index, field, value) =>
                    updatePageSection("faq", index, field, value)
                  }
                  onRemoveSection={(index) => removePageSection("faq", index)}
                />

                <SectionHeader
                  title="FAQ Items"
                  actionLabel="Add Question"
                  onAction={addFaqItem}
                />
                <div className="grid gap-4">
                  {(content.site_content.faq.items ?? []).map((item, index) => (
                    <ArrayCard key={`faq-${index}`} onRemove={() => removeFaqItem(index)}>
                      <div className="grid gap-4">
                        <Field label="Question">
                          <Input
                            value={item.question}
                            onChange={(e) =>
                              updateFaqItem(index, "question", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Answer">
                          <Textarea
                            value={item.answer}
                            onChange={(e) =>
                              updateFaqItem(index, "answer", e.target.value)
                            }
                            className="min-h-[120px]"
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className={tabContentClassName}>
                <MarketingPageEditor
                  icon={<BookOpen className="w-5 h-5 text-muted-foreground" />}
                  title="Content Hub"
                  description="Manage the public content index and article library from one place."
                  page={content.site_content.content_hub}
                  onFieldChange={(field, value) =>
                    updatePageField("content_hub", field, value)
                  }
                  onAddSection={() => addPageSection("content_hub")}
                  onUpdateSection={(index, field, value) =>
                    updatePageSection("content_hub", index, field, value)
                  }
                  onRemoveSection={(index) => removePageSection("content_hub", index)}
                />

                <SectionHeader
                  title="Articles"
                  actionLabel="Add Article"
                  onAction={addArticle}
                />
                <div className="grid gap-4">
                  {(content.site_content.content_hub.articles ?? []).map((article, index) => (
                    <ArrayCard
                      key={`${article.slug}-${index}`}
                      onRemove={() => removeArticle(index)}
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Slug">
                          <Input
                            value={article.slug}
                            onChange={(e) =>
                              updateArticle(index, "slug", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Title">
                          <Input
                            value={article.title}
                            onChange={(e) =>
                              updateArticle(index, "title", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Category">
                          <Input
                            value={article.category}
                            onChange={(e) =>
                              updateArticle(index, "category", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Read Time">
                          <Input
                            value={article.read_time || ""}
                            onChange={(e) =>
                              updateArticle(index, "read_time", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Published Date">
                          <Input
                            value={article.published_at || ""}
                            onChange={(e) =>
                              updateArticle(index, "published_at", e.target.value)
                            }
                            placeholder="YYYY-MM-DD"
                          />
                        </Field>
                        <Field label="Meta Title">
                          <Input
                            value={article.meta_title || ""}
                            onChange={(e) =>
                              updateArticle(index, "meta_title", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Meta Description" className="md:col-span-2">
                          <Textarea
                            value={article.meta_description || ""}
                            onChange={(e) =>
                              updateArticle(index, "meta_description", e.target.value)
                            }
                            className="min-h-[90px]"
                          />
                        </Field>
                        <Field label="Excerpt" className="md:col-span-2">
                          <Textarea
                            value={article.excerpt}
                            onChange={(e) =>
                              updateArticle(index, "excerpt", e.target.value)
                            }
                            className="min-h-[100px]"
                          />
                        </Field>
                        <Field label="Body" className="md:col-span-2">
                          <Textarea
                            value={article.body}
                            onChange={(e) =>
                              updateArticle(index, "body", e.target.value)
                            }
                            className="min-h-[220px]"
                          />
                        </Field>
                      </div>
                    </ArrayCard>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const tabTriggerClassName =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent bg-transparent text-xs font-bold uppercase tracking-widest px-0 pb-4 h-12";

const tabContentClassName = "mt-0 space-y-6 outline-none";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 ${className ?? ""}`}>
      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {secondaryActionLabel && onSecondaryAction ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-black uppercase tracking-widest"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        ) : null}
        {actionLabel && onAction ? (
          <Button
            onClick={onAction}
            size="sm"
            variant="outline"
            className="h-8 text-[10px] font-black uppercase tracking-widest"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ArrayCard({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <Card className="shadow-sm border-border bg-background relative group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function MarketingPageEditor({
  icon,
  title,
  description,
  page,
  onFieldChange,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  page: BasicMarketingPage;
  onFieldChange: (field: keyof BasicMarketingPage, value: string) => void;
  onAddSection: () => void;
  onUpdateSection: (
    index: number,
    field: keyof SitePageSection,
    value: string
  ) => void;
  onRemoveSection: (index: number) => void;
}) {
  return (
    <>
      <Card className="shadow-sm border-border bg-background">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-5">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                {title}
              </CardTitle>
              <CardDescription className="text-[11px] font-medium">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 py-8 md:grid-cols-2">
          <Field label="Meta Title">
            <Input
              value={page.meta_title || ""}
              onChange={(e) => onFieldChange("meta_title", e.target.value)}
            />
          </Field>
          <Field label="Meta Description">
            <Textarea
              value={page.meta_description || ""}
              onChange={(e) => onFieldChange("meta_description", e.target.value)}
              className="min-h-[90px]"
            />
          </Field>
          <Field label="Eyebrow">
            <Input
              value={page.eyebrow || ""}
              onChange={(e) => onFieldChange("eyebrow", e.target.value)}
            />
          </Field>
          <Field label="Page Title">
            <Input
              value={page.title || ""}
              onChange={(e) => onFieldChange("title", e.target.value)}
            />
          </Field>
          <Field label="Intro" className="md:col-span-2">
            <Textarea
              value={page.intro || ""}
              onChange={(e) => onFieldChange("intro", e.target.value)}
              className="min-h-[120px]"
            />
          </Field>
          <Field label="Hero Media">
            <Input
              value={page.hero_media || ""}
              onChange={(e) => onFieldChange("hero_media", e.target.value)}
              placeholder="cloudinary://folder/asset or https://..."
            />
          </Field>
          <Field label="Feature Media">
            <Input
              value={page.feature_media || ""}
              onChange={(e) => onFieldChange("feature_media", e.target.value)}
              placeholder="cloudinary://folder/asset or https://..."
            />
          </Field>
          <Field label="Spotlight Quote" className="md:col-span-2">
            <Textarea
              value={page.spotlight_quote || ""}
              onChange={(e) => onFieldChange("spotlight_quote", e.target.value)}
              className="min-h-[90px]"
            />
          </Field>
          <Field label="CTA Title">
            <Input
              value={page.cta_title || ""}
              onChange={(e) => onFieldChange("cta_title", e.target.value)}
            />
          </Field>
          <Field label="CTA Label">
            <Input
              value={page.cta_label || ""}
              onChange={(e) => onFieldChange("cta_label", e.target.value)}
            />
          </Field>
          <Field label="CTA Body">
            <Textarea
              value={page.cta_body || ""}
              onChange={(e) => onFieldChange("cta_body", e.target.value)}
              className="min-h-[100px]"
            />
          </Field>
          <Field label="CTA Href">
            <Input
              value={page.cta_href || ""}
              onChange={(e) => onFieldChange("cta_href", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <SectionHeader
        title={`${title} Sections`}
        actionLabel="Add Section"
        onAction={onAddSection}
      />
      <div className="grid gap-4">
        {(page.sections ?? []).map((section, index) => (
          <ArrayCard key={`${section.title}-${index}`} onRemove={() => onRemoveSection(index)}>
            <div className="grid gap-4">
              <Field label="Section Title">
                <Input
                  value={section.title}
                  onChange={(e) => onUpdateSection(index, "title", e.target.value)}
                />
              </Field>
              <Field label="Section Body">
                <Textarea
                  value={section.body}
                  onChange={(e) => onUpdateSection(index, "body", e.target.value)}
                  className="min-h-[120px]"
                />
              </Field>
            </div>
          </ArrayCard>
        ))}
      </div>
    </>
  );
}

function MarketingEnhancementsEditor({
  title,
  page,
  onAddStat,
  onUpdateStat,
  onRemoveStat,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight,
}: {
  title: string;
  page: BasicMarketingPage;
  onAddStat: () => void;
  onUpdateStat: (index: number, field: keyof SitePageStat, value: string) => void;
  onRemoveStat: (index: number) => void;
  onAddHighlight: () => void;
  onUpdateHighlight: (
    index: number,
    field: keyof SitePageHighlight,
    value: string
  ) => void;
  onRemoveHighlight: (index: number) => void;
}) {
  return (
    <>
      <SectionHeader title={`${title} Stats`} actionLabel="Add Stat" onAction={onAddStat} />
      <div className="grid gap-4 md:grid-cols-2">
        {(page.stats ?? []).map((stat, index) => (
          <ArrayCard key={`${stat.label}-${index}`} onRemove={() => onRemoveStat(index)}>
            <div className="grid gap-4">
              <Field label="Label">
                <Input
                  value={stat.label}
                  onChange={(e) => onUpdateStat(index, "label", e.target.value)}
                />
              </Field>
              <Field label="Value">
                <Input
                  value={stat.value}
                  onChange={(e) => onUpdateStat(index, "value", e.target.value)}
                />
              </Field>
            </div>
          </ArrayCard>
        ))}
      </div>

      <SectionHeader
        title={`${title} Highlights`}
        actionLabel="Add Highlight"
        onAction={onAddHighlight}
      />
      <div className="grid gap-4">
        {(page.highlights ?? []).map((highlight, index) => (
          <ArrayCard
            key={`${highlight.title}-${index}`}
            onRemove={() => onRemoveHighlight(index)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow">
                <Input
                  value={highlight.eyebrow || ""}
                  onChange={(e) => onUpdateHighlight(index, "eyebrow", e.target.value)}
                />
              </Field>
              <Field label="Title">
                <Input
                  value={highlight.title}
                  onChange={(e) => onUpdateHighlight(index, "title", e.target.value)}
                />
              </Field>
              <Field label="Media">
                <Input
                  value={highlight.media || ""}
                  onChange={(e) => onUpdateHighlight(index, "media", e.target.value)}
                  placeholder="cloudinary://folder/asset or https://..."
                />
              </Field>
              <Field label="Body" className="md:col-span-2">
                <Textarea
                  value={highlight.body}
                  onChange={(e) => onUpdateHighlight(index, "body", e.target.value)}
                  className="min-h-[120px]"
                />
              </Field>
            </div>
          </ArrayCard>
        ))}
      </div>
    </>
  );
}
