import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, GitCompare, ShieldAlert, ArrowRight, Microscope, FlaskConical } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";

type Card = { title: string; desc: string };

export function ValidationSection() {
  const { t } = useTranslation();
  const cards = (t("home.validation.cards") as unknown as Card[]) ?? [];
  const icons = [Target, GitCompare, ShieldAlert, Microscope] as const;

  return (
    <section
      id="validation-clinique"
      aria-labelledby="validation-title"
      className="py-20 bg-muted/30 scroll-mt-20"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {t("home.validation.badge")}
            </span>
          </div>
          <h2 id="validation-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("home.validation.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            {t("home.validation.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map((card, i) => {
            const Icon = icons[i] ?? Target;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-2xl border bg-card p-5 card-hover"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border bg-card/60 p-6 md:p-8 mb-6"
        >
          <p className="text-sm md:text-base text-foreground leading-relaxed text-center font-medium">
            {t("home.validation.scopeStatement")}
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button asChild size="lg" className="shadow-md">
            <Link to="/protocol">
              {t("home.validation.ctaProtocol")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/80 text-center max-w-3xl mx-auto leading-relaxed">
          {t("home.validation.disclaimer")}
        </p>
      </div>
    </section>
  );
}
