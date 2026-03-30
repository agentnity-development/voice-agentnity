import { useEffect, useRef, useState } from 'react';

const HOOMAN_AGENT_ID = import.meta.env.VITE_HOOMAN_AGENT_ID as string | undefined;
const HOOMAN_WIDGET_SCRIPT = 'https://core.hoomanlabs.com/scripts/web';

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

export default function CallWidget() {
  const botContainerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HoomanVoiceBotInstance | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState('');

  useEffect(() => {
    if (!HOOMAN_AGENT_ID) {
      setScriptError('Add VITE_HOOMAN_AGENT_ID to enable the website call widget.');
      return;
    }

    let createdScript: HTMLScriptElement | null = null;
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${HOOMAN_WIDGET_SCRIPT}"]`);

    const initializeBot = () => {
      if (!window.HoomanVoiceBot || !botContainerRef.current || botRef.current) return;

      setScriptError('');
      botRef.current = new window.HoomanVoiceBot({
        agentId: HOOMAN_AGENT_ID,
        parent: botContainerRef.current,
        context: JSON.stringify({ name: 'Customer', source: 'call_widget_section' }),
        onCallId: (nextCallId: string) => setCallId(nextCallId),
        fg: '#DEE2E6',
        bg: '#101125',
        accent: '#3B82F6',
        border: 'rgba(255,255,255,0.12)',
      });
    };

    const handleScriptError = () => {
      setScriptError('Unable to load the Hooman voice widget right now.');
    };

    if (window.HoomanVoiceBot) {
      initializeBot();
    } else if (existingScript) {
      existingScript.addEventListener('load', initializeBot);
      existingScript.addEventListener('error', handleScriptError);
    } else {
      createdScript = document.createElement('script');
      createdScript.src = HOOMAN_WIDGET_SCRIPT;
      createdScript.async = true;
      createdScript.addEventListener('load', initializeBot);
      createdScript.addEventListener('error', handleScriptError);
      document.body.appendChild(createdScript);
    }

    return () => {
      botRef.current?.handleCleanup();
      botRef.current = null;

      if (createdScript) {
        createdScript.removeEventListener('load', initializeBot);
        createdScript.removeEventListener('error', handleScriptError);
        document.body.removeChild(createdScript);
      }

      if (existingScript) {
        existingScript.removeEventListener('load', initializeBot);
        existingScript.removeEventListener('error', handleScriptError);
      }
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
                Add your Hooman agent ID to preview the website call widget here.
              </p>
            </div>
          )}
          {scriptError && HOOMAN_AGENT_ID && (
            <div className="absolute inset-x-0 bottom-0 px-4 py-3">
              <p className="text-xs text-red-300 text-center">{scriptError}</p>
            </div>
          )}
        </div>

        {callId && (
          <p className="mt-4 text-xs text-gray-400 break-all text-center">
            Call ID: {callId}
          </p>
        )}
      </div>
    </section>
  );
}
