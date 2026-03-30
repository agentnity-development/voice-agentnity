import { useState, useRef } from 'react';

const HOOMAN_AGENT_ID = import.meta.env.VITE_HOOMAN_AGENT_ID as string;
const HOOMAN_CAMPAIGN = import.meta.env.VITE_HOOMAN_CAMPAIGN  as string;
const HOOMAN_TASK_ENDPOINT = '/api/hooman-task';
const GOOGLE_SHEET_ENDPOINT = '/api/google-sheet-lead';

const USE_CASES = [
  { label: 'Admissions follow-up', value: 'admissions_followup' },
  { label: 'Customer Support',     value: 'customer_support'    },
  { label: 'Sales Outreach',       value: 'sales_outreach'      },
  { label: 'Appointment Reminder', value: 'appointment_reminder'},
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen bg-[#080812] overflow-hidden flex items-center">
      <div className="absolute top-0 left-0 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] bg-blue-600/15 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] bg-blue-700/8 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col gap-5 items-center text-center md:items-start md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-3.5 py-1.5 w-fit mx-auto md:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] text-blue-300 font-medium tracking-widest uppercase">
                Localized for Bharat • 12+ languages
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.1] text-white max-w-xl mx-auto md:mx-0">
              Your AI is ready.
              <span className="block text-blue-400">Talk to it in 2 minutes.</span>
            </h1>

            <p className="text-gray-500 text-[15px] leading-relaxed max-w-md md:max-w-sm mx-auto md:mx-0">
              Multilingual voice agents that sound natural, reduce wait times, and help teams across education and enterprise move faster.
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-1 items-center justify-center md:justify-start mx-auto md:mx-0">
              <a href="#live-demo" className="bg-blue-500 hover:bg-blue-600 transition-all text-white font-semibold text-sm px-5 py-2.5 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Watch Demo
              </a>
              <a href="#use-cases" className="hover:bg-white/5 border border-white/10 transition-all text-gray-400 hover:text-white font-medium text-sm px-5 py-2.5 rounded-full inline-flex items-center justify-center w-full sm:w-auto">
                See Live Scenarios
              </a>
            </div>
          </div>

          {/* Right */}
          <div id="live-demo" className="w-full">
            <LiveDemoCard />
          </div>
        </div>

        {/* City strip */}
        <div className="mt-20 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-8 sm:gap-14">
          {['Mumbai Financial Centre', 'Delhi NCR EdTech', 'Hyderabad GCCs', 'Pune Auto Sector'].map((city) => (
            <span key={city} className="text-[11px] text-gray-700 font-medium tracking-widest uppercase">
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemoCard() {
  const [selected, setSelected] = useState(USE_CASES[0]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [sheetSyncError, setSheetSyncError] = useState('');
  const [taskId, setTaskId] = useState('');
  const submitted = useRef(false);

  const normalizedPhone = phone.replace(/\s+/g, '').replace(/^0+/, '');

  const validate = (): string => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!/^\d{10}$/.test(normalizedPhone)) return 'Enter a valid 10-digit Indian mobile number.';
    return '';
  };

  const saveLead = async (payload: {
    currentDate: string;
    currentTime: string;
    status: 'success' | 'error';
    taskId?: string;
    error?: string;
  }) => {
    const response = await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        phone: `+91${normalizedPhone}`,
        useCase: selected.label,
        taskId: payload.taskId || '',
        status: payload.status,
        source: 'hero_form',
        currentDate: payload.currentDate,
        currentTime: payload.currentTime,
        error: payload.error || '',
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `Google Sheets sync failed with status ${response.status}`);
    }
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (submitted.current) return;

    const now = Date.now();
    const startAt = new Date(now).toISOString();
    const expiresAt = new Date(now + 30 * 60 * 1000).toISOString();
    const currentDate = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' }).format(new Date(now));
    const currentTime = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' }).format(new Date(now));

    submitted.current = true;
    setError('');
    setSheetSyncError('');
    setTaskId('');
    setStatus('loading');

    try {
      const res = await fetch(HOOMAN_TASK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone:    `+91${normalizedPhone}`,
          agent:    HOOMAN_AGENT_ID,
          campaign: HOOMAN_CAMPAIGN,
          start:    900,
          end:      2100,
          startAfter: startAt,
          endAfter: expiresAt,
          timezone: 'Asia/Kolkata',
          context: {
            studentName:   name.trim(),
            studentPhone:  `+91${normalizedPhone}`,
            programName:   selected.label,
            callerType:    'student',
            currentDate,
            currentTime,
            customer_name: name.trim(),
            use_case:      selected.label,
            source:        'hero_form',
          },
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      if (!data?.taskId) {
        throw new Error(data?.message || 'Task was not created in Hooman Labs.');
      }

      setTaskId(data.taskId);
      try {
        await saveLead({
          currentDate,
          currentTime,
          status: 'success',
          taskId: data.taskId,
        });
      } catch (sheetError) {
        setSheetSyncError(sheetError instanceof Error ? sheetError.message : 'The lead was not saved to Google Sheets.');
      }
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      try {
        await saveLead({
          currentDate,
          currentTime,
          status: 'error',
          error: message,
        });
      } catch (sheetError) {
        setSheetSyncError(sheetError instanceof Error ? sheetError.message : 'The lead was not saved to Google Sheets.');
      }
      submitted.current = false;
      setStatus('error');
      setError(message);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md mx-auto flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-base mb-1">Call request accepted</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hooman created a task for <span className="text-white font-medium">+91 {normalizedPhone}</span>. If the phone does not ring, check this task in Hooman logs.
          </p>
        </div>
        {taskId && (
          <p className="text-[11px] text-gray-500 break-all">
            Task ID: <span className="text-white">{taskId}</span>
          </p>
        )}
        {sheetSyncError && (
          <p className="text-[11px] text-amber-300 leading-relaxed">
            Google Sheets sync issue: {sheetSyncError}
          </p>
        )}
        <p className="text-[10px] text-gray-700 tracking-wide">One-time AI experience. No spam.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 mb-6 text-center sm:text-left">
        <div>
          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-[0.18em] mb-1.5">
            Experience it now
          </p>
          <h3 className="text-white font-bold text-[17px] leading-snug">
            Trigger a live voice AI call
          </h3>
        </div>
        <span className="bg-green-500/15 text-green-400 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-green-500/20 sm:mt-0.5">
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3">

        {/* Custom Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            disabled={status === 'loading'}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-white text-sm rounded-xl px-4 py-3 flex items-center justify-between transition-all focus:outline-none focus:border-blue-500/40 disabled:opacity-50"
          >
            <span className="font-medium">{selected.label}</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d0d22] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 z-20">
              {USE_CASES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => { setSelected(item); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                    ${selected.value === item.value
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {item.label}
                  {selected.value === item.value && (
                    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          disabled={status === 'loading'}
          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/40 text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-all disabled:opacity-50"
        />

        {/* Phone */}
        <div className="flex gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-gray-400 text-sm font-medium whitespace-nowrap">
            +91
          </div>
          <input
            type="tel"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
            disabled={status === 'loading'}
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/40 text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Validation error */}
        {error && (
          <p className="text-xs text-red-300 mt-1.5 px-1">
            {error}
          </p>
        )}
        {sheetSyncError && (
          <p className="text-xs text-amber-300 mt-1.5 px-1">
            Google Sheets sync issue: {sheetSyncError}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed transition-all text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 mt-1"
        >
          {status === 'loading' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Triggering call…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Trigger Instant Call
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-700 mt-4 tracking-wide">
        One-time AI experience. No spam.
      </p>
    </div>
  );
}
