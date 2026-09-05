# Alibi 开源项目研究矩阵

版本：v0.1  
研究日期：2026-09-04（Asia/Shanghai）  
研究状态：Stage 1 完成；仅形成采用决策，不复制第三方代码。

## 研究边界

本矩阵优先核验 PRD 指定的四个项目，再补充直接相关的 SDK、Agent 工具和时间锁定评估项目。仓库状态、README、目录和许可证以研究日期可访问的公开页面为准；“可访问”不等于项目 API 或数据当前可用。

Alibi 只读分析，不执行交易、不连接用户钱包、不托管资金、不接触主网私钥。MIT 许可证只解决代码许可证兼容性，不自动授权复制数据集、新闻内容或第三方服务条款。

## 矩阵

| 项目 / 状态 | 许可证 / 数据源 | 主要模块与可借鉴设计 | 不应照搬 | Alibi 决策、模块与测试 | 判断依据 |
|---|---|---|---|---|---|
| [NYTEMODEONLY/polyterm](https://github.com/NYTEMODEONLY/polyterm)；`main` 可访问，主页显示 167 commits；README 记录 2026-08-30 的 1,145 个可收集测试 | MIT。Gamma、CLOB、Data API；本地 SQLite；支持历史 replay、local archive | API client 分层；Gamma/CLOB/Data API fallback；JSON Schema、agent manifest、FastMCP stdio、JSONL adapter；读取模式和 no-custody 说明 | 预测、copy trading、跟单、仓位/通知系统和庞大 TUI；不复制仓库代码或文案 | **采用设计、改造边界**：借鉴数据适配器、状态标记、机器可读 schema、回放协议。**测试**：输入解析、分页/重试、live/recorded 状态、schema contract、MCP/API 只读检查 | [README 与目录](https://github.com/NYTEMODEONLY/polyterm)；[数据 API 文档](https://github.com/NYTEMODEONLY/polyterm/blob/main/docs/api/data_api.md)；[许可证](https://github.com/NYTEMODEONLY/polyterm/blob/main/LICENSE) |
| [pselamy/polymarket-insider-tracker](https://github.com/pselamy/polymarket-insider-tracker)；`main` 可访问，仓库主页可见 1 issue / 1 PR | MIT。Polymarket WebSocket trades、Polygon RPC；PostgreSQL 15、Redis 7；ML + heuristics | `WebSocket → Ingestor → Profiler → Detector → Alerter` 的流水线分层；dry-run、config-check、pytest/ruff/mypy | “insider”/suspicious 标签会造成主体指控和因果暗示；Postgres/Redis、实时告警超出 Alibi 的轻量 Demo；不复制代码 | **仅参考**：借鉴 ingest/profile/detect 的职责分离和故障诊断；不采用风险评分。**测试**：输入数据缺失、重复事件、限流/断线、`insufficient_evidence` 与免责声明 | [README、架构和开发命令](https://github.com/pselamy/polymarket-insider-tracker)；[许可证](https://github.com/pselamy/polymarket-insider-tracker/blob/main/LICENSE) |
| [leolopez007/polymarket-trade-tracker](https://github.com/leolopez007/polymarket-trade-tracker)；`main` 可访问，主页显示 1 commit | MIT。Gamma API、CLOB API、Data API、Polygon RPC | Flask + HTML/Tailwind/JS；交易时间、价格、数量；Maker/Taker；Direct、Neg-Risk、Split、Merge、Transfer、Redeem、Convert 源类型 | 精确 PnL、仓位结算和交易准备超出 PRD；单体脚本、公开 RPC 慢和限流风险不应成为核心架构 | **改造为参考**：借鉴字段规范化、链上操作分类和 maker/taker 测试样例，不实现 PnL 重算。**测试**：trade timestamp、side/outcome、source 分类、未知字段和 RPC 降级 | [README 与数据源](https://github.com/leolopez007/polymarket-trade-tracker)；[脚本中的公开端点与事件分类](https://github.com/leolopez007/polymarket-trade-tracker/blob/main/script.py)；[许可证](https://github.com/leolopez007/polymarket-trade-tracker/blob/main/LICENSE) |
| [SII-WANGZJ/Polymarket_data](https://github.com/SII-WANGZJ/Polymarket_data)；`main` 可访问，主页显示 12 commits；README 声称 107GB、1.1B records、268K+ markets | 仓库页面标为 MIT；原始链上数据来自 Polygon，市场元数据来自 Gamma；Parquet / Hugging Face 分发。数据集自身使用条款需单独核验 | `orderfilled`、`trades`、`markets`、`quant`、`users` 五类数据；统一 YES 视角；拆分 maker/taker；可增量写入和失败块重取 | 107GB 数据不可作为三天 Demo 依赖；不下载全量数据、不把数据集统计当作 Alibi 实时结果；数据集许可证/使用条款未在本轮完全确认 | **仅参考 schema**：借鉴 `transaction_hash`、`block_number`、`market_id`、`maker/taker`、统一 token 视角。**测试**：Parquet/JSON 小样本规范化、缺 token、重复/排序、数据状态和许可元数据检查 | [仓库 README 与数据管线](https://github.com/SII-WANGZJ/Polymarket_data)；[Hugging Face 数据页](https://huggingface.co/datasets/SII-WANGZJ/Polymarket_data)；[数据处理说明](https://github.com/SII-WANGZJ/Polymarket_data#data-processing-pipeline) |
| [PolyBench/PolyBench](https://github.com/PolyBench/PolyBench)；主页显示 4 commits，研究日可访问 | 根目录许可证在本轮未验证；不能复制代码、数据库或数据。CLOB 状态、预取 Google News、SQLite、时间对齐 | point-in-time CLOB/news bundle；严格 timestamp lock；批处理、数据库和评估脚本 | `trading_engine` 和 autonomous trading 方向与 Alibi 安全红线冲突；外部 Google News 供应商不是当前批准的正式新闻 API | **采用评估思想，拒绝交易实现**：借鉴时间锁定、无未来数据、snapshot manifest、重放可复现。**测试**：时间泄漏、证据发布时间晚于价格窗口、fixture replay 一致性 | [README、架构与指标](https://github.com/PolyBench/PolyBench)；许可证状态作为未验证项记录 |
| [Polymarket/ts-sdk `@polymarket/client`](https://github.com/Polymarket/ts-sdk/blob/main/packages/client/README.md)；官方 TypeScript client，`main` README 可访问 | README 标注 MIT。公开 client 示例为 `createPublicClient().listMarkets()`；本轮不采用交易/签名模块 | 轻量 typed public client；分页异步迭代；官方 API 入口 | 不引入需要签名、下单、builder credential 的模块；不假定 SDK 版本稳定覆盖所有端点 | **候选采用**：Plan 阶段可评估作为 Gamma public adapter；若使用需锁版本并保留 raw response contract。**测试**：public client 解析、分页终止、端点异常和 raw payload schema | [官方 client README](https://github.com/Polymarket/ts-sdk/blob/main/packages/client/README.md) |
| [Polymarket/agent-skills](https://github.com/Polymarket/agent-skills)；主页显示 1 commit，研究日可访问 | 本轮未找到可确认的根目录许可证；不复制。包含 Gamma、CLOB、Data、WebSocket、认证、交易、桥接、relayer 资料 | 可读的 API 目录、市场数据说明、工具文档渐进披露 | 认证、下单、bridge、gasless、私钥和资金操作全部超出 Alibi；不能把该仓库当作安全授权 | **不采用实现**；只把官方端点列表作为研究索引。**测试**：确保 Alibi 代码没有交易 endpoint、签名器、私钥字段 | [仓库 README](https://github.com/Polymarket/agent-skills) |

## 官方数据接口核验

Polymarket 官方文档在研究日明确列出：Gamma 用于市场/事件元数据，CLOB 提供 `/prices-history`，Data API 提供公开 `/trades`；市场数据读取不要求 API key。CLOB 历史接口支持 `1m`、`1h` 等 interval，Data API trade 响应包含 `timestamp` 字段，但真实可用性、分页完整性和速率限制仍必须在 Day 0 实测。

- [官方市场数据总览](https://docs.polymarket.com/market-data/overview)
- [价格历史接口](https://docs.polymarket.com/api-reference/markets/get-prices-history)
- [公开钱包/市场 trades 接口](https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets)
- [批量价格历史接口](https://docs.polymarket.com/api-reference/markets/get-batch-prices-history)

## 采用结论

1. 采用“适配器 + 规范化 + 回放 + schema”工程思想，不复制第三方代码。
2. 采用 timestamp lock、source provenance 和 deterministic rule engine。
3. 只读数据源保持 Gamma / CLOB / Data API；链上 RPC 只在确认必要且不增加范围时使用。
4. 新闻 API 供应商不在本矩阵中新增；使用精选公开证据集和受控检索降级。
5. 所有含交易、下单、copy trading、bridge、私钥、主体指控或投资方向的实现均不采用。

## 对 Spec 与测试的映射

| Spec 条款 | 研究依据 | 必须出现的测试 |
|---|---|---|
| 数据源与状态 | 官方 Polymarket 文档、PolyTerm、Polymarket_data | raw → normalized；`live/recorded/synthetic/cached` 不混淆 |
| 时间对齐 | Political Shocks、PolyBench | 事件窗口、发布时间晚到、时间泄漏、重复回放 |
| 证据归因 | AIS、RAGTruth、Correctness ≠ Faithfulness | URL/发布时间/检索时间校验；无有效证据必须 `unattributed` |
| Agent/API 契约 | PolyTerm、FinToolBench、官方 TS client | JSON schema、只读工具、参数错误、限流与部分响应 |
| 成本与安全 | Finance Agent Benchmark、Financial Multi-Agent Evaluation | API 调用计数、预算上限、无私钥/无交易端点静态检查 |

