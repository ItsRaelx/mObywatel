/* Strona pokazowa w przeglądarce (szeroki ekran): po lewej telefon z działającą aplikacją w ramce,
   po prawej opis, wybór osoby, scenariusze do sprawdzenia i kod QR do otwarcia na telefonie. */
import { useEffect, useMemo, useRef, useState } from 'react';

import { OSOBY, OSOBY_IDS } from '@/data/typy';
import { OSOBA_Z_ADRESU } from '@/lib/web';
import { portretSvg } from '@/lib/grafika';
import { QR } from '@/lib/qr';

const SCENARIUSZE: Record<string, string[]> = {
  marta: ['Na ekranie Start ktoś sprawdzał Twój PESEL. Dotknij „To nie ja, zablokuj” i przejdź zgłoszenie.', 'W Dokumentach otwórz Moje pojazdy: historia badań, polisa i stan licznika Toyoty.', 'W Usługach spisz mStłuczkę. Na końcu pokażesz kod QR drugiemu kierowcy.'],
  jan: ['Odpowiedz urzędowi skarbowemu w sprawie JPK, z fakturami w załączniku.', 'W Moich pojazdach przełącz się między Skodą a Transporterem w leasingu.', 'Zarejestruj wyjazd do Egiptu w Bezpiecznej podróży i zobacz ostrzeżenie o paszporcie Olka.'],
  ewa: ['Twój dowód traci ważność za 48 dni. Złóż wniosek o nowy prosto z ekranu Start.', 'W Usługach otwórz Recepty i pokaż kod do apteki dla mamy.', 'Sprawdź Moją emeryturę i zobacz, jak zmienia się prognoza.'],
  kacper: ['Zapłać mandat. Płatność potwierdzisz Face ID.', 'Sprawdź punkty karne i limit w okresie próbnym.', 'Pokaż mLegitymację i policz zniżkę na pociąg w Ulgach studenta.'],
};

const CSS = `
:root{--bg:#F3F1EE;--panel:#FFFFFF;--ink:#17181C;--ink2:#5F6270;--ink3:#9A9CA6;--hair:#E5E0DB;--acc:#D8143A;--accInk:#B00F30;--accBg:#FBE8EC;--dark:#17181C;--darkInk:#F2F2F4;--frame:#0D0E10}
@media (prefers-color-scheme:dark){:root{--bg:#0B0C0E;--panel:#17181C;--ink:#F2F2F4;--ink2:#A7AAB4;--ink3:#70737E;--hair:#2A2C32;--acc:#F2304F;--accInk:#FF6E86;--accBg:rgba(242,48,79,.16);--dark:#1E1F24;--darkInk:#F2F2F4;--frame:#000}}
html,body,#root{height:100%;margin:0}
body{background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.pz{height:100%;overflow-y:auto;display:flex;justify-content:center;gap:64px;padding:20px 40px;box-sizing:border-box;background:radial-gradient(1200px 700px at 30% 40%,var(--panel) 0%,transparent 60%),var(--bg)}
.tel{position:relative;flex:none;margin-block:auto}
.obud{position:absolute;inset:0;border-radius:62px;background:var(--frame);box-shadow:0 40px 80px -30px rgba(40,10,20,.45),0 0 0 2px #2a2b30 inset}
.przycisk{position:absolute;width:4px;border-radius:2px;background:#24252a}
.ekr{position:absolute;left:14px;top:14px;width:390px;height:844px;border-radius:48px;overflow:hidden;background:#000}
.ekr iframe{border:0;width:390px;height:844px;display:block}
.status{position:absolute;left:14px;top:14px;width:390px;height:50px;pointer-events:none;display:flex;align-items:center;justify-content:space-between;padding:0 34px 0 44px;box-sizing:border-box;font-weight:600;font-size:16px;letter-spacing:-.2px;transition:color .2s}
.wyspa{position:absolute;left:50%;top:11px;transform:translateX(-50%);width:120px;height:34px;border-radius:20px;background:#000}
.ikony{display:flex;gap:6px;align-items:center}
.dom{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;pointer-events:none;transition:background .2s}
.bok{width:440px;max-width:100%;display:flex;flex-direction:column;gap:20px;margin-block:auto;padding-block:8px}
.znak{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;padding:6px 12px;border-radius:999px;background:var(--accBg);color:var(--accInk);font-size:13px;font-weight:700}
.znak i{width:7px;height:7px;border-radius:50%;background:var(--acc)}
h1{font-size:36px;line-height:1.08;letter-spacing:-1px;margin:12px 0 0;font-weight:800;text-wrap:balance}
.lead{font-size:16px;line-height:1.5;color:var(--ink2);margin:10px 0 0}
.cap{font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:var(--ink3);margin:0 0 10px}
.osoby{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.os{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:var(--panel);border:1.5px solid var(--hair);cursor:pointer;text-align:left;font:inherit;color:inherit;transition:border-color .15s,transform .15s}
.os:hover{border-color:var(--ink3)}
.os:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.os[aria-pressed=true]{border-color:var(--acc)}
.os img{width:42px;height:42px;border-radius:50%;background:#eee}
.os b{display:block;font-size:15px}
.os span{font-size:12.5px;color:var(--ink2)}
ol.kroki{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
ol.kroki li{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--hair);font-size:14.5px;line-height:1.45}
ol.kroki li:first-child{border-top:0;padding-top:2px}
ol.kroki em{font-style:normal;flex:none;width:22px;height:22px;border-radius:7px;background:var(--panel);border:1px solid var(--hair);color:var(--accInk);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
.wiersz{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.seg{display:inline-flex;padding:3px;border-radius:12px;background:var(--panel);border:1px solid var(--hair)}
.seg button{border:0;background:transparent;color:var(--ink2);font:inherit;font-size:13.5px;font-weight:700;padding:7px 14px;border-radius:9px;cursor:pointer}
.seg button[aria-pressed=true]{background:var(--ink);color:var(--bg)}
.pin{font-size:13.5px;color:var(--ink2)}
.pin b{font-variant-numeric:tabular-nums;color:var(--ink);letter-spacing:2px}
.karta{display:flex;gap:18px;align-items:center;padding:18px;border-radius:22px;background:var(--dark);color:var(--darkInk)}
.karta .qr{flex:none;width:96px;height:96px;border-radius:12px;background:#fff;padding:6px;box-sizing:border-box}
.karta .qr svg{width:100%;height:100%;display:block}
.karta b{display:block;font-size:16px;margin-bottom:4px}
.karta p{margin:0;font-size:13.5px;line-height:1.45;opacity:.8}
.stopka{font-size:12px;line-height:1.5;color:var(--ink3);margin:0}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const IkonyStatusu = ({ c }: { c: string }) => (
  <span className="ikony">
    <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill={c}><path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8 .6 10.2 10.2 0 0 0 .8 3.5L2 4.7a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 4a6.8 6.8 0 0 0-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c.5 0 1 .2 1.3.5L8 11 6.7 9.6c.3-.3.8-.5 1.3-.5Z" /></svg>
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke={c} opacity=".45" /><rect x="2" y="2" width="20" height="9" rx="2.2" fill={c} /><rect x="24.7" y="4.3" width="1.6" height="4.4" rx=".8" fill={c} opacity=".5" /></svg>
  </span>
);

export function Prezentacja() {
  const start = OSOBA_Z_ADRESU && OSOBY[OSOBA_Z_ADRESU] ? OSOBA_Z_ADRESU : 'ewa';
  const [osoba, setOsoba] = useState(start);
  const [motyw, setMotyw] = useState<'jasny' | 'ciemny'>(() => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'ciemny' : 'jasny'));
  const [pasek, setPasek] = useState({ jasny: true, ciemny: false });
  const [skala, setSkala] = useState(1);
  const ramka = useRef<HTMLIFrameElement>(null);
  const [src] = useState(() => `/?ramka=1&osoba=${start}`);

  useEffect(() => {
    const dopasuj = () => setSkala(Math.min(1, (window.innerHeight - 40) / 872));
    dopasuj(); window.addEventListener('resize', dopasuj);
    const wiad = (e: MessageEvent) => { const d = e.data; if (d?.mobywatel && d.typ === 'pasek') setPasek({ jasny: !!d.jasny, ciemny: !!d.ciemny }); };
    window.addEventListener('message', wiad);
    document.title = 'mObywatel, prototyp';
    return () => { window.removeEventListener('resize', dopasuj); window.removeEventListener('message', wiad); };
  }, []);

  const wyslij = (m: Record<string, unknown>) => ramka.current?.contentWindow?.postMessage({ mobywatel: 1, ...m }, '*');
  const wybierz = (id: string) => {
    setOsoba(id); wyslij({ typ: 'osoba', id });
    try { window.history.replaceState(null, '', `?osoba=${id}`); } catch { /* brak */ }
  };
  const zmienMotyw = (m: 'jasny' | 'ciemny') => { setMotyw(m); wyslij({ typ: 'motyw', m }); };
  const zaladowana = () => wyslij({ typ: 'motyw', m: motyw });

  const adres = typeof window !== 'undefined' ? `${window.location.origin}/?osoba=${osoba}` : '';
  const qr = useMemo(() => (QR.svg as (t: string, o: object) => { xml: string })(adres, { logo: false, bg: '#fff', quiet: 1, color: '#111' }).xml, [adres]);
  const portrety = useMemo(() => Object.fromEntries(OSOBY_IDS.map(id => [id, `data:image/svg+xml;utf8,${encodeURIComponent(portretSvg(id))}`])), []);
  const kolorStatusu = pasek.jasny || pasek.ciemny ? '#fff' : '#111';
  const godzina = '9:41';
  const o = OSOBY[osoba];

  return (
    <div className="pz">
      <style>{CSS}</style>
      <div className="tel" style={{ width: 418 * skala, height: 872 * skala }}>
        <div style={{ width: 418, height: 872, transform: `scale(${skala})`, transformOrigin: 'top left', position: 'relative' }}>
          <div className="obud" />
          <div className="przycisk" style={{ left: -3, top: 180, height: 34 }} />
          <div className="przycisk" style={{ left: -3, top: 236, height: 64 }} />
          <div className="przycisk" style={{ left: -3, top: 312, height: 64 }} />
          <div className="przycisk" style={{ right: -3, top: 260, height: 100 }} />
          <div className="ekr">
            <iframe ref={ramka} src={src} title="Prototyp aplikacji mObywatel" onLoad={zaladowana} allow="camera; clipboard-write" />
          </div>
          <div className="status" style={{ color: kolorStatusu }}>
            <span>{godzina}</span>
            <IkonyStatusu c={kolorStatusu} />
          </div>
          <div className="wyspa" style={{ top: 25 }} />
          <div className="dom" style={{ background: pasek.ciemny ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.8)' }} />
        </div>
      </div>

      <div className="bok">
        <div>
          <span className="znak"><i />Prototyp na fikcyjnych danych</span>
          <h1>Tak mógłby wyglądać mObywatel</h1>
          <p className="lead">Klikalny prototyp aplikacji. Dokumenty, usługi, płatności i pisma działają na przykładowych danych czterech osób. Wybierz osobę i załatw jej sprawy.</p>
        </div>

        <div>
          <p className="cap">Osoba w pokazie</p>
          <div className="osoby">
            {OSOBY_IDS.map(id => { const x = OSOBY[id]; return (
              <button key={id} className="os" aria-pressed={id === osoba} onClick={() => wybierz(id)}>
                <img src={portrety[id]} alt="" />
                <div><b>{x.imie}</b><span>{x.opis.split(',').slice(0, 2).join(',')}</span></div>
              </button>
            ); })}
          </div>
        </div>

        <div>
          <p className="cap">Co sprawdzić u: {o.imie}</p>
          <ol className="kroki">
            {SCENARIUSZE[osoba].map((t, i) => <li key={t}><em>{i + 1}</em><span>{t}</span></li>)}
          </ol>
        </div>

        <div className="wiersz">
          <div className="seg" role="group" aria-label="Motyw telefonu">
            <button aria-pressed={motyw === 'jasny'} onClick={() => zmienMotyw('jasny')}>Jasny</button>
            <button aria-pressed={motyw === 'ciemny'} onClick={() => zmienMotyw('ciemny')}>Ciemny</button>
          </div>
          <span className="pin">W pokazie działa <b>dowolny PIN</b></span>
        </div>

        <div className="karta">
          <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div>
            <b>Otwórz na telefonie</b>
            <p>Zeskanuj kod aparatem. Na telefonie prototyp otworzy się na cały ekran, z tą samą osobą.</p>
          </div>
        </div>

        <p className="stopka">Osoby i dane są fikcyjne. To nie jest aplikacja mObywatel ani usługa administracji publicznej. Godło i logo mObywatela pochodzą z serwisu info.mobywatel.gov.pl.</p>
      </div>
    </div>
  );
}
