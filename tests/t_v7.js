/* تست v7: پنجره «چه تازه است» */
function loadJsdom(){
  for(const p of ["jsdom","../../Projeyar/tests/node_modules/jsdom"]){
    try{ return require(p); }catch(e){}
  }
  console.error("jsdom not found — run: npm i jsdom"); process.exit(1);
}
const {JSDOM} = loadJsdom();
const html = require("fs").readFileSync(__dirname + "/../index.html", "utf8");
const errs = [];

function boot(seed){
  const dom = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, url: "https://gympro.local/",
    beforeParse(w){ if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v); }
  });
  dom.window.addEventListener("error", e => errs.push(e.message));
  return dom;
}

setTimeout(() => {
 try{
  const out = {errs};
  const d1 = boot({
    "gympro.seen.v1":"5",
    "gympro.profile.v1": JSON.stringify({sex:"m", age:30, h:178, w:80, goal:"muscle", exp:"inter", days:3, dayIdx:[0,2,4], programId:"ppl3"}),
    "gympro.done.v2": JSON.stringify({prog:"ppl3", map:{}}),
  }).window.document;

  // ۱) کاربر بازگشته (seen=5 < 7) → پنجره خودکار
  out.autoOpen = d1.getElementById("whatsNew").classList.contains("open");
  out.wizClosed = !d1.getElementById("wizard").classList.contains("open");
  const cards1 = d1.querySelectorAll("#wnList .wn-entry");
  out.entriesAuto = cards1.length;                       // انتظار: ۲ (v6,v7)
  out.firstNew = cards1[0].classList.contains("new");
  out.firstText = cards1[0].textContent.includes("اعلان تازه‌ها")
               && cards1[1].textContent.includes("دستیار گام‌به‌گام");
  out.dateShown = cards1[0].textContent.includes("۱۴۰۵/۰۶/۱۲");
  out.autoLabel = d1.getElementById("wnSub").textContent.includes("آخرین بازدید");

  // بستن → seen=7 ذخیره شود
  d1.getElementById("wnOk").click();
  out.autoClosed = !d1.getElementById("whatsNew").classList.contains("open");
  out.savedSeen = d1.defaultView.localStorage.getItem("gympro.seen.v1") === "7";

  // ۲) دکمه پاورقی → تاریخچه کامل ۷ نسخه
  d1.getElementById("whatsNewBtn").click();
  out.entriesAll = d1.querySelectorAll("#wnList .wn-entry").length;   // انتظار: ۷
  out.allLabel = d1.getElementById("wnSub").textContent.includes("کامل");
  d1.getElementById("wnOk").click();

  // ۳) نصب تازه → پنجره باز نشود، seen همانیجا ۷ شود
  const dom3 = boot(null);
  setTimeout(() => {
    const d3 = dom3.window.document;
    out.freshNoWN = !d3.getElementById("whatsNew").classList.contains("open");
    out.freshWizOpen = d3.getElementById("wizard").classList.contains("open");
    out.freshSeen = dom3.window.localStorage.getItem("gympro.seen.v1") === "7";
    out.freshBtnWorks = (d3.getElementById("whatsNewBtn").click(), d3.getElementById("whatsNew").classList.contains("open"));
    console.log(JSON.stringify(out, null, 1));
    process.exit(errs.length ? 2 : 0);
  }, 300);
 }catch(e){ console.error("TEST FAIL:", e.stack); process.exit(3); }
}, 400);
