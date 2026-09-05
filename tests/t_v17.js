/* تست v17: بخش تغذیه و کالری — پایگاه‌داده داخلی + محاسبه خودکار */
function loadJsdom(){
  for(const p of ["jsdom","../../Projeyar/tests/node_modules/jsdom"]){
    try{ return require(p); }catch(e){}
  }
  console.error("jsdom not found"); process.exit(1);
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
  const LS = dom.window.localStorage;

  // ۱) بخش تغذیه رندر اولیه
  out.sectionPresent = !!d.querySelector(".nutri");
  const sel = d.getElementById("nutriSel");
  out.selectOptions = sel ? sel.querySelectorAll("option").length : 0;
  out.todayLabel = d.getElementById("nutriDateLbl").textContent;
  out.weekBars = d.getElementById("nutriWeek").querySelectorAll(".nw-bar").length;

  // ۲) افزودن سینه مرغ ۲۰۰ گرم (۱۶۵ kcal/۱۰۰g → ۳۳۰ kcal، پروتئین ۶۲g)
  sel.value = "chicken_breast";
  d.getElementById("nutriGrams").value = "200";
  d.getElementById("nutriAdd").click();
  const stored = JSON.parse(LS.getItem("gympro.nutri.v1") || "{}");
  const today = (()=>{ const t=new Date(); const p=n=>String(n).padStart(2,"0"); return t.getFullYear()+"-"+p(t.getMonth()+1)+"-"+p(t.getDate()); })();
  out.savedToday = !!(stored.days && stored.days[today] && stored.days[today].length===1);
  out.savedGrams = stored.days[today][0].g;

  // ۳) محاسبه خودکار در نمایش
  const tot = d.getElementById("nutriTotals").textContent;
  out.totalsHasKcal = /۳۳۰/.test(tot);   // کالری سینه مرغ ۲۰۰g
  out.totalsHasProtein = /۶۲/.test(tot); // پروتئین
  out.listRows = d.getElementById("nutriList").querySelectorAll(".nutri-row").length;
  out.rowKcal = (d.querySelector(".nutri-row .nk")||{}).textContent || "";

  // ۴) تغییر هدف روزانه
  const gi = d.getElementById("nutriGoal");
  gi.value = "2500";
  gi.dispatchEvent(new dom.window.Event("change"));
  out.goalSaved = JSON.parse(LS.getItem("gympro.nutri.v1")).goal === 2500;

  // ۵) حذف ورودی
  d.querySelector(".nutri-x").click();
  out.afterDelete = JSON.parse(LS.getItem("gympro.nutri.v1")).days[today].length;

  console.log(JSON.stringify(out, null, 2));
  const ok = out.errs.length===0 && out.sectionPresent && out.selectOptions>=100 &&
             out.weekBars===7 && out.savedToday && out.savedGrams===200 &&
             out.totalsHasKcal && out.totalsHasProtein && out.listRows===1 &&
             out.goalSaved && out.afterDelete===0;
  process.exit(ok ? 0 : 1);
 }catch(e){ console.error("TEST ERROR:", e); process.exit(1); }
}, 600);
