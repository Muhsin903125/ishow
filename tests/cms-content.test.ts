import { describe, expect, it } from "vitest";
import {
  getDefaultCMSContent,
  normalizeCMSContent,
} from "../src/lib/cms/content";

describe("cms content defaults", () => {
  it("provides default services and packages for marketing surfaces", () => {
    const content = getDefaultCMSContent();

    expect(content.services.items.length).toBeGreaterThan(0);
    expect(content.packages.items.length).toBeGreaterThan(0);
    expect(content.proof.items.length).toBeGreaterThan(0);
    expect(content.site_content.services.title).toContain("Fitness Services");
  });

  it("normalizes missing nested fields for admin editing", () => {
    const content = normalizeCMSContent({
      hero: {
        title: "Test hero",
      },
      site_content: {
        about: {
          title: "About",
        },
      },
    });

    expect(content.hero.title).toBe("Test hero");
    expect(content.services.items.length).toBeGreaterThan(0);
    expect(content.packages.items.length).toBeGreaterThan(0);
    expect(content.proof.items.length).toBeGreaterThan(0);
    expect(content.site_content.contact.channels?.length).toBeGreaterThan(0);
    expect(content.site_content.about.stats?.length).toBeGreaterThan(0);
    expect(content.site_content.about.highlights?.length).toBeGreaterThan(0);
    expect(content.site_content.contact.form_button_label).toBeTruthy();
    expect(content.site_content.services.sections?.length).toBeGreaterThan(0);
  });

  it("falls back to default public content when stored cms fields are blank", () => {
    const content = normalizeCMSContent({
      site_content: {
        contact: {
          title: "Start The Conversation.",
          intro: "",
          hero_media: "",
          highlights: [],
          channels: [],
        },
      },
    });

    expect(content.site_content.contact.title).toBe("Start The Conversation.");
    expect(content.site_content.contact.intro).toContain("Reach out");
    expect(content.site_content.contact.hero_media).toContain("images.unsplash.com");
    expect(content.site_content.contact.channels?.length).toBeGreaterThan(0);
    expect(content.site_content.contact.highlights?.length).toBeGreaterThan(0);
  });
});
