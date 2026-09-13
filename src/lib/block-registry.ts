import type { ComponentType } from "react";
import Hero from "@/components/sections/Hero";
import IntroStats from "@/components/sections/IntroStats";
import PopularPackages from "@/components/sections/PopularPackages";
import PackageGrid from "@/components/sections/PackageGrid";
import PopularPackagesGrid from "@/components/sections/PopularPackagesGrid";
import BlogGrid from "@/components/sections/BlogGrid";
import ArticleHero from "@/components/sections/ArticleHero";
import ArticleBody from "@/components/sections/ArticleBody";
import RelatedStories from "@/components/sections/RelatedStories";
import PageHero from "@/components/sections/PageHero";
import ContactHero from "@/components/sections/ContactHero";
import ContactForm from "@/components/sections/ContactForm";
import DestinationsGrid from "@/components/sections/DestinationsGrid";
import CulturalDayTours from "@/components/sections/CulturalDayTours";
import DestinationDetail from "@/components/sections/DestinationDetail";
import {
  DestinationHeader,
  DestinationOverview,
  DestinationPackages,
} from "@/components/sections/DestinationSections";
import PackageDetail from "@/components/sections/PackageDetail";
import {
  PackageBooking,
  PackageHeader,
  PackageItinerary,
  PackageOverview,
  PackageReviewsSection,
} from "@/components/sections/PackageSections";
import PackageEnquiry from "@/components/sections/PackageEnquiry";
import Checkout from "@/components/sections/Checkout";
import PaymentSuccess from "@/components/sections/PaymentSuccess";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import DestinationsBento from "@/components/sections/DestinationsBento";
import AuthenticExperiences from "@/components/sections/AuthenticExperiences";
import CTABand from "@/components/sections/CTABand";
import FAQSection from "@/components/sections/FAQSection";
import {
  EmbedSection,
  FeaturesList,
  Gallery,
  HeaderCard,
  LeadForm,
  RichTextSection,
  Spacer,
  StatsSection,
  Testimonial,
  TestimonialsCarousel,
  VideoSection,
} from "@/components/sections/CmsSimpleBlocks";

/**
 * Maps a Wagtail block's `component` (`block.value.component` — PascalCase,
 * set by every `SectionBlock` in the backend's `apps/cms/blocks/sections.py`)
 * to its React section component. `<BlockRenderer>` looks up this map and
 * spreads the rest of `block.value` as props.
 *
 * Every backend section currently has a frontend registration. Keep this map
 * aligned with the backend `COMPONENT_MAP` contract.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockRegistry: Record<string, ComponentType<any>> = {
  Hero: Hero,
  PageHero,
  ContactHero,
  ContactForm,
  IntroStats: IntroStats,
  PopularPackages: PopularPackages,
  PackageGrid: PackageGrid,
  PackageListing: PopularPackagesGrid,
  BlogListing: BlogGrid,
  ArticleHero,
  ArticleBody,
  RelatedStories,
  DestinationsGrid,
  CulturalDayTours,
  DestinationDetail,
  DestinationHeader,
  DestinationOverview,
  DestinationPackages,
  PackageDetail,
  PackageHeader,
  PackageOverview,
  PackageBooking,
  PackageItinerary,
  PackageReviewsSection,
  PackageEnquiry,
  Checkout,
  PaymentSuccess,
  ExperienceSection: ExperienceSection,
  WhyChooseUs: WhyChooseUs,
  BentoGrid: DestinationsBento,
  AuthenticExperiences: AuthenticExperiences,
  CTABanner: CTABand,
  FAQSection: FAQSection,
  RichTextSection,
  Gallery,
  VideoSection,
  EmbedSection,
  LeadForm,
  Spacer,
  HeaderCard,
  FeaturesList,
  Testimonial,
  TestimonialsCarousel,
  StatsSection,
};
