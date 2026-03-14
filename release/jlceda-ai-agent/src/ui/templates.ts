function inlineScript(kind: "chat" | "config"): string {
  if (kind === "chat") {
    return `
      const state = { assistant: "" };
      const history = document.getElementById("history");
      const form = document.getElementById("chat-form");
      const input = document.getElementById("prompt");
      const append = (role, content) => {
        const item = document.createElement("div");
        item.className = "msg " + role;
        item.textContent = content;
        history.appendChild(item);
        history.scrollTop = history.scrollHeight;
      };
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const content = input.value.trim();
        if (!content) return;
        append("user", content);
        window.parent.postMessage({ type: "chat:submit", content }, "*");
        input.value = "";
      });
      window.addEventListener("message", (event) => {
        const message = event.data;
        if (message?.type === "chat:delta") {
          state.assistant += message.content;
          let node = document.getElementById("assistant-live");
          if (!node) {
            node = document.createElement("div");
            node.id = "assistant-live";
            node.className = "msg assistant";
            history.appendChild(node);
          }
          node.textContent = state.assistant;
          history.scrollTop = history.scrollHeight;
        }
        if (message?.type === "chat:done") {
          state.assistant = "";
          const live = document.getElementById("assistant-live");
          if (live) live.removeAttribute("id");
        }
      });
    `;
  }

  return `
    const form = document.getElementById("config-form");
    window.addEventListener("message", (event) => {
      const data = event.data;
      if (data?.type !== "config:load") return;
      for (const [key, value] of Object.entries(data.payload)) {
        const input = form.elements.namedItem(key);
        if (input) input.value = String(value ?? "");
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.temperature = Number(payload.temperature);
      payload.maxTokens = Number(payload.maxTokens);
      window.parent.postMessage({ type: "config:save", payload }, "*");
    });
  `;
}

function htmlFrame(title: string, body: string, script: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="./ui/styles.css" />
  <title>${title}</title>
</head>
<body>
  ${body}
  <script>${script}</script>
</body>
</html>`;
}

export function getChatPanelHtml(): string {
  return htmlFrame(
    "AI Agent",
    `
      <section class="panel">
        <header><h1>AI Agent</h1></header>
        <div id="history" class="history"></div>
        <form id="chat-form" class="stack">
          <textarea id="prompt" rows="5" placeholder="输入设计问题或布局请求"></textarea>
          <button type="submit">发送</button>
        </form>
      </section>
    `,
    inlineScript("chat")
  );
}

export function getConfigPanelHtml(): string {
  return htmlFrame(
    "AI Agent Settings",
    `
      <section class="panel">
        <header><h1>AI Agent Settings</h1></header>
        <form id="config-form" class="stack">
          <label>API URL <input name="apiUrl" /></label>
          <label>API Key <input name="apiKey" type="password" /></label>
          <label>Model <input name="model" /></label>
          <label>Temperature <input name="temperature" type="number" min="0" max="2" step="0.1" /></label>
          <label>Max Tokens <input name="maxTokens" type="number" min="128" max="32000" step="1" /></label>
          <label>Language
            <select name="language">
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <button type="submit">保存</button>
        </form>
      </section>
    `,
    inlineScript("config")
  );
}
