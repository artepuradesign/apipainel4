import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Monitor, MapPin, Globe, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type SessionKickedPayload = {
  reason: 'logged_in_elsewhere';
  revoked_token_prefix?: string;
  revoked_at?: string;
  new_session?: {
    id?: number;
    ip_address?: string;
    user_agent?: string;
    device?: string;
    browser?: string;
    os?: string;
    location?: string;
    country?: string;
    created_at?: string;
    last_activity?: string;
  };
};

const EVENT_NAME = 'apipainel:session-kicked';

const maskIp = (ip?: string) => {
  if (!ip) return 'N/A';
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return parts.map((p, i) => (i >= 2 ? '***' : p)).join('.');
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SessionKickedModal() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<SessionKickedPayload | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const details = useMemo(() => payload?.new_session, [payload]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<SessionKickedPayload>;
      if (!customEvent.detail || customEvent.detail.reason !== 'logged_in_elsewhere') return;

      setPayload(customEvent.detail);
      setSecondsLeft(5);
      setOpen(true);
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    const timer = window.setTimeout(async () => {
      try {
        await signOut();
      } finally {
        navigate('/logout');
      }
    }, 5000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timer);
    };
  }, [open, navigate, signOut]);

  if (!open || !payload) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl">Login em outro dispositivo</AlertDialogTitle>
              <p className="text-sm text-muted-foreground">Você será desconectado em {secondsLeft}s</p>
            </div>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p className="text-foreground font-medium">
              Detectamos um novo login com a sua conta. Por segurança, esta sessão será encerrada automaticamente.
            </p>

            <div className="space-y-2 bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Monitor className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Dispositivo</span>
                  <p className="text-sm font-medium text-foreground">
                    {(details?.browser || 'Desconhecido') + (details?.os ? ` no ${details.os}` : '')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Localização</span>
                  <p className="text-sm font-medium text-foreground">
                    {(details?.location || 'Desconhecido') + (details?.country ? `, ${details.country}` : '')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Endereço IP</span>
                  <p className="text-sm font-medium text-foreground font-mono">{maskIp(details?.ip_address)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Horário</span>
                  <p className="text-sm font-medium text-foreground">{formatDateTime(details?.created_at || details?.last_activity)}</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await signOut();
              } finally {
                navigate('/logout');
              }
            }}
            className="w-full"
          >
            Sair agora
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const dispatchSessionKicked = (payload: SessionKickedPayload) => {
  window.dispatchEvent(new CustomEvent<SessionKickedPayload>(EVENT_NAME, { detail: payload }));
};
