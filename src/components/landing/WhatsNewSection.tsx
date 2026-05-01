import { motion } from "framer-motion";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

type ChangelogTag = "new" | "improved" | "fixed" | "security";

interface ChangelogEntry {
  date: string;
  version: string;
  title: string;
  description: string;
  tags: { label: string; type: ChangelogTag }[];
}

const tagStyles: Record<ChangelogTag, string> = {
  new: "bg-primary/10 text-primary border-primary/30",
  improved: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  fixed: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  security: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

export function WhatsNewSection() {
  const { t } = useTranslation();
  const entries = (t("home.whatsNew.entries") as unknown as ChangelogEntry[]) || [];
  const tagLabel = (type: ChangelogTag) => t(`home.whatsNew.tagLabels.${type}`) as string;

  return (
    <section
      id="whats-new"
      aria-labelledby="whats-new-title"
      className="relative py-20 md:py-28 bg-gradient-to-b from-background via-background to-muted/30"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/40 bg-primary/5 text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("home.whatsNew.badge")}
          </Badge>
          <h2
            id="whats-new-title"
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
          >
            {t("home.whatsNew.title")}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.whatsNew.subtitle")}
          </p>
        </motion.div>

        <ol className="relative space-y-6 md:space-y-8 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {Array.isArray(entries) &&
            entries.map((entry, idx) => (
              <motion.li
                key={`${entry.version}-${idx}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative pl-10 md:pl-14"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-3 flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full border border-primary/40 bg-background shadow-sm"
                >
                  <span className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-primary" />
                </span>
                <Card className="p-5 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <time dateTime={entry.date}>{entry.date}</time>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {entry.version}
                    </Badge>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tagStyles[tag.type]}`}
                        >
                          {tag.label || tagLabel(tag.type)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {entry.description}
                  </p>
                </Card>
              </motion.li>
            ))}
        </ol>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/modules"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("home.whatsNew.cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
