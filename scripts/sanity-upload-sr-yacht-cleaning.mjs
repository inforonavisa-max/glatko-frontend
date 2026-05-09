#!/usr/bin/env node
/**
 * Publish "Čišćenje jahti u Crnoj Gori" (SR locale, Ekavski) blog post.
 *
 * Companion to the EN/ME scripts:
 * - separate _id (yacht-cleaning-montenegro-sr) so SR is independent of ME
 *   even though both share the slug `ciscenje-jahti-crna-gora` (different
 *   locale fields, no collision)
 * - reuses seeded author + category + EN hero asset (no extra writes)
 * - SR content is the ME article retoned to SR Ekavski (cijena→cena,
 *   sedmično→nedeljno, prije→pre, mjesečno→mesečno, vjetar→vetar, etc.)
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";

// ─────────────────────────── env loading ─────────────────────────── //
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

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ─────────────────── _key generator (Sanity-compat) ─────────────────── //
let __k = 0;
const keyOf = (prefix = "k") =>
  `${prefix}${(++__k).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ─────────────────── inline markdown → spans + markDefs ─────────────────── //
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
        tokens.push({
          type: "link",
          text: text.slice(pos + 1, close),
          href: text.slice(open + 1, end),
        });
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
      spans.push({
        _type: "span",
        _key: keyOf("s"),
        text: tok.text,
        marks: ["strong"],
      });
    } else if (tok.type === "link") {
      const linkKey = keyOf("ml");
      markDefs.push({ _type: "link", _key: linkKey, href: tok.href });
      spans.push({
        _type: "span",
        _key: keyOf("s"),
        text: tok.text,
        marks: [linkKey],
      });
    }
  }
  return { spans, markDefs };
}

// ─────────────────── helpers ─────────────────── //
function makeBlock(style, text, extras = {}) {
  const { spans, markDefs } = parseInline(text);
  return {
    _type: "block",
    _key: keyOf("b"),
    style,
    markDefs,
    children: spans.length
      ? spans
      : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
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
    children: spans.length
      ? spans
      : [{ _type: "span", _key: keyOf("s"), text: "", marks: [] }],
  };
}

// ─────────────────── content builder (SR locale, Ekavski) ─────────────────── //
function buildContent() {
  const blocks = [];
  const push = (b) => blocks.push(b);

  // Intro
  push(
    makeBlock(
      "normal",
      "Crna Gora je postala jedna od najpoželjnijih nautičkih destinacija na Jadranu. U 2025. godini zabeleženo je više od 4.800 dolazaka plovila u crnogorske teritorijalne vode — broj koji neprestano raste od 2023. Porto Montenegro učvršćuje svoju poziciju mega-jahte čvorišta, dok Dukley marina u Budvi prolazi kroz proširenje kapaciteta za 60%.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Ali Boka Kotorska nije blagonaklona prema nemaru. Intenzivno letnje UV zračenje, visoko slani aerosoli s otvorenog Jadrana i zimska Bura — hladni i siloviti vetar s Dinarskih Alpa — stvaraju okruženje koje nemilosrdno razara svaku nezaštićenu površinu. Bez redovnog i stručnog čišćenja, šteta se gomila brzo i skupo.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Ovaj vodič pokriva sve što treba da znate o profesionalnom čišćenju i detailingu jahti u Crnoj Gori — od cena i vrsta usluga, do toga kako pronaći pouzdanog majstora u stranoj marini bez uobičajene frustracije.",
    ),
  );

  // Section: Zašto je morsko okruženje Boke Kotorske posebno zahtevno
  push(makeBlock("h2", "Zašto je morsko okruženje Boke Kotorske posebno zahtevno"));
  push(
    makeBlock(
      "normal",
      "Kombinacija slanog aerosola i fine krečnjačke prašine s Dinarida stvara korozivni film na svakoj izloženoj površini za 24 do 48 sati. Rđa napada nerđajući čelik. Gelkot oksidira pre vremena. Tik upija čestice koje, ako se ne uklanjaju nedeljno, ubrzano razaraju drvo.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Dodatno, crnogorski propis o bescarinskom gorivu obavezuje plovila da ostanu u teritorijalnim vodama najmanje 72 sata kako bi ostvarila pravo na povlašćenu cenu goriva. Kapetani koji taj period iskoriste za detailing i unutrašnje čišćenje stižu u sledeću luku u znatno boljem stanju od onih koji to ne urade.",
    ),
  );

  // Section: Vrste usluga
  push(makeBlock("h2", "Vrste usluga čišćenja i detailinga jahti u Crnoj Gori"));
  push(
    makeBlock(
      "normal",
      "Pranje broda u Crnoj Gori obuhvata širok raspon usluga — od osnovnog ispiranja do višednevnog, višefaznog restauratorskog projekta. Evo šta profesionalno čišćenje i detailing jahti uključuje i šta svaka usluga zapravo radi.",
    ),
  );

  push(makeBlock("h3", "Spoljašnje pranje (trup, vodena linija, paluba)"));
  push(
    makeBlock(
      "normal",
      "Temelj svakog plana održavanja. Stručnjaci koriste pH-balansirane, marine-sigurne deterdžente koji uklanjaju so, ptičje izmete i zagađivače s trupa, vodene linije i palube, bez uklanjanja postojećeg voska ili polimernih prevlaka. Pranje pod visokim pritiskom se pažljivo kontroliše oko priključaka i zaptivki prozora. Učestalost: nedeljno tokom sezone.",
    ),
  );

  push(makeBlock("h3", "Unutrašnji detailing i odvlaživanje"));
  push(
    makeBlock(
      "normal",
      "Unutrašnjost jahte zadržava vlagu na načine koje nijedno stambeno okruženje ne doživljava. Profesionalni unutrašnji detailing podrazumeva parno čišćenje tepiha i kože sa niskom vlažnošću, ozonski ili enzimski tretman mirisa poreklom iz kobilice, te bolničku dezinfekciju toaleta i kuhinje. U Boki, gde je zimska vlažnost visoka, aktivno odvlaživanje između sezona ključno je za sprečavanje buđi u tapacirungu i nameštaju.",
    ),
  );

  push(makeBlock("h3", "Čišćenje i obnova tik palube"));
  push(
    makeBlock(
      "normal",
      "Tik je najzahtevnija površina na svakoj jahti. UV zračenje i morska voda uzrokuju oksidaciju, drvo poprima srebrno-sivu boju i pojavljuje se crna algalna masa u spojevima. Profesionalno čišćenje tika koristi dvostepeni hemijski postupak: razređeno kiselo sredstvo otvara poru drveta i odstranjuje zagađivače, zatim odmah sledi neutralizujuća baza koja vraća toplu, zlatnu nijansu. Žičane četke, koje često koriste neobučeni radnici, uništavaju meku strukturu drveta i trajno skraćuju vek palube. Uvek proverite da li vaš izvođač koristi ispravnu dvostepenu hemiju. Učestalost: mesečno.",
    ),
  );

  push(makeBlock("h3", "Poliranje i voskiranje gelkota"));
  push(
    makeBlock(
      "normal",
      "Ako je trup postao mutan i mat, radi se o UV oksidaciji polimernih lanaca gelkota. Ovo je najzahtevnija spoljašnja usluga. Tehničari rade sa graduiranim abrazivnim smesama i polirnim mašinama promenljive brzine kako bi mehanički izravnali površinu, a zatim je zapečatili karnauba voskom, polimernim sredstvima ili — za dugotrajnu zaštitu — profesionalnim keramičkim (SiO₂) premazima. U crnogorskim letima, keramički premaz se amortizuje već u prvoj sezoni drastičnim smanjenjem učestalosti poliranja. Učestalost: godišnje (prolećno opremanje).",
    ),
  );

  push(makeBlock("h3", "Čišćenje trupa i antifouling (specifičnosti za Crnu Goru)"));
  push(
    makeBlock(
      "normal",
      "Antifouling se izvodi pri suvo-dokovanju — u postrojenjima kao što su Adriatic 42 u Bijeloj ili tokom zimskog skladištenja. Pranje pod pritiskom uklanja školjke i alge sa potopljenog trupa; potom se površina brusi, premazuje temeljem i završnim antifouling bojama. Zanemareni antifouling povećava potrošnju goriva i do 30%, a ako se probije zaštitni sloj, morski organizmi uzrokuju osmotske mehure — delaminaciju staklolaminata čija sanacija košta desetine hiljada evra. Crnogorski ekološki propisi zabranjuju ispuštanje ostataka antifoulinga u marini. Učestalost: godišnje.",
    ),
  );

  push(makeBlock("h3", "Čišćenje prostora motora"));
  push(
    makeBlock(
      "normal",
      "Čist prostor motora nije stvar estetike — radi se o ranom otkrivanju kvarova. Ulje i nakupljene nečistoće u kobilici prikrivaju prve znake curenja tečnosti i korozije. Profesionalno čišćenje motora koristi ekološki prihvatljive odmašćivače koji se nanose s preciznošću oko električnih kablova, senzora i filtera hladne vode. Ovo je specijalistički posao — izbegavajte generaliste koji mogu oštetiti osetljive instalacije. Učestalost: sezonski.",
    ),
  );

  push(makeBlock("h3", "Post-charter čišćenje i primopredaja"));
  push(
    makeBlock(
      "normal",
      "Komercijalna charter flota u Crnoj Gori radi sa tesnim rokovima primopredaje, često ispod šest sati između gostiju. Čišćenje primopredaje pokriva potpuni reset unutrašnjosti: pranje posteljine i peškira, dezinfekcija toaleta i kuhinje, dopunjavanje potrošnog materijala, odvoz smeća i kompletno spoljašnje pranje. Ovo je segment koji Glatko.app adresira direktno — charter operateri trebaju brze, pouzdane izvođače, a trenutno tržište nema transparentan mehanizam za rezervaciju ovih poslova.",
    ),
  );

  // Section: Cene
  push(makeBlock("h2", "Koliko košta čišćenje jahte u Crnoj Gori — cene za 2026."));
  push(
    makeBlock(
      "normal",
      "Crnogorske premium nautičke firme gotovo isključivo rade po modelu individualnih ponuda — cene nisu objavljene, a svaki posao zahteva telefonski poziv ili e-mail da bi se dobio broj. Ova neprozirnost je dominantna tačka trenja na lokalnom tržištu.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Na osnovu jadranske regionalne referentne vrednosti i lokalnih troškovnih uslova, evo realnih procena za sezonu 2025/2026:",
    ),
  );

  push(makeListItem("**Osnovno spoljašnje pranje:** €10 – €20 po dužnom metru (LOA)"));
  push(makeListItem("**Dubinski unutrašnji detailing:** €15 – €30 po dužnom metru (LOA)"));
  push(makeListItem("**Čišćenje i obnova tika:** €25 – €45 po m² palube"));
  push(makeListItem("**Poliranje i voskiranje gelkota:** €80 – €150 po dužnom metru (LOA)"));
  push(makeListItem("**Napredni keramički premaz:** €200 – €400+ po dužnom metru (LOA)"));
  push(makeListItem("**Odmašćivanje prostora motora:** €250 – €600 (fiksna cena)"));
  push(makeListItem("**Antifouling (podvodni trup):** €100 – €140 po dužnom metru (LOA)"));
  push(makeListItem("**Post-charter čišćenje:** €150 – €400 (fiksna cena, prema broju kabina)"));

  push(
    makeBlock(
      "normal",
      "**Praktičan primer:** Jedrilica od 12 metara kojoj je potrebno potpuno spoljašnje pranje, unutrašnji detailing i tretman tika koštaće tipično €600 – €1.200, zavisno od stanja plovila i izvođača. Motorna jahta od 40 metara kojoj treba poliranje gelkota po celoj dužini može lako preći €5.000.",
    ),
  );

  // Section: Marine
  push(makeBlock("h2", "Ključne marine Crne Gore: gde se obavlja čišćenje jahti"));
  push(
    makeBlock(
      "normal",
      "**Porto Montenegro (Tivat)** je vodeće čvorište za mega-jahte — 450+ vezova, TYHA Five Gold Anchor Platinum, carina i bescarinsko gorivo na licu mesta, te gust ekosistem izvođača. Ovde se nalaze vrhunske firme za detailing jahti. Maksimalna LOA: 250 metara.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Dukley marina (Budva)** prolazi kroz proširenje kapaciteta za 60% i izgradnju vetrobrana. Trenutno prima oko 300 plovila i funkcioniše kao primarno čvorište za charter jahte srednje veličine na Budvanskoj rivijeri. Maksimalna LOA: 70 metara.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**D-Marin Portonovi (Herceg Novi)** je ekskluzivna luksuzna marina sa 238 vezova i Five Gold Anchor akreditacijom, duboko integrisana u One&Only resort kompleks.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Marina Bar** nudi najveći apsolutni kapacitet veza (~900 vezova + 300 suvih) i funkcioniše kao konkurentno zimsko skladište i bescarinska tačka za gorivo.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**Marina Kotor** je kapacitetno ograničena zahtevima UNESCO baštine i uglavnom prima tranzitne jahte.",
    ),
  );

  // Section: Sezonalnost
  push(makeBlock("h2", "Sezonalnost: kada zakazati čišćenje jahte"));
  push(
    makeBlock(
      "normal",
      "Vrhunac sezone traje od početka juna do kraja septembra, sa pravim zastojem kod izvođača u julu i avgustu. Potražnja za uslugama čišćenja tokom ovih meseci prevazilazi lokalne kapacitete — provajderi koji nisu unapred rezervisani često ne mogu primiti prijavljivanja u hodu.",
    ),
  );
  push(makeBlock("normal", "**Strateško planiranje:**"));
  push(
    makeListItem(
      "**April – maj (opremanje):** Najbitniji period za poliranje gelkota, keramički premaz, potpunu restauraciju tika i antifouling pre nego što plovilo uđe u vodu.",
    ),
  );
  push(
    makeListItem(
      "**Jun – septembar (sezona):** Nedeljna spoljašnja pranja, mesečni unutrašnji detailing i održavanje tika, brze charter primopredaje.",
    ),
  );
  push(
    makeListItem(
      "**Oktobar – novembar (zimovanje):** Protokol zimovanja — kompletno pražnjenje sistema slatke vode i primena morskog antifrizera, zamagljivanje cilindara motora, skidanje cerada i tendi, postavljanje odvlaživača u unutrašnjosti. Zadnja prilika za pregled podvodnog trupa.",
    ),
  );

  // Section: Ekološki propisi
  push(makeBlock("h2", "Ekološki propisi: čišćenje jahti u crnogorskim vodama"));
  push(
    makeBlock(
      "normal",
      "Crna Gora aktivno gradi održivi nautički turizam. Porto Montenegro ima TYHA Clean Marina akreditaciju; cela obala posluje po domaćem pravu usaglašenom sa MARPOL Aneksom V.",
    ),
  );
  push(makeBlock("normal", "**Ključna pravila:**"));
  push(
    makeListItem(
      "Direktno ispuštanje crnih voda (kanalizacija), sivih voda (sudopere/tuševi) i hemijskih otpadnih voda u bazen marine strogo je zabranjeno. Obavezna je upotreba marino-specificiranih pump-out stanica.",
    ),
  );
  push(
    makeListItem(
      "Pranje palube uz vez dozvoljeno je isključivo biorazgradivim deterdžentima bez fosfata. Teška sredstva i voda sa belilom su zabranjeni — štete morskim travnjacima Posidonia oceanica koji su ključni za ekosistem Jadrana.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "Kada proveravate izvođača u Crnoj Gori, direktno pitajte koriste li MARPOL-usaglašene preparate. Izvođač koji ne može jasno odgovoriti na ovo pitanje ne posluje prema standardu koji marine zahtevaju.",
    ),
  );

  // Section: Praktična lista
  push(makeBlock("h2", "Kako pronaći pouzdanog čistača jahti u Crnoj Gori: praktična lista"));
  push(
    makeBlock(
      "normal",
      "Tradicionalna metoda — oglasne table u marini, pitanje kapetana putem VHF radija ili oslanjanje na neverifikovane preporuke — daje neujednačene rezultate u nepoznatoj luci. Lokalno tržište je visoko fragmentirano: elitne tehničke firme poput 7seas7works nalaze se na jednom kraju spektra; generalistički serviseri bez specijalizovane marine opreme i hemije pokušavaju da uhvate nautičke klijente na drugom.",
    ),
  );
  push(makeBlock("normal", "**Pre nego što angažujete bilo kog izvođača, proverite:**"));
  push(
    makeListItem(
      "Da li koriste marine-specifične, pH-balansirane deterdžente — ne kućne preparate?",
    ),
  );
  push(
    makeListItem(
      "Za tik: koriste li dvostepeni kiselo/bazni sistem, ne žičane četke?",
    ),
  );
  push(
    makeListItem(
      "Za gelkot: mogu li pokazati polirnu opremu i gradaciju abrazivnih smesa?",
    ),
  );
  push(makeListItem("Da li su njihovi preparati MARPOL-usaglašeni za upotrebu u marini?"));
  push(makeListItem("Da li imaju osiguranje kao nautički izvođači?"));
  push(makeListItem("Mogu li dati reference sa plovila u istoj marini?"));
  push(
    makeListItem(
      "Da li navode cenu po dužnom metru (standard) ili nejasnu paušalnu cenu?",
    ),
  );

  // Section: CTA
  push(makeBlock("h2", "Rezervišite čišćenje jahti u Crnoj Gori bez uobičajenih problema"));
  push(
    makeBlock(
      "normal",
      "Glatko.app je prvi crnogorski reverse marketplace za kućne i nautičke usluge. Umesto da jurite ponude od više izvođača, objavljujete posao — veličinu plovila, lokaciju marine, potrebne usluge, željene datume — i provereni lokalni profesionalci šalju vam konkurentne ponude.",
    ),
  );
  push(makeBlock("normal", "Za vlasnike jahti u Boki Kotorskoj, to znači:"));
  push(makeListItem("Transparentne konkurentne cene, vidljive pre nego što se obavežete."));
  push(makeListItem("Provereni lokalni izvođači sa ocenama i istorijom usluga."));
  push(
    makeListItem(
      "Funkcioniše za jednokratna čišćenja, ugovore o sezonskom održavanju i charter primopredajne pakete.",
    ),
  );
  push(
    makeListItem(
      "Objavljujte sa bilo kog mesta — ne morate biti na brodu da biste pokrenuli proces.",
    ),
  );
  push(
    makeBlock(
      "normal",
      "**[Objavite posao čišćenja jahte na Glatko.app →](https://glatko.app)**",
    ),
  );

  // FAQ
  push(makeBlock("h2", "Često postavljana pitanja"));

  push(makeBlock("h3", "Koliko često treba profesionalno čistiti jahtu u Boki Kotorskoj?"));
  push(
    makeBlock(
      "normal",
      "Nedeljna spoljašnja pranja su standard tokom sezone jun–septembar zbog koncentracije slanog aerosola. Unutrašnji detailing i tik održavanje treba zakazivati mesečno. Poliranje gelkota i zaštitni premazi su godišnje usluge, koje se najbolje izvode tokom prolećnog opremanja.",
    ),
  );

  push(makeBlock("h3", "Koliko košta čišćenje jahte po metru u Crnoj Gori?"));
  push(
    makeBlock(
      "normal",
      "Osnovno spoljašnje pranje košta €10–€20 po dužnom metru. Višefazno poliranje gelkota i voskiranje košta €80–€150 po metru. Napredni keramički premaz može premašiti €200–€400 po metru. Post-charter primopredajna čišćenja se cene kao paušal između €150 i €400.",
    ),
  );

  push(makeBlock("h3", "Koja je razlika između čišćenja i detailinga jahte?"));
  push(
    makeBlock(
      "normal",
      "Čišćenje pokriva rutinsko održavanje — spoljašnje pranje, unutrašnje brisanje, osnovna sanacija. Detailing je dublji proces: višefazno poliranje gelkota, restauracija tika kiselo-baznom metodom, nanošenje keramičkih premaza i specijalizovan tretman tkanina i kože. Detailing restaurira; čišćenje održava.",
    ),
  );

  push(makeBlock("h3", "Smeju li se koristiti kućni preparati za čišćenje jahte?"));
  push(
    makeBlock(
      "normal",
      "Ne. Standardni deterdženti skidaju zaštitne voskove i polimerne premaze sa gelkota, ubrzavajući UV degradaciju. Voda sa belilom razara šavove i impregnaciju cerada. Preparati sa fosfatima su zabranjeni u crnogorskim marinama. Koristite isključivo pH-balansirane, marine-specifične, biorazgradive preparate.",
    ),
  );

  push(makeBlock("h3", "Šta je pravilo od 72 sata i kako se odnosi na čišćenje?"));
  push(
    makeBlock(
      "normal",
      "Da bi ostvarila pravo na bescarinsko gorivo, plovila moraju ostati u crnogorskim teritorijalnim vodama najmanje 72 sata. Kapetani taj prinudni boravak često koriste kao optimalan prozor za zakazivanje sveobuhvatnog spoljašnjeg i unutrašnjeg detailinga pre polaska ka sledećem odredištu.",
    ),
  );

  push(makeBlock("h3", "Kako pripremiti jahtu za zimovanje u Crnoj Gori zbog Bure?"));
  push(
    makeBlock(
      "normal",
      "Potpuno ispraznite sve sisteme slatke vode i napunite ih morskim antifrizerom do -50°F. Zamaglite cilindre motora uljem za zamagljivanje. Skinite sve cerade i labave dodatke kako biste eliminisali površinu vetra. Postavite apsorbere vlage ili aktivni odvlaživač u unutrašnjosti. Organizujte nadzor plovila svake 2–4 nedelje tokom zimskih meseci.",
    ),
  );

  push(makeBlock("h3", "Koje su ekološke regulative za pranje jahti u marinama Crne Gore?"));
  push(
    makeBlock(
      "normal",
      "Direktno ispuštanje crnih voda, sivih voda i hemijskih otpadnih voda u bazen marine je ilegalno. Pranje palube mora koristiti biorazgradive marine deterdžente za zaštitu livade Posidonia oceanica. Porto Montenegro ima TYHA Clean Marina akreditaciju i ovi standardi se sprovode na vezu.",
    ),
  );

  push(makeBlock("h3", "Postoji li reverse marketplace za čišćenje jahti u Crnoj Gori?"));
  push(
    makeBlock(
      "normal",
      "Da — Glatko.app omogućava vlasnicima jahti da objave svoje zahteve za održavanjem i prime konkurentne ponude od proverenih lokalnih nautičkih profesionalaca, eliminišući neprozirnost i trenje tradicionalnog modela \"cena na upit\".",
    ),
  );

  return blocks;
}

// ─────────────────── refs (already seeded) ─────────────────── //
const AUTHOR_ID = "author-glatko-editorial";
const CATEGORY_ID = "category-marine-services";
const HERO_ASSET_ID =
  "image-f1434c75e522c37df8cd907007a7047f4044d951-1600x656-png";

// ─────────────────── main ─────────────────── //
async function main() {
  console.log(`Project: ${projectId} | Dataset: ${dataset}`);

  const content = buildContent();
  console.log(`Content blocks: ${content.length}`);

  const docId = "yacht-cleaning-montenegro-sr";
  const articleTitle =
    "Čišćenje jahti u Crnoj Gori: Cene, usluge i pouzdani profesionalci (2026)";
  const seoTitle =
    "Čišćenje jahti u Crnoj Gori: Cene, usluge i pouzdani profesionalci (2026)";
  const seoDescription =
    "Profesionalno čišćenje jahti u Crnoj Gori — cene, marine (Tivat, Kotor, Porto Montenegro), usluge i kako rezervisati proverene majstore na Glatku.";
  const excerpt =
    "Profesionalno čišćenje jahti u Crnoj Gori — cene, usluge, marine (Tivat, Kotor, Porto Montenegro), propisi i kako rezervisati proverene majstore na Glatku.";

  const doc = {
    _id: docId,
    _type: "post",
    title: {
      _type: "localeString",
      sr: articleTitle,
    },
    slug: {
      _type: "localeSlug",
      sr: { _type: "slug", current: "ciscenje-jahti-crna-gora" },
    },
    excerpt: {
      _type: "localeText",
      sr: excerpt,
    },
    content: {
      _type: "localeRichText",
      sr: content,
    },
    coverImage: {
      _type: "image",
      asset: { _type: "reference", _ref: HERO_ASSET_ID },
      alt: "Jahta vezana u crnogorskoj marini, Boka Kotorska",
    },
    author: { _type: "reference", _ref: AUTHOR_ID },
    category: { _type: "reference", _ref: CATEGORY_ID },
    serviceCategoryRefs: ["boat-services"],
    publishedAt: new Date("2026-05-09T08:00:00.000Z").toISOString(),
    featured: false,
    seo: {
      _type: "seoMeta",
      metaTitle: { _type: "localeString", sr: seoTitle },
      metaDescription: { _type: "localeText", sr: seoDescription },
    },
  };

  console.log("\nCreating/updating SR post...");
  const result = await client.createOrReplace(doc);
  console.log(`Done: ${result._id}`);
  console.log(`Title SR: ${result.title?.sr}`);
  console.log(`Slug SR: ${result.slug?.sr?.current}`);
  console.log(`Cover image: ${result.coverImage ? "set" : "missing"}`);
  console.log(
    `\nPublic URL: https://glatko.app/sr/blog/ciscenje-jahti-crna-gora`,
  );
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
