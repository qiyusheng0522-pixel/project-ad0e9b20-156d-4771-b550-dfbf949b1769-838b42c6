import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, Phone, Users as UsersIcon, FileText,
  ChevronDown, CheckCircle2, Stethoscope, TrendingUp, Activity, BookOpen, Send,
  Hospital, ClipboardList,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { eduByCategory } from "@/data/education";

type Med = { name: string; freq: string; per: string; start: string; end: string; days: number; ended?: boolean };
type Health = { label: string; value: string; unit: string; status: "正常" | "偏高" | "偏低" };
type DischargeSummary = {
  admitDate: string;
  dischargeDate: string;
  surgery: string;
  admitDx: string[];
  dischargeDx: string[];
  admitNote: string;
  course: { title: string; body: string }[];
  dischargeStatus: string;
  orders: string[];
  signature: string;
};
type Patient = {
  id: number;
  name: string;
  bed: string;
  age: number;
  gender: "男" | "女";
  idCard: string;
  phone: string;
  vip?: boolean;
  diagnosis: string;
  condition: string;
  doctor: string;
  updatedAt: string;
  healthSummary: string;
  health: Health[];
  meds: Med[];
  trend: { label: string; unit: string; range: string; points: { date: string; v: number }[] }[];
  lifestyle: { label: string; tone: "good" | "warn" }[];
  referralDept: string;
  referralDoctor: string;
  discharged?: boolean;
  discharge?: DischargeSummary;
};

const sampleDischarge: DischargeSummary = {
  admitDate: "2025-10-22",
  dischargeDate: "2025-10-24",
  surgery: "无",
  admitDx: [
    "2 型糖尿病伴血糖控制不佳",
    "剖宫产个人史",
    "子宫腺肌病(术后)",
    "贫血",
  ],
  dischargeDx: [
    "糖尿病大血管病变",
    "2 型糖尿病伴血糖控制不佳",
    "剖宫产个人史",
    "子宫腺肌病(术后)",
    "贫血",
    "非酒精性脂肪性肝炎",
    "高脂血症",
    "维生素 D 缺乏",
    "甲状腺结节(双叶)",
    "肺诊断性影像检查的异常所见(肺结节)",
    "腰椎退行性病变",
    "椎间盘突出(L4-S1)",
  ],
  admitNote:
    "患者于 6 年前无明显诱因出现口干、多饮、多尿,每日饮水量 2000-3000ml,尿量与之相当,无明显易饥、多食、消瘦症状,后在当地医院多次测空腹血糖≥7mmol/L,餐后 2 小时血糖≥11.1mmol/L,诊断为'2 型糖尿病',予二甲双胍 2 片、每日 2 次口服降糖。近期发现血糖控制不佳,空腹血糖 13-14mmol/L,为进一步调节血糖及筛查糖尿病并发症,门诊拟'2 型糖尿病'收住入院。\n病程中患者偶有视物模糊,无四肢麻木及疼痛,无心悸、胸闷、胸痛。既往有剖宫产个人史、子宫腺肌病个人史、贫血及输血史。\n入院查体:体温 36.5℃,脉搏 112 次/分,呼吸 20 次/分,血压 143/86mmHg,BMI 27.97 kg/m²。\n实验室及器械检查(2025-10-16):糖化血红蛋白 14.4%;入院随机血糖 18.1 mmol/L。",
  course: [
    {
      title: "实验室检查",
      body:
        "1. 血常规:WBC 3.7×10⁹/L,RBC 4.75×10¹²/L,Hb 136 g/L,PLT 197×10⁹/L,未见明显异常。\n2. 尿常规:尿葡萄糖 2+↑,胆红素、酮体、蛋白均阴性。\n3. 心肌三项、D 二聚体+凝血四项、胰岛自身抗体五项:均未见明显异常。\n4. 生化全套:ALT 55.4↑,AST 44.0↑,γ-GT 51.3↑,总蛋白 62.5↓,白蛋白 38.5↓,葡萄糖 9.33↑,尿酸 368↑,甘油三酯 17.37↑,总胆固醇 9.54↑,HDL-C 0.89↓,LDL-C 3.64↑,载脂蛋白 A 0.51↓,载脂蛋白 B 3.15↑,K 3.48↓,Na 135.1↓。\n5. 性激素六项:FSH 16.83 mIU/mL,其余甲功、维生素 B12、降钙素均正常。\n6. 大便隐血:阴性。\n7. 骨代谢四项:25-OH-VitD 10.50 ng/mL↓(维生素 D 缺乏)。",
    },
    {
      title: "器械检查",
      body:
        "1. 腹部彩超:脂肪肝声像图,胆胰脾未见明显异常。\n2. 心电图:窦性心律,QTc 间期延长。\n3. 慢性肝纤维化检测:肝硬度 6.8 kPa,脂肪衰减 303 dB/m。\n4. 四肢血管多普勒:右侧 ABI 1.23,左侧 ABI 1.2,未见明显异常。\n5. 眼底照相:双侧视乳头色红边清,未见明显出血渗出灶。\n6. 甲状腺彩超:双侧甲状腺内囊性结节,ACR-TIRADS 1 级。\n7. 颈动脉彩超:左侧颈动脉内膜增厚。\n8. 双肾输尿管彩超:未见明显异常。\n9. 胸部 CT:两肺多发结节(较前相仿),右肺中叶钙化灶,脂肪肝。\n10. 腰椎 CT:腰椎退变,后纵韧带钙化,L4-S1 椎间盘突出。\n11. 心脏彩超:左房增大,二、三尖瓣轻度反流。",
    },
    {
      title: "治疗措施",
      body:
        "1. 血糖管理:体型偏胖,无酮症倾向,胰岛自身抗体阴性、胰岛功能可,予胰岛素皮下泵降糖,停泵后改为二甲双胍口服,血糖控制可。\n2. 糖尿病并发症干预:左侧颈动脉内膜增厚,确诊糖尿病大血管病变,予非诺贝特调脂稳斑;其余并发症暂不支持,嘱定期复查筛查。\n3. 非酒精性脂肪性肝炎:予非诺贝特降脂治疗,嘱低脂饮食。\n4. 维生素 D 缺乏:予骨化三醇补充,嘱定期复查。\n5. 其他异常:心超异常嘱心内科随诊;甲状腺结节、肺结节、腰椎病变分别嘱相关专科随诊。",
    },
  ],
  dischargeStatus:
    "患者病情好转,无发热畏寒,无咳嗽咳痰,无口干乏力,无多饮多尿,无胸闷气喘,饮食睡眠可,二便如常。查体:神志清楚,精神可,体型偏胖,甲状腺无肿大,双肺呼吸音清,心律规整,腹部质地软,无压痛、反跳痛,四肢肌张力正常,双下肢无水肿。",
  orders: [
    "饮食与生活:严格执行糖尿病低脂饮食,适当运动,控制体重,规律监测血糖。",
    "复查要求:半月后复查肝功能、血脂、肌酶;3 个月后复查糖化血红蛋白;每年复查胸部 CT,每年行糖尿病并发症筛查。",
    "专科随诊:定期到内分泌科、肝病门诊、呼吸科、心内科、脊柱外科复诊。",
    "用药指导:遵医嘱规律服药(具体用药可结合临床补充)。",
    "联系方式:内分泌科电话 02583304616 转 61431;官网 www.glnfm.com;微信公众号:glyynfm。",
    "备注:不存在尚未回归的病理检查结果。",
  ],
  signature: "上级医师:王主任   主治医师:孔令辉",
};

const patients: Record<string, Patient> = {
  "1": {
    id: 1, name: "张伟", bed: "0312", age: 58, gender: "男",
    idCard: "3201**********0318", phone: "13851234567", vip: true,
    diagnosis: "2 型糖尿病 · 出院 3 天", condition: "糖尿病", doctor: "王主任",
    updatedAt: "2026年04月16日 15:24:47",
    healthSummary: "出院后血糖偏高,需加强随访",
    referralDept: "内分泌科", referralDoctor: "王主任",
    discharged: true, discharge: sampleDischarge,
    health: [
      { label: "空腹血糖", value: "9.6", unit: "mmol/L", status: "偏高" },
      { label: "餐后2小时血糖", value: "16.8", unit: "mmol/L", status: "偏高" },
      { label: "糖化血红蛋白", value: "9.2", unit: "%", status: "偏高" },
      { label: "体重", value: "72", unit: "kg", status: "正常" },
    ],
    meds: [
      { name: "二甲双胍片", freq: "每天3次", per: "0.5g", start: "2025-10-24", end: "2026-04-24", days: 175 },
      { name: "非诺贝特", freq: "每天1次", per: "1片", start: "2025-10-24", end: "2026-04-24", days: 175 },
      { name: "骨化三醇", freq: "每天1次", per: "0.25μg", start: "2025-10-24", end: "2026-04-24", days: 175 },
    ],
    trend: [
      { label: "空腹血糖", unit: "mmol/L", range: "3.9 ~ 6.1",
        points: [{ date: "10-24", v: 7.8 }, { date: "11-24", v: 8.1 }, { date: "12-24", v: 9.0 }, { date: "03-24", v: 9.6 }] },
      { label: "糖化血红蛋白", unit: "%", range: "4.0 ~ 6.0",
        points: [{ date: "10-22", v: 14.4 }, { date: "01-22", v: 10.8 }, { date: "04-22", v: 9.2 }] },
    ],
    lifestyle: [
      { label: "低糖饮食", tone: "good" },
      { label: "规律运动", tone: "warn" },
      { label: "戒烟", tone: "good" },
      { label: "睡眠不足", tone: "warn" },
    ],
  },
  "2": {
    id: 2, name: "李建国", bed: "—", age: 62, gender: "男",
    idCard: "3201**********0612", phone: "13912345678",
    diagnosis: "2 型糖尿病 · 血糖控制不佳", condition: "糖尿病", doctor: "王主任",
    updatedAt: "2026年04月15日 10:00:00",
    healthSummary: "血糖波动,需调整方案",
    referralDept: "内分泌科", referralDoctor: "王主任",
    health: [
      { label: "空腹血糖", value: "8.4", unit: "mmol/L", status: "偏高" },
      { label: "糖化血红蛋白", value: "8.6", unit: "%", status: "偏高" },
    ],
    meds: [
      { name: "甘精胰岛素", freq: "每天1次", per: "12U", start: "2026-03-01", end: "2026-05-01", days: 60 },
    ],
    trend: [
      { label: "空腹血糖", unit: "mmol/L", range: "3.9 ~ 6.1",
        points: [{ date: "03-01", v: 9.0 }, { date: "04-01", v: 8.4 }] },
    ],
    lifestyle: [{ label: "规律运动", tone: "good" }],
  },
};

const fallback = (id: string): Patient => ({
  id: Number(id), name: "患者", bed: "—", age: 0, gender: "男",
  idCard: "—", phone: "—",
  diagnosis: "—", condition: "—", doctor: "—",
  updatedAt: "—", healthSummary: "暂无健康摘要",
  referralDept: "内分泌科", referralDoctor: "—",
  health: [], meds: [],
  trend: [{ label: "空腹血糖", unit: "mmol/L", range: "3.9 ~ 6.1", points: [] }],
  lifestyle: [],
});

const TrendChart = ({ points, range }: { points: { date: string; v: number }[]; range: string }) => {
  if (points.length === 0) return <div className="py-8 text-center text-xs text-muted-foreground">暂无数据</div>;
  const w = 320, h = 160, pad = 28;
  const vals = points.map((p) => p.v);
  const max = Math.max(...vals, 8) + 1;
  const min = 0;
  const x = (i: number) => pad + (i * (w - pad * 1.5)) / Math.max(points.length - 1, 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 1.5);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.v)}`).join(" ");
  const [lo, hi] = range.split("~").map((s) => Number(s.trim()));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      {[0, 4, 8, 12, 16].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad / 2} y1={y(g)} y2={y(g)} stroke="hsl(var(--border))" strokeDasharray="2 3" />
          <text x={4} y={y(g) + 3} fontSize={9} fill="hsl(var(--muted-foreground))">{g}</text>
        </g>
      ))}
      {!isNaN(hi) && <line x1={pad} x2={w - pad / 2} y1={y(hi)} y2={y(hi)} stroke="hsl(var(--destructive))" strokeDasharray="3 3" opacity={0.6} />}
      {!isNaN(lo) && <line x1={pad} x2={w - pad / 2} y1={y(lo)} y2={y(lo)} stroke="hsl(var(--warning))" strokeDasharray="3 3" opacity={0.6} />}
      <path d={path} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.v)} r={3} fill="white" stroke="hsl(var(--accent))" strokeWidth={2} />
      ))}
      {points.map((p, i) => (
        <text key={`t-${i}`} x={x(i)} y={h - 6} fontSize={8} fill="hsl(var(--muted-foreground))" textAnchor="middle">{p.date}</text>
      ))}
    </svg>
  );
};

/** Collapsible long-text block */
const Expandable = ({ text, lines = 3 }: { text: string; lines?: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p
        className="whitespace-pre-line text-xs leading-relaxed text-foreground/80"
        style={open ? undefined : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {text}
      </p>
      <button onClick={() => setOpen((v) => !v)} className="mt-1 flex items-center gap-0.5 text-[11px] text-accent">
        {open ? "收起" : "展开"}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
};

const CommunityPatientDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const p = patients[id] || fallback(id);
  const [showMore, setShowMore] = useState(false);
  const [trendIdx, setTrendIdx] = useState(0);
  const [pushEduOpen, setPushEduOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<Set<number>>(new Set());
  const [referOpen, setReferOpen] = useState(false);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "push-edu") setPushEduOpen(true);
    if (action === "refer") setReferOpen(true);
    if (action === "chat") navigate(`/community/chat/patient/${id}`, { replace: true });
  }, [searchParams, id, navigate]);

  const eduGroups = useMemo(() => eduByCategory(), []);
  const toggleEdu = (cid: number) =>
    setSelectedEdu((s) => {
      const n = new Set(s);
      n.has(cid) ? n.delete(cid) : n.add(cid);
      return n;
    });
  const closePushEdu = () => {
    setPushEduOpen(false);
    if (searchParams.get("action")) {
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  };
  const confirmPushEdu = () => {
    if (selectedEdu.size === 0) {
      toast({ title: "请选择宣教内容" });
      return;
    }
    toast({ title: "推送成功", description: `已向 ${p.name} 推送 ${selectedEdu.size} 条宣教` });
    setSelectedEdu(new Set());
    closePushEdu();
  };
  const confirmReferral = () => {
    setReferOpen(false);
    navigate(`/community/chat/patient/${p.id}`, {
      state: {
        referral: {
          dept: p.referralDept,
          doctor: p.referralDoctor,
          url: "https://www.njglyy.com/",
        },
      },
    });
  };

  const fields = useMemo(() => {
    const base = [
      { k: "姓名", v: p.name },
      { k: "性别", v: p.gender },
      { k: "年龄", v: p.age ? `${p.age}岁` : "-" },
      { k: "身份证号", v: p.idCard },
    ];
    return showMore
      ? [...base, { k: "床位", v: p.bed }, { k: "主治医师", v: p.doctor }, { k: "主要诊断", v: p.diagnosis }, { k: "病症分类", v: p.condition }]
      : base;
  }, [p, showMore]);

  const statusTone = (s: Health["status"]) =>
    s === "正常" ? "bg-success/15 text-success" : s === "偏高" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning";

  return (
    <div className="bg-muted/30">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-accent">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-base font-semibold">{p.name}</h2>
        <span className="w-10" />
      </div>

      <div className="space-y-3 p-3">
        {/* 头像卡片 */}
        <Card className="flex flex-col items-center bg-card p-5 shadow-soft">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
              {p.name[0]}
            </div>
            {p.vip && (
              <span className="absolute -right-1 -top-1 rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-bold text-white">VIP</span>
            )}
          </div>
          <p className="mt-3 text-lg font-bold">{p.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{p.diagnosis}</p>
          {p.discharged && (
            <span className="mt-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">已出院</span>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">⏱ 更新于 {p.updatedAt}</p>

          <div className="mt-4 grid w-full grid-cols-3 gap-3">
            <button onClick={() => navigate(`/community/chat/patient/${p.id}`)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                <MessageSquare className="h-5 w-5 text-accent" />
              </span>
              <span className="text-xs text-accent">沟通</span>
            </button>
            <button onClick={() => toast({ title: "正在呼叫", description: p.name })} className="flex flex-col items-center gap-1.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Phone className="h-5 w-5 text-accent" />
              </span>
              <span className="text-xs text-accent">电话</span>
            </button>
            <button onClick={() => toast({ title: "已发起会诊", description: `主治 ${p.doctor}` })} className="flex flex-col items-center gap-1.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
                <UsersIcon className="h-5 w-5 text-warning" />
              </span>
              <span className="text-xs text-warning">会诊</span>
            </button>
          </div>
        </Card>

        {/* 患者档案 */}
        <Card className="p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">患者档案</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <div key={f.k} className="rounded-lg bg-muted/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">{f.k}</p>
                <p className="mt-1 text-sm font-medium">{f.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-muted/60 p-2.5">
            <p className="text-[10px] text-muted-foreground">联系方式</p>
            <p className="mt-1 text-sm font-medium">{p.phone}</p>
          </div>
          <button onClick={() => setShowMore((v) => !v)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-accent/10 py-2.5 text-sm text-accent">
            {showMore ? "收起" : "更多详情"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
          </button>
        </Card>

        {/* 出院小结 */}
        {p.discharged && p.discharge && (
          <Card className="p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">出院小结</h3>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {p.discharge.admitDate} ~ {p.discharge.dischargeDate}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">入院日期</p>
                <p className="mt-1 text-xs font-medium">{p.discharge.admitDate}</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">出院日期</p>
                <p className="mt-1 text-xs font-medium">{p.discharge.dischargeDate}</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">手术名称</p>
                <p className="mt-1 text-xs font-medium">{p.discharge.surgery}</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">入院诊断</p>
              <ol className="list-decimal space-y-0.5 pl-4 text-xs text-foreground/80">
                {p.discharge.admitDx.map((d, i) => <li key={i}>{d}</li>)}
              </ol>
            </div>

            <div className="mt-2 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">出院诊断</p>
              <ol className="list-decimal space-y-0.5 pl-4 text-xs text-foreground/80">
                {p.discharge.dischargeDx.map((d, i) => <li key={i}>{d}</li>)}
              </ol>
            </div>

            <div className="mt-2 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">入院情况</p>
              <Expandable text={p.discharge.admitNote} />
            </div>

            <div className="mt-2 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">诊疗经过</p>
              <div className="space-y-2">
                {p.discharge.course.map((c) => (
                  <div key={c.title}>
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">{c.title}</p>
                    <Expandable text={c.body} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">出院情况</p>
              <Expandable text={p.discharge.dischargeStatus} />
            </div>

            <div className="mt-2 rounded-lg border p-3">
              <p className="mb-1.5 text-xs font-semibold text-accent">出院医嘱</p>
              <ol className="list-decimal space-y-1 pl-4 text-xs text-foreground/80">
                {p.discharge.orders.map((o, i) => <li key={i}>{o}</li>)}
              </ol>
            </div>

            <div className="mt-2 rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground">
              {p.discharge.signature}
            </div>
          </Card>
        )}

        {/* 健康状态 */}
        <Card className="p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold">健康状态</h3>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-success">健康良好</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{p.healthSummary}</p>
            </div>
          </div>
          <div className="divide-y">
            {p.health.map((h) => (
              <div key={h.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-foreground/80">{h.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{h.value} {h.unit}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${statusTone(h.status)}`}>{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 当前用药 */}
        <Card className="p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">当前用药</h3>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {p.meds.map((m) => (
              <span key={m.name} className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] text-accent">{m.name}</span>
            ))}
          </div>
          <div className="space-y-2">
            {p.meds.map((m) => (
              <div key={m.name} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{m.start} ~ {m.end}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.freq} | 每次 {m.per}</p>
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-[11px] text-muted-foreground">服用天数: {m.days} 天</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${m.ended ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                    {m.ended ? "已结束" : "进行中"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 健康指标趋势 */}
        <Card className="p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">健康指标趋势</h3>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {p.trend.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setTrendIdx(i)}
                className={`rounded-full px-3 py-1 text-[11px] transition-colors ${
                  trendIdx === i ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mb-1 text-[11px] text-muted-foreground">
            单位:{p.trend[trendIdx]?.unit} 参考范围:{p.trend[trendIdx]?.range}
          </p>
          <TrendChart points={p.trend[trendIdx]?.points || []} range={p.trend[trendIdx]?.range || ""} />
        </Card>

        {/* 生活方式 */}
        <Card className="p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold">生活方式</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {p.lifestyle.map((l) => (
              <span
                key={l.label}
                className={`rounded-full px-3 py-1 text-[11px] ${
                  l.tone === "good" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}
              >
                {l.label}
              </span>
            ))}
            {p.lifestyle.length === 0 && <span className="text-[11px] text-muted-foreground">暂无记录</span>}
          </div>
        </Card>

        <div className="sticky bottom-0 -mx-3 grid grid-cols-3 gap-2 border-t bg-card/95 p-3 backdrop-blur">
          <Button variant="outline" onClick={() => navigate(`/community/chat/patient/${p.id}`)}>
            <MessageSquare className="mr-1 h-3.5 w-3.5" />沟通
          </Button>
          <Button variant="outline" onClick={() => setPushEduOpen(true)}>
            <Send className="mr-1 h-3.5 w-3.5" />立即推送
          </Button>
          <Button className="bg-gradient-community" onClick={() => setReferOpen(true)}>
            <Hospital className="mr-1 h-3.5 w-3.5" />转诊鼓楼
          </Button>
        </div>
      </div>

      {/* 立即推送 - 宣教 */}
      <ActionSheet
        open={pushEduOpen}
        onOpenChange={(v) => (v ? setPushEduOpen(true) : closePushEdu())}
        title="立即推送 · 宣教内容"
        description={`向 ${p.name} 推送宣教 · 已选 ${selectedEdu.size} 条`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={closePushEdu}>取消</Button>
            <Button className="bg-gradient-community" onClick={confirmPushEdu}>
              <Send className="mr-1 h-4 w-4" />确认推送
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          {Object.entries(eduGroups).map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-muted-foreground">{cat}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((c) => {
                  const checked = selectedEdu.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-xs transition-colors ${
                        checked ? "border-accent bg-accent/5" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEdu(c.id)}
                        className="mt-0.5 h-4 w-4 accent-accent"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{c.desc} · {c.duration}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ActionSheet>

      {/* 转诊鼓楼 */}
      <ActionSheet
        open={referOpen}
        onOpenChange={setReferOpen}
        title="转诊至南京市鼓楼医院"
        description={`为 ${p.name} 推荐互联网医院挂号`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setReferOpen(false)}>取消</Button>
            <Button className="bg-gradient-community" onClick={confirmReferral}>
              <Hospital className="mr-1 h-4 w-4" />确认
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">接收科室</p>
            <p className="mt-1 font-medium">南京市鼓楼医院 · {p.referralDept}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">推荐医生</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              <Stethoscope className="h-3.5 w-3.5 text-accent" />
              {p.referralDoctor} · {p.referralDept}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
            确认后将跳转至与患者的沟通界面,并自动发送 {p.referralDoctor} 的互联网医院挂号地址,由患者自主完成挂号。
          </div>
        </div>
      </ActionSheet>
    </div>
  );
};

export default CommunityPatientDetail;
