import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ListChecks, CreditCard, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSiteTheme } from '@/contexts/SiteThemeContext';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Crie sua conta',
    desc: 'Cadastro rápido e seguro em menos de 1 minuto.',
    accent: 'from-[hsl(262,83%,58%)] to-[hsl(280,80%,55%)]',
    matrixAccent: 'from-green-500 to-green-400',
  },
  {
    icon: ListChecks,
    number: '02',
    title: 'Escolha seu plano',
    desc: 'Planos flexíveis que se adaptam à sua operação.',
    accent: 'from-secondary to-[hsl(160,70%,40%)]',
    matrixAccent: 'from-green-400 to-emerald-500',
  },
  {
    icon: CreditCard,
    number: '03',
    title: 'Recarregue ou assine',
    desc: 'PIX, boleto ou cartão. Saldo disponível na hora.',
    accent: 'from-[hsl(200,80%,50%)] to-[hsl(220,75%,55%)]',
    matrixAccent: 'from-emerald-500 to-green-500',
  },
  {
    icon: Search,
    number: '04',
    title: 'Consulte em segundos',
    desc: 'Acesse dados completos com rapidez e precisão.',
    accent: 'from-[hsl(340,75%,55%)] to-[hsl(320,70%,50%)]',
    matrixAccent: 'from-green-500 to-lime-500',
  },
];

const CleanHowItWorksSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentVisualTheme } = useSiteTheme();
  const isMatrix = currentVisualTheme === 'matrix';

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[160px] opacity-15",
            isMatrix ? "bg-green-500" : "bg-[hsl(262,83%,58%)]"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10",
            isMatrix ? "bg-green-400" : "bg-secondary"
          )}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4",
              isMatrix
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-[hsl(262,83%,58%)]/10 text-[hsl(262,83%,58%)] border border-[hsl(262,83%,58%)]/20"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isMatrix ? "bg-green-400" : "bg-[hsl(262,83%,58%)]"
              )}
            />
            Passo a passo
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground tracking-tight mt-3">
            Como funciona
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Comece a consultar em minutos. Quatro etapas simples para transformar dados em decisões.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="group relative"
              >
                {/* Connector line - desktop only */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px">
                    <div
                      className={cn(
                        "w-full h-full",
                        isMatrix
                          ? "bg-gradient-to-r from-green-500/30 to-green-500/10"
                          : "bg-gradient-to-r from-border to-transparent"
                      )}
                    />
                    <motion.div
                      className={cn(
                        "absolute top-0 left-0 h-full w-1/2",
                        isMatrix
                          ? "bg-gradient-to-r from-green-400/60 to-transparent"
                          : "bg-gradient-to-r from-[hsl(262,83%,58%)]/40 to-transparent"
                      )}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.15 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                )}

                {/* Card */}
                <div
                  className={cn(
                    "relative rounded-2xl p-6 h-full transition-all duration-300",
                    "border border-border/50 hover:border-border",
                    isMatrix
                      ? "bg-black/30 hover:bg-black/50"
                      : "bg-card/50 hover:bg-card"
                  )}
                  style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Number + Icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                        isMatrix ? step.matrixAccent : step.accent
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span
                      className={cn(
                        "text-3xl font-black opacity-10 group-hover:opacity-20 transition-opacity select-none",
                        isMatrix ? "text-green-400" : "text-foreground"
                      )}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Bottom accent bar */}
                  <div className="mt-5 h-0.5 w-full rounded-full overflow-hidden bg-border/30">
                    <motion.div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        isMatrix ? step.matrixAccent : step.accent
                      )}
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-14 sm:mt-20"
        >
          <button
            onClick={() => navigate('/registration')}
            className={cn(
              "inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-300",
              "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
              isMatrix
                ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                : "bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(280,80%,55%)] hover:from-[hsl(262,83%,52%)] hover:to-[hsl(280,80%,50%)]"
            )}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            Comece agora — é grátis
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CleanHowItWorksSection;
