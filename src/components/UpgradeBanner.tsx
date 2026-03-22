import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

interface UpgradeBannerProps {
  title: string;
  description: string;
}

export default function UpgradeBanner({ title, description }: UpgradeBannerProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        {description}
      </p>
      
      <Link
        to="/#pricing"
        className="bg-primary text-primary-foreground px-5 py-2.5 flex items-center gap-2 rounded-lg text-sm font-medium hover:opacity-90 btn-press relative z-10"
      >
        Upgrade Plan
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
