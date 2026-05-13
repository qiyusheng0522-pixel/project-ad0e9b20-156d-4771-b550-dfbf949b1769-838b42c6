import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, MessageSquare, Hospital, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ActionSheet from "@/components/nurse/ActionSheet";

type Stage = "新接收" | "随访中" | "复诊待约" | "历史";
type Source = "南京市鼓楼医院" | "兰园社区";
type Patient = {
  id: number;
  name: string;
  age: number;
  gender: "男" | "女";
  diagnosis: string;
  condition: string;
  stage: Stage;
  source: Source;
  abnormal: boolean;
  lastVisit: string;
  referralDept: string;
  referralDoctor: string;
};

const allPatients: Patient[] = [
  { id: 1, name: "张伟", age: 58, gender: "男", diagnosis: "2 型糖尿病 · 出院 3 天", condition: "糖尿病", stage: "新接收", source: "南京市鼓楼医院", abnormal: false, lastVisit: "今日下转", referralDept: "内分泌科", referralDoctor: "王主任" },
  { id: 2, name: "李建国", age: 62, gender: "男", diagnosis: "2 型糖尿病 · 血糖控制不佳", condition: "糖尿病", stage: "随访中", source: "兰园社区", abnormal: true, lastVisit: "1 小时前", referralDept: "内分泌科", referralDoctor: "王主任" },
  { id: 3, name: "刘秀英", age: 67, gender: "女", diagnosis: "桥本甲状腺炎 · 甲减", condition: "甲减", stage: "随访中", source: "兰园社区", abnormal: false, lastVisit: "3 天前", referralDept: "内分泌科", referralDoctor: "李医生" },
  { id: 4, name: "陈敏", age: 55, gender: "女", diagnosis: "1 型糖尿病", condition: "糖尿病", stage: "新接收", source: "南京市鼓楼医院", abnormal: false, lastVisit: "今日下转", referralDept: "内分泌科", referralDoctor: "张医生" },
  { id: 5, name: "周春华", age: 71, gender: "女", diagnosis: "糖尿病酮症 · 血糖↑", condition: "糖尿病", stage: "复诊待约", source: "兰园社区", abnormal: true, lastVisit: "30 分钟前", referralDept: "内分泌科", referralDoctor: "王主任" },
  { id: 6, name: "赵磊", age: 48, gender: "男", diagnosis: "Graves 病 · 甲亢复查", condition: "甲亢", stage: "复诊待约", source: "兰园社区", abnormal: false, lastVisit: "昨天", referralDept: "内分泌科", referralDoctor: "李医生" },
];

const stageTabs: ("全部" | Stage)[] = ["全部", "新接收", "随访中", "复诊待约", "历史"];

const CommunityPatients = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(params.get("tab") === "new" ? "新接收" : params.get("tab") === "abnormal" ? "随访中" : "全部");
  const [conditionFilter, setConditionFilter] = useState<string>("全部疾病");
  const [referFor, setReferFor] = useState<Patient | null>(null);

  const conditions = useMemo(() => {
    const set = new Set<string>(["全部疾病"]);
    allPatients.forEach((p) => set.add(p.condition));
    return Array.from(set);
  }, []);

  const list = useMemo(
    () =>
      allPatients
        .filter((p) => {
          const ms = !search || p.name.includes(search);
          const mf = filter === "全部" || p.stage === filter;
          const mc = conditionFilter === "全部疾病" || p.condition === conditionFilter;
          return ms && mf && mc;
        })
        .sort((a, b) => Number(b.abnormal) - Number(a.abnormal)),
    [search, filter, conditionFilter],
  );

  const stageCount = (s: Stage) => allPatients.filter((p) => p.stage === s).length;

  const confirmReferral = () => {
    if (!referFor) return;
    const p = referFor;
    setReferFor(null);
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

  return (
    <div className="space-y-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索患者姓名"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {stageTabs.map((t) => {
          const active = filter === t;
          const count = t === "全部" ? allPatients.length : stageCount(t);
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {t}
              <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {conditions.map((c) => {
          const active = conditionFilter === c;
          return (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">患者列表</h3>
          <span className="text-xs text-muted-foreground">{list.length} 位</span>
        </div>
        <div className="divide-y">
          {list.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">无匹配患者</div>}
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/community/chat/patient/${p.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${p.abnormal ? "bg-destructive/15 text-destructive" : "bg-accent/10 text-accent"}`}>
                {p.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground">{p.gender} · {p.age}岁</span>
                  {p.abnormal && <Badge variant="destructive" className="h-4 px-1 text-[9px]">异常</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${p.source === "南京市鼓楼医院" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                    {p.source === "南京市鼓楼医院" ? "鼓楼" : "兰园社区"}
                  </span>
                  <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">{p.condition}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.stage}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.lastVisit}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    onClick={(e) => { e.stopPropagation(); navigate(`/community/chat/patient/${p.id}`); }}
                    className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-[10px] text-accent"
                  >
                    <MessageSquare className="h-3 w-3" />沟通
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); setReferFor(p); }}
                    className="flex items-center gap-1 rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] text-warning"
                  >
                    <Hospital className="h-3 w-3" />转诊鼓楼
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Card>

      {/* 转诊鼓楼 */}
      <ActionSheet
        open={!!referFor}
        onOpenChange={(v) => !v && setReferFor(null)}
        title="转诊至南京市鼓楼医院"
        description={referFor ? `为 ${referFor.name} 推荐互联网医院挂号` : ""}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setReferFor(null)}>取消</Button>
            <Button className="bg-gradient-community" onClick={confirmReferral}>
              <Hospital className="mr-1 h-4 w-4" />确认
            </Button>
          </div>
        }
      >
        {referFor && (
          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">接收科室</p>
              <p className="mt-1 font-medium">南京市鼓楼医院 · {referFor.referralDept}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">推荐医生</p>
              <p className="mt-1 flex items-center gap-1.5 font-medium">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                {referFor.referralDoctor} · {referFor.referralDept}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
              确认后将跳转至与患者的沟通界面，并自动发送 {referFor.referralDoctor} 的互联网医院挂号地址，由患者自主完成挂号。
            </div>
          </div>
        )}
      </ActionSheet>
    </div>
  );
};

export default CommunityPatients;
