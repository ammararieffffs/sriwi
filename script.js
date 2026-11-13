gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   PHOTO SLIDESHOW
   ============================================================ */

const photos = [
  { src: "images/watikah-pelantikan-pengawas-2026.jpg", caption: "Watikah pelantikan pengawas 2026" },
  { src: "images/tahniah-murid-cemerlang-psra.jpg",     caption: "Tahniah murid cemerlang PSRA" },
  { src: "images/penyampaian-sijil-upkk-2025.jpg",      caption: "Penyampaian sijil UPKK 2025" },
  { src: "images/sambutan-bulan-kemerdekaan.jpg",       caption: "Sambutan Bulan Kemerdekaan" },
  { src: "images/persembahan-murid.jpg",                caption: "Persembahan murid" },
  { src: "images/bacaan-bersama-di-surau.jpg",          caption: "Bacaan bersama di surau" },
  { src: "images/suasana-dalam-kelas.jpg",              caption: "Suasana dalam kelas" },
  { src: "images/majlis-doa-bersama-ibu-bapa.jpg",      caption: "Majlis doa bersama ibu bapa" },
  { src: "images/majlis-ilmu-dan-doa-bersama.jpg",      caption: "Majlis ilmu dan doa bersama" },
  { src: "images/kunjungan-maskot-bersama-murid.jpg",   caption: "Kunjungan maskot bersama murid" },
  { src: "images/barisan-guru-sriwi.jpg",               caption: "Barisan guru SRIWI" }
];

const strip = document.getElementById("photo-strip");
const track = document.getElementById("photo-track");

if (strip && track) {
  // give each photo its own random tilt and height
  // neighbours lean opposite ways so it never looks flat
  const looks = photos.map((photo, i) => {
    const direction = i % 2 === 0 ? -1 : 1;
    const tilt = direction * gsap.utils.random(3, 7, 0.5); // 3° to 7°
    const lift = gsap.utils.random(-35, 35, 1);            // -35px to 35px up or down
    return `--tilt:${tilt}deg; --lift:${lift}px;`;
  });

  const cards = photos.map((photo, i) => `
    <figure style="${looks[i]}">
      <img src="${photo.src}" alt="${photo.caption}"${i < 4 ? "" : ' loading="lazy"'}>
      <figcaption>${photo.caption}</figcaption>
    </figure>`).join("");

  // photos added twice so the loop has no gap
  // (the copy gets the same tilt and height so the loop stays seamless)
  track.innerHTML = cards + cards.replace(/<figure /g, '<figure aria-hidden="true" ');

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // slide left by half the track (one full set of photos), then repeat forever
    const loop = gsap.to(track, {
      xPercent: -50,
      duration: 70, // smaller number = faster
      ease: "none",
      repeat: -1
    });

    // slow down smoothly on hover, speed back up when the mouse leaves
    const slowDown = () => gsap.to(loop, { timeScale: 0.3, duration: 0.6, overwrite: true });
    const speedUp  = () => gsap.to(loop, { timeScale: 1,   duration: 0.6, overwrite: true });
    strip.addEventListener("mouseenter", slowDown);
    strip.addEventListener("mouseleave", speedUp);

    // pause when the strip is off screen (saves battery on phones)
    ScrollTrigger.create({
      trigger: strip,
      start: "top bottom",
      end: "bottom top",
      onToggle: self => (self.isActive ? loop.play() : loop.pause())
    });

    // clean up if motion settings change
    return () => {
      strip.removeEventListener("mouseenter", slowDown);
      strip.removeEventListener("mouseleave", speedUp);
    };
  });
}
/* ============================================================
   WHY SRIWI
   ============================================================ */

   const why = document.querySelector(".why");

   if (why) {
     const list     = why.querySelector(".why-list");
     const items    = [...why.querySelectorAll(".why-item")];
     const bars     = items.map(item => item.querySelector(".why-progress"));
     const blob     = why.querySelector(".why-blob");
     const img      = blob.querySelector("img");
     const caption  = why.querySelector(".why-photo figcaption");
     const ring     = why.querySelector(".why-ring");
     const reduce   = matchMedia("(prefers-reduced-motion: reduce)").matches;
     const canHover = matchMedia("(hover: hover)").matches;
     const STEP     = 6; // seconds before moving to the next point
   
     // a different blob shape for each point
     const shapes = [
       "46% 54% 42% 58% / 34% 38% 62% 66%",
       "58% 42% 55% 45% / 45% 55% 45% 55%",
       "40% 60% 60% 40% / 55% 40% 60% 45%",
       "52% 48% 38% 62% / 42% 58% 42% 58%"
     ];
   
     let current  = Math.max(0, items.findIndex(item => item.classList.contains("is-active")));
     let autoplay = !reduce;
     let photoTl, timer;
   
     // load all photos early so switching is instant
     items.forEach(item => { new Image().src = item.dataset.photo; });
   
     // starting state
     items.forEach((item, i) => {
       gsap.set(item.querySelector(".why-body"), { height: i === current ? "auto" : 0 });
     });
     gsap.set(blob, { borderRadius: shapes[current % shapes.length] });
   
     function swapPhoto(item) {
       img.src = item.dataset.photo;
       img.alt = item.dataset.caption;
       caption.textContent = item.dataset.caption;
     }
   
     function show(i) {
       if (i === current) return;
       const oldItem = items[current];
       const newItem = items[i];
       current = i;
   
       oldItem.classList.remove("is-active");
       newItem.classList.add("is-active");
       oldItem.querySelector("button").setAttribute("aria-expanded", "false");
       newItem.querySelector("button").setAttribute("aria-expanded", "true");
   
       const oldBody = oldItem.querySelector(".why-body");
       const newBody = newItem.querySelector(".why-body");
   
       if (reduce) {
         gsap.set(oldBody, { height: 0 });
         gsap.set(newBody, { height: "auto" });
         swapPhoto(newItem);
         return;
       }
   
       // open / close the descriptions
       gsap.to(oldBody, { height: 0, duration: 0.5, ease: "power2.inOut", overwrite: true });
       gsap.to(newBody, { height: "auto", duration: 0.5, ease: "power2.inOut", overwrite: true });
       gsap.fromTo(newBody.querySelector("p"),
         { autoAlpha: 0, y: -8 },
         { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.15, overwrite: true });
   
       // change the photo and its blob shape
       if (photoTl) photoTl.progress(1).kill();
       photoTl = gsap.timeline()
         .to(img, { autoAlpha: 0, scale: 1.08, duration: 0.25, ease: "power1.in" })
         .call(swapPhoto, [newItem])
         .to(blob, {
           borderRadius: shapes[i % shapes.length],
           rotation: gsap.utils.random(-4, 4),
           duration: 0.9,
           ease: "elastic.out(1, 0.6)"
         }, 0)
         .to(img, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.25)
         .fromTo(caption, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.3);
     }
   
     /* ---------- autoplay ---------- */
   
     function startTimer() {
       if (!autoplay) return;
       if (timer) timer.kill();
       gsap.set(bars, { scaleX: 0 });
       timer = gsap.to(bars[current], {
         scaleX: 1,
         duration: STEP,
         ease: "none",
         onComplete: () => {
           show((current + 1) % items.length);
           startTimer();
         }
       });
     }
   
     function pauseTimer() {
       if (timer) timer.pause();
     }
   
     function stopAutoplay() {
       autoplay = false;
       if (timer) timer.kill();
       gsap.to(bars, { scaleX: 0, duration: 0.3 });
     }
   
     /* ---------- clicks and hover ---------- */
   
     items.forEach((item, i) => {
       const btn = item.querySelector("button");
       btn.addEventListener("click", () => { stopAutoplay(); show(i); });
       if (canHover) btn.addEventListener("mouseenter", () => show(i));
     });
   
     list.addEventListener("mouseenter", pauseTimer);
     list.addEventListener("mouseleave", startTimer);
   
     /* ---------- scroll ---------- */
   
     if (!reduce) {
       // autoplay only while the section is on screen
       ScrollTrigger.create({
         trigger: why,
         start: "top 60%",
         end: "bottom 40%",
         onEnter: startTimer,
         onEnterBack: startTimer,
         onLeave: pauseTimer,
         onLeaveBack: pauseTimer
       });
   
       // dashed outline slowly turning behind the photo
       gsap.to(ring, { rotation: 360, duration: 40, ease: "none", repeat: -1 });
   
       // entrance when the section scrolls into view
       const reveal = { trigger: why, start: "top 70%" };
       gsap.from(why.querySelectorAll(".why-eyebrow, h2"), {
         y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: reveal
       });
       gsap.from(items, {
         x: -30, autoAlpha: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: "power3.out", scrollTrigger: reveal
       });
       gsap.from(".why-photo", {
         scale: 0.85, rotation: -6, autoAlpha: 0, duration: 1.1, ease: "back.out(1.4)", scrollTrigger: reveal
       });
     }
   }
   /* ============================================================
   REGISTRATION STEPS
   ============================================================ */

const stepsSection = document.querySelector(".steps-section");

if (stepsSection) {
  const steps    = [...stepsSection.querySelectorAll(".step")];
  const circles  = steps.map(step => step.querySelector(".step-circle"));
  const lineFill = stepsSection.querySelector(".steps-line-fill");

  // light up a step (with a small bounce) or switch it off again
  const reach = (step, on) => {
    if (step.classList.contains("is-reached") === on) return;
    step.classList.toggle("is-reached", on);
    if (on) {
      gsap.fromTo(step.querySelector(".step-circle"),
        { scale: 1.25 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    }
  };

  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 1025px)",
      motionOK: "(prefers-reduced-motion: no-preference)"
    },
    context => {
      const { desktop, motionOK } = context.conditions;
      if (!motionOK) return; // no animation: all circles stay lit

      stepsSection.classList.add("is-animated");

      // entrance
      gsap.from(stepsSection.querySelectorAll(".steps-eyebrow, h2, .steps-lede"), {
        y: "1.563vw", autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: stepsSection, start: "top 75%" }
      });
      gsap.from(circles, {
        scale: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)",
        scrollTrigger: { trigger: ".steps", start: "top 85%" }
      });
      gsap.from(stepsSection.querySelectorAll(".step h3, .step p, .steps-cta"), {
        y: "1.042vw", autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: "power2.out",
        scrollTrigger: { trigger: ".steps", start: "top 85%" }
      });

      if (desktop) {
        // lime line fills as you scroll; circles light up when it reaches them
        const last = steps.length - 1;
        gsap.fromTo(lineFill,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: ".steps-wrap",
              start: "top 70%",
              end: "bottom 45%",
              scrub: 0.6
            },
            onUpdate() {
              const p = this.progress();
              steps.forEach((step, i) => {
                const needed = i === 0 ? 0.001 : i / last - 0.001;
                reach(step, p >= needed);
              });
            }
          });
      } else {
        // phones: each step lights up as it scrolls into view
        steps.forEach(step => {
          ScrollTrigger.create({
            trigger: step,
            start: "top 75%",
            onEnter: () => reach(step, true),
            onLeaveBack: () => reach(step, false)
          });
        });
      }

      // clean up when the screen size or motion setting changes
      return () => {
        stepsSection.classList.remove("is-animated");
        steps.forEach(step => step.classList.remove("is-reached"));
      };
    }
  );
}
/* ============================================================
   FEES (YURAN)
   ============================================================ */

// edit prices here: one row = one item, values = Darjah 1 to 6
// rows starting with "Jumlah" are highlighted automatically
const feeClasses = ["Darjah 1", "Darjah 2", "Darjah 3", "Darjah 4", "Darjah 5", "Darjah 6"];

const fees = [
  {
    label: "Bayaran wajib (yuran permulaan)",
    rows: [
      { item: "Jumlah", values: [350, 350, 350, 350, 400, 400] }
    ]
  },
  {
    label: "Keperluan murid",
    rows: [
      { item: "Pelajar baru", values: [85, 65, 65, 65, 65, 65] },
      { item: "Pelajar lama", values: [85, 28, 28, 28, 28, 28] }
    ]
  },
  {
    label: "Yuran bulanan",
    note: "Pakej 3 bulan: RM1,290 (diskaun RM30).",
    rows: [
      { item: "Yuran KAFA",         values: [150, 150, 150, 150, 150, 150] },
      { item: "Yuran transit",      values: [200, 200, 200, 200, 200, 200] },
      { item: "Yuran pengangkutan", values: [90, 90, 90, 90, 90, 90] },
      { item: "Jumlah sebulan",     values: [440, 440, 440, 440, 440, 440] }
    ]
  },
  {
    label: "Keperluan tambahan",
    rows: [
      { item: "Jumlah", values: [100, 100, 100, 100, 750, 750] }
    ]
  },
  {
    label: "Kedai sekolah: buku & keperluan",
    note: "Butiran item setiap darjah ada dalam poster Senarai Keperluan Kedai Sekolah.",
    rows: [
      { item: "Jumlah buku & keperluan",     values: [180, 180, 200, 206, 250, 250] },
      { item: "T-shirt sekolah (lelaki)",    values: [35.5, 35.5, 35.5, 35.5, 35.5, 35.5] },
      { item: "T-shirt sekolah (perempuan)", values: [40.5, 40.5, 40.5, 40.5, 40.5, 40.5] }
    ]
  }
];

const feesSection = document.querySelector(".fees");

if (feesSection) {
  const tabsEl    = feesSection.querySelector(".fees-tabs");
  const indicator = tabsEl.querySelector(".fees-tab-indicator");
  const panel     = feesSection.querySelector(".fees-table-wrap");
  const thead     = panel.querySelector("thead");
  const tbody     = panel.querySelector("tbody");
  const noteEl    = feesSection.querySelector(".fees-note");
  const reduce    = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const money = n =>
    Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let current = 0;

  /* ---------- build the tabs ---------- */

  fees.forEach((group, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fees-tab";
    btn.id = `fees-tab-${i}`;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-controls", "fees-panel");
    btn.setAttribute("aria-selected", i === current);
    btn.tabIndex = i === current ? 0 : -1;
    btn.textContent = group.label;
    btn.addEventListener("click", () => select(i));
    tabsEl.appendChild(btn);
  });

  const tabs = [...tabsEl.querySelectorAll(".fees-tab")];

  // arrow keys move between tabs
  tabsEl.addEventListener("keydown", e => {
    const last = tabs.length - 1;
    let next = null;
    if (e.key === "ArrowRight") next = current === last ? 0 : current + 1;
    if (e.key === "ArrowLeft")  next = current === 0 ? last : current - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End")  next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabs[next].focus();
  });

  /* ---------- sliding lime highlight ---------- */

  function moveIndicator(instant = false) {
    const tab = tabs[current];
    const box = { x: tab.offsetLeft, y: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight };
    if (instant || reduce) gsap.set(indicator, box);
    else gsap.to(indicator, { ...box, duration: 0.5, ease: "power3.out", overwrite: true });
  }

  /* ---------- numbers counting up ---------- */

  function countUp(cells) {
    cells.forEach(cell => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: parseFloat(cell.dataset.value),
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => { cell.textContent = money(counter.value); }
      });
    });
  }

  /* ---------- the table ---------- */

  function renderTable(animate) {
    const group = fees[current];
    const oldHeight = panel.offsetHeight;

    thead.innerHTML = `<tr><th scope="col">Perkara</th>${
      feeClasses.map(c => `<th scope="col">${c}</th>`).join("")
    }</tr>`;

    tbody.innerHTML = group.rows.map(row => `
      <tr class="${row.item.startsWith("Jumlah") ? "is-total" : ""}">
        <th scope="row">${row.item}</th>
        ${row.values.map(v => `<td data-value="${v}">${money(v)}</td>`).join("")}
      </tr>`).join("");

    noteEl.textContent = group.note || "";
    panel.setAttribute("aria-labelledby", `fees-tab-${current}`);

    if (!animate || reduce) return;

    // grow or shrink smoothly to the new height
    gsap.fromTo(panel, { height: oldHeight }, {
      height: "auto", duration: 0.4, ease: "power2.inOut", clearProps: "height"
    });
    gsap.from(tbody.querySelectorAll("tr"), {
      autoAlpha: 0, y: "0.833vw", duration: 0.4, stagger: 0.06, ease: "power2.out"
    });
    countUp(tbody.querySelectorAll("td"));
  }

  function select(i) {
    if (i === current) return;
    current = i;
    tabs.forEach((tab, j) => {
      tab.setAttribute("aria-selected", j === i);
      tab.tabIndex = j === i ? 0 : -1;
    });
    moveIndicator();
    renderTable(true);
  }

  /* ---------- start ---------- */

  renderTable(false);
  moveIndicator(true);
  document.fonts && document.fonts.ready.then(() => moveIndicator(true));
  window.addEventListener("resize", () => moveIndicator(true));

  if (!reduce) {
    // numbers start at 0 and count up the first time the table is seen
    tbody.querySelectorAll("td").forEach(td => { td.textContent = money(0); });
    ScrollTrigger.create({
      trigger: panel,
      start: "top 80%",
      once: true,
      onEnter: () => countUp(tbody.querySelectorAll("td"))
    });

    // entrance
    gsap.from(feesSection.querySelectorAll(".fees-intro > *"), {
      y: "1.563vw", autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: feesSection, start: "top 75%" }
    });
    gsap.from(feesSection.querySelectorAll(".fees-poster"), {
      y: "2.604vw", rotation: 12, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.6)",
      scrollTrigger: { trigger: feesSection, start: "top 75%" }
    });
  }

  /* ---------- big poster viewer ---------- */

  const viewer    = document.getElementById("poster-viewer");
  const viewerImg = viewer.querySelector("img");

  feesSection.querySelectorAll(".fees-poster").forEach(poster => {
    poster.addEventListener("click", () => {
      viewerImg.src = poster.dataset.full;
      viewerImg.alt = poster.querySelector("img").alt;
      viewer.showModal();
      if (!reduce) {
        gsap.fromTo(viewerImg,
          { scale: 0.85, rotation: -3, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.5)" });
      }
    });
  });

  viewer.querySelector(".poster-close").addEventListener("click", () => viewer.close());
  // clicking the dark area around the poster closes it
  viewer.addEventListener("click", e => { if (e.target === viewer) viewer.close(); });
}
/* ============================================================
   MOTTO STRIP
   ============================================================ */

   const mottoTrack = document.querySelector(".motto-track");

   if (mottoTrack) {
     const star = `<svg class="motto-star" viewBox="0 0 24 24"><path d="M12 0l2.6 6.3L21 3l-3.3 6.4L24 12l-6.3 2.6L21 21l-6.4-3.3L12 24l-2.6-6.3L3 21l3.3-6.4L0 12l6.3-2.6L3 3l6.4 3.3z"/></svg>`;
     const words = ["Berilmu", "Beriman", "Berinovasi"];
   
     // one set is repeated 3 times so it's wider than the screen, then doubled for the loop
     const set = words.map(w => `<span class="motto-word">${w}</span>${star}`).join("").repeat(3);
     mottoTrack.innerHTML = set + set;
   
     gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
       const loop = gsap.to(mottoTrack, {
         xPercent: -50,
         duration: 40, // smaller number = faster
         ease: "none",
         repeat: -1,
         // keeps looping when it runs backwards
         onReverseComplete() {
           this.totalTime(this.rawTime() + this.duration() * 100);
         }
       });
   
       // follows the scroll direction: scroll down = left, scroll up = right
       ScrollTrigger.create({
         onUpdate: self => gsap.to(loop, { timeScale: self.direction, duration: 0.4, overwrite: true })
       });
     });
   }
   
   /* ============================================================
      GALLERY
      ============================================================ */
   
   const gallery = document.querySelector(".gallery");
   
   if (gallery) {
     const grid   = gallery.querySelector(".gallery-grid");
     const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
   
     // same photos as the slideshow
     grid.innerHTML = photos.map((photo, i) => `
       <figure class="gallery-item">
         <button type="button" class="gallery-open" data-index="${i}" aria-label="Lihat gambar: ${photo.caption}">
           <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
         </button>
         <figcaption>${photo.caption}</figcaption>
       </figure>`).join("");
   
     /* ---------- entrance ---------- */
   
     if (!reduce) {
       gsap.from(gallery.querySelectorAll(".gallery-eyebrow, h2, .gallery-lede"), {
         y: "1.563vw", autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
         scrollTrigger: { trigger: gallery, start: "top 75%" }
       });
   
       const items = gallery.querySelectorAll(".gallery-item");
       gsap.set(items, { y: "2.604vw", autoAlpha: 0 });
       ScrollTrigger.batch(items, {
         start: "top 90%",
         once: true,
         onEnter: batch => gsap.to(batch, {
           y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true
         })
       });
   
       // photos load late (lazy), so recalculate scroll positions as they arrive
       let wait;
       grid.addEventListener("load", () => {
         clearTimeout(wait);
         wait = setTimeout(() => ScrollTrigger.refresh(), 200);
       }, true);
     }
   
     /* ---------- big photo viewer ---------- */
   
     const viewer  = document.getElementById("gallery-viewer");
     const img     = viewer.querySelector(".gv-figure img");
     const caption = viewer.querySelector(".gv-caption");
     const count   = viewer.querySelector(".gv-count");
     let index = 0;
     let slide;
   
     function showPhoto(i, direction = 0) {
       index = (i + photos.length) % photos.length;
       const photo = photos[index];
   
       const update = () => {
         img.src = photo.src;
         img.alt = photo.caption;
         caption.textContent = photo.caption;
         count.textContent = `${index + 1} / ${photos.length}`;
       };
   
       if (slide) slide.progress(1).kill();
   
       if (reduce) { update(); return; }
   
       if (direction === 0) {
         // opening: photo grows in
         update();
         gsap.fromTo(img, { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.5)" });
         return;
       }
   
       // next / previous: old photo slides out, new one slides in from the other side
       slide = gsap.timeline()
         .to(img, { x: `${-direction * 3}vw`, autoAlpha: 0, duration: 0.2, ease: "power1.in" })
         .call(update)
         .fromTo(img, { x: `${direction * 3}vw`, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
     }
   
     const next = () => showPhoto(index + 1, 1);
     const prev = () => showPhoto(index - 1, -1);
   
     grid.addEventListener("click", e => {
       const btn = e.target.closest(".gallery-open");
       if (!btn) return;
       viewer.showModal();
       showPhoto(Number(btn.dataset.index));
     });
   
     viewer.querySelector(".gv-next").addEventListener("click", next);
     viewer.querySelector(".gv-prev").addEventListener("click", prev);
     viewer.querySelector(".gv-close").addEventListener("click", () => viewer.close());
   
     // click the dark area to close
     viewer.addEventListener("click", e => { if (e.target === viewer) viewer.close(); });
   
     // arrow keys (Esc closes by itself)
     viewer.addEventListener("keydown", e => {
       if (e.key === "ArrowRight") next();
       if (e.key === "ArrowLeft") prev();
     });
   
     // swipe on phones
     let startX = null;
     viewer.addEventListener("pointerdown", e => { startX = e.clientX; });
     viewer.addEventListener("pointerup", e => {
       if (startX === null) return;
       const moved = e.clientX - startX;
       startX = null;
       if (Math.abs(moved) > 40) moved < 0 ? next() : prev();
     });
   }
   /* ============================================================
   SERVICES (PERKHIDMATAN)
   ============================================================ */

const services = document.querySelector(".services");

if (services) {
  const cards = [...services.querySelectorAll(".service-card")];

  // lime glow follows the mouse inside each card
  cards.forEach(card => {
    card.addEventListener("pointermove", e => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - box.left) / box.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - box.top) / box.height) * 100}%`);
    });
  });

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const reveal = { trigger: ".services-grid", start: "top 80%" };

    gsap.from(services.querySelectorAll(".services-eyebrow, h2, .services-lede"), {
      y: "1.563vw", autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: services, start: "top 75%" }
    });

    // cards rise in with a small tilt
    gsap.from(cards, {
      y: "3.125vw",
      rotation: i => (i % 2 ? 2 : -2),
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: reveal
    });

    // icons pop in after the cards
    gsap.from(services.querySelectorAll(".service-icon"), {
      scale: 0,
      rotation: -45,
      duration: 0.6,
      stagger: 0.12,
      delay: 0.3,
      ease: "back.out(2)",
      scrollTrigger: reveal
    });
  });
}
/* ============================================================
   BRANCHES (CAWANGAN)
   ============================================================ */

   const branches = document.querySelector(".branches");

   if (branches) {
     gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
       const reveal = { trigger: ".branches-grid", start: "top 80%" };
   
       gsap.from(branches.querySelectorAll(".branches-eyebrow, h2, .branches-lede"), {
         y: "1.563vw", autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
         scrollTrigger: { trigger: branches, start: "top 75%" }
       });
   
       // cards rise in
       gsap.from(branches.querySelectorAll(".branch"), {
         y: "3.125vw", autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
         scrollTrigger: reveal
       });
   
       // pins drop onto the cards with a bounce
       gsap.from(branches.querySelectorAll(".branch-pin"), {
         y: "-4.167vw", autoAlpha: 0, duration: 1, stagger: 0.15, delay: 0.35, ease: "bounce.out",
         scrollTrigger: reveal
       });
   
       // address and buttons fade in last
       gsap.from(branches.querySelectorAll(".branch address, .branch-actions"), {
         y: "1.042vw", autoAlpha: 0, duration: 0.6, stagger: 0.08, delay: 0.5, ease: "power2.out",
         scrollTrigger: reveal
       });
     });
   }
   /* ============================================================
   CLOSING (DAFTAR UNTUK SESI 2027)
   ============================================================ */

const closing = document.querySelector(".closing");

if (closing) {
  // on computers, clicking a contact copies it (phones call / open email instead)
  if (matchMedia("(hover: hover)").matches && navigator.clipboard) {
    closing.querySelectorAll(".contact-chip").forEach(chip => {
      chip.addEventListener("click", e => {
        e.preventDefault();
        navigator.clipboard.writeText(chip.dataset.copy).then(() => {
          chip.classList.add("is-copied");
          setTimeout(() => chip.classList.remove("is-copied"), 1500);
        });
      });
    });
  }

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const words = closing.querySelectorAll(".closing-title span");
    const year  = closing.querySelector(".closing-year");
    const counter = { value: 2020 };
    year.textContent = "2020";

    const tl = gsap.timeline({ scrollTrigger: { trigger: closing, start: "top 70%" } });

    // words pop up one by one with a little tilt
    tl.from(words, {
      yPercent: 60,
      rotation: i => (i % 2 ? 6 : -6),
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "back.out(1.7)"
    })
      // the year counts up to 2027
      .to(counter, {
        value: 2027,
        duration: 1.2,
        ease: "power2.out",
        snap: { value: 1 },
        onUpdate: () => { year.textContent = counter.value; }
      }, 0.2)
      .from(closing.querySelectorAll(".closing-lede, .closing-actions"), {
        y: "1.042vw", autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
      }, "-=0.8")
      .from(closing.querySelectorAll(".contact-chip"), {
        y: "1.563vw", scale: 0.9, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "back.out(1.6)"
      }, "-=0.4");

    // put the real year back if animations are switched off
    return () => { year.textContent = "2027"; };
  });
}

/* ============================================================
   FOOTER
   ============================================================ */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
}

/* ============================================================
   FLOATING WHATSAPP BUTTON
   ============================================================ */

const waFloat = document.querySelector(".wa-float");

if (waFloat) {
  let pastHero = false;
  let atClosing = false;
  const update = () => waFloat.classList.toggle("is-visible", pastHero && !atClosing);

  // show after scrolling past most of the hero
  ScrollTrigger.create({
    start: () => window.innerHeight * 0.6,
    end: "max",
    onToggle: self => { pastHero = self.isActive; update(); }
  });

  // hide again when the closing section is on screen (it has its own buttons)
  if (closing) {
    ScrollTrigger.create({
      trigger: closing,
      start: "top bottom",
      end: "max",
      onToggle: self => { atClosing = self.isActive; update(); }
    });
  }
}/* ============================================================
   HERO
   ============================================================ */

const hero = document.querySelector(".hero");

if (hero) {
  const arabic  = hero.querySelector(".arab");
  const title   = hero.querySelector("h1");
  const intro   = hero.querySelector("p");
  const buttons = hero.querySelector(".hero-btns");

  // split the title at each <br> so every line can slide up on its own
  title.innerHTML = title.innerHTML
    .split(/<br\s*\/?>/i)
    .map(line => `<span class="hero-line"><span>${line.trim()}</span></span>`)
    .join("");

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const intro_tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    intro_tl
      // nav slides down
      .from(".nav", { y: "-6vw", autoAlpha: 0, duration: 0.8 })
      // Arabic name fades up
      .from(arabic, { y: "1.5vw", autoAlpha: 0, duration: 0.6 }, "-=0.4")
      // title lines slide up one by one
      .from(title.querySelectorAll(".hero-line > span"), {
        yPercent: 110, rotation: 3, duration: 0.9, stagger: 0.12
      }, "-=0.3")
      // intro text and buttons
      .from(intro, { y: "1.5vw", autoAlpha: 0, duration: 0.7 }, "-=0.5")
      .from(buttons, { y: "1.5vw", scale: 0.95, autoAlpha: 0, duration: 0.7, ease: "back.out(1.6)" }, "-=0.45")
      // slideshow rises in
      .from(".photo-strip", { y: "4vw", autoAlpha: 0, duration: 1 }, "-=0.4")
      // memo icon wiggles
      .to(buttons.querySelector("img"), {
        rotation: -14, duration: 0.15, repeat: 5, yoyo: true, ease: "sine.inOut"
      }, "-=0.3");

    // after the entrance: text drifts up at different speeds while scrolling
    intro_tl.eventCallback("onComplete", () => {
      gsap.to([arabic, title, intro, buttons], {
        y: i => `-${(i + 1) * 1.5}vw`,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });
  });

  // everything is ready: show the hero (the timeline has already hidden what it animates)
  document.documentElement.classList.remove("hero-loading");
}
/* ============================================================
   SMOOTH SCROLLING (Lenis)
   ============================================================ */

   const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

   if (window.Lenis && !reduceMotion) {
     const lenis = new Lenis({
       lerp: 0.04,          // smaller = smoother and slower, bigger = snappier
       wheelMultiplier: 1  // how far one wheel turn scrolls
     });
     window.lenis = lenis;
   
     // keep ScrollTrigger in sync with Lenis
     lenis.on("scroll", ScrollTrigger.update);
     gsap.ticker.add(time => lenis.raf(time * 1000));
     gsap.ticker.lagSmoothing(0);
   
     // menu links and other "#section" links glide to their section
     document.addEventListener("click", e => {
       const link = e.target.closest('a[href^="#"]');
       if (!link) return;
       const target = document.querySelector(link.getAttribute("href"));
       if (!target) return;
       e.preventDefault();
       const navHeight = document.querySelector(".nav")?.offsetHeight || 0;
       lenis.scrollTo(target, { offset: -(navHeight + 20), duration: 1.4 });
     });
   
     // stop the page scrolling behind the photo / poster viewers
     document.querySelectorAll("dialog").forEach(dialog => {
       new MutationObserver(() => {
         dialog.open ? lenis.stop() : lenis.start();
       }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
     });
   }
   /* ============================================================
   MENU BUTTON (tablets and phones)
   ============================================================ */

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");

if (nav && navToggle) {
  const setMenu = open => {
    nav.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open);
    navToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };

  navToggle.addEventListener("click", () => setMenu(!nav.classList.contains("nav-open")));

  // close after choosing a link, tapping outside, or pressing Esc
  nav.querySelectorAll(".nav-loc a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", e => { if (!nav.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
}
  document.getElementById("download-fees").addEventListener("click", (e) => {
    e.preventDefault();

alert("Sedang memuat turun dokumen pendaftaran");

    const files = [
      "images/dokumen-pendaftaran-sriwi-2027.pdf"    ];

    files.forEach((file) => {
      const link = document.createElement("a");
      link.href = file;
      link.download = file.split("/").pop();

      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  });
