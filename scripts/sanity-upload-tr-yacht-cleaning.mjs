#!/usr/bin/env node
/**
 * Publish "Karadağ'da Yat Temizliği" (TR locale) blog post.
 *
 * Companion to en/me/sr scripts:
 * - separate _id (yacht-cleaning-montenegro-tr)
 * - reuses seeded author + category + EN hero asset (no extra writes)
 * - TR content adapted from the EN article; Turkish marine-services
 *   terminology, "siz" address, ASCII slug (karadagda-yat-temizligi)
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

// ─────────────────── content (TR) ─────────────────── //
function buildContent() {
  const blocks = [];
  const push = (b) => blocks.push(b);

  push(makeBlock("normal", "Karadağ, sessiz sedasız Adriyatik'in en cazip yat duraklarından biri haline geldi. 2025'te 4.800'ü aşkın tekne Karadağ sularına giriş yaptı — bu rakam 2023'ten beri her sezon büyüyor. Porto Montenegro süperyat çekim merkezi olarak konumunu sağlamlaştırırken, Dukley Marina yüzde 60'lık kapasite genişlemesi sürecinde. Tüm bunlar bir araya gelince yat sahibinin omzuna binen tek bir sorumluluk var: tekneyi yılın her ayında zirve formda tutmak."));
  push(makeBlock("normal", "Ama Boka Körfezi affedici değildir. Yoğun yaz UV'si, açık Adriyatik'ten gelen aşırı tuzlu aerosol ve kışın esen şiddetli Bora rüzgarı, bakımı ihmal edenleri çabuk cezalandırır. Yazın Tivat'tan çarter filosu çıkartıyor olun, kruvazörünüzü Marina Bar'da kışlatıyor olun veya Kotor üzerinden güneye geçiyor olun — bu rehber Karadağ'da yat temizliği ve detayını yapmak için bilmeniz gereken her şeyi içeriyor: fiyatlar, hizmetler, mevzuat ve klasik marina koşuşturmacasına girmeden güvenilir profesyonelleri nasıl bulacağınız."));

  push(makeBlock("h2", "Karadağ'ın Deniz Ortamı Neden Sıkı Bir Temizlik Programı Gerektirir?"));
  push(makeBlock("normal", "Boka Körfezi'nin mikroklimasında nadiren bu yoğunlukta bir arada bulunan iki aşındırıcı güç birleşir: açık Adriyatik'ten gelen yoğun tuz aerosolü ve Dinarid Alpleri'nden inen ince kireçtaşı tozu. İkisi birlikte, oturduktan 24–48 saat içinde her açık yüzeyde aşındırıcı bir film oluşturur. Paslanmaz çelik korkuluklar pittinge başlar. Jelkot vakitsiz oksitlenir. Tik damarları, haftalık temizlenmediğinde ahşabı hızla bozan parçacıkları yakalar."));
  push(makeBlock("normal", "Karadağ'ın gümrüksüz yakıt için zorunlu kıldığı 72 saat kalış kuralı, pratikte profesyonel detaya en uygun pencereyi yaratır. Kaptanlar bu zorunlu konaklamayı kapsamlı bir dış yıkama ve iç sıfırlama için kullandıklarında bir sonraki limana çok daha iyi bir formda varır."));

  push(makeBlock("h2", "Karadağ'da Yat Temizliği ve Detailing Hizmet Türleri"));
  push(makeBlock("normal", "Karadağ'da tekne temizliği, 90 dakikalık temel bir dış yıkamadan günlerce süren çok aşamalı bir restorasyon projesine kadar uzanır. İşte profesyonel yat temizliği ve detailing'in kapsadığı her hizmetin gerçekte ne yaptığı."));

  push(makeBlock("h3", "Dış Yıkama (Tekne Gövdesi, Su Hattı, Bordalar)"));
  push(makeBlock("normal", "Her bakım programının temeli. pH dengeli ve denize uygun deterjanlarla profesyoneller tuz birikintilerini, kuş tahribatını ve su hattı kirini var olan cila veya polimer kaplamayı söküp atmadan uzaklaştırır. Yüksek basınçlı durulama güverte aksamı ve cam fitilleri etrafında dikkatle kontrol edilir. Sıklık: sezon boyunca haftalık."));

  push(makeBlock("h3", "İç Temizlik ve Nem Alma"));
  push(makeBlock("normal", "Yat iç mekanları, hiçbir konutun yapamayacağı şekilde nem tutar. Profesyonel yat iç temizliği halı ve deri için düşük nemli buharla ekstraksiyon, sintine kaynaklı kokular için ozon veya enzimatik koku tedavisi, tuvalet ve mutfaklar için hastane düzeyinde dezenfeksiyon içerir. Kış nemi yüksek olan Boka'da, sezonlar arası aktif nem alma; döşeme ve marangoz işlerinde küflenmeyi engellemek için kritiktir."));

  push(makeBlock("h3", "Tik Güverte Temizliği ve Yenileme"));
  push(makeBlock("normal", "Tik, her yelkenli yattaki en emek isteyen yüzeydir. UV ve tuzlu su oksidasyona neden olur — zengin ahşap gümüş-griye döner ve birleşim yerlerinde siyah alg gelişir. Profesyonel tik temizliği iki bileşenli kimyasal süreç kullanır: seyreltik asit bazlı bir temizleyici dokuyu açıp kirleticileri kaldırır, hemen ardından gelen nötrleştirici baz sıcak altın tonu geri getirir. Eğitimsiz işçilerin yaygın kullandığı tel fırça yumuşak damarı parçalar ve güverte ömrünü kalıcı olarak kısaltır. Servis sağlayıcınızın doğru iki bileşenli kimyayı kullandığını mutlaka teyit edin. Sıklık: aylık."));

  push(makeBlock("h3", "Jelkot Cilalama ve Mum (Gelcoat Compounding & Waxing)"));
  push(makeBlock("normal", "Tekne gövdeniz tebeşirleşmiş ve mat görünüyorsa, jelkot polimer zincirlerinin UV oksidasyonuyla karşı karşıyasınız. Bu, en emek isteyen dış hizmettir. Teknisyenler değişken devirli rotari makineler ve kademeli aşındırıcı pastalarla yüzeyi mekanik olarak düzleştirir, ardından carnauba mumu, polimer dolgu ya da uzun ömürlü koruma için profesyonel seramik (SiO₂) kaplama ile kapatır. Karadağ yazlarında bir seramik kaplama, gerekli cilalama sıklığını dramatik biçimde azaltarak kendisini bir sezonda amorti eder. Sıklık: yılda bir (bahar donanım sezonunda)."));

  push(makeBlock("h3", "Tekne Tabanı Temizliği ve Antifouling (Karadağ'a Özel)"));
  push(makeBlock("normal", "Antifouling, kuru havuzlama gerektiren bir hizmettir; Bijela'daki Adriatic 42 gibi tesislerde veya kış depolaması sırasında uygulanır. Yüksek basınçlı yıkama batık tekne tabanından midye ve algleri söker; çıplak yüzey zımparalanır, astar ve ablatif/sert biyositli boya ile kaplanır. İhmal edilen antifouling deniz büyümesine yol açar — yakıt tüketimini yüzde 30'a kadar artırır ve bariyer sızdırırsa osmotik kabarcıklar başlar; fiber laminasyonun bozulması on binlerce euro'luk onarım demektir. Karadağ eko-mevzuatı antifouling tortusunun marina havzalarına boşaltılmasını yasaklar. Sıklık: yılda bir (karaya çekme döneminde)."));

  push(makeBlock("h3", "Makine Dairesi Temizliği ve Yağdan Arındırma"));
  push(makeBlock("normal", "Tertemiz bir makine dairesi estetikle ilgili değildir — arıza tespitiyle ilgilidir. Sintinedeki yağ ve birikmiş kirler, sıvı kaçaklarının ve korozyonun erken işaretlerini gizler. Profesyonel makine dairesi temizliği elektrik tesisatları, deniz suyu süzgeçleri ve sensörler etrafında hassasiyetle uygulanan, çevreye uyumlu yağ çözücüleri kullanır. Bu uzmanlık işidir; hassas kabloları zedeleyebilecek genelci temizlikçilerden kaçının. Sıklık: sezonluk."));

  push(makeBlock("h3", "Çarter Sonrası / Devir Teslim Temizliği"));
  push(makeBlock("normal", "Karadağ'daki ticari çarter filosu sıkı bir devir teslim ritminde — çoğunlukla iki konuk arasında altı saatten az süre. Devir teslim temizliği iç mekanın komple sıfırlanmasını içerir: nevresim yıkama, tuvalet ve mutfak sanitasyonu, sarf malzeme ikmali, çöp atımı ve eksiksiz bir dış yıkama. Bu, Glatko'nun en doğrudan hitap ettiği segmenttir — çarter operatörleri hızlı ve güvenilir profesyonele ihtiyaç duyar ve mevcut piyasada bu işler için şeffaf bir rezervasyon mekanizması yoktur."));

  push(makeBlock("h2", "Karadağ'da Yat Temizliği Fiyatları: 2026 Beklentileri"));
  push(makeBlock("normal", "Karadağ'ın premium denizcilik firmaları neredeyse tamamen özel teklif modeliyle çalışır — fiyatlar yayınlanmaz, her iş için telefon veya e-posta üzerinden bir rakam istenmesi gerekir. Bu şeffafsızlık, yerel piyasanın baskın sürtüşme noktasıdır."));
  push(makeBlock("normal", "Adriyatik bölgesel kıyaslamaları ve yerel iş gücü ekonomisine göre 2025/2026 sezonu için gerçekçi tahminler:"));

  push(makeListItem("**Temel dış yıkama:** metre başına (boy) €10 – €20"));
  push(makeListItem("**Derinlemesine iç temizlik (detailing):** metre başına (boy) €15 – €30"));
  push(makeListItem("**Tik temizliği ve canlandırma:** m² güverte başına €25 – €45"));
  push(makeListItem("**Jelkot cilalama ve mum:** metre başına (boy) €80 – €150"));
  push(makeListItem("**Seramik kaplama (üst seviye):** metre başına (boy) €200 – €400+"));
  push(makeListItem("**Makine dairesi yağdan arındırma:** sabit €250 – €600"));
  push(makeListItem("**Antifouling (su altı tekne tabanı):** metre başına (boy) €100 – €140"));
  push(makeListItem("**Çarter sonrası devir teslim temizliği:** sabit €150 – €400 (kabin sayısına göre)"));

  push(makeBlock("normal", "**Pratik örnek:** 12 metrelik bir yelkenli için tam dış yıkama, iç temizlik ve tik bakımı, teknenin durumuna ve servis sağlayıcısına göre tipik olarak €600 – €1.200 tutar. 40 metrelik bir motoryatın tüm bordalarına yapılacak jelkot cilalaması rahatlıkla €5.000'ü aşar."));

  push(makeBlock("h2", "Karadağ'ın Önemli Marinaları: Yat Temizliği Nerede Yapılır?"));
  push(makeBlock("normal", "Marina coğrafyasını anlamak, bakım programınızı planlarken kritik."));
  push(makeBlock("normal", "**Porto Montenegro (Tivat)** süperyat merkezi — 450+ bağlama yeri, TYHA Five Gold Anchor Platinum, sahada gümrük ve gümrüksüz yakıt, yoğun bir taşeron ekosistemi. En üst düzey detailing firmaları burada toplanır. Maksimum LOA: 250 metre."));
  push(makeBlock("normal", "**Dukley Marina (Budva)** yüzde 60'lık bağlama kapasitesi genişlemesi ve dalgakıran inşaatından geçiyor. Şu anda yaklaşık 300 tekneye hizmet veriyor ve Budva Rivierası'nda orta boy çarter yatlar için ana üs işlevi görüyor. Maksimum LOA: 70 metre."));
  push(makeBlock("normal", "**D-Marin Portonovi (Herceg Novi)** 238 bağlama yerine sahip, Five Gold Anchor sertifikalı butik lüks bir marina. One&Only resort kompleksiyle iç içe geçmiştir; düşük yoğunluklu, resort ortamlı bir bağlama isteyen sahipler için idealdir."));
  push(makeBlock("normal", "**Marina Bar** Karadağ'ın mutlak olarak en büyük bağlama kapasitesini sunar (~900 bağlama + 300 kuru) ve rekabetçi kış depolaması ile gümrüksüz yakıt için pratik bir hub'dır. Daha az gösterişli ama kışlama ve antifouling işleri için son derece pratiktir."));
  push(makeBlock("normal", "**Marina Kotor** UNESCO sınırları nedeniyle kapasitesi kısıtlıdır; çoğunlukla transit yatlara hizmet eder. Sezon boyunca bağlama yeri bulmak zordur."));

  push(makeBlock("h2", "Sezonalite: Yat Temizliğinizi Ne Zaman Planlamalısınız?"));
  push(makeBlock("normal", "Yoğun sezon haziran başından eylül sonuna kadar sürer; temmuz ve ağustosta gerçek bir kapasite darboğazı oluşur. Bu aylarda temizlik talebi yerel arzı aşar — önceden rezerve etmemiş profesyoneller, yürüyen başvuruları çoğunlukla kabul edemezler."));
  push(makeBlock("normal", "**Stratejik planlama:**"));
  push(makeListItem("**Nisan – Mayıs (donanım sezonu):** Jelkot cilalaması, seramik kaplama, kapsamlı tik restorasyonu ve antifouling için en iyi pencere — tekne suya inmeden yapılır."));
  push(makeListItem("**Haziran – Eylül (sezon içi):** Haftalık dış yıkama, aylık iç temizlik ve tik bakımı, hızlı çarter devir teslimleri."));
  push(makeListItem("**Ekim – Kasım (kışlama):** Kışlama protokolü — tatlı su sisteminin tamamen boşaltılması, antifriz uygulaması, motor silindirlerinin sislenmesi, brandaların sökülmesi, iç nem alıcının kurulması. Su altı muayenesi için son fırsat."));

  push(makeBlock("h2", "Çevre Mevzuatı: Karadağ Sularında Yat Temizliği"));
  push(makeBlock("normal", "Karadağ sürdürülebilir denizcilik turizmini agresif biçimde takip ediyor. Porto Montenegro TYHA Clean Marina sertifikasına sahip; tüm sahil MARPOL Ek V ile uyumlu yerel mevzuat altında işliyor."));
  push(makeBlock("normal", "**Tekne sahipleri ve servis sağlayıcılar için temel kurallar:**"));
  push(makeListItem("Siyah suyun (atık), gri suyun (lavabo/duş) ve kimyasal sıvıların doğrudan marina havzalarına boşaltılması yasaktır. Tüm boşaltma işlemleri marinanın belirlediği pump-out istasyonlarından yapılmalıdır."));
  push(makeListItem("Bağlamada bordalar yıkaması yalnızca biyolojik olarak ayrışan, fosfatsız denize uygun deterjanlarla yapılabilir. Sert çamaşır suyu ve fosfatlı sabunlar yasaktır — Adriyatik ekosistemi için kritik olan Posidonia oceanica deniz çayır ekosistemine zarar verirler."));
  push(makeListItem("Karaya çekme operasyonları sırasında aşındırıcı antifouling tortuları kontrol altında tutulmalıdır. İtibarlı kuru havuz tesisleri bunu otomatik olarak uygular."));
  push(makeBlock("normal", "Karadağ'da bir yat temizliği firması seçerken doğrudan sorun: MARPOL uyumlu ürünler kullanıyor musunuz? Bu soruya net cevap veremeyen bir taşeron, marinaların talep ettiği standartta çalışmıyor demektir."));

  push(makeBlock("h2", "Karadağ'da Güvenilir Yat Temizlikçisi Nasıl Bulunur: Pratik Kontrol Listesi"));
  push(makeBlock("normal", "Geleneksel yöntem — marina ilan panoları, VHF üzerinden başka kaptanlara sormak veya doğrulanmamış tavsiyelere güvenmek — yabancı bir marinada tutarsız sonuçlar verir. Yerel pazar oldukça parçalıdır: 7seas7works gibi seçkin teknik firmalar bir uçta; denizcilik kimyası ve ekipmanı olmayan genelci temizlik firmaları diğer uçta yat sahiplerini yakalamaya çalışır."));
  push(makeBlock("normal", "**Herhangi bir servis sağlayıcı ile çalışmadan önce şunları teyit edin:**"));
  push(makeListItem("Denize uygun, pH dengeli deterjanlar mı kullanıyorlar? (Ev tipi temizleyici değil)"));
  push(makeListItem("Tik için: tel fırça değil, iki bileşenli asit/baz sistemi mi kullanıyorlar?"));
  push(makeListItem("Jelkot için: rotari makine ve pasta gradasyonunu gösterebiliyorlar mı?"));
  push(makeListItem("Ürünleri marina havzalarında kullanım için MARPOL uyumlu mu?"));
  push(makeListItem("Denizcilik taşeronu sigortaları var mı?"));
  push(makeListItem("Aynı marinadan başka teknelerden referans verebiliyorlar mı?"));
  push(makeListItem("Fiyat metre başına mı (standart) yoksa belirsiz götürü olarak mı veriliyor?"));
  push(makeBlock("normal", "Şeffaf fiyatın yokluğu, bu pazarın baskın sürtüşme noktasıdır. Yerleşik servis sağlayıcıların çoğu yerinde inceleme yapmadan rakam vermez — bu da sizin orada olmanızı gerektirir. Tekneyi uzaktan yöneten veya seyahat planı yapan sahipler için bu model fiilen işlemez."));

  push(makeBlock("h2", "Karadağ'da Yat Temizliği Rezervasyonu: Klasik Koşuşturmaca Olmadan"));
  push(makeBlock("normal", "Glatko.app, Karadağ'ın ilk ters yönlü ev ve denizcilik hizmetleri pazaryeridir. Birden fazla taşerondan teklif kovalamak yerine işi siz yayınlarsınız — tekne boyu, marina lokasyonu, gerekli hizmetler, tercih ettiğiniz tarihler — ve onaylı yerel profesyoneller doğrudan size rekabetçi teklifler gönderir."));
  push(makeBlock("normal", "Boka Körfezi'ndeki yat sahipleri için bu şu anlama gelir:"));
  push(makeListItem("Sözleşmeden önce görünen şeffaf rekabetçi fiyatlar"));
  push(makeListItem("Puan ve geçmiş hizmet kaydıyla doğrulanmış yerel profesyoneller"));
  push(makeListItem("Tek seferlik temizlik, periyodik sezon sözleşmesi ve çarter devir teslim paketleri için çalışır"));
  push(makeListItem("Her yerden yayınlayın — süreci başlatmak için tekne üzerinde olmanıza gerek yok"));
  push(makeBlock("normal", "**[Glatko.app'te yat temizliği ilanı verin →](https://glatko.app)**"));

  // FAQ
  push(makeBlock("h2", "Sıkça Sorulan Sorular"));

  push(makeBlock("h3", "Boka Körfezi'nde bir yat ne sıklıkta profesyonel olarak temizlenmelidir?"));
  push(makeBlock("normal", "Tuz aerosolü yoğunluğu nedeniyle Haziran–Eylül sezonunda haftalık dış yıkama standarttır. İç temizlik ve tik bakımı aylık planlanmalıdır. Jelkot cilalama ve koruyucu kaplama yıllık hizmetlerdir; en iyi şekilde bahar donanım sezonunda yapılır."));

  push(makeBlock("h3", "Karadağ'da yat temizliği metre başına ne kadar tutar?"));
  push(makeBlock("normal", "Temel dış yıkama metre başına €10–€20 arasındadır. Çok aşamalı jelkot cilalama ve mum metre başına €80–€150'dir. Üst seviye seramik kaplama metre başına €200–€400'ü aşabilir. Çarter sonrası devir teslim temizlikleri tipik olarak €150 ile €400 arasında sabit fiyatlandırılır."));

  push(makeBlock("h3", "Yat temizliği ile yat detailing arasındaki fark nedir?"));
  push(makeBlock("normal", "Temizlik rutin bakımı kapsar — dış yıkama, iç silme, temel sanitasyon. Detailing daha derinlemesine bir süreçtir: çok aşamalı jelkot cilalama, asit-baz yöntemiyle tik restorasyonu, seramik kaplama uygulaması ve özel kumaş ile deri bakımı. Detailing geri kazandırır; temizlik ise korur."));

  push(makeBlock("h3", "Yatımda evimde kullandığım temizlik ürünlerini kullanabilir miyim?"));
  push(makeBlock("normal", "Hayır. Standart deterjanlar jelkottan koruyucu mum ve polimer kaplamaları söker, UV hasarını hızlandırır. Çamaşır suyu dikiş ve branda emprenyesini bozar. Fosfatlı sabunlar Karadağ marina havzalarında yasaktır. Yalnızca pH dengeli, denize uygun, biyolojik olarak ayrışan ürünler kullanın."));

  push(makeBlock("h3", "72 saat kuralı nedir ve temizlikle nasıl ilişkilidir?"));
  push(makeBlock("normal", "Gümrüksüz yakıt hakkından yararlanmak için tekneler Karadağ karasularında en az 72 saat kalmak zorundadır. Kaptanlar bu zorunlu konaklamayı, bir sonraki rotaya çıkmadan önce kapsamlı dış ve iç detailing planlamak için en uygun pencere olarak değerlendirir."));

  push(makeBlock("h3", "Bora rüzgarına karşı yatımı Karadağ'da nasıl kışlatırım?"));
  push(makeBlock("normal", "Tüm tatlı su ve tesisat sistemlerini tamamen boşaltıp en az -50°F dereceye dayanıklı denize uygun antifrizle doldurun. Motor silindirlerini sisleme yağıyla kaplayın. Rüzgar yüzeyini en aza indirmek için tüm brandaları, biminileri ve sökülebilir ekleri kaldırın. İçeriye nem emici veya aktif nem alıcı yerleştirin. Kış aylarında her 2–4 haftada bir tekne kontrolü ayarlayın."));

  push(makeBlock("h3", "Karadağ marinalarında tekne yıkamasına ilişkin çevre kuralları nelerdir?"));
  push(makeBlock("normal", "Siyah su, gri su ve kimyasal sıvıların marina havzalarına doğrudan boşaltılması yasaktır. Borda yıkamasında Posidonia oceanica deniz çayırlarını korumak için biyolojik olarak ayrışan denize uygun deterjan kullanılmalıdır. Porto Montenegro TYHA Clean Marina sertifikasına sahiptir ve bu standartlar bağlamada uygulanır."));

  push(makeBlock("h3", "Karadağ'da yat temizliği için ters yönlü pazaryeri var mı?"));
  push(makeBlock("normal", "Evet — Glatko.app, yat sahiplerinin bakım taleplerini yayınlayıp doğrulanmış yerel deniz profesyonellerinden rekabetçi teklif almasını sağlar; geleneksel \"talep üzerine fiyat\" modelinin şeffafsızlığını ve sürtüşmesini ortadan kaldırır."));

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

  const docId = "yacht-cleaning-montenegro-tr";
  const articleTitle =
    "Karadağ'da Yat Temizliği: 2026 Boka Körfezi Rehberi — Fiyatlar ve Hizmetler";
  const seoTitle =
    "Karadağ'da Yat Temizliği: Fiyatlar, Hizmetler ve Güvenilir Ustalar (2026)";
  const seoDescription =
    "Karadağ'da profesyonel yat temizliği — Tivat, Kotor, Porto Montenegro fiyatları, hizmetler ve güvenilir ustalar. Glatko'da teklif alın.";
  const excerpt =
    "Karadağ'da profesyonel yat temizliği — Tivat, Kotor, Porto Montenegro fiyatları, hizmetler, mevzuat ve Glatko üzerinden güvenilir ustalar.";

  const doc = {
    _id: docId,
    _type: "post",
    title: { _type: "localeString", tr: articleTitle },
    slug: {
      _type: "localeSlug",
      tr: { _type: "slug", current: "karadagda-yat-temizligi" },
    },
    excerpt: { _type: "localeText", tr: excerpt },
    content: { _type: "localeRichText", tr: content },
    coverImage: {
      _type: "image",
      asset: { _type: "reference", _ref: HERO_ASSET_ID },
      alt: "Karadağ marinasında demirli yat, Boka Körfezi",
    },
    author: { _type: "reference", _ref: AUTHOR_ID },
    category: { _type: "reference", _ref: CATEGORY_ID },
    serviceCategoryRefs: ["boat-services"],
    publishedAt: new Date("2026-05-09T08:00:00.000Z").toISOString(),
    featured: false,
    seo: {
      _type: "seoMeta",
      metaTitle: { _type: "localeString", tr: seoTitle },
      metaDescription: { _type: "localeText", tr: seoDescription },
    },
  };

  console.log("\nCreating/updating TR post...");
  const result = await client.createOrReplace(doc);
  console.log(`Done: ${result._id}`);
  console.log(`Title TR: ${result.title?.tr}`);
  console.log(`Slug TR: ${result.slug?.tr?.current}`);
  console.log(`Cover image: ${result.coverImage ? "set" : "missing"}`);
  console.log(
    `\nPublic URL: https://glatko.app/tr/blog/karadagda-yat-temizligi`,
  );
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
