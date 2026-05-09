#!/usr/bin/env node
/**
 * Publish "Pulizia Yacht in Montenegro" (IT locale) blog post.
 *
 * Companion to en/me/sr/tr/de scripts. Native Italian tone (Lei formal),
 * standard nautical terminology (gelcoat, antivegetativa/antifouling,
 * teak, sentina, alaggio, svernamento), ASCII slug
 * `pulizia-yacht-montenegro`. Reuses seeded author + category + EN hero
 * asset by _ref.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";

const envPath = "/Users/Shared/dev/glatko-frontend/.env.local";
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity env (project/dataset/write token).");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

let __k = 0;
const keyOf = (prefix = "k") =>
  `${prefix}${(++__k).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function parseInline(text) {
  const spans = [];
  const markDefs = [];
  let pos = 0;
  const tokens = [];
  while (pos < text.length) {
    if (text[pos] === "[") {
      const close = text.indexOf("]", pos);
      const open = close > -1 ? text.indexOf("(", close) : -1;
      const end = open > -1 ? text.indexOf(")", open) : -1;
      if (close > -1 && open === close + 1 && end > -1) {
        tokens.push({ type: "link", text: text.slice(pos + 1, close), href: text.slice(open + 1, end) });
        pos = end + 1;
        continue;
      }
    }
    if (text[pos] === "*" && text[pos + 1] === "*") {
      const end = text.indexOf("**", pos + 2);
      if (end > -1) {
        tokens.push({ type: "bold", text: text.slice(pos + 2, end) });
        pos = end + 2;
        continue;
      }
    }
    let plain = "";
    while (pos < text.length) {
      if (text[pos] === "[") {
        const close = text.indexOf("]", pos);
        const open = close > -1 ? text.indexOf("(", close) : -1;
        const end = open > -1 ? text.indexOf(")", open) : -1;
        if (close > -1 && open === close + 1 && end > -1) break;
      }
      if (text[pos] === "*" && text[pos + 1] === "*") {
        const end = text.indexOf("**", pos + 2);
        if (end > -1) break;
      }
      plain += text[pos];
      pos += 1;
    }
    if (plain) tokens.push({ type: "plain", text: plain });
  }
  for (const tok of tokens) {
    if (tok.type === "plain") {
      spans.push({ _type: "span", _key: keyOf("s"), text: tok.text, marks: [] });
    } else if (tok.type === "bold") {
      spans.push({ _type: "span", _key: keyOf("s"), text: tok.text, marks: ["strong"] });
    } else if (tok.type === "link") {
      const linkKey = keyOf("ml");
      markDefs.push({ _type: "link", _key: linkKey, href: tok.href });
      spans.push({ _type: "span", _key: keyOf("s"), text: tok.text, marks: [linkKey] });
    }
  }
  return { spans, markDefs };
}

function makeBlock(style, text, extras = {}) {
  const { spans, markDefs } = parseInline(text);
  return {
    _type: "block",
    _key: keyOf("b"),
    style,
    markDefs,
    children: spans.length ? spans : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
    ...extras,
  };
}

function makeListItem(text, listItem = "bullet") {
  const { spans, markDefs } = parseInline(text);
  return {
    _type: "block",
    _key: keyOf("b"),
    style: "normal",
    listItem,
    level: 1,
    markDefs,
    children: spans.length ? spans : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
  };
}

function buildContent() {
  const blocks = [];
  const push = (b) => blocks.push(b);

  push(makeBlock("normal", "Negli ultimi anni il Montenegro è diventato silenziosamente uno degli ormeggi più interessanti dell'Adriatico. Nel 2025 sono entrate nelle acque montenegrine oltre 4.800 imbarcazioni — una cifra in crescita costante dal 2023. Mentre Porto Montenegro consolida la sua posizione di hub per superyacht e Marina Dukley realizza un'espansione del 60% dei posti barca, cresce anche la pressione sui proprietari per mantenere le proprie imbarcazioni in forma tutto l'anno."));
  push(makeBlock("normal", "Ma le Bocche di Cattaro non perdonano la trascuratezza. Intensa radiazione UV estiva, aerosol salino concentrato dell'Adriatico aperto e la Bora invernale — venti freddi e violenti che scendono dalle Alpi Dinariche — creano un ambiente di manutenzione che attacca senza pietà ogni superficie esposta. Questa guida le mostra tutto ciò che serve sapere sulla pulizia yacht professionale e sul detailing in Montenegro: prezzi, servizi, normative e come trovare professionisti affidabili senza il classico tira e molla da marina straniera."));

  push(makeBlock("h2", "Perché l'Ambiente Marino delle Bocche di Cattaro Richiede una Pulizia Rigorosa"));
  push(makeBlock("normal", "Il microclima della Boka combina due forze corrosive che raramente convivono con questa intensità: aerosol salini concentrati dall'Adriatico aperto e fine pulviscolo calcareo che scende dalle Alpi Dinariche. Insieme formano una pellicola aggressiva su qualunque superficie esposta entro 24–48 ore. Le ringhiere in acciaio inox iniziano a pittinare. Il gelcoat ossida prematuramente. Il teak trattiene particelle che, se non rimosse settimanalmente, deteriorano la fibra del legno a velocità accelerata."));
  push(makeBlock("normal", "La regola montenegrina che impone alle imbarcazioni almeno 72 ore in acque territoriali per accedere al carburante esente da imposte crea, nella pratica, la finestra perfetta per un detailing accurato. Gli skipper che usano questa sosta forzata per un lavaggio esterno completo e un reset interno arrivano allo scalo successivo in condizioni decisamente migliori di chi non lo fa."));

  push(makeBlock("h2", "Tipi di Servizi di Pulizia e Detailing Yacht in Montenegro"));
  push(makeBlock("normal", "La pulizia di una barca in Montenegro va da un lavaggio esterno di novanta minuti a un progetto di restauro multi-fase di più giorni. Ecco cosa coprono la pulizia yacht professionale e il detailing — e cosa fa concretamente ogni servizio."));

  push(makeBlock("h3", "Lavaggio Esterno (Scafo, Linea di Galleggiamento, Ponte)"));
  push(makeBlock("normal", "Il fondamento di ogni piano di manutenzione. Con detergenti a pH bilanciato e sicuri per l'ambiente marino, i tecnici rimuovono depositi di sale, sporco organico e schiuma della linea di galleggiamento senza intaccare cere o sigillanti polimerici esistenti. Il risciacquo ad alta pressione viene controllato con cura attorno ai punti del ponte e alle guarnizioni dei vetri. Frequenza: settimanale durante la stagione."));

  push(makeBlock("h3", "Pulizia degli Interni e Deumidificazione"));
  push(makeBlock("normal", "Gli interni di uno yacht trattengono umidità in modi che nessuno spazio domestico conosce. La pulizia professionale degli interni prevede estrazione a vapore a bassa umidità per moquette e pelle, trattamento all'ozono o enzimatico contro odori provenienti dalla sentina e disinfezione di livello sanitario per servizi e cucina. Nella Boka, dove l'umidità invernale è alta, una deumidificazione attiva tra le stagioni è fondamentale per prevenire la formazione di muffa nei tessuti e nei mobili."));

  push(makeBlock("h3", "Pulizia e Recupero del Ponte in Teak"));
  push(makeBlock("normal", "Il teak è la superficie più impegnativa di qualunque yacht. UV e acqua di mare causano ossidazione: il legno diventa grigio argenteo e nelle fughe compaiono alghe nere. La pulizia professionale del teak utilizza un processo chimico a due componenti: un detergente acido diluito apre la fibra e solleva i contaminanti, seguito immediatamente da una base neutralizzante che ripristina la calda tonalità dorata. Le spazzole metalliche, usate spesso da operatori non specializzati, distruggono la fibra morbida e accorciano in modo permanente la vita del ponte. Verifichi sempre che il fornitore impieghi la corretta chimica a due componenti. Frequenza: mensile."));

  push(makeBlock("h3", "Lucidatura e Ceratura del Gelcoat"));
  push(makeBlock("normal", "Se lo scafo appare opaco e gessoso, il problema è l'ossidazione UV delle catene polimeriche del gelcoat. È il servizio esterno più impegnativo. I tecnici lavorano con paste abrasive graduate e lucidatrici rotative a velocità variabile per livellare meccanicamente la superficie, e poi la sigillano con cera carnauba, sigillanti polimerici o — per protezione a lungo termine — con un trattamento ceramico professionale (SiO₂). Nelle estati montenegrine un trattamento ceramico si ripaga già nella prima stagione, riducendo drasticamente la frequenza di lucidatura. Frequenza: annuale (varo primaverile)."));

  push(makeBlock("h3", "Pulizia della Carena e Antifouling (Specifiche del Montenegro)"));
  push(makeBlock("normal", "L'antifouling è un servizio che si esegue a barca alata — durante l'alaggio in cantieri come Adriatic 42 a Bijela o nel rimessaggio invernale. Il lavaggio ad alta pressione rimuove cirripedi e alghe dallo scafo immerso; la superficie nuda viene poi carteggiata, primerizzata e ricoperta con vernice antivegetativa ablativa o dura biocida. Un antifouling trascurato fa proliferare organismi marini che aumentano i consumi di carburante fino al 30% e, se la barriera viene perforata, possono comparire bolle osmotiche — una delaminazione della vetroresina la cui riparazione costa decine di migliaia di euro. Le normative ambientali montenegrine vietano lo scarico dei residui di antifouling nei bacini delle marine. Frequenza: annuale (alaggio)."));

  push(makeBlock("h3", "Pulizia della Sala Macchine e Sgrassaggio"));
  push(makeBlock("normal", "Una sala macchine pulita non è una questione di estetica — è una questione di diagnosi precoce. Olio in sentina e sporco accumulato mascherano le prime tracce di trafilamenti e corrosione. La pulizia professionale del vano motore impiega sgrassanti compatibili con l'ambiente, applicati con precisione attorno a cablaggi elettrici, filtri dell'acqua di mare e sensori. È un lavoro da specialisti; eviti i generalisti che possono danneggiare cablaggi sensibili. Frequenza: stagionale."));

  push(makeBlock("h3", "Pulizia di Fine Charter e Cambio Equipaggio"));
  push(makeBlock("normal", "La flotta charter commerciale in Montenegro lavora con tempi di consegna stretti — spesso meno di sei ore tra un equipaggio e l'altro. La pulizia di fine charter copre un reset completo degli interni: cambio biancheria, sanificazione di servizi e cucina, rifornimento dei consumabili, smaltimento rifiuti e un lavaggio esterno completo. È esattamente il segmento che Glatko intercetta in modo diretto: gli operatori charter hanno bisogno di fornitori rapidi e affidabili, e il mercato locale non offre attualmente alcun meccanismo trasparente per prenotare questi lavori."));

  push(makeBlock("h2", "Pulizia Yacht in Montenegro: Cosa Aspettarsi nel 2026"));
  push(makeBlock("normal", "Le aziende premium della nautica montenegrina lavorano quasi esclusivamente con un modello di preventivo personalizzato — i prezzi non sono pubblicati e per ogni intervento serve una telefonata o un'email per ottenere una cifra. Questa opacità è il punto di attrito dominante del mercato locale."));
  push(makeBlock("normal", "Sulla base dei benchmark regionali adriatici e del costo del lavoro locale, queste sono stime realistiche per la stagione 2025/2026:"));

  push(makeListItem("**Lavaggio esterno base:** €10 – €20 al metro lineare (LFT)"));
  push(makeListItem("**Detailing interno profondo:** €15 – €30 al metro lineare (LFT)"));
  push(makeListItem("**Pulizia e recupero del teak:** €25 – €45 al m² di ponte"));
  push(makeListItem("**Lucidatura e ceratura del gelcoat:** €80 – €150 al metro lineare (LFT)"));
  push(makeListItem("**Trattamento ceramico (premium):** €200 – €400+ al metro lineare (LFT)"));
  push(makeListItem("**Sgrassaggio sala macchine:** €250 – €600 (forfettario)"));
  push(makeListItem("**Antifouling (carena):** €100 – €140 al metro lineare (LFT)"));
  push(makeListItem("**Pulizia di fine charter:** €150 – €400 (forfettario, in base al numero di cabine)"));

  push(makeBlock("normal", "**Esempio pratico:** Un veliero di 12 metri che richiede lavaggio esterno completo, detailing interno e trattamento del teak costa tipicamente €600 – €1.200, a seconda dello stato dell'imbarcazione e del fornitore. Un motoryacht di 40 metri che ha bisogno di lucidatura del gelcoat su tutta la sovrastruttura supera tranquillamente i €5.000."));

  push(makeBlock("h2", "Le Marine Principali del Montenegro: Dove Si Esegue la Pulizia Yacht"));
  push(makeBlock("normal", "Capire la geografia delle marine è essenziale per pianificare la manutenzione."));
  push(makeBlock("normal", "**Porto Montenegro (Tivat)** è il principale hub per superyacht — oltre 450 posti barca, TYHA Five Gold Anchor Platinum, dogana e carburante duty-free sul posto, e un fitto ecosistema di fornitori. È qui che si concentrano le aziende di detailing di alto livello. Lunghezza fuori tutto massima: 250 metri."));
  push(makeBlock("normal", "**Marina Dukley (Budva)** è in piena espansione: 60% in più di posti barca e nuovo frangiflutti. Attualmente serve circa 300 imbarcazioni e funziona da hub primario per yacht charter di taglia media sulla riviera di Budva. Lunghezza fuori tutto massima: 70 metri."));
  push(makeBlock("normal", "**D-Marin Portonovi (Herceg Novi)** è una marina luxury di nicchia con 238 posti barca e accreditamento Five Gold Anchor, integrata con il complesso One&Only. Ideale per chi cerca un'atmosfera resort a bassa densità."));
  push(makeBlock("normal", "**Marina Bar** offre la maggiore capacità assoluta del Paese (~900 posti barca in acqua + 300 a secco) ed è il punto di riferimento per il rimessaggio invernale e il rifornimento esente da imposte. Meno glamour, ma estremamente pratica per svernamento e antifouling."));
  push(makeBlock("normal", "**Marina Kotor** è limitata nella capacità per i vincoli UNESCO e accoglie soprattutto barche in transito. I posti barca scarseggiano per tutta la stagione."));

  push(makeBlock("h2", "Stagionalità: Quando Pianificare la Pulizia Yacht"));
  push(makeBlock("normal", "La stagione di punta va da inizio giugno a fine settembre, con un vero collo di bottiglia tra luglio e agosto. La domanda di pulizia in questi mesi supera la capacità locale: i fornitori non prenotati in anticipo difficilmente accettano richieste a piedi."));
  push(makeBlock("normal", "**Pianificazione strategica:**"));
  push(makeListItem("**Aprile – Maggio (allestimento):** Finestra ideale per lucidatura gelcoat, trattamento ceramico, restauro completo del teak e antifouling, prima che la barca scenda in acqua."));
  push(makeListItem("**Giugno – Settembre (in stagione):** Lavaggi esterni settimanali, detailing interni e manutenzione del teak mensili, pulizie di fine charter rapide."));
  push(makeListItem("**Ottobre – Novembre (svernamento):** Protocollo di rimessaggio — svuotamento completo dell'impianto idrico, antigelo marino, nebulizzazione olio nei cilindri (fogging), rimozione di teli e bimini, sistemazione di deumidificatori. Ultima finestra utile per l'ispezione della carena."));

  push(makeBlock("h2", "Normative Ambientali: Pulizia Yacht nelle Acque Montenegrine"));
  push(makeBlock("normal", "Il Montenegro punta in modo deciso sul turismo nautico sostenibile. Porto Montenegro detiene la certificazione TYHA Clean Marina; tutta la costa opera sotto la legge nazionale, allineata all'Allegato V MARPOL."));
  push(makeBlock("normal", "**Regole chiave per armatori e fornitori:**"));
  push(makeListItem("Lo scarico diretto di acque nere (reflue), acque grigie (lavandini/docce) e reflui chimici nei bacini delle marine è vietato. Tutto deve passare dalle stazioni pump-out della marina."));
  push(makeListItem("Il lavaggio della coperta in ormeggio è consentito solo con detergenti marini biodegradabili e privi di fosfati. Candeggine aggressive e detergenti fosfatici sono vietati: danneggiano le praterie di Posidonia oceanica, fondamentali per l'ecosistema adriatico."));
  push(makeListItem("I residui abrasivi di antifouling devono essere contenuti durante l'alaggio. I cantieri seri lo impongono in automatico."));
  push(makeBlock("normal", "Quando valuta un fornitore di pulizia yacht in Montenegro, chieda direttamente: usate prodotti conformi a MARPOL? Chi non sa rispondere con chiarezza non lavora allo standard richiesto dalle marine."));

  push(makeBlock("h2", "Come Trovare un Servizio di Pulizia Yacht Affidabile in Montenegro: Checklist Pratica"));
  push(makeBlock("normal", "Il metodo tradizionale — bacheche della marina, chiamate via VHF ad altri skipper, raccomandazioni non verificate — produce risultati incoerenti in una marina sconosciuta. Il mercato locale è molto frammentato: aziende tecniche di alto livello come 7seas7works da una parte; servizi di pulizia generalisti senza chimica e attrezzatura marine specifiche dall'altra, che però provano a intercettare la clientela degli yacht."));
  push(makeBlock("normal", "**Prima di affidarsi a un fornitore, verifichi:**"));
  push(makeListItem("Usano detergenti marini specifici a pH bilanciato (non chimica per la casa)?"));
  push(makeListItem("Sul teak: usano un sistema acido/base a due componenti, non spazzole metalliche?"));
  push(makeListItem("Sul gelcoat: possono mostrare lucidatrici e gradazione delle paste?"));
  push(makeListItem("I prodotti sono conformi MARPOL per l'uso nei bacini delle marine?"));
  push(makeListItem("Hanno una polizza assicurativa per appaltatori marittimi?"));
  push(makeListItem("Possono fornire referenze da altre imbarcazioni nella stessa marina?"));
  push(makeListItem("Il prezzo è espresso al metro lineare (standard) o come forfait poco chiaro?"));
  push(makeBlock("normal", "L'assenza di trasparenza sui prezzi è il punto di attrito dominante di questo mercato. La maggior parte dei fornitori consolidati non rilascia un numero senza un'ispezione di persona — il che richiede la sua presenza. Per chi gestisce la barca a distanza o sta pianificando l'itinerario, questo modello è di fatto ingestibile."));

  push(makeBlock("h2", "Prenoti la Pulizia Yacht in Montenegro Senza il Solito Tira e Molla"));
  push(makeBlock("normal", "Glatko.app è il primo marketplace inverso del Montenegro per servizi domestici e marittimi. Invece di rincorrere preventivi tra più fornitori, lei pubblica il lavoro — dimensioni della barca, marina, servizi richiesti, date preferite — e i professionisti locali verificati le inviano offerte competitive in modo diretto."));
  push(makeBlock("normal", "Per un armatore nelle Bocche di Cattaro questo significa:"));
  push(makeListItem("Prezzi competitivi e trasparenti, visibili prima di impegnarsi."));
  push(makeListItem("Fornitori locali verificati con valutazioni e storico interventi."));
  push(makeListItem("Funziona per pulizie occasionali, contratti stagionali ricorrenti e pacchetti per cambio equipaggio charter."));
  push(makeListItem("Pubblichi da qualunque luogo — non serve essere a bordo per avviare il processo."));
  push(makeBlock("normal", "**[Pubblica il tuo lavoro di pulizia su Glatko.app →](https://glatko.app)**"));

  push(makeBlock("h2", "Domande Frequenti"));

  push(makeBlock("h3", "Con che frequenza va pulito professionalmente uno yacht nelle Bocche di Cattaro?"));
  push(makeBlock("normal", "Il lavaggio esterno settimanale è lo standard nei mesi giugno–settembre, per via dell'alta concentrazione di aerosol salino. Detailing interno e manutenzione del teak vanno programmati su base mensile. Lucidatura del gelcoat e trattamenti protettivi sono servizi annuali, idealmente svolti durante l'allestimento primaverile."));

  push(makeBlock("h3", "Quanto costa la pulizia yacht al metro in Montenegro?"));
  push(makeBlock("normal", "Un lavaggio esterno base costa €10–€20 al metro lineare. La lucidatura multifase del gelcoat con ceratura sta tra €80 e €150 al metro. Un trattamento ceramico premium può superare €200–€400 al metro. Le pulizie di fine charter sono di norma a forfait, tra €150 e €400."));

  push(makeBlock("h3", "Qual è la differenza tra pulizia yacht e detailing yacht?"));
  push(makeBlock("normal", "La pulizia copre la manutenzione di routine — lavaggio esterno, panno interno, sanificazione di base. Il detailing è un processo più profondo: lucidatura multifase del gelcoat, restauro acido-base del teak, applicazione di trattamenti ceramici e cura specialistica di tessuti e pelle. Il detailing ripristina; la pulizia mantiene."));

  push(makeBlock("h3", "Posso usare detergenti domestici sul mio yacht?"));
  push(makeBlock("normal", "No. I detergenti standard rimuovono cera e sigillanti polimerici dal gelcoat, accelerando il danno UV. La candeggina degrada cuciture e impermeabilizzazione delle teli. I prodotti con fosfati sono vietati nelle marine montenegrine. Usi solo prodotti marini specifici, a pH bilanciato e biodegradabili."));

  push(makeBlock("h3", "Cos'è la regola delle 72 ore e che relazione ha con la pulizia?"));
  push(makeBlock("normal", "Per accedere al carburante esente da imposte, le imbarcazioni devono restare almeno 72 ore in acque territoriali montenegrine. Gli skipper utilizzano spesso questa sosta obbligatoria come finestra ideale per programmare un detailing esterno e interno completo prima della partenza per la tappa successiva."));

  push(makeBlock("h3", "Come preparo lo yacht allo svernamento in Montenegro contro la Bora?"));
  push(makeBlock("normal", "Svuoti completamente l'impianto di acqua dolce e lo riempia con antigelo marino fino ad almeno -45 °C. Esegua il fogging dei cilindri del motore con olio protettivo. Rimuova teli, bimini e tutti gli accessori amovibili per ridurre la superficie esposta al vento. Posizioni assorbi-umidità o un deumidificatore attivo sotto coperta. Durante i mesi invernali organizzi un controllo a bordo ogni 2–4 settimane."));

  push(makeBlock("h3", "Quali sono le norme ambientali per il lavaggio delle barche nelle marine montenegrine?"));
  push(makeBlock("normal", "Lo scarico diretto di acque nere, grigie e reflui chimici nei bacini delle marine è illegale. Il lavaggio della coperta deve essere eseguito con detergenti marini biodegradabili per proteggere le praterie di Posidonia oceanica. Porto Montenegro detiene la certificazione TYHA Clean Marina e questi standard sono applicati direttamente in ormeggio."));

  push(makeBlock("h3", "Esiste un marketplace inverso per la pulizia yacht in Montenegro?"));
  push(makeBlock("normal", "Sì — Glatko.app permette agli armatori di pubblicare le proprie esigenze di manutenzione e ricevere offerte competitive da professionisti marittimi locali verificati, eliminando l'opacità del classico modello \"prezzo su richiesta\"."));

  return blocks;
}

const AUTHOR_ID = "author-glatko-editorial";
const CATEGORY_ID = "category-marine-services";
const HERO_ASSET_ID =
  "image-f1434c75e522c37df8cd907007a7047f4044d951-1600x656-png";

async function main() {
  console.log(`Project: ${projectId} | Dataset: ${dataset}`);
  const content = buildContent();
  console.log(`Content blocks: ${content.length}`);

  const docId = "yacht-cleaning-montenegro-it";
  const articleTitle =
    "Pulizia Yacht in Montenegro: La Guida Completa 2026 per la Baia di Cattaro";
  const seoTitle =
    "Pulizia Yacht Montenegro: Prezzi, Servizi ed Esperti Locali (2026)";
  const seoDescription =
    "Pulizia professionale yacht in Montenegro — prezzi, marine (Tivat, Kotor, Porto Montenegro), servizi e come prenotare professionisti su Glatko.";
  const excerpt =
    "Pulizia professionale yacht in Montenegro — prezzi, marine (Tivat, Kotor, Porto Montenegro), normative e come prenotare professionisti verificati su Glatko.";

  const doc = {
    _id: docId,
    _type: "post",
    title: { _type: "localeString", it: articleTitle },
    slug: {
      _type: "localeSlug",
      it: { _type: "slug", current: "pulizia-yacht-montenegro" },
    },
    excerpt: { _type: "localeText", it: excerpt },
    content: { _type: "localeRichText", it: content },
    coverImage: {
      _type: "image",
      asset: { _type: "reference", _ref: HERO_ASSET_ID },
      alt: "Yacht ormeggiato in una marina del Montenegro, Bocche di Cattaro",
    },
    author: { _type: "reference", _ref: AUTHOR_ID },
    category: { _type: "reference", _ref: CATEGORY_ID },
    serviceCategoryRefs: ["boat-services"],
    publishedAt: new Date("2026-05-10T08:00:00.000Z").toISOString(),
    featured: false,
    seo: {
      _type: "seoMeta",
      metaTitle: { _type: "localeString", it: seoTitle },
      metaDescription: { _type: "localeText", it: seoDescription },
    },
  };

  console.log("\nCreating/updating IT post...");
  const result = await client.createOrReplace(doc);
  console.log(`Done: ${result._id}`);
  console.log(`Title IT: ${result.title?.it}`);
  console.log(`Slug IT: ${result.slug?.it?.current}`);
  console.log(`Cover image: ${result.coverImage ? "set" : "missing"}`);
  console.log(`\nPublic URL: https://glatko.app/it/blog/pulizia-yacht-montenegro`);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
