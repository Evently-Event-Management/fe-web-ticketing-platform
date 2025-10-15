"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Copy,
    Check,
    Share2,
    Mail,
} from "lucide-react";
import { toast } from "sonner";
import {SiFacebook, SiInstagram, SiWhatsapp, SiX} from "@icons-pack/react-simple-icons";

interface ShareComponentProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  onCopy?: () => void;
  campaign?: string;
}

export function ShareComponent({
  url,
  title = "Check this out",
  text = "I thought you might be interested in this",
  className = "",
  onCopy,
  campaign,
}: ShareComponentProps) {
  const [copied, setCopied] = useState(false);

  const resolvedCampaign = (campaign ?? "share_component").trim() || "share_component";

  const createTrackedUrl = useCallback((source: string, medium: string, content?: string) => {
    try {
      const absoluteUrl = /^https?:\/\//i.test(url)
        ? url
        : (typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url);

      const urlObj = new URL(absoluteUrl);
      const params = urlObj.searchParams;
      params.set("utm_source", source);
      params.set("utm_medium", medium);
      params.set("utm_campaign", resolvedCampaign);
      if (content) {
        params.set("utm_content", content);
      }
      return urlObj.toString();
    } catch (error) {
      console.warn("Failed to build tracked share URL, falling back to original", error);
      return url;
    }
  }, [resolvedCampaign, url]);

  const trackedTargets = useMemo(() => ({
    facebook: createTrackedUrl("facebook", "social", "share-facebook"),
    twitter: createTrackedUrl("x", "social", "share-x"),
    instagram: createTrackedUrl("instagram", "social", "share-instagram"),
    whatsapp: createTrackedUrl("whatsapp", "social", "share-whatsapp"),
    email: createTrackedUrl("email", "email", "share-email"),
    copy: createTrackedUrl("copy_link", "share", "copy-link"),
    native: createTrackedUrl("native_share", "share", "native-share"),
  }), [createTrackedUrl]);

  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(text);

  // Social media share links with tracked URLs
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackedTargets.facebook)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(trackedTargets.twitter)}&text=${shareText}`;
  const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(trackedTargets.instagram)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${trackedTargets.whatsapp}`)}`;
  const mailtoUrl = `mailto:?subject=${shareTitle}&body=${encodeURIComponent(`${text} ${trackedTargets.email}`)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackedTargets.copy).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Use Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: trackedTargets.native
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => openShareWindow(facebookUrl)}
          className="flex-1"
        >
          <SiFacebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => openShareWindow(twitterUrl)}
          className="flex-1"
        >
          <SiX className="h-4 w-4 mr-2" />
          X
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => openShareWindow(instagramUrl)}
          className="flex-1"
        >
          <SiInstagram className="h-4 w-4 mr-2" />
            Instagram
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => openShareWindow(whatsappUrl)}
          className="flex-1"
        >
          <SiWhatsapp className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => openShareWindow(mailtoUrl)}
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleNativeShare}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      <div className="flex gap-2 mt-2 items-center">
        <Input 
          value={trackedTargets.copy} 
          readOnly 
          className="text-xs"
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={copyToClipboard}
          className="min-w-[80px]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
