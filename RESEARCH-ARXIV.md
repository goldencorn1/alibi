# Alibi arXiv 研究与应用矩阵

版本：v0.1  
研究日期：2026-09-04（Asia/Shanghai）  
范围：按提示词主动检索 arXiv，并阅读可用的 arXiv HTML 全文方法、实验或结论段落。论文结论只作为工程约束和测试设计依据，不扩大产品范围。

## 总体采纳原则

- prediction-market 论文支持“价格、成交量、钱包时间线需要分开解释”，不支持对单个钱包作内幕或因果判断。
- attribution/RAG 论文支持“引用必须可验证、可追溯、按 claim 检查”，不支持仅凭 LLM 自述证明内部因果使用。
- agent benchmark 论文支持时间锁定、工具契约、故障注入和成本记录，不支持把 benchmark 分数当作投资能力证明。
- 所有 arXiv 资料的同行评审状态未作为产品真实性依据；真实 Demo 仍以可复现数据和测试为准。

## 论文矩阵

| 论文、版本和日期 | 研究问题；可直接支持的结论 | 不能支持的结论 | Alibi 模块 / 工程模式 / 指标 | 对应测试；采纳决策 | 可信度与待验证项 |
|---|---|---|---|---|---|
| [Political Shocks and Price Discovery in Prediction Markets](https://arxiv.org/abs/2603.03152)；v4，arXiv 最新修订 2026-07-18；HTML 论文日期显示 2026-08-24，日期差异已记录 | 用 Polymarket 链上 ledger 研究三个政治冲击；5 分钟事件桶、±30 分钟响应窗口和 3 小时持续/反转描述；成交量与 belief revision 不是同一件事；链上数据可连接 wallet、方向、数量和时间 | 不能由事件前交易证明信息优势、内幕或因果；滚动 price-impact 只描述成交流与价格映射，不识别冲击对深度的因果效应 | repricing timeline；区分 activity 与 price response；记录 event anchor、bin size、window；指标只作为“时间特征” | 测试 5m/1h 数据归一化、窗口边界、价格反转、linked outcome；**采纳方法约束，不采纳其结论外推** | 高：正文包含数据构造和结论；待验证 Alibi 的公开 API 粒度与真实市场可比性 |
| [PolyBench](https://arxiv.org/abs/2604.14199)；v1，2026-04-03 | point-in-time CLOB、新闻和市场状态同步；严格 timestamp lock；使用 CWR/APY/Sharpe 评估 simulated execution | 不能支持 Alibi 做自动交易、预测涨跌或证明钱包可复制性 | fixture manifest；`as_of` 时间；禁止未来数据；tool/replay evaluation | 测试同一 fixture 多次输出一致、证据不得晚于 `as_of`、外部服务失败时回放；**采纳时间锁定，不采纳交易引擎** | 中高：论文与代码仓库均可访问；待验证其数据许可和 Alibi 公开证据可用性 |
| [Measuring Attribution in Natural Language Generation Models](https://arxiv.org/abs/2112.12870)；v2，2022-08-02 修订 | AIS 将“句子是否可由指定来源支持”形式化，并采用两阶段人工标注；强调 source-relative、time-relative 的 claim 支持 | 不能证明引用是模型生成时真正使用的内部原因；不能把 AIS 等同于因果真理 | claim extraction；`source_support`；两阶段校验：可解释性/可支持性；覆盖率、支持率 | 测试每条 claim 是否绑定 evidence；缺源、空 claim、模糊 claim；**采纳 claim-level evidence contract** | 高：arXiv 全文定义清楚；待验证人工评审成本和 LLM judge 一致性 |
| [Correctness is not Faithfulness in RAG Attributions](https://arxiv.org/abs/2412.18004)；v1，2024-12-23 | 区分 citation correctness 与 citation faithfulness；指出 post-rationalization：引用可能正确但没有反映真实生成过程；论文报告最多 57% citations 的 faithfulness 问题 | 不能仅凭最终回答和 URL 证明内部使用路径；不能把“引用存在”表述为模型忠实 | 证据状态拆成 `source_valid`、`claim_supported`、`process_faithfulness_unverified`；禁止把后验引用叫作“模型真正依据” | 测试错配 URL、正文不支持、正确但时间不合格、后验补引；**采纳“正确性与忠实性分离”，不声称可测内部 faithfulness** | 高：全文含定义、实验和讨论；待验证真实网页内容变化导致的再现稳定性 |
| [RAGTruth](https://arxiv.org/abs/2401.00396)；v2，2024-05-17 修订 | 近 18,000 条自然生成 RAG response，提供 passage/word-level hallucination 标注；说明 RAG 仍会产生无依据或矛盾陈述 | 不能直接为 Polymarket 归因阈值提供统计保证；不能仅靠 word-level 检测替代来源校验 | 输出 claim/field 级 unsupported 标记；抽样人工审查；`unattributed` 是有效结果 | 测试无来源、来源矛盾、部分支持、LLM 生成多余因果词；**采纳 hallucination test pattern** | 高：全文含人工标注与检测比较；待验证 Alibi 中文/金融语境的误差 |
| [Do Large Language Model Benchmarks Test Reliability?](https://arxiv.org/abs/2502.03461)；v1，2025-02-05 | 旧 benchmark 的 label errors 会遮蔽失败；提出减少歧义、可达到 100% 的 platinum benchmark | 不能说明 Alibi 的真实市场结果仅靠测试集即可可靠；不能消除实时数据漂移 | 人工审核精选 fixtures；明确 ground truth、来源和预期状态；不使用歧义案例做成功演示 | 测试 fixture schema、gold output、歧义拒绝、重复运行；**采纳 fixture 质量门槛** | 中高：全文和代码链接可验证；待验证精选 evidence 的独立复核 |
| [ReliabilityBench](https://arxiv.org/abs/2601.06112)；v1，2026-01-03 | 用 `pass^k`、语义扰动 ε、故障强度 λ 和 `R(k,ε,λ)` 评估 agent 一致性、鲁棒性、故障容忍；超时、限流、部分响应、schema drift 是真实风险 | 不能把跨领域 agent benchmark 直接当成金融合规或投资能力结论 | replay consistency；fault injection；状态/终态验证；记录 retries 和 error class | 测试同输入 3 次一致、输入别名、timeout/429/partial JSON/schema drift；**采纳轻量子集，不实现完整 reliability surface** | 中高：全文含指标与故障框架；待验证 Demo 资源允许的重复次数和成本 |
| [Finance Agent Benchmark](https://arxiv.org/abs/2508.00828)；v1，2025-05-20 | 537 个专家编写的真实金融研究问题，强调多步检索、工具轨迹、证据答案和时间/成本；实验显示当前 agent 仍有限 | 不能支持“有工具就可靠”；不能用其成本/准确率外推 Alibi；SEC 工具不适用于 Polymarket 本身 | 工具调用记录、来源清单、每请求成本；把 evidence completeness 与 answer correctness 分开 | 测试 API trace、预算累计、工具参数、空结果和证据缺口；**采纳 trace/cost contract** | 中高：全文含数据切分、harness 和 limitations；待验证 Alibi 的真实 LLM 成本 |
| [FinToolBench](https://arxiv.org/abs/2603.08262)；v2，arXiv 最新修订 2026-08-01 | 760 tools / 295 tool-required questions；通过 tool card 属性约束 timeliness、intent_type、regulatory_domain；固定轮次、timeout、retry 和 deterministic cache | 不能把其 tool compliance 分数当作金融许可或安全认证；不能覆盖所有供应商/市场 | API/MCP tool schema 增加 `data_status`、`timeliness`、`intent_type=informational`、`domain=prediction-market-read` | 测试只读工具、意图越界、过时数据、retry 上限和缓存；**采纳工具卡元数据与 trace** | 中高：全文有可复现实验协议与 limitations；待验证 Alibi 只保留信息用途 |
| [Toward Reliable Evaluation of LLM-Based Financial Multi-Agent Systems](https://arxiv.org/abs/2603.27539)；v1，2026-03-29 | 调查将系统分为 architecture、coordination、memory、tool integration；列出 look-ahead、survivorship、overfitting、transaction-cost neglect、regime-shift 等评估失败；CPH 明确是待验证假设 | 不能支持“多 Agent 必然更强”；不能证明协调带来真实收益；不能扩大 Alibi 成多 Agent 交易系统 | 禁止 look-ahead；分开 live/recorded；披露数据窗口、费用、样本选择；单 Agent/确定性规则优先 | 测试未来信息泄漏、样本筛选、无交易成本虚假收益、重放窗口；**采纳评估红线，不采纳 CPH 或多 Agent 架构** | 中：论文自称假设尚未验证；待验证 Alibi 不产生收益/交易能力宣传 |

## 研究到 Spec 的落点

| 研究结论 | Spec 条款 | 验收证据 |
|---|---|---|
| 时间锁定比流畅解释更重要 | Data Contract 必须保留 `as_of`、`published_at`、`retrieved_at` | 时间泄漏测试与 replay manifest |
| 正确引用不等于忠实引用 | 只输出可验证的 source support；内部 faithfulness 标为未验证 | 错配、后验引用、无源案例 |
| 低覆盖率时不要给能力结论 | wallet coverage `< 0.40` → `insufficient_evidence` | 边界值 0.39/0.40 测试 |
| API/Agent 可靠性要在故障下验证 | 统一 error envelope、retry、recorded fallback | timeout/429/partial/schema drift 测试 |
| 金融评估必须记录成本和意图 | 只读 informational tool；预算和调用计数进入报告 | 预算上限与安全静态检查 |

