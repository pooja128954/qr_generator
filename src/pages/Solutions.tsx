import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const ease = [0.16, 1, 0.3, 1] as const;

const solutionsData = [
  { img: "social_media.png", title: "Marketing & Promotions", desc: "Track campaign performance with QR code analytics." },
  { img: "image.png", title: "Business & Branding", desc: "Custom QR codes with your logo & design." },
  { img: "menu_card.png", title: "Restaurants & Menus", desc: "Contactless menu QR codes for your restaurant." },
  { img: "presentation.png", title: "Events & Tickets", desc: "Easy access to event info with QR codes." },
  { img: "payments.png", title: "Payments & vCards", desc: "Quick payments & digital business cards." },
  { img: "app.png", title: "App Downloads", desc: "Route users to App Store or Google Play." },
  { img: "website.png", title: "Website Traffic", desc: "Drive traffic directly to your website." },
  { img: "pdf.png", title: "PDF Documents", desc: "Share PDFs instantly with a single scan." },
  { img: "wifi.png", title: "WiFi Access", desc: "Connect guests to WiFi without passwords." },
  { img: "email.png", title: "Email Campaigns", desc: "Pre-filled emails ready to be sent." },
  { img: "google_maps.png", title: "Google Maps", desc: "Share locations and business directions." },
  { img: "google_meet.png", title: "Virtual Meetings", desc: "Join Google Meet calls instantly." },
  { img: "resume.png", title: "Digital Resumes", desc: "Share your professional portfolio instantly." },
  { img: "text.png", title: "Plain Text", desc: "Display text, serial numbers, or notes." },
];

const whyChooseData = [
  { img: "analysis.png", title: "Real-Time Analytics", desc: "Track scans & locations." },
  { img: "customize.png", title: "Advanced Customization", desc: "Unique shapes & designs." },
  { img: "share.png", title: "Instant Sharing", desc: "Share via social media." },
  { img: "manage.png", title: "Easy Management", desc: "Organize & download QRs." },
];

function HeroSection() {
  const { isLoggedIn } = useAuth();
  const ctaDest = isLoggedIn ? "/dashboard/qr-generator" : "/login";

  return (
    <section className="pt-32 pb-24 bg-[#0a45be] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.2] mb-4">
            Smart QR Code Solutions <br />
            <span className="text-blue-100 font-normal text-3xl md:text-4xl">for Businesses & Individuals</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto opacity-90">
            Create, Customize, Track & Grow with Powerful QR Codes
          </p>
          <Link
            to={ctaDest}
            className="inline-flex items-center justify-center gap-2 bg-success text-success-foreground px-8 py-3.5 rounded-lg font-medium hover:opacity-90 btn-press text-base shadow-lg shadow-success/20 transition-all"
          >
            Create Your QR Code
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function SolutionsGrid() {
  return (
    <section className="section-padding bg-background pb-8 pt-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-semibold text-[#1e3a8a]">Solutions for Every Need</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          {solutionsData.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: (i % 5) * 0.08 }}
              className="bg-card rounded-xl border border-border overflow-hidden hover-lift shadow-sm group flex flex-col"
            >
              <div className="aspect-[4/3] bg-muted/30 p-4 border-b border-border flex items-center justify-center overflow-hidden">
                <img 
                  src={`/solution/${s.img}`} 
                  alt={s.title} 
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="p-5 flex flex-col items-center flex-1 text-center">
                <h3 className="font-semibold text-sm text-[#1e3a8a] mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="section-padding bg-background pt-8 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-semibold text-[#1e3a8a]">Why Choose ScanQr?</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {whyChooseData.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border overflow-hidden hover-lift shadow-sm group flex flex-col"
            >
              <div className="aspect-[4/3] bg-muted/5 p-6 flex items-center justify-center overflow-hidden">
                <img 
                  src={`/choose/${w.img}`} 
                  alt={w.title} 
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="p-5 flex flex-col items-center flex-1 text-center">
                <h3 className="font-medium text-sm text-[#1e3a8a] mb-2">{w.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  const { isLoggedIn } = useAuth();
  const ctaDest = isLoggedIn ? "/dashboard/qr-generator" : "/login";

  return (
    <section className="relative py-20 bg-[#506680] text-white overflow-hidden">
      {/* Fallback pattern/gradient if no image is present */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3a506b] to-[#506680] opacity-90 mix-blend-multiply pointer-events-none" />
      
      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-3">
            Get Started with Smart QR Codes!
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Start your free trial today and create your first QR code in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaDest}
              className="inline-flex items-center justify-center gap-2 bg-success text-success-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 btn-press text-sm"
            >
              Start Free Trial
            </Link>
            <Link
              to="/#features"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors btn-press text-sm"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Solutions() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SolutionsGrid />
      <WhyChooseUs />
      <BottomCTA />
      <Footer />
    </div>
  );
}
