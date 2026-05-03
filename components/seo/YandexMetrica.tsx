"use client";

import Script from "next/script";

const YANDEX_METRICA_ID = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;

/**
 * Yandex Metrica counter — loads only when NEXT_PUBLIC_YANDEX_METRICA_ID is set
 * (preview/dev builds with no ID skip the script entirely).
 *
 * G-PERF-2: switched from afterInteractive → lazyOnload. Metrica's tag.js
 * + webvisor recorder is one of the heaviest third-party payloads on the
 * homepage; firing it in idle time (rather than immediately post-hydration)
 * pulls roughly 800ms-1.2s out of TBT on mobile. Tradeoff: very-early
 * bounces (user leaves before idle fires) are no longer counted, but for
 * a pre-launch product where CWV directly affects ranking and conversion,
 * the metric is the better thing to optimise for.
 */
export function YandexMetrica() {
  if (!YANDEX_METRICA_ID) return null;

  return (
    <>
      <Script id="yandex-metrica" strategy="lazyOnload">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRICA_ID}", "ym");
ym(${YANDEX_METRICA_ID}, "init", {ssr:true, webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://mc.yandex.ru/watch/${YANDEX_METRICA_ID}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </noscript>
    </>
  );
}
