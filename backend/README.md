API调用指南

## 🧨 初始调用失败的原因总结

| 失败阶段 | 错误类型 | 原因分析 | 解决方案 |
|----------|-----------|------------|-------------|
| **第一次尝试** | `404 Not Found` | 使用了 `/compatible-mode/v1` 接口路径，但该接口不支持 `qwen-plus` 模型 | 更换为 DashScope 官方推荐的正式 API 路径：<br>`https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation` |
| **第二次尝试** | `400 Bad Request` | 请求体使用了 `input.prompt` 字段，而 DashScope 的 `qwen-plus` 模型要求使用 [messages](file:///home/zhzhou/network/docker.tips/build/html/_static/copybutton.js#L1-L44) 格式 | 将请求格式改为标准的 [messages](file:///home/zhzhou/network/docker.tips/build/html/_static/copybutton.js#L1-L44) 数组，包含 [role](file:///home/zhzhou/network/nana/frontend/node_modules/@types/react/index.d.ts#L3674-L3674) 和 [content](file:///home/zhzhou/network/nana/frontend/node_modules/@types/react/index.d.ts#L2935-L2935) 字段 |

---

## ✅ 成功经验总结

### 1. **API 地址必须与模型匹配**
- 不同模型在不同平台上有不同的接口路径。
- `qwen-plus` 属于阿里通义千问系列模型，**不能使用 OpenAI 兼容路径**（如 `/compatible-mode/v1`）。
- 正确地址是：
  ```python
  https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
  ```

---

### 2. **请求格式要符合模型规范**
- DashScope 的 Qwen 系列模型要求使用标准的 **messages** 结构：
  ```json
  {
    "model": "qwen-plus",
    "input": {
      "messages": [
        {"role": "user", "content": "你好"}
      ]
    },
    "parameters": {}
  }
  ```
- 不再支持传统的 `prompt` 字段。

---

### 3. **环境变量配置很重要**
- 如果未设置 `DASHSCOPE_API_KEY` 或设置错误，即使接口正确也会报错。
- 设置方式：
  ```bash
  export DASHSCOPE_API_KEY=your_api_key_here
  ```

---

### 4. **日志和调试信息是排查问题的关键**
- 在代码中加入详细的日志输出（如请求地址、模型名、响应内容），可以快速定位问题。
- 示例：
  ```python
  logger.info(f"发送请求到 {self.api_url}")
  logger.info(f"使用的模型: {self.model_name}")
  logger.info(f"API 响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
  ```

---

### 5. **理解模型文档和接口文档非常重要**
- DashScope 的官方文档对每种模型都有明确说明：
  - 支持的接口路径
  - 输入格式（如 `messages`）
  - 输出字段（如 `output.text`）

---

### 🧠 最终成功结构图

```
+------------------+     +-------------------------+
|                  |     |                         |
| 用户输入消息     | --> | 构造 messages 格式       |
| (例如：你好)     |     | [ { role: user, content } ] |
|                  |     |                         |
+------------------+     +-------------------------+
           ↓
+-----------------------------------------------+
|                                               |
| 向 DashScope 发送 POST 请求                   |
| URL: /api/v1/services/aigc/text-generation/generation |
| Headers: Authorization, Content-Type          |
| Body: model + input.messages + parameters     |
|                                               |
+-----------------------------------------------+
           ↓
+------------------------+
|                        |
| 提取 response 中的     |
| output.text 内容返回   |
| 给用户                |
|                        |
+------------------------+
```

---

### 🛠️ 总结建议

| 项目 | 建议 |
|------|------|
| API 地址 | 使用 DashScope 官方指定的生成接口 |
| 请求体格式 | 使用 `messages` 数组，避免使用 `prompt` |
| 日志输出 | 记录请求内容和响应结果，便于调试 |
| 环境变量 | 确保 `DASHSCOPE_API_KEY` 已设置 |
| 文档阅读 | 查阅模型对应的具体接口文档，避免通用路径误用 |

---

如果你希望我帮你整理一份 DashScope Qwen 模型调用模板或封装成同步/异步库函数，请告诉我！我可以根据你的需求进一步优化。