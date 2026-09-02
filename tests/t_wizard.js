/* تست یکپارچه v2: ویزارد → انتخاب برنامه → تیک حرکت */
function loadJsdom(){
  for(const p of ["jsdom","../../Projeyar/tests/node_modules/jsdom"]){
    try{ return require(p); }catch(e){}
  }
  console.error("jsdom not found — run: npm i jsdom"); process.exit(1);
}
const {JSDOM} = loadJsdom();
const html = require("fs").readFileSync(__dirname + "/../index.html", "utf8");
const errs = [];
const dom = new JSDOM(html, {runScripts: "dangerously", pretendToBeVisual: true, url: "https://gympro.local/"});
dom.window.addEventListener("error", e => errs.push(e.message));

setTimeout(() => {
 try{
  const d = dom.window.document;
  const out = {errs};

  out.wizOpenOnBoot = d.getElementById("wizard").classList.contains("open");

  // گام ۱
  d.querySelector('.seg[data-key="sex"] button[data-v="m"]').click();
  d.getElementById("wAge").value = "30";
  d.getElementById("wHeight").value = "178";
  d.getElementById("wWeight").value = "80";
  d.getElementById("wAge").dispatchEvent(new dom.window.Event("input", {bubbles: true}));
  d.getElementById("wzNext").click();
  out.step2 = d.querySelector('.wz-step[data-step="2"]').classList.contains("on");

  // گام ۲
  d.querySelector('.seg[data-key="goal"] button[data-v="muscle"]').click();
  d.querySelector('.seg[data-key="exp"] button[data-v="inter"]').click();
  d.getElementById("wzNext").click();

  // گام ۳: پاک‌کردن انتخاب‌های پیش‌فرض، سپس شنبه، یکشنبه، سه‌شنبه، چهارشنبه
  [...d.querySelectorAll('.seg[data-key="daypick"] button.sel')].forEach(b => b.click());
  [0, 1, 3, 4].forEach(v => d.querySelector(`.seg[data-key="daypick"] button[data-v="${v}"]`).click());
  out.dayCountTxt = d.getElementById("dayCountTxt").textContent.trim();
  d.getElementById("wzNext").click();
  out.step4 = d.querySelector('.wz-step[data-step="4"]').classList.contains("on");
  out.schedTr = [...d.querySelectorAll(".plan.best .sched i.tr")].map(i => i.textContent.replace(" ✓", ""));

  // کارت‌های برنامه
  out.plans = [...d.querySelectorAll(".plan")].map(p => ({
    name: p.querySelector("h3").textContent,
    best: p.classList.contains("best"),
    fit: p.querySelector(".fit b").textContent,
  }));

  // انتخاب برنامه دوم (تست حق انتخاب)
  d.querySelectorAll("[data-pick]")[1].click();
  out.wizClosed = !d.getElementById("wizard").classList.contains("open");
  out.tabs = d.querySelectorAll(".day-tab").length;
  out.trainTabs = [...d.querySelectorAll(".day-tab")].filter(t => !t.textContent.includes("استراحت")).length;
  out.trainDayNames = [...d.querySelectorAll(".day-tab")]
    .filter(t => !t.textContent.includes("استراحت"))
    .map(t => t.querySelector("b").textContent);
  out.chip = d.getElementById("progChip").textContent.trim();
  out.stats = d.querySelectorAll(".stat").length;

  // اگر امروز روز تمرین است پنل حرکت دارد؛ در غیر صورت به اولین روز تمرین برو
  let exs = d.querySelectorAll(".ex");
  if (!exs.length) {
    const firstTrain = [...d.querySelectorAll(".day-tab")].find(t => !t.textContent.includes("استراحت"));
    firstTrain.click();
    exs = d.querySelectorAll(".ex");
  }
  out.exCount = exs.length;
  const pctBefore = d.getElementById("dayPct") ? d.getElementById("dayPct").textContent : "-";
  exs[0].dispatchEvent(new dom.window.MouseEvent("click", {bubbles: true}));
  out.pctBefore = pctBefore;
  out.pctAfter = d.getElementById("dayPct") ? d.getElementById("dayPct").textContent : "-";
  out.ring = d.getElementById("ringPct").textContent;
  out.miniBars = d.querySelectorAll(".mb").length;

  // ذخیره‌سازی و بازخوانی (شبیه‌سازی رفرش با همان localStorage)
  const ls = dom.window.localStorage;
  out.savedProfile = !!ls.getItem("gympro.profile.v1");
  out.savedDone = ls.getItem("gympro.done.v2");

  console.log(JSON.stringify(out, null, 1));
  process.exit(errs.length ? 2 : 0);
 }catch(e){ console.error("TEST FAIL:", e.stack); process.exit(3); }
}, 400);
