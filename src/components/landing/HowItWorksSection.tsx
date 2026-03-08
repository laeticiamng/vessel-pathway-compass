import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/context";
import { UserPlus, HeartPulse, Rocket } from "lucide-react";

const stepIcons = [UserPlus, HeartPulse, Rocket];

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = t("landing.howItWorks.steps") as any as Array<{ title: string; desc: string }>;

  if (!Array.isArray(steps)) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("landing.howItWorks.title")}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = stepIcons[i] || Rocket;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
