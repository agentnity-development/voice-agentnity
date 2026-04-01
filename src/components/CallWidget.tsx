import { useEffect, useRef, useState } from 'react';

const HOOMAN_AGENT_ID = import.meta.env.VITE_HOOMAN_AGENT_ID as string | undefined;
const HOOMAN_WIDGET_SCRIPT = 'https://core.hoomanlabs.com/scripts/web';
let hoomanWidgetScriptPromise: Promise<void> | null = null;

type HoomanVoiceBotOptions = {
  agentId: string;
  parent: HTMLElement;
  context?: string;
  onCallId?: (callId: string) => void;
  fg?: string;
  bg?: string;
  accent?: string;
  light?: boolean;
  border?: string;
};

type HoomanVoiceBotInstance = {
  handleCleanup: () => void;
};

declare global {
  interface Window {
    HoomanVoiceBot?: new (options: HoomanVoiceBotOptions) => HoomanVoiceBotInstance;
  }
}

function loadHoomanWidgetScript() {
  if (window.HoomanVoiceBot) {
    return Promise.resolve();
  }

  if (hoomanWidgetScriptPromise) {
    return hoomanWidgetScriptPromise;
  }

  hoomanWidgetScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${HOOMAN_WIDGET_SCRIPT}"]`);

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error('Unable to load the Hooman voice widget right now.'));

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = HOOMAN_WIDGET_SCRIPT;
    script.async = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.body.appendChild(script);
  }).catch((error) => {
    hoomanWidgetScriptPromise = null;
    throw error;
  });

  return hoomanWidgetScriptPromise;
}

export default function CallWidget() {
  const botContainerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HoomanVoiceBotInstance | null>(null);
  const [scriptError, setScriptError] = useState('');

  useEffect(() => {
    if (!HOOMAN_AGENT_ID) {
      setScriptError('The call widget is unavailable right now.');
      return;
    }

    let cancelled = false;

    const initializeBot = async () => {
      try {
        await loadHoomanWidgetScript();

        if (cancelled || !window.HoomanVoiceBot || !botContainerRef.current || botRef.current) return;

        setScriptError('');
        botRef.current = new window.HoomanVoiceBot({
          agentId: HOOMAN_AGENT_ID,
          parent: botContainerRef.current,
          context: JSON.stringify({ name: 'Customer', source: 'call_widget_section' }),
          fg: '#DEE2E6',
          bg: '#101125',
          accent: '#3B82F6',
          border: 'rgba(255,255,255,0.12)',
        });
      } catch (error) {
        if (!cancelled) {
          setScriptError('The call widget is unavailable right now.');
        }
      }
    };

    initializeBot();

    return () => {
      cancelled = true;
      botRef.current?.handleCleanup();
      botRef.current = null;
    };
  }, []);

  return (
    <section id="call" className="bg-[#06060f] px-4 sm:px-6 py-20 sm:py-24">
      <div className="max-w-xl mx-auto">
        <div className="min-h-[420px] relative">
          <div ref={botContainerRef} className="w-full h-[390px] overflow-hidden" />
          {!HOOMAN_AGENT_ID && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <p className="text-sm text-gray-500 leading-relaxed">
                The call widget is unavailable right now.
              </p>
            </div>
          )}
          {scriptError && HOOMAN_AGENT_ID && (
            <div className="absolute inset-x-0 bottom-0 px-4 py-3">
              <p className="text-xs text-red-300 text-center">{scriptError}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
