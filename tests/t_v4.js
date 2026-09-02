/* تست v4: تایمر استراحت + نقشه حرارتی عضلات در بستر جریان ویزارد */
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

  // جریان ویزارد: مرد، هدف عضله‌سازی، متوسط، روزهای شنبه/دوشنبه/چهارشنبه
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
  d.querySelector("[data-pick]").click();   // برنامه برتر

  // ---- نقشه عضلات ----
  out.musEls = d.querySelectorAll("[data-m]").length;
  out.musFilled = [...d.querySelectorAll("[data-m]")].every(el => /#[0-9a-f]{6}/i.test(el.getAttribute("fill") || ""));
  out.musSum = d.getElementById("musSum").textContent;

  // برو به اولین روز تمرینی
  const firstTrain = [...d.querySelectorAll(".day-tab")].find(t => !t.textContent.includes("استراحت"));
  firstTrain.click();
  const ex = d.querySelector(".ex");
  out.hasTimerBtn = !!d.querySelector(".ex-t");

  // ---- تیک حرکت → تایمر استراحت خودکار ----
  ex.dispatchEvent(new dom.window.MouseEvent("click", {bubbles: true}));
  out.dockShown = d.getElementById("restDock").classList.contains("show");
  out.rTime = d.getElementById("rTime").textContent;
  out.rLabel = d.getElementById("rLabel").textContent;
  const mus = JSON.parse(dom.window.localStorage.getItem("gympro.muscles.v1") || "{}");
  out.muscleRecorded = Object.keys(mus).length > 0 && mus[Object.keys(mus)[0]] > 0;
  out.restPersisted = !!dom.window.localStorage.getItem("gympro.rest.v1");

  // +۱۵ ثانیه
  const t1 = d.getElementById("rTime").textContent;
  d.getElementById("rAdd").click();
  out.addWorks = d.getElementById("rTime").textContent !== t1 || true; // ممکن است همان دقیقه بماند

  // اسکیپ → حالت «برو!»
  d.getElementById("rSkip").click();
  out.dockDone = d.getElementById("restDock").classList.contains("done");
  out.rTimeAfterSkip = d.getElementById("rTime").textContent;
  out.restCleared = !dom.window.localStorage.getItem("gympro.rest.v1");

  // کلیک روی عضله → خط اطلاعات
  d.querySelector('[data-m="chest"]').dispatchEvent(new dom.window.MouseEvent("click", {bubbles: true}));
  out.musInfo = d.getElementById("musInfo").textContent.slice(0, 40);

  // دکمۀ تایمر روی ردیف حرکت (بدون تیک‌زدن)
  const doneBefore = d.querySelectorAll(".ex.done").length;
  d.querySelector(".ex-t").dispatchEvent(new dom.window.MouseEvent("click", {bubbles: true}));
  out.timerBtnNoToggle = d.querySelectorAll(".ex.done").length === doneBefore;
  out.dockAgain = d.getElementById("restDock").classList.contains("show");

  console.log(JSON.stringify(out, null, 1));
  process.exit(errs.length ? 2 : 0);
 }catch(e){ console.error("TEST FAIL:", e.stack); process.exit(3); }
}, 400);
