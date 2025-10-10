"use client";

import { useState } from "react";
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
}

export function ShareComponent({
  url,
  title = "Check this out",
  text = "I thought you might be interested in this",
  className = "",
  onCopy
}: ShareComponentProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(text);

  // Social media share links
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
  const instagramUrl = `https://www.instagram.com/?url=${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;
  const mailtoUrl = `mailto:?subject=${shareTitle}&body=${shareText}%20${shareUrl}`;

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
          url
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
          value={url} 
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
