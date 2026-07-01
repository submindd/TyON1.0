# 🎤 TyON 面试介绍脚本

> 根据面试岗位和可用时间，选择对应版本。每个版本末尾附有岗位针对性调整建议。

---

## ⏱️ 目录

| 版本 | 时长 | 适用场景 |
|:-----|:-----|:---------|
| [1 分钟版](#1-分钟版) | ~60s | 自我介绍环节、HR 初筛、电梯 pitch |
| [3 分钟版](#3-分钟版) | ~180s | 技术一面、项目经历介绍 |
| [5 分钟版](#5-分钟版) | ~300s | 技术二面/终面、详细项目讲解、现场 Demo |

---

## 一、1 分钟版

> **适用场景：** 自我介绍环节、HR 初筛、快速展示项目亮点

---

### 通用脚本

---

**TyON 是一个 AI 驱动的 TikTok Shop 选品分析平台。** 我在两周内独立完成全栈开发。

**解决的问题：** 跨境电商卖家选品效率极低——手动刷 TikTok 比价、整理竞品数据、写 Listing 文案，一个产品要花 3-4 小时。TyON 把这个流程压缩到 30 秒。

**怎么做：** 用户输入一个关键词，后端调用 Firecrawl API 抓取 TikTok Shop 商品数据，然后 DeepSeek AI 自动完成三件事——清洗数据、评估市场机会（输出 0-100 机会分）、生成运营策略（包括目标人群、内容创意、定价建议、风险评估）。24 小时 Redis 缓存保证重复查询秒级返回。

**技术栈：** Next.js 16 + FastAPI + MySQL + Redis + DeepSeek。支持中英文双语。

**核心数据：** 前端从 0 搭建，4 个页面（搜索 → 分析仪表盘 → AI 报告 → 产品库），包含雷达图、柱状图、竞品对比表，20 个预置种子商品保证离线可演示。

这个项目让我完整实践了 AI 产品从数据获取 → AI 分析 → 结果呈现的全链路设计。

---

### 岗位针对性调整

**🎯 AI 产品实习** — 强调产品思维：
> "我独立完成了需求调研、技术选型、UX 设计和全栈开发。最关注的是 **AI 输出的可靠性**——比如 DeepSeek 返回的 JSON 可能格式错误或缺失字段，我设计了 Pydantic Schema 强校验 + 2 次自动重试 + 结构化 System Prompt，把解析成功率从 ~70% 提升到接近 100%。"

**🎯 跨境电商运营实习** — 强调业务价值：
> "这个工具的出发点就是解决运营日常痛点。种子数据覆盖无线耳机、便携榨汁机、手机壳、瑜伽垫 4 个真实 TikTok 热销品类，AI 输出的机会分和运营建议直接可用于选品决策。"

**🎯 AI Agent 开发实习** — 强调 Agent 设计：
> "我把整个系统设计成一个 **Agent Pipeline**——Scrape Agent 获取数据 → Analysis Agent 评估机会 → Strategy Agent 生成策略，每个 Agent 有独立的 System Prompt 和结构化输出 Schema，支持自动重试和错误恢复。"

**🎯 全栈开发实习** — 强调工程能力：
> "独立完成全栈：Next.js 16 + FastAPI + MySQL + Redis。关键设计包括：异步数据库写入（fire-and-forget 不阻塞响应）、Redis + 内存双级缓存、Firecrawl → 种子数据优雅降级。"

---

## 二、3 分钟版

> **适用场景：** 技术一面、项目经历介绍、需要展开讲技术细节

---

### 通用脚本

---

#### 1. 项目背景 & 为什么做（~40s）

大家好，我介绍的项目是 **TyON——AI 驱动的 TikTok Shop 选品分析平台**。

我身边有朋友做跨境电商 TikTok Shop，我发现他们有一个非常痛苦的流程：选品。

他们每天花 3-4 个小时手动刷 TikTok，把看到的爆款商品截图、复制价格、记录销量，然后打开 Excel 做对比分析。最后还要自己写英文 Listing——标题、卖点、描述、关键词。整个过程重复、低效，而且完全依赖个人经验。

我就想：**能不能用 AI 把这个流程自动化？**

于是我花了大约两周时间，从零独立开发了 TyON。它做的事情很简单：**输入关键词，输出完整市场研究报告。**

---

#### 2. 技术选型（~40s）

技术选型我做了比较慎重的考量：

**前端选 Next.js 16**——两个原因：一是 App Router 的 Server Component 模式天然适合数据展示型产品；二是 TypeScript 的类型安全对 AI 输出的结构化数据特别重要。

**后端选 FastAPI**——Python 生态的 AI/LLM 库最成熟，FastAPI 的异步支持对 I/O 密集型场景（同时调 Firecrawl + DeepSeek）非常友好，自带的 Swagger 文档也方便调试。

**AI 选 DeepSeek**——当时对比了 GPT-4 和 DeepSeek。DeepSeek 在结构化 JSON 输出上表现稳定，成本是 GPT-4 的 1/50，而且支持 `response_format: json_object` 参数，与我的 Pydantic Schema 方案天然契合。

**缓存选 Redis**——24 小时 TTL 的查询缓存，命中后响应时间从 8-15 秒降到 10 毫秒以内。更重要的是，Redis 挂了也不影响服务——我做了内存字典回退。

---

#### 3. AI Workflow（~50s）

AI 是整个系统的核心。我设计了一个两阶段的 Agent Pipeline：

**第一阶段：数据获取。** 用户输入关键词后，Firecrawl API 搜索 TikTok Shop 的 Google 索引结果，返回 8 个商品的标题和描述。我用正则表达式从文本中提取价格、销量、评分、店铺名——这一步的挑战是 Firecrawl 实际上不能直接爬 TikTok 页面（403），所以只能从搜索摘要里解析。

**第二阶段：AI 分析。** 把解析后的商品列表发给 DeepSeek，分两步：

第一步 **Analyze Agent**——System Prompt 设定它是"TikTok Shop 电商数据分析师"，要求它清洁目标商品数据、对比竞品、输出机会分（0-100）、市场规模判断、卖点、痛点、差异化建议。

第二步 **Strategy Agent**——根据分析结果，Prompt 设定为"运营策略师"，输出目标人群、内容创意、合作达人类型、定价建议、风险分析，最后给出推荐/谨慎/不推荐的结论。

**关键设计：** 两个 Agent 都有严格的 Pydantic Schema 约束——DeepSeek 的输出必须通过 `AnalyzeResponse` 和 `StrategyResponse` 的字段级校验，包括枚举值（如 recommendation 只能是 推荐/谨慎/不推荐）、数值范围（opportunity_score 0-100）、列表长度（selling_points 1-6 条）。

如果 LLM 返回格式错误，系统自动追加错误信息重试，最多 2 次。这个机制把解析成功率从原生的 ~70% 提升到接近 100%。

---

#### 4. 遇到的问题 & 解决方案（~40s）

开发中最大的挑战有三个：

**第一，Firecrawl 不能直接爬 TikTok。** TikTok 的反爬机制很强，Firecrawl 所有代理层都返回 403。我的方案是改用 Google 索引搜索（`site:tiktok.com/shop "keyword"`），用正则从文本摘要里提取结构化字段。但这样数据完整性不够——所以我准备了 20 个预采集的种子商品，当检测到 top 3 结果都缺价格和销量时，自动切换到种子数据。

**第二，DeepSeek 输出不稳定。** 有时返回带 markdown 代码块的 JSON，有时漏字段。我做了三层防护：System Prompt 反复强调输出格式 + Pydantic 校验 + 自动重试。

**第三，AI 响应时间长。** 一个完整周期需要两轮 LLM 调用 + 一轮外部 API，约 8-15 秒。我设计了 Redis + 内存双级缓存，24 小时 TTL，重复查询直接命中缓存——用户体验从 10 秒等待变成瞬间返回。

---

#### 5. 数据流设计（~10s）

```
Keyword → Firecrawl Search → Regex Parse → [Seed Fallback] 
→ DeepSeek Analysis → DeepSeek Strategy → Redis Cache + Memory Fallback 
→ MySQL (async, fire-and-forget) → JSON Response → Recharts Dashboard
```

---

#### 6. 未来规划（~10s）

短期：接入用户认证和个人仪表盘；长期：支持 Amazon/Shopee 多平台，加入销量趋势追踪，支持 PDF 报告导出。

---

### 岗位针对性调整

**🎯 AI 产品实习** — 强调产品设计决策：

> 替换"技术选型"为产品思考：
> "做这个项目我最关注两个产品指标：**可靠性**和**响应速度**。可靠性方面，除了 LLM 输出的 Schema 校验，我特别设计了 Firecrawl → 种子数据的优雅降级——宁可给用户预采集数据，也不返回空结果。响应速度方面，缓存命中率是核心指标，我用 Redis 24h TTL + 前端 TanStack Query 的 stale-while-revalidate 策略，保证重复搜索瞬间返回。UI 上我参考了 LangChain 和 LobeChat 的设计语言——暗色主题、卡片式信息布局、渐进式数据呈现，减少用户的认知负荷。"
>
> 在"遇到的问题"部分，增加一个产品层面的挑战：
> "还有一个产品层面的挑战是 **AI 输出的置信度管理**。我发现 LLM 有时会"编造"数据——比如给一个完全没有评分数据的商品估计 4.5 分。所以我增加了 `is_estimated` 标记，当 AI 推断字段时标注为 true，让用户知道哪些数据是真实的、哪些是 AI 估算的。这对用户的决策信任度非常关键。"

**🎯 跨境电商运营实习** — 强调业务洞察：

> 替换"技术选型"和"AI Workflow"为业务视角：
> "从运营角度看，这个工具的差异化在于它不只是数据抓取，而是**直接给出可执行的运营建议**。比如你搜 'wireless earbuds'，系统不只告诉你竞品卖多少钱、有多少销量，它还会告诉你：'
> - 这个品类的目标用户是谁（Tech-savvy Gen Z consumers aged 18-28）
> - 你应该拍什么 TikTok 内容（ASMR 开箱、音质对比、运动场景）
> - 找什么类型的达人合作（科技测评、生活方式、性价比推荐）
> - 建议定价区间（$14.90 - $24.90）
> - 风险评估（低价段竞争激烈，利润空间有限）
>
> **种子数据的选择也做了运营考量**——4 个品类无线耳机、便携榨汁机、手机壳、瑜伽垫都是 TikTok 上真实热销且竞争格局各异的品类。比如手机壳是"高需求、高竞争、低客单价"，瑜伽垫是"中等需求、低竞争、高客单价"，AI 的分析逻辑需要适应不同品类特征。"
>
> 在"未来规划"中，增加运营相关规划：
> "未来想加一个趋势追踪功能——追踪同一品类的价格和销量变化曲线，帮助运营判断是上升期还是饱和期。还想加一个利润计算器，根据售价、平台佣金、物流成本自动算净利润。"

**🎯 AI Agent 开发实习** — 强调 Agent 架构设计：

> 替换全文为 Agent 视角：
> "TyON 本质上是一个 **Multi-Agent 协作系统**。我设计了三个 Agent：
>
> 1. **Scrape Agent** — 负责数据获取。它不只是调 API，还有决策逻辑：Firecrawl 返回的数据是否完整？不完整就自动切换到种子数据。这相当于 Agent 的 'tool selection' 能力。
>
> 2. **Analysis Agent** — 角色设定为 TikTok Shop 电商分析师。System Prompt 约 60 行，包含角色定义、任务说明、输出格式约束、字段指南。它接收原始商品列表，输出结构化的市场分析。
>
> 3. **Strategy Agent** — 角色设定为运营策略师。它接收 Analysis Agent 的输出作为上下文，生成可执行的运营方案。
>
> **Agent 间的通信是通过 Pydantic Schema 实现的**——每个 Agent 的输出经过严格的结构化校验后才流入下一个 Agent，确保数据契约不被破坏。
>
> **容错设计：** 每个 Agent 有独立的错误处理和重试逻辑。LLM 返回格式错误时，系统把错误信息注入到对话历史中让 LLM 自我修正。这不是简单的重试——而是让 Agent '理解'自己哪里出错了。
>
> **可扩展性：** 当前是硬编码的 Agent Pipeline，但架构已经预留了扩展点——比如未来可以加一个 'Trend Agent' 分析价格趋势，或者 'Content Agent' 直接生成 TikTok 视频脚本。因为每个 Agent 的输入输出都是结构化的，插入新 Agent 只需定义新的 Schema + System Prompt。
>
> **与 LangChain 的对比：** 我刻意没有用 LangChain 或 CrewAI，而是自己实现了 Agent 编排。原因是当前流程的确定性很强——就是 Scrape → Analyze → Strategize，不需要 Agent 自主选择工具或规划步骤。自己实现的好处是完全可控——Prompt 的每个字、重试策略、错误处理都是透明的。如果未来需要更灵活的 Agent 行为（比如根据品类自动选择不同的分析策略），我会考虑引入 LangGraph。"

**🎯 全栈开发实习** — 强调工程实践：

> 替换"AI Workflow"为工程视角：
> "从工程角度，这个项目有几个我比较满意的设计决策：
>
> **1. 异步架构。** 后端所有 I/O 操作都是异步的——Firecrawl 调用、DeepSeek 调用、Redis 读写、MySQL 写入。特别是 MySQL 写入用了 `asyncio.create_task()` 即发即忘——用户的 API 响应不等待数据库写入完成，延迟降低约 30%。
>
> **2. 缓存策略。** 双级缓存设计：Redis 作为一级缓存，内存字典作为二级回退。缓存 key 设计为 `report:{platform}:{country}:{keyword}`，支持未来多平台扩展。TTL 设为 24 小时——因为 TikTok Shop 的商品数据变化频率不高。
>
> **3. 优雅降级。** 三个层面的降级：Firecrawl 失败 → 种子数据；Redis 故障 → 内存缓存；AI 不可用 → 结构化错误提示。系统在任何单点故障下都不会完全不可用。
>
> **4. 类型安全从前端贯穿到后端。** TypeScript 的 `types/report.ts` 定义了前端类型，Python 的 `schemas/report_schema.py` 定义了后端类型，AI 输出的 Pydantic Schema 定义了 LLM 的类型——三套类型体系一一对应。如果 AI 的 Schema 修改了，TypeScript 类型也要同步更新，这种约束防止了前后端类型不一致导致的 bug。
>
> **5. 国际化架构。** `next-intl` + JSON 文件的方式，抽取了所有 UI 文案、指标说明、列表模板。`metricGlossary.ts` 把数据分析指标的定义也做了 i18n，比如 'opportunity_score' 在中文模式下显示'机会分'并附带中文解释。"

---

## 三、5 分钟版

> **适用场景：** 技术二面/终面、需要详细讲解架构 + 现场 Demo

---

### 通用脚本

---

#### Part 1：项目背景（~30s）

大家好，我介绍 TyON——AI 驱动的 TikTok Shop 选品分析平台。两周独立全栈开发，从需求调研到上线部署。

**一句话定位：** 输入关键词，AI 自动完成商品搜索 → 市场分析 → 竞品对比 → 运营策略 → Listing 生成。

**解决的问题：** 跨境电商卖家选品效率低下。一个产品的完整调研需要 3-4 小时手工操作，TyON 压缩到 30 秒。

---

#### Part 2：技术选型 & 架构（~60s）

**前端：Next.js 16 + React 19 + TypeScript + TailwindCSS v4 + shadcn/ui + Recharts。**
选择 Next.js 的原因是 App Router 的布局嵌套很适合仪表盘类产品——/search、/analysis/[keyword]、/report/[id] 可以共享 header 和 sidebar。TanStack Query 管理服务端状态，自动处理缓存失效和乐观更新。

**后端：FastAPI + SQLAlchemy 2.0 异步 ORM + Pydantic v2 + httpx。**
FastAPI 的 async/await 原生支持让并发 I/O（同时调 Firecrawl 和 DeepSeek）变得简单。Pydantic v2 的 `model_validate()` 比 v1 快 5-10 倍，对 AI 输出的实时校验很重要。

**数据库：MySQL + Redis。**
MySQL 存储搜索历史、商品数据、分析结果三张表。Redis 做查询缓存，24h TTL。关键设计是 Redis 宕机时自动切换到内存字典缓存——通过 try/except 和标志位 `redis_ok` 控制。

**AI：DeepSeek Chat API + Firecrawl API。**
选择 DeepSeek 的主要原因是性价比——GPT-4 的 1/50 成本，`response_format: json_object` 参数对结构化输出友好。

**完整架构图（已在 README 中）：**
```
Frontend (Next.js) → FastAPI → Report Service Orchestrator
                                   ├─ Scrape Service → Firecrawl / Seed Data
                                   ├─ LLM Service → DeepSeek
                                   ├─ Redis Cache + Memory Fallback
                                   └─ MySQL (async, fire-and-forget)
```

---

#### Part 3：AI Workflow 深度解析（~60s）

这是项目的核心。整个 AI Pipeline 分三个阶段：

**阶段一：数据获取（Scrape Service）**

Firecrawl 的 `/v1/search` 端点搜索 `site:tiktok.com/shop "keyword"`，返回 Google 索引的 8 个结果。每个结果包含 title 和 description 文本——不是结构化数据。

我写了 5 组正则表达式从文本中提取：价格（支持 `$12.99` / `US $1,234` 格式）、销量（支持 `10K sold` / `已售 1.2万` 格式）、评分（0.5-5.0 范围校验，防止把 `Bluetooth 5.4` 误识别为评分）、店铺名（6 种常见模式：@handle / by ShopName / Shop: Name / Sold by Name / Store: Name）和图片 URL。

如果 top 3 商品都缺价格和销量，自动切换至种子数据（20 个预采集商品 × 4 品类）。

**阶段二：AI 分析（LLM Service - analyze_product）**

System Prompt 约 60 行，设定 DeepSeek 为"TikTok Shop 电商数据分析师"。关键在于 Prompt 设计：

1. **角色设定** — 明确专业身份和任务边界
2. **CRITICAL RULES** — 5 条严格格式约束（只返回 JSON 对象、不用 markdown 代码块等）
3. **FIELD GUIDELINES** — 每个字段的填写规范，比如 opportunity_score 的评分逻辑、rating 为空时的估算策略
4. **结构化输出要求** — 提供完整的 JSON Schema 示例

请求时传入 `response_format: {"type": "json_object"}` 参数，DeepSeek 会尽量遵守 JSON 输出格式。

**阶段三：策略生成（LLM Service - generate_strategy）**

基于分析结果，Prompt 设定为"TikTok Shop 运营策略师"，输出目标人群、TikTok 内容创意、达人类型匹配、定价建议、风险分析、推荐结论。

**Agent 通信协议：** 两个 Agent 之间通过 Pydantic Schema 通信。Analysis Agent 的输出（`AnalyzeResponse`）经过 `model_validate()` 校验后，只提取策略相关的字段传给 Strategy Agent。这样做的好处：一是减少 Token 消耗，二是防止上游错误传播。

**容错机制：** 每个 Agent 最多重试 2 次。重试时把前一次的错误信息（JSON 解析错误或 Schema 校验错误）注入到对话历史，让 LLM 自我修正。实际测试中，首次成功率约 85%，两次重试后接近 100%。

---

#### Part 4：缓存设计详解（~45s）

这是我在性能优化上最花心思的部分。缓存设计有几个关键决策：

**为什么用双级缓存？** 纯 Redis 方案在 Redis 故障时所有请求都要重新走 Pipeline（8-15 秒），用户体验很差。我加了内存字典作为二级缓存——和 Redis 一样的 TTL 逻辑，但零网络依赖。

**缓存键设计：** `report:{platform}:{country}:{keyword}` 的命名空间。这样如果未来扩展 Amazon/Shopee，同一个关键词在不同平台有独立缓存。

**缓存失效策略：** 采用 TTL（Time To Live）而非主动失效。选择 24 小时是因为 TikTok Shop 的商品数据变化不频繁——价格和销量通常按天波动，不需要实时更新。如果未来需要更短的 TTL，只需改 `CACHE_TTL_SECONDS` 常量。

**与 TanStack Query 的配合：** 前端也有一层缓存——TanStack Query 的 `staleTime` 默认缓存服务端数据。两层缓存叠加：前端缓存避免不必要的网络请求，后端缓存避免不必要的 AI 调用。

**实际效果：**
- 首次查询：8-15 秒（Firecrawl + 2× DeepSeek）
- 缓存命中：< 10ms（Redis）/ < 1ms（内存）
- Dashboard 页面切换：< 100ms（TanStack Query 缓存）

---

#### Part 5：数据流设计（~30s）

完整的数据流转（已在 README 中详细展示）：

1. 用户在 `/search` 输入关键词 → POST `/api/research`
2. `report_service.get_or_create_report()` 检查 Redis → 内存缓存
3. 缓存 miss → `scrape_service.search_products()` 调 Firecrawl `/v1/search`
4. 正则提取字段 → 完整性检测 → 必要时触发 `seed_data.json`
5. `llm_service.analyze_product()` 调 DeepSeek → Pydantic 校验 → 返回 `AnalyzeResponse`
6. `llm_service.generate_strategy()` 调 DeepSeek → Pydantic 校验 → 返回 `StrategyResponse`
7. `json.dumps(report)` 写入 Redis（`SET key value EX 86400`）+ 内存字典
8. `asyncio.create_task(save_report_to_db(report))` 异步写 MySQL（三张表：search_history, products, analysis）
9. `ResearchResponse` JSON 返回前端
10. 前端 React 状态更新 → Recharts 渲染图表 → 用户看到分析仪表盘
11. 用户点击进入 `/report/[id]` → 策略卡片 + Listing 生成器

**关键设计决策：** 第 8 步的数据库写入是即发即忘（fire-and-forget）。用户的 API 响应不等待 DB 写入完成——因为写入失败不应该影响用户体验。这个设计牺牲了数据可靠性（写 DB 失败会静默丢弃），但在 MVP 阶段是可接受的取舍。

---

#### Part 6：遇到的问题 & 解决方案（~45s）

**问题一：Firecrawl 无法爬取 TikTok 页面（403）**

这是开发初期最大的阻塞。Firecrawl 的所有代理层对 `tiktok.com` 都返回 403。官方文档建议的 `/v1/scrape` 端点完全不可用。

解决方案：改用 `/v1/search` 端点搜索 Google 索引（`site:tiktok.com/shop "keyword"`），用正则从文本摘要中解析结构化数据。同时准备 20 个预采集商品作为种子数据——当检测到 live data 不完整时（top 3 商品都没有价格和销量），自动切换。

**问题二：DeepSeek JSON 输出不稳定（解析失败率 ~30%）**

DeepSeek 有时忽略 `response_format: json_object` 指令，返回带 `` ```json `` 代码块的响应，或者 JSON 中包含不合法字符。

解决方案分三层：
1. **Prompt 层面：** System Prompt 用全大写 `CRITICAL RULES` 反复强调，并给出完整 JSON 示例
2. **代码层面：** 写 `_strip_markdown_fence()` 剥离可能的 markdown 代码块
3. **容错层面：** 捕获 `json.JSONDecodeError` 和 `ValidationError`，把错误详情注入重试消息让 LLM 自我修正，最多 2 次

最终解析成功率 > 99%。

**问题三：JSON 解析后字段类型不符合预期**

LLM 返回的 `price` 有时是 `"$14.90"` 字符串，有时是 `14.9` 数字；`rating` 有时是 `"4.5"` 字符串，有时是 `4.5` 浮点数。

解决方案：Pydantic `CleanedProduct` Schema 明确定义每个字段的类型（`price: str`、`rating: float | None`），配合 `model_validate()` 做严格类型校验。前端 TypeScript 类型和后端 Pydantic Schema 一一对应，编译时就能发现类型不匹配。

**问题四：AI 幻觉——LLM 给无评分商品编造评分**

系统提示 `rating` 为空时可以估算，但 LLM 有时给一个明显不合理的高分。

解决方案：加 `is_estimated: bool` 标记字段。所有 AI 推断的数据（评分、增长趋势等）标注为 estimated=true。前端展示时，预估数据旁边显示 "🤖 AI 估算" 标签，让用户区分真实数据和 AI 推断。

---

#### Part 7：未来规划（~15s）

**短期（1-2 周）：** 接入用户认证（Clerk），个人仪表盘（历史搜索、收藏报告）。

**中期（1-2 月）：** 多平台支持（Amazon、Shopee、Lazada），PDF 报告导出，利润计算器。

**长期：** 销量趋势追踪（时间序列），AI 视频脚本生成，部署上线（Vercel + Railway）。

---

### 岗位针对性调整

**🎯 AI 产品实习** — 在开头增加产品视角：

> 在每个 Part 之间，插入产品思考的过渡：
>
> *Part 2 之后：*
> "从产品经理的角度，技术选型最重要的不是'新技术'，而是 **'合适的技术'**。比如为什么数据库用 MySQL 而不是 MongoDB？因为商品数据的关系性很强——产品 → 分析 → 搜索历史，三张表的关联查询用 SQL 最自然。为什么缓存 TTL 是 24 小时而不是实时？因为我观察了 TikTok Shop 的商品更新频率，价格和销量通常一天才变动一次，实时更新没必要且浪费 API 调用费用。这些决策背后都是产品思考，而不是技术炫技。"
>
> *Part 4 之后：*
> "我特别关注了 **AI 产品的信任问题**。当 LLM 输出一个机会分 75 分时，用户凭什么相信这个分数？我做了三件事：一是 `is_estimated` 标记区分真实数据和 AI 推断；二是在前端展示每个分析维度的具体依据（比如'竞争评分来自 top 8 商品中有 5 个相似产品'）；三是推荐结论给出具体理由（'推荐——市场需求大且竞争适中'）。"
>
> *Part 6 之后：*
> "这个项目的 **MVP 策略**也值得说一下。我刻意限制了 scope——只做 TikTok Shop、只用英文和中文、只用搜索（不做类目浏览）。这些限制让我能在两周内从 0 到 1。如果重新规划，我会更早做用户验证——比如把原型拿给做跨境电商的朋友试用，根据反馈调整 AI 输出的格式和内容优先级。"

**🎯 跨境电商运营实习** — 增加运营数据分析视角：

> *Part 3 之前插入运营视角：*
> "从运营角度看，这个项目的核心价值不是技术，而是**把运营经验数字化**。我做种子数据时不是随便找 20 个商品，而是刻意选了 4 个竞争格局不同的品类：
>
> | 品类 | 特征 | AI 分析重点 |
> |------|------|------------|
> | 无线耳机 | 高需求、高竞争、中客单价 | 差异化空间、技术卖点 |
> | 便携榨汁机 | 中需求、低竞争、中客单价 | 使用场景、内容创意 |
> | 手机壳 | 高需求、高竞争、低客单价 | 价格策略、设计差异化 |
> | 瑜伽垫 | 中需求、低竞争、高客单价 | 品质定位、达人匹配 |
>
> AI 需要根据不同品类特征调整分析逻辑——这在 Prompt 设计里体现为不同的 selling_points 和 differentiation_opportunities 的生成方式。"
>
> *Part 5 之后：*
> "Listing 生成器也是一个重要的运营工具。它不是简单翻译产品信息，而是按照 TikTok Shop 的 Listing 规范生成：SEO 标题（含高频搜索词）、5 条卖点 bullet point、产品描述（含使用场景和情感诉求）、以及后端搜索关键词。这些格式都是我在研究 TikTok Shop 官方卖家指南后确定的。"

**🎯 AI Agent 开发实习** — 深入 Agent 实现细节：

> *Part 3 展开为更详细的技术讲解：*
> "我想深入讲讲 Agent 的 Prompt 工程设计。Analysis Agent 的 System Prompt 我花了最多时间打磨。几个关键设计原则：
>
> **1. 角色锚定：** 第一句就是 'You are a TikTok Shop e-commerce data analyst.' 这比模糊的 'You are a helpful AI assistant' 效果好很多——LLM 会根据角色自动调整输出风格和专业度。
>
> **2. 负面约束优于正面约束：** 'Do NOT wrap your response in markdown code blocks' 比 'Return clean JSON' 更有效。LLM 对否定指令的遵从度更高。
>
> **3. 示例驱动：** 提供一个完整的 JSON 示例——LLM 会模仿示例的结构和字段顺序。示例中的数值选择也很重要——opportunity_score 示例写 75 而不是 100，避免 LLM 倾向于给高分。
>
> **4. 字段级别的指南：** 每个字段都有独立的填写规范。比如 `opportunity_score` 的指南是 'how good the market opportunity is for a new seller considering competition level, demand, price range, differentiation potential'——这 5 个维度明确告诉 LLM 评分时应该考虑什么。
>
> **Agent 编排与 LangChain 的对比：**
> 我刻意没有用 LangChain。原因是当前 pipeline 的确定性很强——Scrape → Analyze → Strategize——不需要动态工具选择。自己实现的好处：
>
> 1. **完全可控的 Prompt** — LangChain 的 Prompt Template 抽象层增加了一层间接性，调试困难
> 2. **透明的错误处理** — 我知道每一步如果失败会怎样，而不是依赖框架的默认行为
> 3. **零依赖启动** — 只用 httpx 调 DeepSeek 的 OpenAI 兼容接口，不需要任何 LangChain 依赖
>
> 如果未来需要更复杂的功能——比如动态选择分析策略、多轮用户交互、工具调用——我会考虑引入 LangGraph 的 StateGraph 来管理 Agent 状态机。
>
> **结构化输出的实践总结：**
> 让 LLM 返回结构化 JSON 是一个经典挑战。我的方案不是 LangChain 的 OutputParser，而是 Pydantic + 自动重试：
>
> ```python
> for attempt in range(1, MAX_RETRIES + 1):
>     content = await _call_deepseek(messages)
>     try:
>         cleaned = _strip_markdown_fence(content)
>         data = json.loads(cleaned)
>         result = AnalyzeResponse.model_validate(data)
>         return result.model_dump()
>     except (json.JSONDecodeError, ValidationError) as exc:
>         # 把错误信息注入下一轮对话，让 LLM 自我修正
>         messages.append({"role": "assistant", "content": content})
>         messages.append({"role": "user", "content": RETRY_SUFFIX.format(error=str(exc))})
> ```
>
> 这个方案的优势是：**LLM 在重试时能看到自己上一次的错误输出和具体的错误原因**——它不是在盲目重试，而是在理解错误后自我修正。"

**🎯 全栈开发实习** — 增加性能优化和工程细节：

> *Part 4 之后插入性能分析：*
> "我想展开讲讲性能优化的几个关键决策：
>
> **1. 不等待数据库写入。**
> 数据库写入耗时约 200-500ms。如果同步等待，API 响应延迟增加 30-50%。我用 `asyncio.create_task()` 把写入变成后台协程——响应不等待写入完成。代价是写 DB 失败会静默丢失，但在 MVP 阶段这个 tradeoff 是合理的。后续可以加一个 task 队列（如 Celery）来保证写入。
>
> **2. 连接池管理。**
> Redis 连接池：`max_connections=10` —— 对于当前单用户场景足够，多用户时需调大。
> MySQL 连接池：`pool_size=5, max_overflow=10` —— SQLAlchemy 异步引擎默认值对低负载场景合理。
>
> **3. HTTP 客户端复用。**
> Firecrawl 和 DeepSeek 的 HTTP 调用都通过 `httpx.AsyncClient` 的 context manager，每次调用创建新连接。未来优化可以复用连接池减少 TLS 握手开销。
>
> **4. 前端性能。**
> 用 Chrome DevTools Lighthouse 跑了一下：首屏加载 ~1.2s，LCP ~0.8s。主要的优化空间在产品图片——20 张商品图没有做懒加载和 WebP 转换，生产环境应该加 next/image。
>
> **5. AI 调用的 Token 消耗。**
> 对运营有意义的指标：单次完整分析约消耗 800-1200 input tokens + 500-800 output tokens。策略生成约 400-600 input + 300-500 output。按 DeepSeek 的定价，单次完整分析成本约 $0.002——这是选 DeepSeek 而不是 GPT-4 的关键原因之一。"

---

## 📋 快速参考卡

打印或手写到卡片上，面试前快速复习：

```
┌─────────────────────────────────────────────────────────┐
│                    TyON 面试速记卡                         │
├─────────────────────────────────────────────────────────┤
│ 📌 一句话：输入关键词，AI 自动生成 TikTok 选品分析报告        │
│                                                         │
│ 🎯 用户：跨境电商 TikTok Shop 卖家                          │
│ 😫 痛点：选品 3-4h/产品 → 压缩到 30s                        │
│                                                         │
│ ⚙️ 架构：Next.js 16 → FastAPI → Redis → DeepSeek → MySQL  │
│                                                         │
│ 🔄 流程：搜索 → 抓取 → AI分析 → AI策略 → 缓存 → 入库       │
│                                                         │
│ 🧠 AI：DeepSeek Chat · 2 Agent Pipeline                  │
│       · Analysis Agent (机会分0-100, 竞品对比)             │
│       · Strategy Agent (人群, 内容, 定价, 风险)            │
│                                                         │
│ ⚡ 缓存：Redis 24h TTL + 内存回退 · <10ms 命中             │
│                                                         │
│ 🛡️ 容错：Firecrawl→Seed · Redis→Memory · 失败→重试       │
│                                                         │
│ 🐛 最大挑战：Firecrawl 403 → Google索引 + 种子数据           │
│                                                         │
│ 📊 数据：20商品×4品类 · 3张MySQL表 · 2种语言                │
│                                                         │
│ 🔜 未来：用户认证 · 多平台 · 趋势追踪 · PDF导出              │
│                                                         │
│ 💡 亮点：Pydantic Schema 约束 LLM 输出 · is_estimated 标记   │
│         双级缓存 · fire-and-forget · 两周独立全栈开发        │
└─────────────────────────────────────────────────────────┘
```
