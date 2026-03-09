import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/context";
import { HeartPulse, ShieldCheck, Users } from "lucide-react";

const highlights = [
  { icon: HeartPulse, key: "clinical" },
  { icon: ShieldCheck, key: "privacy" },
  { icon: Users, key: "community" },
] as const;

export const AboutSection = forwardRef<HTMLElement>(function AboutSection(_, ref) {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.about.title")}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            {t("landing.about.description")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <motion.div
              key={h.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-6 rounded-2xl border bg-card"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <h.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">
                {t(`landing.about.highlights.${h.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`landing.about.highlights.${h.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
