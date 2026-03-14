# JLCEDA AI Agent

JLCEDA Pro 智能设计插件骨架，提供以下能力：

- 自定义 OpenAI 兼容接口配置
- 读取原理图和 PCB 结构化数据
- 轻量聊天面板与多轮上下文
- AI 建议驱动的元件自动放置入口

## 安装

1. 在插件目录执行 `npm install`
2. 执行 `npm run build`
3. 生成的 `artifacts/jlceda-ai-agent.eext` 可拖拽到嘉立创 EDA 专业版安装

## 配置

在插件内打开 `AI Agent: Settings`，填写：

- `API URL`
- `API Key`
- `Model`
- `Temperature`
- `Max Tokens`

支持 OpenAI、DeepSeek、兼容接口网关以及本地 Ollama 网关。

## 使用

1. 打开 `AI Agent: Open Chat`
2. 输入自然语言请求，例如：
   - `分析当前PCB布局风险`
   - `为选中的电源器件给出更紧凑的摆放建议`
   - `根据原理图生成BOM摘要`
3. 若需要执行布局动作，使用 `AI Agent: Auto Place Selection`

## 构建输出

- `dist/`: 编译后的脚本与静态资源
- `artifacts/jlceda-ai-agent.eext`: 打包结果

## 说明

当前工程在无官方 SDK 依赖的情况下提供了兼容型 API 适配层，便于后续直接接入 `pro-api-sdk` 和 `@jlceda/pro-api-types`。
