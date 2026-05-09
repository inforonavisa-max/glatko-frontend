#!/usr/bin/env node
/**
 * Publish "Yachtreinigung in Montenegro" (DE locale) blog post.
 *
 * Companion to en/me/sr/tr scripts. Same article structure, native
 * German tone (Sie/Ihre), ASCII slug `yachtreinigung-montenegro`.
 * Reuses seeded author + category + EN hero asset by _ref.
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

  push(makeBlock("normal", "Montenegro hat sich in den letzten Jahren leise zu einem der attraktivsten Liegeplätze der Adria entwickelt. Im Jahr 2025 liefen über 4.800 Schiffe in montenegrinische Gewässer ein — eine Zahl, die seit 2023 jährlich gewachsen ist. Während Porto Montenegro seinen Ruf als Superyacht-Hub festigt und die Marina Dukley eine Kapazitätserweiterung um 60 % durchläuft, steigt der Druck auf Yachteigner, ihre Schiffe ganzjährig in Bestform zu halten."));
  push(makeBlock("normal", "Doch die Bucht von Kotor verzeiht keine Nachlässigkeit. Intensive sommerliche UV-Strahlung, salzgesättigte Aerosole von der offenen Adria und die heftige Bora im Winter — kalte, gewaltige Fallwinde aus den Dinarischen Alpen — schaffen ein Wartungsumfeld, das jede ungeschützte Oberfläche ohne Gnade angreift. Dieser Ratgeber führt Sie durch alles, was Sie zur professionellen Yachtreinigung und zum Yachtdetailing in Montenegro wissen müssen — Preise, Leistungen, Vorschriften und wie Sie zuverlässige Anbieter finden, ohne sich durch das übliche Marina-Hin-und-Her quälen zu müssen."));

  push(makeBlock("h2", "Warum die Bucht von Kotor besondere Pflege verlangt"));
  push(makeBlock("normal", "Das Mikroklima der Boka kombiniert zwei korrosive Kräfte, die selten in dieser Konzentration zusammenwirken: konzentrierte Salzaerosole von der offenen Adria und feiner Kalksteinstaub aus den Dinariden. Innerhalb von 24 bis 48 Stunden bildet sich auf jeder freiliegenden Oberfläche ein aggressiver Film. Edelstahl-Reling beginnt zu pittingen. Gelcoat oxidiert vorzeitig. Teakholz speichert Partikel, die die weiche Holzfaser bei nicht wöchentlicher Reinigung beschleunigt zersetzen."));
  push(makeBlock("normal", "Die montenegrinische Vorschrift, dass Schiffe für zollfreien Kraftstoff mindestens 72 Stunden in Hoheitsgewässern bleiben müssen, schafft praktisch das ideale Zeitfenster für ein Detailing. Skipper, die diese Liegezeit für eine vollständige Außenwäsche und einen Innenraum-Reset nutzen, kommen in deutlich besserem Zustand am nächsten Hafen an als jene, die es nicht tun."));

  push(makeBlock("h2", "Arten von Yachtreinigungs- und Detailing-Leistungen in Montenegro"));
  push(makeBlock("normal", "Bootsreinigung in Montenegro reicht von einer 90-minütigen Außenwäsche bis zu einem mehrtägigen, mehrstufigen Restaurierungsprojekt. Hier ist, was professionelle Yachtreinigung und Yachtdetailing umfassen — und was jede Leistung tatsächlich bewirkt."));

  push(makeBlock("h3", "Außenwäsche (Rumpf, Wasserlinie, Aufbauten)"));
  push(makeBlock("normal", "Das Fundament jedes Wartungsplans. Mit pH-neutralen, marine-tauglichen Reinigern entfernen Fachkräfte Salzablagerungen, Vogeldreck und Wasserlinienschmutz, ohne vorhandenes Wachs oder Polymer-Versiegelungen anzugreifen. Hochdruckspülungen werden rund um Decksbeschläge und Fensterdichtungen sorgfältig dosiert. Frequenz: wöchentlich während der Saison."));

  push(makeBlock("h3", "Innenreinigung und Entfeuchtung"));
  push(makeBlock("normal", "Yachtinnenräume binden Feuchtigkeit auf eine Weise, die kein Wohnraum tut. Professionelles Innendetailing umfasst Niedrig-Feuchtigkeits-Dampfextraktion für Teppiche und Lederpolster, Ozon- oder enzymatische Geruchsbehandlung gegen Bilge-Düfte sowie Hospital-Grade-Desinfektion in Nasszellen und Pantry. In der Boka, wo die Winterluftfeuchtigkeit hoch liegt, ist eine aktive Entfeuchtung zwischen den Saisons kritisch, um Schimmel in Polstern und Holzeinbauten zu verhindern."));

  push(makeBlock("h3", "Teakdeck-Reinigung und Auffrischung"));
  push(makeBlock("normal", "Teak ist die pflegeintensivste Oberfläche jeder Yacht. UV-Strahlung und Salzwasser oxidieren das Holz, lassen es silbergrau werden und fördern schwarzen Algenbewuchs in den Fugen. Professionelle Teakreinigung arbeitet mit einem zweikomponentigen Chemieprozess: Ein verdünnter Säure-Reiniger öffnet die Holzfaser und löst Schmutz, eine sofort folgende, neutralisierende Base stellt den warmen, goldenen Farbton wieder her. Drahtbürsten — von ungelernten Kräften gerne verwendet — zerstören die weiche Faserstruktur und verkürzen die Decklebensdauer dauerhaft. Bestätigen Sie immer, dass Ihr Anbieter das korrekte Zwei-Schritt-Verfahren einsetzt. Frequenz: monatlich."));

  push(makeBlock("h3", "Gelcoat polieren, schleifen, wachsen"));
  push(makeBlock("normal", "Wenn der Rumpf matt und kreidig wirkt, oxidieren die Polymerketten der Gelcoat-Schicht durch UV-Einwirkung. Diese Leistung ist die arbeitsintensivste der gesamten Außenpflege. Techniker arbeiten mit abgestuften Polituren und drehzahlvariablen Rotationspoliermaschinen, glätten die Oberfläche mechanisch und versiegeln sie anschließend mit Carnauba-Wachs, Polymer-Versiegelung oder — für Langzeitschutz — einer professionellen Keramikversiegelung (SiO₂). In den montenegrinischen Sommern amortisiert sich eine Keramikbeschichtung bereits in einer Saison durch deutlich seltener notwendiges Polieren. Frequenz: jährlich (im Frühjahrs-Refit)."));

  push(makeBlock("h3", "Unterwasser-Rumpfreinigung und Antifouling (Montenegro-Spezifika)"));
  push(makeBlock("normal", "Antifouling ist eine Krannungs-Leistung — sie wird beim Trockendock in Werften wie Adriatic 42 in Bijela oder während der Wintereinlagerung durchgeführt. Hochdruckwäsche entfernt Muschel- und Algenbewuchs vom Unterwasserrumpf; die nackte Fläche wird angeschliffen, grundiert und mit ablativem oder hartem biozidem Antifouling beschichtet. Vernachlässigtes Antifouling lässt Bewuchs wachsen, der den Treibstoffverbrauch um bis zu 30 % erhöht — und wenn die Schutzschicht durchbrochen wird, kann es zu osmotischen Blasen und einer GFK-Delamination kommen, deren Reparatur leicht zehntausende Euro kostet. Montenegrinische Umweltvorschriften verbieten das Einleiten von Antifouling-Resten in Marina-Becken. Frequenz: jährlich (Krannung)."));

  push(makeBlock("h3", "Maschinenraum-Reinigung und Entölung"));
  push(makeBlock("normal", "Ein sauberer Maschinenraum ist keine Frage der Optik — er ermöglicht eine frühe Fehlererkennung. Bilgeöl und Schmutz verdecken die ersten Anzeichen von Leckagen und Korrosion. Professionelle Maschinenraumreinigung nutzt umweltverträgliche Entfetter, die mit Präzision rund um Kabelbäume, Seewasserfilter und Sensoren aufgetragen werden. Das ist Spezialistenarbeit; allgemeine Reinigungsfirmen ohne Marine-Erfahrung können sensible Verkabelung beschädigen. Frequenz: saisonal."));

  push(makeBlock("h3", "Charter-Endreinigung und Übergaben"));
  push(makeBlock("normal", "Die kommerzielle Charterflotte in Montenegro arbeitet mit knappen Übergabezeiten — oft unter sechs Stunden zwischen den Crews. Eine Charter-Endreinigung umfasst einen vollständigen Innenraum-Reset: Wäsche der Bettwäsche, Sanitär- und Pantry-Hygiene, Auffüllen von Verbrauchsmaterial, Müllentsorgung und eine komplette Außenwäsche. Genau dieses Segment adressiert Glatko unmittelbar — Charterunternehmen brauchen schnelle, zuverlässige Anbieter, und der lokale Markt bietet derzeit keinen transparenten Buchungsmechanismus für solche Aufträge."));

  push(makeBlock("h2", "Yachtreinigung in Montenegro: Was die Reinigung 2026 kostet"));
  push(makeBlock("normal", "Premium-Marineanbieter in Montenegro arbeiten fast ausschließlich nach individuellem Angebotsmodell — Preise sind nicht öffentlich, jeder Auftrag erfordert einen Anruf oder eine E-Mail, um eine Zahl zu bekommen. Diese Intransparenz ist die dominierende Reibung des lokalen Markts."));
  push(makeBlock("normal", "Auf Basis adriatischer Regional-Benchmarks und lokaler Lohnkosten sind das realistische Schätzungen für die Saison 2025/2026:"));

  push(makeListItem("**Einfache Außenwäsche:** €10 – €20 pro laufendem Meter (LüA)"));
  push(makeListItem("**Tiefen-Innendetailing:** €15 – €30 pro laufendem Meter (LüA)"));
  push(makeListItem("**Teakreinigung und Auffrischung:** €25 – €45 pro m² Deckfläche"));
  push(makeListItem("**Gelcoat polieren und wachsen:** €80 – €150 pro laufendem Meter (LüA)"));
  push(makeListItem("**Keramikversiegelung (Premium):** €200 – €400+ pro laufendem Meter (LüA)"));
  push(makeListItem("**Maschinenraum-Entfettung:** €250 – €600 (Pauschale)"));
  push(makeListItem("**Antifouling (Unterwasser):** €100 – €140 pro laufendem Meter (LüA)"));
  push(makeListItem("**Charter-Endreinigung:** €150 – €400 (Pauschale, je nach Kabinenzahl)"));

  push(makeBlock("normal", "**Praktisches Beispiel:** Eine 12-Meter-Yacht mit Außenwäsche, Innendetailing und Teakpflege liegt typischerweise bei €600 – €1.200, abhängig vom Zustand und Anbieter. Eine 40-Meter-Motoryacht, die ein vollflächiges Gelcoat-Politur über die gesamten Aufbauten benötigt, übersteigt €5.000 ohne Weiteres."));

  push(makeBlock("h2", "Montenegros wichtigste Marinas: Wo Yachtreinigung stattfindet"));
  push(makeBlock("normal", "Die Marina-Geographie zu verstehen, ist für die Wartungsplanung entscheidend."));
  push(makeBlock("normal", "**Porto Montenegro (Tivat)** ist der Superyacht-Flaggschiff-Hub — über 450 Liegeplätze, TYHA Five Gold Anchor Platinum, Zoll und zollfreier Kraftstoff vor Ort, dichtes Netzwerk an Dienstleistern. Hier siedeln sich die hochwertigsten Detailing-Firmen an. Maximale Länge über alles: 250 Meter."));
  push(makeBlock("normal", "**Marina Dukley (Budva)** durchläuft eine 60-prozentige Erweiterung der Liegeplätze und einen Wellenbrecherausbau. Sie betreut derzeit rund 300 Schiffe und ist der primäre Hub für mittelgroße Charter-Yachten an der Riviera von Budva. Maximale Länge über alles: 70 Meter."));
  push(makeBlock("normal", "**D-Marin Portonovi (Herceg Novi)** ist eine Boutique-Luxusmarina mit 238 Liegeplätzen und Five Gold Anchor-Auszeichnung, eng mit dem One&Only-Resort verzahnt. Ideal für Eigner, die ein weniger dichtes, resort-orientiertes Liegeplatzgefühl bevorzugen."));
  push(makeBlock("normal", "**Marina Bar** bietet die größte absolute Kapazität in Montenegro (~900 Liegeplätze + 300 Trockenplätze) und fungiert als preisgünstiger Wintereinlagerungs- und Tankhub. Weniger glamourös, aber äußerst praktisch für Auswinterung und Antifouling-Arbeiten."));
  push(makeBlock("normal", "**Marina Kotor** ist durch das UNESCO-Weltkulturerbe in der Kapazität begrenzt und nimmt vorrangig Transit-Yachten auf. Liegeplätze sind die ganze Saison über knapp."));

  push(makeBlock("h2", "Saisonalität: Wann Sie Ihre Yachtreinigung planen sollten"));
  push(makeBlock("normal", "Die Hauptsaison läuft von Anfang Juni bis Ende September; im Juli und August entstehen echte Engpässe bei den Anbietern. Die Nachfrage nach Reinigungsleistungen übersteigt in diesen Monaten das lokale Angebot — Anbieter, die nicht vorab gebucht sind, können kurzfristige Anfragen oft nicht annehmen."));
  push(makeBlock("normal", "**Strategische Planung:**"));
  push(makeListItem("**April – Mai (Refit):** Bestes Fenster für Gelcoat-Politur, Keramikversiegelung, vollständige Teakrestauration und Antifouling, bevor das Schiff zu Wasser kommt."));
  push(makeListItem("**Juni – September (Saison):** Wöchentliche Außenwäsche, monatliches Innendetailing und Teakpflege, schnelle Charter-Endreinigungen."));
  push(makeListItem("**Oktober – November (Auswinterung):** Wintereinlagerungs-Protokoll — komplette Entleerung des Frischwassersystems, Frostschutz, Motor-Konservierungsöl (Fogging), Abnahme aller Persenninge, Aufstellen von Entfeuchtern. Letztes Fenster für eine Unterwasser-Rumpfinspektion."));

  push(makeBlock("h2", "Umweltauflagen: Yachtreinigung in montenegrinischen Gewässern"));
  push(makeBlock("normal", "Montenegro setzt aktiv auf nachhaltigen Yachttourismus. Porto Montenegro trägt die TYHA Clean Marina-Akkreditierung; die gesamte Küste arbeitet nach nationalem Recht in Übereinstimmung mit MARPOL Anhang V."));
  push(makeBlock("normal", "**Schlüsselregeln für Eigner und Dienstleister:**"));
  push(makeListItem("Direktes Einleiten von Schwarzwasser (Fäkalien), Grauwasser (Spüle/Dusche) und chemischen Abwässern in Marina-Becken ist streng verboten. Sämtliche Entsorgung muss über die Pumpstationen der Marinas laufen."));
  push(makeListItem("Aufbautenwäsche am Liegeplatz ist nur mit biologisch abbaubaren, phosphatfreien Marine-Reinigern erlaubt. Aggressive Chlorreiniger und phosphathaltige Mittel sind verboten — sie schädigen die Posidonia-oceanica-Seegraswiesen, die für das adriatische Ökosystem essenziell sind."));
  push(makeListItem("Abrasive Antifouling-Reste müssen während der Krannung kontrolliert aufgefangen werden. Seriöse Trockendockanlagen setzen das automatisch um."));
  push(makeBlock("normal", "Wenn Sie einen Yachtreinigungs-Anbieter in Montenegro prüfen, fragen Sie direkt: Verwenden Sie MARPOL-konforme Produkte? Wer diese Frage nicht klar beantworten kann, arbeitet nicht auf dem Niveau, das die Marinas verlangen."));

  push(makeBlock("h2", "So finden Sie einen zuverlässigen Yachtreinigungs-Anbieter in Montenegro: Praktische Checkliste"));
  push(makeBlock("normal", "Die klassische Methode — Aushänge an der Marina, Funkanrufe über UKW, Empfehlungen ohne Verifikation — liefert in einer fremden Marina inkonsistente Ergebnisse. Der lokale Markt ist hochfragmentiert: Auf der einen Seite Spezialfirmen wie 7seas7works, auf der anderen Seite generelle Reinigungsdienste ohne marine Spezialchemie und Ausrüstung, die Yachtkunden trotzdem akquirieren wollen."));
  push(makeBlock("normal", "**Bevor Sie einen Anbieter beauftragen, prüfen Sie:**"));
  push(makeListItem("Verwenden sie marine-spezifische, pH-neutrale Reiniger (keine Haushaltschemie)?"));
  push(makeListItem("Bei Teak: Arbeiten sie mit zweikomponentigem Säure-Basis-System statt Drahtbürsten?"));
  push(makeListItem("Beim Gelcoat: Können sie Poliermaschinen und Politurabstufungen vorzeigen?"));
  push(makeListItem("Sind ihre Produkte MARPOL-konform für die Anwendung in Marina-Becken?"));
  push(makeListItem("Haben sie eine Marine-Auftragnehmer-Versicherung?"));
  push(makeListItem("Können sie Referenzen von anderen Schiffen in derselben Marina nennen?"));
  push(makeListItem("Wird der Preis pro laufendem Meter (Standard) oder als unklare Pauschale angegeben?"));
  push(makeBlock("normal", "Die fehlende Preistransparenz ist die zentrale Reibung dieses Markts. Etablierte Anbieter geben oft erst nach einer persönlichen Inspektion einen Preis ab — was wiederum Ihre Anwesenheit voraussetzt. Für Eigner, die ihr Schiff aus der Distanz managen oder ihre Reiseroute planen, ist dieses Modell schlicht unpraktikabel."));

  push(makeBlock("h2", "Yachtreinigung in Montenegro buchen — ohne das übliche Hin und Her"));
  push(makeBlock("normal", "Glatko.app ist Montenegros erster Reverse-Marketplace für Hauswirtschafts- und Marine-Dienstleistungen. Anstatt Angebote bei mehreren Anbietern einzuholen, veröffentlichen Sie Ihren Auftrag — Schiffsgröße, Marina-Standort, gewünschte Leistungen, bevorzugte Termine — und geprüfte lokale Profis bewerben sich direkt bei Ihnen mit konkurrenzfähigen Angeboten."));
  push(makeBlock("normal", "Für Yachteigner in der Bucht von Kotor heißt das:"));
  push(makeListItem("Transparente Wettbewerbspreise, sichtbar bevor Sie sich festlegen."));
  push(makeListItem("Verifizierte lokale Anbieter mit Bewertungen und Auftragshistorie."));
  push(makeListItem("Funktioniert für Einzelreinigungen, wiederkehrende Saisonverträge und Charter-Endreinigungspakete."));
  push(makeListItem("Auftrag von überall einstellen — Sie müssen nicht an Bord sein, um den Prozess zu starten."));
  push(makeBlock("normal", "**[Veröffentlichen Sie Ihren Reinigungsauftrag auf Glatko.app →](https://glatko.app)**"));

  push(makeBlock("h2", "Häufig gestellte Fragen"));

  push(makeBlock("h3", "Wie oft sollte eine Yacht in der Bucht von Kotor professionell gereinigt werden?"));
  push(makeBlock("normal", "In der Saison Juni–September ist eine wöchentliche Außenwäsche Standard, wegen der hohen Salzaerosol-Belastung. Innendetailing und Teakpflege gehören in einen Monatsrhythmus. Gelcoat-Politur und Schutzbeschichtungen sind jährliche Leistungen — am besten beim Frühjahrs-Refit."));

  push(makeBlock("h3", "Was kostet Yachtreinigung pro Meter in Montenegro?"));
  push(makeBlock("normal", "Eine einfache Außenwäsche kostet €10–€20 pro laufendem Meter. Mehrstufige Gelcoat-Politur mit Wachs liegt bei €80–€150 pro Meter. Eine Premium-Keramikversiegelung kann €200–€400 pro Meter überschreiten. Charter-Endreinigungen werden meist als Pauschale zwischen €150 und €400 abgerechnet."));

  push(makeBlock("h3", "Was ist der Unterschied zwischen Yachtreinigung und Yachtdetailing?"));
  push(makeBlock("normal", "Reinigung deckt routinemäßige Pflege ab — Außenwäsche, Innenwischung, einfache Hygiene. Detailing ist ein tiefer gehender Prozess: mehrstufige Gelcoat-Politur, Säure-Basis-Teakrestauration, Keramikversiegelung und spezialisierte Stoff- und Lederbehandlung. Detailing stellt wieder her; Reinigung erhält den Status quo."));

  push(makeBlock("h3", "Darf ich für meine Yacht Haushaltsreiniger verwenden?"));
  push(makeBlock("normal", "Nein. Standard-Reiniger ziehen Wachs- und Polymer-Schutzschichten vom Gelcoat ab und beschleunigen die UV-Schädigung. Chlorbleiche zerstört Nähte und Persenning-Imprägnierungen. Phosphathaltige Reiniger sind in montenegrinischen Marinas verboten. Verwenden Sie ausschließlich pH-neutrale, marine-spezifische, biologisch abbaubare Produkte."));

  push(makeBlock("h3", "Was ist die 72-Stunden-Regel und welche Rolle spielt sie für die Reinigung?"));
  push(makeBlock("normal", "Um zollfreien Kraftstoff zu beziehen, müssen Schiffe mindestens 72 Stunden in montenegrinischen Hoheitsgewässern bleiben. Skipper nutzen diese erzwungene Liegezeit häufig als ideales Fenster, um vor der Weiterfahrt eine umfassende Außen- und Innenreinigung einzuplanen."));

  push(makeBlock("h3", "Wie wintere ich meine Yacht in Montenegro gegen die Bora ein?"));
  push(makeBlock("normal", "Frischwassersystem komplett entleeren und mit marine-tauglichem Frostschutz bis mindestens -45 °C füllen. Motorzylinder mit Konservierungsöl einnebeln. Persenninge, Biminis und alle losen Anbauten entfernen, um die Angriffsfläche für den Wind zu minimieren. Feuchtigkeitsabsorber oder einen aktiven Entfeuchter unter Deck aufstellen. Während der Wintermonate alle 2–4 Wochen eine Aufsichtskontrolle organisieren."));

  push(makeBlock("h3", "Welche Umweltauflagen gelten beim Bootreinigen in montenegrinischen Marinas?"));
  push(makeBlock("normal", "Direktes Einleiten von Schwarz-, Grau- und Chemieabwässern in Marina-Becken ist illegal. Aufbautenwäsche muss mit biologisch abbaubaren Marine-Reinigern erfolgen, um die Posidonia-oceanica-Seegraswiesen zu schützen. Porto Montenegro trägt die TYHA Clean Marina-Akkreditierung, und diese Standards werden am Liegeplatz durchgesetzt."));

  push(makeBlock("h3", "Gibt es einen Reverse-Marketplace für Yachtreinigung in Montenegro?"));
  push(makeBlock("normal", "Ja — Glatko.app erlaubt Yachteignern, ihre Wartungsanforderungen zu veröffentlichen und Wettbewerbsangebote von geprüften lokalen Marine-Profis zu erhalten, statt sich auf das intransparente \"Preis auf Anfrage\"-Modell zu verlassen."));

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

  const docId = "yacht-cleaning-montenegro-de";
  const articleTitle =
    "Yachtreinigung in Montenegro: Der komplette Ratgeber 2026 für die Bucht von Kotor";
  const seoTitle =
    "Yachtreinigung Montenegro: Preise, Services & lokale Experten (2026)";
  const seoDescription =
    "Professionelle Yachtreinigung in Montenegro — Preise, Marinas (Tivat, Kotor, Porto Montenegro), Services & zuverlässige Anbieter auf Glatko buchen.";
  const excerpt =
    "Professionelle Yachtreinigung in Montenegro — Preise, Marinas (Tivat, Kotor, Porto Montenegro), Vorschriften und zuverlässige Anbieter auf Glatko buchen.";

  const doc = {
    _id: docId,
    _type: "post",
    title: { _type: "localeString", de: articleTitle },
    slug: {
      _type: "localeSlug",
      de: { _type: "slug", current: "yachtreinigung-montenegro" },
    },
    excerpt: { _type: "localeText", de: excerpt },
    content: { _type: "localeRichText", de: content },
    coverImage: {
      _type: "image",
      asset: { _type: "reference", _ref: HERO_ASSET_ID },
      alt: "Yacht am Liegeplatz in einer Marina in Montenegro, Bucht von Kotor",
    },
    author: { _type: "reference", _ref: AUTHOR_ID },
    category: { _type: "reference", _ref: CATEGORY_ID },
    serviceCategoryRefs: ["boat-services"],
    publishedAt: new Date("2026-05-09T08:00:00.000Z").toISOString(),
    featured: false,
    seo: {
      _type: "seoMeta",
      metaTitle: { _type: "localeString", de: seoTitle },
      metaDescription: { _type: "localeText", de: seoDescription },
    },
  };

  console.log("\nCreating/updating DE post...");
  const result = await client.createOrReplace(doc);
  console.log(`Done: ${result._id}`);
  console.log(`Title DE: ${result.title?.de}`);
  console.log(`Slug DE: ${result.slug?.de?.current}`);
  console.log(`Cover image: ${result.coverImage ? "set" : "missing"}`);
  console.log(`\nPublic URL: https://glatko.app/de/blog/yachtreinigung-montenegro`);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
