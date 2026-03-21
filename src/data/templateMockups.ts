import feedImg1 from "@/assets/templates/template_post_feed_2.jpg";
import feedImg2 from "@/assets/templates/template_post_feed_3.jpg";
import feedImg3 from "@/assets/templates/exemplo_criativo_db8.jpg";
import storyImg1 from "@/assets/templates/template_story_1.jpg";
import storyImg2 from "@/assets/templates/template_story_2.jpg";
import storyImg3 from "@/assets/templates/template_story_3.jpg";
import reelsImg1 from "@/assets/templates/template_reels_1.jpg";
import reelsImg2 from "@/assets/templates/template_reels_2.jpg";

export interface TemplateMockup {
  src: string;
  label: string;
}

export const feedMockups: TemplateMockup[] = [
  { src: feedImg1, label: "Feed Moderno" },
  { src: feedImg2, label: "Feed Elegante" },
  { src: feedImg3, label: "Feed DB8" },
];

export const storyMockups: TemplateMockup[] = [
  { src: storyImg1, label: "Story Clean" },
  { src: storyImg2, label: "Story Bold" },
  { src: storyImg3, label: "Story Premium" },
];

export const reelsMockups: TemplateMockup[] = [
  { src: reelsImg1, label: "Reels Dinâmico" },
  { src: reelsImg2, label: "Reels Impacto" },
];

export const mockupsByFormat: Record<string, TemplateMockup[]> = {
  feed: feedMockups,
  story: storyMockups,
  carousel: reelsMockups,
};

export const allMockups = [
  { format: "Feed", aspect: "aspect-square", mockups: feedMockups },
  { format: "Stories", aspect: "aspect-[9/16]", mockups: storyMockups },
  { format: "Reels", aspect: "aspect-[9/16]", mockups: reelsMockups },
];
