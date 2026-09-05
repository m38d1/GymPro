/* تست v6: دستیار گام‌به‌گام تمرین (کوچ) */
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

  // ویزارد: مرد / عضله‌سازی / متوسط / شنبه‌دوشنبه‌چهارشنبه
  [...d.querySelectorAll('.seg[data-key="daypick"] button.sel')].forEach(b => b.click());
  d.querySelector('.seg[data-key="sex"] button[data-v="m"]').click();
  d.getElementById("wAge").value = "30";
  d.getElementById("wHeight").value = "178";
  d.getElementById("wWeight").value = "80";
  d.getElementById("wzNext").click();
  d.querySelector('.seg[data-key="goal"] button[data-v="muscle"]').click();
  d.querySelector('.seg[data-key="exp"] button[data-v="inter"]').click();
  d.getElementById("wzNext").click();
  [0, 2, 4].forEach(v => d.querySelector(`.seg[data-key="daypick"] button[data-v="${v}"]`).click());
  d.getElementById("wzNext").click();
  d.querySelector("[data-pick]").click();

  // برو به اولین روز تمرینی و کوچ را باز کن
  const firstTrain = [...d.querySelectorAll(".day-tab")].find(t => !t.textContent.includes("استراحت"));
  firstTrain.click();
  d.getElementById("coachBtn").click();
  out.coachOpen = d.getElementById("coach").classList.contains("open");
  out.ex1 = d.getElementById("coachEx").textContent;
  out.set1 = d.getElementById("coachSet").textContent;
  out.ringHiddenAtStart = !d.getElementById("coachRing").classList.contains("show");

  // ست ۱ تمام → استراحت
  d.getElementById("coachDone").click();
  out.restPhase = d.getElementById("coachRing").classList.contains("show");
  out.time = d.getElementById("coachTime").textContent;
  out.skipVisible = d.getElementById("coachSkipRest").style.display !== "none";
  out.nextLabel = d.getElementById("coachNext").textContent;

  // رد استراحت → ست ۲
  d.getElementById("coachSkipRest").click();
  out.set2 = d.getElementById("coachSet").textContent;
  out.ringHidden = !d.getElementById("coachRing").classList.contains("show");

  // تا پایان تمرین ادامه بده (work → done، rest → skip)
  let guard = 0;
  while (guard++ < 80) {
    if (d.getElementById("coachEx").textContent.includes("تمرین کامل شد")) break;
    if (d.getElementById("coachSkipRest").style.display !== "none") d.getElementById("coachSkipRest").click();
    else d.getElementById("coachDone").click();
  }
  out.guard = guard;
  out.finished = d.getElementById("coachEx").textContent.includes("تمرین کامل شد");
  out.doneBtnText = d.getElementById("coachDone").textContent;

  // همه حرکت‌ها در done ثبت شده؟
  const ls = JSON.parse(dom.window.localStorage.getItem("gympro.done.v2") || "{}");
  const dayId = firstTrain.dataset.day;
  const doneCount = (ls.map[dayId] || []).length;
  const trainTabs = [...d.querySelectorAll(".day-tab")].filter(t => !t.textContent.includes("استراحت"));
  const dayIdx = trainTabs.findIndex(t => t.dataset.day === dayId);
  out.doneCount = doneCount;
  const exCount = [...d.querySelectorAll(".mb")][dayIdx] ? null : null;
  out.ring = d.getElementById("ringPct").textContent;
  out.dayComplete = [...d.querySelectorAll(".mb")].some(m => m.textContent.includes("۱۰۰"));

  // خروج از کوچ
  d.getElementById("coachDone").click();
  out.coachClosed = !d.getElementById("coach").classList.contains("open");

  console.log(JSON.stringify(out, null, 1));
  process.exit(errs.length ? 2 : 0);
 }catch(e){ console.error("TEST FAIL:", e.stack); process.exit(3); }
}, 400);
